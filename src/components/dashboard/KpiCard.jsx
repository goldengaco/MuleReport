const KpiCard = ({ title, value, icon: Icon, color = 'var(--accent-primary)' }) => {
  const formatValue = (val) => {
    if (val === undefined || val === null) return '--';
    // Manejar BigInt de DuckDB WASM
    const num = typeof val === 'bigint' ? Number(val) : Number(val);
    if (isNaN(num)) return String(val);
    return num.toLocaleString('es-MX');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        padding: '0.875rem', borderRadius: '12px',
        backgroundColor: `${color}18`, color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={22} />
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.2rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', lineHeight: 1 }}>
          {formatValue(value)}
        </h3>
      </div>
    </div>
  );
};

export default KpiCard;
