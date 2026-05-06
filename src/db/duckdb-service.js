import * as duckdb from '@duckdb/duckdb-wasm';
import { clearColumnCache } from './queries';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

let db = null;
let conn = null;

export const initDB = async () => {
  if (conn) return conn;

  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  
  conn = await db.connect();
  return conn;
};

export const importCSV = async (file) => {
  try {
    console.log('--- Iniciando Importación ---');
    clearColumnCache(); // Limpiar caché de sesión anterior
    const connection = await initDB();
    
    const internalName = 'input_file.csv';
    await db.registerFileHandle(internalName, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);

    const tryLoad = async (options = '') => {
      await connection.query(`DROP TABLE IF EXISTS logs`);
      await connection.query(`
        CREATE TABLE logs AS 
        SELECT * FROM read_csv_auto('${internalName}', all_varchar=TRUE ${options})
      `);
      const countRes = await connection.query(`SELECT COUNT(*) as count FROM logs`);
      const count = Number(countRes.toArray()[0].toJSON().count);
      const colsRes = await connection.query(`PRAGMA table_info('logs')`);
      const cols = colsRes.toArray().map(r => r.toJSON().name);
      return { count, cols };
    };

    // Intento 1: Auto-detección total
    console.log('Intento 1: Auto-detección...');
    let result = await tryLoad();
    
    // Si no hay filas o solo hay una columna genérica, algo salió mal
    if (result.count === 0 || (result.cols.length === 1 && result.cols[0] === 'column0')) {
      console.log('Intento 2: Probando con delimitador ";" (Excel)...');
      result = await tryLoad(`, delim=';'`);
    }

    if (result.count === 0 || (result.cols.length === 1 && result.cols[0] === 'column0')) {
      console.log('Intento 3: Probando con delimitador TAB...');
      result = await tryLoad(`, delim='\\t'`);
    }

    console.log('Resultado final:', result.count, 'filas, columnas:', result.cols);

    if (result.count === 0) {
      throw new Error('No se detectaron datos en el archivo. Verifica que el CSV sea válido y no esté vacío.');
    }
    
    return true;
  } catch (error) {
    console.error('ERROR EN IMPORTACIÓN:', error);
    throw new Error(`Error al procesar el archivo: ${error.message}`);
  }
};

export const executeQuery = async (sql) => {
  if (!conn) await initDB();
  const result = await conn.query(sql);
  return result.toArray().map((row) => row.toJSON());
};

export const resetDB = async () => {
  if (conn) {
    await conn.query('DROP TABLE IF EXISTS logs');
  }
};
