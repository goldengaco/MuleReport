import { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Activity, ListChecks, Search, Filter, Download, ArrowLeft, Globe, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import KpiCard from './KpiCard';
import ActionChart from './ActionChart';
import TimelineChart from './TimelineChart';
import PayloadViewer from './PayloadViewer';
import {
  getKpiMetrics, getActionsDistribution, getLogsPaginated,
  getFilterOptions, getTimelineData, getTableColumns,
  getFilteredCount
} from '../../db/queries';
import { formatBytes } from '../../utils/formatters';

const PAGE_SIZE = 50;

const DashboardView = ({ file, onReset }) => {
  const [metrics, setMetrics]           = useState(null);
  const [actionsData, setActionsData]   = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [recentLogs, setRecentLogs]     = useState([]);
  const [columns, setColumns]           = useState([]);
  const [filterOptions, setFilterOptions] = useState({ actions: [], environments: [] });
  const [filters, setFilters]           = useState({ search: '', action: 'all', environment: 'all' });
  const [searchInput, setSearchInput]   = useState(''); // valor del input (debounced)
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage]                 = useState(0);

  const debounceRef = useRef(null);

  // ── Carga inicial del dashboard ───────────────────────────────────────────
  const loadDashboard = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const cols = await getTableColumns();
      setColumns(cols);

      const [m, a, l, o, t, c] = await Promise.all([
        getKpiMetrics(),
        getActionsDistribution(),
        getLogsPaginated(PAGE_SIZE, 0, currentFilters),
        getFilterOptions(),
        getTimelineData(),
        getFilteredCount(currentFilters),
      ]);
      setMetrics(m);
      setActionsData(a);
      setRecentLogs(l);
      setFilterOptions(o);
      setTimelineData(t);
      setTotalFiltered(Number(c));
      setPage(0);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(filters); }, []);

  // ── Actualizar tabla cuando cambian filtros o página ─────────────────────
  const refreshTable = useCallback(async (currentFilters, currentPage) => {
    setTableLoading(true);
    try {
      const [logs, count] = await Promise.all([
        getLogsPaginated(PAGE_SIZE, currentPage * PAGE_SIZE, currentFilters),
        getFilteredCount(currentFilters),
      ]);
      setRecentLogs(logs);
      setTotalFiltered(Number(count));
    } catch (e) {
      console.error('Error en refreshTable:', e);
    } finally {
      setTableLoading(false);
    }
  }, []);

  // ── Debounce del buscador (400 ms) ───────────────────────────────────────
  const handleSearchInput = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: value };
      setFilters(newFilters);
      setPage(0);
      refreshTable(newFilters, 0);
    }, 400);
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setPage(0);
    refreshTable(newFilters, 0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    refreshTable(filters, newPage);
  };

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  // ── Renderizado ──────────────────────────────────────────────────────────
  return (
    <div className="main-content" style={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ── */}
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onReset}
            className="glass-panel"
            style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }}
            title="Cambiar archivo"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Audit Dashboard</h1>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <div className="glass-panel" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-primary)', border: '1px solid var(--border-accent)' }}>
                📄 {file.name}
              </div>
              <div className="glass-panel" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                💾 {formatBytes(file.size)}
              </div>
              <div className="glass-panel" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                📅 {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div className="glass-panel" style={{ padding: '0.2rem 0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                🗂 {columns.length} columnas
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="glass-panel"
            style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => loadDashboard(filters)}
            title="Recargar"
          >
            <RefreshCw size={14} />
          </button>
          <button
            className="glass-panel"
            style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => window.print()}
          >
            <Download size={14} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KpiCard title="Total de Eventos"  value={metrics?.total_events}  icon={Activity}      color="#3B82F6" />
        <KpiCard title="Usuarios Únicos"   value={metrics?.total_users}   icon={Users}         color="#8B5CF6" />
        <KpiCard title="Tipos de Acción"   value={metrics?.total_actions} icon={ListChecks}    color="#10B981" />
        <KpiCard title="Entornos"          value={metrics?.total_envs}    icon={Globe}         color="#F59E0B" />
        <KpiCard title="Eventos Fallidos"  value={metrics?.total_failed}  icon={AlertTriangle} color="#EF4444" />
      </div>

      {/* ── Gráficos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
            Distribución Temporal
          </h3>
          {loading
            ? <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando…</div>
            : <TimelineChart data={timelineData} />}
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <ListChecks size={16} style={{ color: 'var(--accent-primary)' }} />
            Top 10 Acciones
          </h3>
          {loading
            ? <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando…</div>
            : <ActionChart data={actionsData} />}
        </div>
      </div>

      {/* ── Tabla de Logs ── */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Barra de filtros */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: 0 }}>
              <ListChecks size={16} style={{ color: 'var(--accent-primary)' }} />
              Registros de Auditoría
            </h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {tableLoading ? '…' : `${totalFiltered.toLocaleString()} registros`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Buscador */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar en todas las columnas…"
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  fontSize: '0.8rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  width: '260px',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Filtro de Acción */}
            {filterOptions.actions.length > 0 && (
              <div style={{ position: 'relative' }}>
                <Filter size={12} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem 0.45rem 1.75rem',
                    fontSize: '0.8rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    appearance: 'none',
                    outline: 'none',
                  }}
                >
                  <option value="all" style={{ background: '#111827' }}>Todas las Acciones</option>
                  {filterOptions.actions.map(a => (
                    <option key={a} value={a} style={{ background: '#111827' }}>{a}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro de Entorno */}
            {filterOptions.environments.length > 0 && (
              <div style={{ position: 'relative' }}>
                <Globe size={12} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select
                  value={filters.environment}
                  onChange={(e) => handleFilterChange('environment', e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem 0.45rem 1.75rem',
                    fontSize: '0.8rem',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    appearance: 'none',
                    outline: 'none',
                  }}
                >
                  <option value="all" style={{ background: '#111827' }}>Todos los Entornos</option>
                  {filterOptions.environments.map(e => (
                    <option key={e} value={e} style={{ background: '#111827' }}>{e}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto', position: 'relative' }}>
          {tableLoading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(11,15,25,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, borderRadius: '8px', backdropFilter: 'blur(2px)'
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Buscando…</span>
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', textAlign: 'left' }}>
                {columns.map(col => (
                  <th key={col} style={{ padding: '0.6rem 0.5rem', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log, idx) => (
                <tr
                  key={idx}
                  className="log-row"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  {columns.map(col => {
                    const val = log[col];
                    const colLow = col.toLowerCase();

                    if (colLow === 'payload' || colLow === 'failed cause' || colLow === 'failedcause') return (
                      <td key={col} style={{ padding: '0.55rem 0.5rem' }}>
                        <PayloadViewer value={val} />
                      </td>
                    );
                    if (colLow === 'action') return (
                      <td key={col} style={{ padding: '0.55rem 0.5rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{val}</span>
                      </td>
                    );
                    if (colLow === 'user name' || colLow === 'username' || colLow === 'user') return (
                      <td key={col} style={{ padding: '0.55rem 0.5rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' }}>{val}</td>
                    );
                    if (colLow === 'failed' || colLow === 'is failed') return (
                      <td key={col} style={{ padding: '0.55rem 0.5rem' }}>
                        {String(val).toLowerCase() === 'true' || val === '1'
                          ? <span style={{ color: '#f87171', fontWeight: 600, fontSize: '0.7rem' }}>✗ FALLÓ</span>
                          : <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>✓ OK</span>}
                      </td>
                    );
                    if (colLow === 'environment' || colLow === 'env') {
                      const isProd = /prod/i.test(String(val));
                      return (
                        <td key={col} style={{ padding: '0.55rem 0.5rem' }}>
                          <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', backgroundColor: isProd ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: isProd ? '#f87171' : '#34d399' }}>{val}</span>
                        </td>
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
                        <td key={col} style={{ padding: '0.55rem 0.5rem', color: '#94a3b8', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          {formattedDate}
                        </td>
                      );
                    }
                    if (colLow === 'clientip' || colLow === 'client ip' || colLow === 'ip') {
                      return (
                        <td key={col} style={{ padding: '0.55rem 0.5rem', color: '#cbd5e1', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          <span style={{ padding: '0.15rem 0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {val}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td key={col} title={val} style={{ padding: '0.55rem 0.5rem', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {recentLogs.length === 0 && !tableLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No se encontraron registros con los filtros aplicados.
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Página {page + 1} de {totalPages} · Mostrando {Math.min(PAGE_SIZE, totalFiltered - page * PAGE_SIZE)} de {totalFiltered.toLocaleString()} registros
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => handlePageChange(0)}
                disabled={page === 0}
                style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page === 0 ? 'var(--text-muted)' : 'white', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
              >«</button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page === 0 ? 'var(--text-muted)' : 'white', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              ><ChevronLeft size={13} /> Anterior</button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page >= totalPages - 1 ? 'var(--text-muted)' : 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >Siguiente <ChevronRight size={13} /></button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={page >= totalPages - 1}
                style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: page >= totalPages - 1 ? 'var(--text-muted)' : 'white', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
              >»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
