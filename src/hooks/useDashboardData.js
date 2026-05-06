import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getKpiMetrics, getActionsDistribution, getLogsPaginated,
  getFilterOptions, getTimelineData, getTableColumns,
  getFilteredCount
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
    reload: () => loadDashboard(filters)
  };
};
