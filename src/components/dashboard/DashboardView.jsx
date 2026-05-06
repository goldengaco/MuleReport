import { Activity, ListChecks, Download, ArrowLeft, RefreshCw } from 'lucide-react';
import ActionChart from './ActionChart';
import TimelineChart from './TimelineChart';
import KpiGrid from './KpiGrid';
import FilterBar from './FilterBar';
import LogTable from './LogTable';
import { useDashboardData } from '../../hooks/useDashboardData';
import { formatBytes } from '../../utils/formatters';
import '../../styles/dashboard.css';

const DashboardView = ({ file, onReset }) => {
  const {
    metrics,
    actionsData,
    timelineData,
    recentLogs,
    columns,
    filterOptions,
    filters,
    searchInput,
    totalFiltered,
    loading,
    tableLoading,
    page,
    handleSearchInput,
    handleFilterChange,
    handlePageChange,
    reload
  } = useDashboardData(file);

  return (
    <div className="main-content">

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
              <div className="glass-panel info-tag">
                📄 {file.name}
              </div>
              <div className="glass-panel info-tag">
                💾 {formatBytes(file.size)}
              </div>
              <div className="glass-panel info-tag" style={{ color: 'var(--text-muted)' }}>
                📅 {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div className="glass-panel info-tag" style={{ color: 'var(--text-muted)' }}>
                🗂 {columns.length} columnas
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="glass-panel action-btn"
            onClick={reload}
            title="Recargar"
          >
            <RefreshCw size={14} />
          </button>
          <button
            className="glass-panel action-btn"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => window.print()}
          >
            <Download size={14} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <KpiGrid metrics={metrics} />

      {/* ── Gráficos ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
            Distribución Temporal
          </h3>
          {loading
            ? <div className="loader-box">Cargando…</div>
            : <TimelineChart data={timelineData} />}
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <ListChecks size={16} style={{ color: 'var(--accent-primary)' }} />
            Top 10 Acciones
          </h3>
          {loading
            ? <div className="loader-box">Cargando…</div>
            : <ActionChart data={actionsData} />}
        </div>
      </div>

      {/* ── Filtros y Tabla ── */}
      <FilterBar 
        searchInput={searchInput}
        onSearchChange={handleSearchInput}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={handleFilterChange}
        totalCount={totalFiltered}
        tableLoading={tableLoading}
      />

      <LogTable 
        logs={recentLogs}
        columns={columns}
        loading={tableLoading}
        totalCount={totalFiltered}
        page={page}
        onPageChange={handlePageChange}
      />

      <style>{`
        .info-tag {
          padding: 0.2rem 0.6rem; 
          font-size: 0.72rem; 
          background-color: rgba(59, 130, 246, 0.12); 
          color: var(--accent-primary); 
          border: 1px solid var(--border-accent);
        }
        .action-btn {
          padding: 0.5rem 1rem; 
          color: var(--text-muted); 
          background: rgba(255,255,255,0.03); 
          font-size: 0.8rem; 
          display: flex; 
          align-items: center; 
          gap: 0.4rem;
        }
        .loader-box {
          height: 200px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
