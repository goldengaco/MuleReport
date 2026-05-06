import { Search, Filter, Globe, ListChecks } from 'lucide-react';

const FilterBar = ({ 
  searchInput, 
  onSearchChange, 
  filterOptions, 
  filters, 
  onFilterChange, 
  totalCount, 
  tableLoading 
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', margin: 0 }}>
          <ListChecks size={16} style={{ color: 'var(--accent-primary)' }} />
          Registros de Auditoría
        </h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {tableLoading ? '…' : `${totalCount.toLocaleString()} registros`}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="filter-input"
            style={{ width: '260px' }}
          />
        </div>

        {/* Filtro de Acción */}
        {filterOptions.actions.length > 0 && (
          <div style={{ position: 'relative' }}>
            <Filter size={12} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <select
              value={filters.action}
              onChange={(e) => onFilterChange('action', e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las Acciones</option>
              {filterOptions.actions.map(a => (
                <option key={a} value={a}>{a}</option>
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
              onChange={(e) => onFilterChange('environment', e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los Entornos</option>
              {filterOptions.environments.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
