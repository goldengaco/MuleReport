import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getKpiMetrics, getActionsDistribution, getLogsPaginated,
  getFilterOptions, getTimelineData, getTableColumns,
  getFilteredCount, getLogsAllFiltered
} from '../db/queries';

const PAGE_SIZE = 50;

export const useDashboardData = (file) => {
  const [metrics, setMetrics]           = useState(null);
  const [actionsData, setActionsData]   = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [recentLogs, setRecentLogs]     = useState([]);
  const [columns, setColumns]           = useState([]);
  const [filterOptions, setFilterOptions] = useState({ actions: [], environments: [] });
  const [filters, setFilters]           = useState({ search: '', action: 'all', environment: 'all' });
  const [searchInput, setSearchInput]   = useState('');
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage]                 = useState(0);

  const debounceRef = useRef(null);
  const prefetchCache = useRef({}); // Memoria caché para el truco de Spotify

  const refreshTable = useCallback(async (currentFilters, currentPage) => {
    setTableLoading(true);
    try {
      // Si ya lo tenemos pre-cargado, lo usamos
      if (prefetchCache.current[currentPage]) {
        setRecentLogs(prefetchCache.current[currentPage]);
        const countRes = await getFilteredCount(currentFilters);
        setTotalFiltered(Number(countRes));
        return;
      }

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

  // Función del "Truco de Spotify": Carga datos antes del clic
  const handlePrefetch = useCallback(async (targetPage) => {
    const totalP = Math.ceil(totalFiltered / PAGE_SIZE);
    if (targetPage < 0 || targetPage >= totalP || prefetchCache.current[targetPage]) return;
    
    try {
      const logs = await getLogsPaginated(PAGE_SIZE, targetPage * PAGE_SIZE, filters);
      prefetchCache.current[targetPage] = logs;
    } catch (e) {}
  }, [totalFiltered, filters]);

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

  useEffect(() => {
    if (file) loadDashboard(filters);
  }, [file, loadDashboard]);

  const handleSearchInput = (value) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // Si el valor es vacío, refrescar inmediatamente (UX fluida)
    if (value.trim() === '') {
      const newFilters = { ...filters, search: '' };
      setFilters(newFilters);
      setPage(0);
      prefetchCache.current = {};
      refreshTable(newFilters, 0);
      return;
    }

    // No disparar búsquedas pesadas de 1 o 2 letras mientras se escribe
    // Esperamos 500ms para asegurar que el usuario terminó o quiere esa búsqueda corta
    debounceRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: value };
      setFilters(newFilters);
      setPage(0);
      prefetchCache.current = {}; // Limpiar caché al cambiar filtros
      refreshTable(newFilters, 0);
    }, 500);
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setPage(0);
    prefetchCache.current = {}; // Limpiar caché al cambiar filtros
    refreshTable(newFilters, 0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    refreshTable(filters, newPage);
  };

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  const handleExportCSV = async () => {
    try {
      const logs = await getLogsAllFiltered(filters);
      const data = logs.toArray().map(r => r.toJSON());
      if (data.length === 0) return;
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
          const val = row[h] === null ? '' : String(row[h]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MuleReport_Export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error exportando CSV:', e);
    }
  };

  return {
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
    totalPages,
    handleSearchInput,
    handleFilterChange,
    handlePageChange,
    handlePrefetch,
    handleExportCSV,
    reload: () => loadDashboard(filters)
  };
};
