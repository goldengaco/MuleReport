import { executeQuery } from './duckdb-service';

let _cachedColumns = null;
export const clearColumnCache = () => { _cachedColumns = null; };

export const getTableColumns = async () => {
  if (_cachedColumns) return _cachedColumns;
  const result = await executeQuery("PRAGMA table_info('logs')");
  _cachedColumns = result.map(col => col.name);
  return _cachedColumns;
};

// Resolución de columnas case-insensitive con múltiples candidatos
const resolveCol = (columns, ...candidates) => {
  for (const c of candidates) {
    const found = columns.find(col => col.toLowerCase() === c.toLowerCase());
    if (found) return found;
  }
  return null;
};

const buildWhere = (columns, filters) => {
  const conds = [];
  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/'/g, "''");
    const parts = columns.map(col => `CAST("${col}" AS VARCHAR) ILIKE '%${term}%'`);
    conds.push(`(${parts.join(' OR ')})`);
  }
  const actionCol = resolveCol(columns, 'Action', 'action');
  if (filters.action && filters.action !== 'all' && actionCol) {
    conds.push(`"${actionCol}" = '${filters.action.replace(/'/g, "''")}'`);
  }
  const envCol = resolveCol(columns, 'Environment', 'Env', 'environment');
  if (filters.environment && filters.environment !== 'all' && envCol) {
    conds.push(`"${envCol}" = '${filters.environment.replace(/'/g, "''")}'`);
  }
  return conds.length ? `WHERE ${conds.join(' AND ')}` : '';
};

export const getKpiMetrics = async () => {
  const columns = await getTableColumns();
  const userCol   = resolveCol(columns, 'User Name', 'Username', 'UserName', 'User', 'user_name');
  const actionCol = resolveCol(columns, 'Action', 'action');
  const envCol    = resolveCol(columns, 'Environment', 'Env', 'environment');
  const failCol   = resolveCol(columns, 'Failed', 'failed', 'Is Failed', 'IsFailed');

  const sql = `
    SELECT
      CAST(COUNT(*) AS INTEGER) as total_events
      ${userCol   ? `, CAST(COUNT(DISTINCT "${userCol}") AS INTEGER) as total_users`   : ', 0 as total_users'}
      ${actionCol ? `, CAST(COUNT(DISTINCT "${actionCol}") AS INTEGER) as total_actions` : ', 0 as total_actions'}
      ${envCol    ? `, CAST(COUNT(DISTINCT "${envCol}") AS INTEGER) as total_envs`     : ', 0 as total_envs'}
      ${failCol   ? `, CAST(SUM(CASE WHEN lower(CAST("${failCol}" AS VARCHAR)) IN ('true','1','yes') THEN 1 ELSE 0 END) AS INTEGER) as total_failed` : ', 0 as total_failed'}
    FROM logs
  `;
  const result = await executeQuery(sql);
  return result[0];
};

export const getActionsDistribution = async () => {
  const columns = await getTableColumns();
  const actionCol = resolveCol(columns, 'Action', 'action');
  if (!actionCol) return [];
  return executeQuery(`
    SELECT "${actionCol}" as Action, CAST(COUNT(*) AS INTEGER) as count
    FROM logs WHERE "${actionCol}" IS NOT NULL AND "${actionCol}" != ''
    GROUP BY "${actionCol}" ORDER BY count DESC LIMIT 10
  `);
};

export const getLogsPaginated = async (limit = 50, offset = 0, filters = {}) => {
  const columns = await getTableColumns();
  const where = buildWhere(columns, filters);
  const timeCol = resolveCol(columns, 'Time', 'Timestamp', 'Date', 'Created At');
  const orderBy = timeCol ? `"${timeCol}" DESC` : `"${columns[0]}" DESC`;
  return executeQuery(`SELECT * FROM logs ${where} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`);
};

export const getFilteredCount = async (filters = {}) => {
  const columns = await getTableColumns();
  const where = buildWhere(columns, filters);
  const result = await executeQuery(`SELECT CAST(COUNT(*) AS INTEGER) as count FROM logs ${where}`);
  return Number(result[0].count);
};

export const getFilterOptions = async () => {
  const columns = await getTableColumns();
  const actionCol = resolveCol(columns, 'Action', 'action');
  const envCol    = resolveCol(columns, 'Environment', 'Env', 'environment');
  const [actions, environments] = await Promise.all([
    actionCol
      ? executeQuery(`SELECT DISTINCT "${actionCol}" as v FROM logs WHERE "${actionCol}" IS NOT NULL AND "${actionCol}" != '' ORDER BY v ASC`).then(r => r.map(x => x.v))
      : Promise.resolve([]),
    envCol
      ? executeQuery(`SELECT DISTINCT "${envCol}" as v FROM logs WHERE "${envCol}" IS NOT NULL AND "${envCol}" != '' ORDER BY v ASC`).then(r => r.map(x => x.v))
      : Promise.resolve([]),
  ]);
  return { actions, environments };
};

export const getTimelineData = async () => {
  const columns = await getTableColumns();
  const timeCol = resolveCol(columns, 'Time', 'Timestamp', 'Date', 'Created At');
  if (!timeCol) return [];
  try {
    return await executeQuery(`
      SELECT
        strftime(TRY_CAST("${timeCol}" AS TIMESTAMP), '%Y-%m-%d %H:00') as hour,
        CAST(COUNT(*) AS INTEGER) as count
      FROM logs
      WHERE TRY_CAST("${timeCol}" AS TIMESTAMP) IS NOT NULL
      GROUP BY hour ORDER BY hour ASC
    `);
  } catch (e) {
    console.warn('Timeline error:', e.message);
    return [];
  }
};
