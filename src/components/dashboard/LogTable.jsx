import PayloadViewer from './PayloadViewer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 50;

const LogTable = ({ 
  logs, 
  columns, 
  loading, 
  totalCount, 
  page, 
  onPageChange,
  onPrefetch
}) => {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderCell = (col, val) => {
    const colLow = col.toLowerCase();
    if (colLow === 'payload' || colLow === 'failed cause' || colLow === 'failedcause') return <PayloadViewer value={val} />;
    if (colLow === 'action') return <span className="tag action-tag">{val}</span>;
    if (colLow === 'user name' || colLow === 'username' || colLow === 'user') return <span className="user-text">{val}</span>;
    if (colLow === 'failed' || colLow === 'is failed') {
      const isFailed = String(val).toLowerCase() === 'true' || val === '1';
      return <span className={isFailed ? 'text-fail' : 'text-success'}>{isFailed ? '✗ FALLÓ' : '✓ OK'}</span>;
    }
    if (colLow === 'environment' || colLow === 'env') {
      const isProd = /prod/i.test(String(val));
      return <span className={`tag env-tag ${isProd ? 'prod' : 'non-prod'}`}>{val}</span>;
    }
    return <span className="default-cell" title={val}>{val}</span>;
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        {loading && (
          <div className="table-overlay">
            <span>Buscando…</span>
          </div>
        )}
        
        <div style={{ maxHeight: '600px', overflowY: 'auto', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.78rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#0f172a' }}>
              <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                {columns.filter(col => col !== 'search_index').map(col => (
                  <th key={col} style={{ 
                    padding: '0.75rem 0.5rem', whiteSpace: 'nowrap', fontWeight: 600, 
                    fontSize: '0.72rem', textTransform: 'uppercase', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={idx} className="log-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {columns.filter(col => col !== 'search_index').map(col => (
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
            No se encontraron registros.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <span className="pagination-info">
            Página {page + 1} de {totalPages} · {totalCount.toLocaleString()} registros
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => onPageChange(page - 1)} onMouseEnter={() => onPrefetch(page - 1)} disabled={page === 0} className="pagination-btn">
              <ChevronLeft size={13} /> Anterior
            </button>
            <button onClick={() => onPageChange(page + 1)} onMouseEnter={() => onPrefetch(page + 1)} disabled={page >= totalPages - 1} className="pagination-btn">
              Siguiente <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .tag { padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
        .action-tag { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .env-tag.prod { background: rgba(239,68,68,0.15); color: #f87171; }
        .env-tag.non-prod { background: rgba(16,185,129,0.15); color: #34d399; }
        .user-text { fontWeight: 600; color: #e2e8f0; white-space: nowrap; }
        .text-fail { color: #f87171; font-weight: 600; font-size: 0.7rem; }
        .text-success { color: #4ade80; font-weight: 600; font-size: 0.7rem; }
        .default-cell { color: #94a3b8; text-overflow: ellipsis; white-space: nowrap; display: block; overflow: hidden; }
        .table-overlay { position: absolute; inset: 0; background: rgba(11,15,25,0.6); display: flex; align-items: center; justifyContent: center; zIndex: 50; border-radius: 8px; backdrop-filter: blur(2px); color: var(--text-muted); }
        .pagination-container { display: flex; align-items: center; justify-content: space-between; marginTop: 1rem; paddingTop: 0.75rem; borderTop: 1px solid rgba(255,255,255,0.05); }
        .pagination-info { font-size: 0.75rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
};

export default LogTable;
