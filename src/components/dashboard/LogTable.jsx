import PayloadViewer from './PayloadViewer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 50;

const LogTable = ({ 
  logs, 
  columns, 
  loading, 
  totalCount, 
  page, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderCell = (col, val) => {
    const colLow = col.toLowerCase();

    if (colLow === 'payload' || colLow === 'failed cause' || colLow === 'failedcause') {
      return <PayloadViewer value={val} />;
    }
    
    if (colLow === 'action') {
      return (
        <span style={{ 
          padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', 
          fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.15)', 
          color: '#60a5fa', textTransform: 'uppercase', whiteSpace: 'nowrap' 
        }}>{val}</span>
      );
    }

    if (colLow === 'user name' || colLow === 'username' || colLow === 'user') {
      return <span style={{ fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' }}>{val}</span>;
    }

    if (colLow === 'failed' || colLow === 'is failed') {
      const isFailed = String(val).toLowerCase() === 'true' || val === '1';
      return (
        <span style={{ color: isFailed ? '#f87171' : '#4ade80', fontWeight: 600, fontSize: '0.7rem' }}>
          {isFailed ? '✗ FALLÓ' : '✓ OK'}
        </span>
      );
    }

    if (colLow === 'environment' || colLow === 'env') {
      const isProd = /prod/i.test(String(val));
      return (
        <span style={{ 
          padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', 
          backgroundColor: isProd ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', 
          color: isProd ? '#f87171' : '#34d399' 
        }}>{val}</span>
      );
    }

    if (colLow === 'time' || colLow === 'timestamp' || colLow === 'date' || colLow === 'created at') {
      let formattedDate = val;
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleString('es-MX', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute:'2-digit', second:'2-digit' 
          });
        }
      } catch(e){}
      return (
        <span style={{ color: '#94a3b8', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.72rem' }}>
          {formattedDate}
        </span>
      );
    }

    if (colLow === 'clientip' || colLow === 'client ip' || colLow === 'ip') {
      return (
        <span style={{ 
          padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.05)', 
          borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
          color: '#cbd5e1', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.72rem'
        }}>{val}</span>
      );
    }

    return (
      <span title={val} style={{ 
        color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', 
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' 
      }}>{val}</span>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(11,15,25,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, borderRadius: '8px', backdropFilter: 'blur(2px)'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Buscando…</span>
          </div>
        )}
        
        <div style={{ maxHeight: '600px', overflowY: 'auto', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.78rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#0f172a' }}>
              <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                {columns.map(col => (
                  <th key={col} style={{ 
                    padding: '0.75rem 0.5rem', 
                    whiteSpace: 'nowrap', 
                    fontWeight: 600, 
                    fontSize: '0.72rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(8px)'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} className="log-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s' }}>
                  {columns.map(col => (
                    <td key={col} style={{ padding: '0.55rem 0.5rem' }}>
                      {renderCell(col, log[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No se encontraron registros con los filtros aplicados.
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Página {page + 1} de {totalPages} · Mostrando {Math.min(PAGE_SIZE, totalCount - page * PAGE_SIZE)} de {totalCount.toLocaleString()} registros
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onPageChange(0)}
              disabled={page === 0}
              className="pagination-btn"
              style={{ opacity: page === 0 ? 0.5 : 1 }}
            >«</button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="pagination-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', opacity: page === 0 ? 0.5 : 1 }}
            ><ChevronLeft size={13} /> Anterior</button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="pagination-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
            >Siguiente <ChevronRight size={13} /></button>
            <button
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="pagination-btn"
              style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
            >»</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogTable;
