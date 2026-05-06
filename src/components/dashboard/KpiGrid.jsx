import { memo } from 'react';
import { Users, Activity, ListChecks, Globe, AlertTriangle } from 'lucide-react';
import KpiCard from './KpiCard';

const KpiGrid = ({ metrics }) => {
  return (
    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
      <KpiCard title="Total de Eventos"  value={metrics?.total_events}  icon={Activity}      color="#3B82F6" />
      <KpiCard title="Usuarios Únicos"   value={metrics?.total_users}   icon={Users}         color="#8B5CF6" />
      <KpiCard title="Tipos de Acción"   value={metrics?.total_actions} icon={ListChecks}    color="#10B981" />
      <KpiCard title="Entornos"          value={metrics?.total_envs}    icon={Globe}         color="#F59E0B" />
      <KpiCard title="Eventos Fallidos"  value={metrics?.total_failed}  icon={AlertTriangle} color="#EF4444" />
    </div>
  );
};

export default memo(KpiGrid);
