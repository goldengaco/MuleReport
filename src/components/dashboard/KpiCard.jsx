import { useState, useEffect } from 'react';

const KpiCard = ({ title, value, icon: Icon, color = 'var(--accent-primary)' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animación de conteo (UX)
  useEffect(() => {
    if (value === undefined || value === null) return;
    const target = typeof value === 'bigint' ? Number(value) : Number(value);
    if (isNaN(target)) return;

    let start = 0;
    const duration = 1000; // 1 segundo
    const increment = target / (duration / 16); // 60 FPS aprox

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val) => {
    if (val === undefined || val === null) return '--';
    if (isNaN(val)) return String(val);
    return val.toLocaleString('es-MX');
  };

  return (
    <div className="glass-panel kpi-card-hover" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }}>
      <div style={{
        padding: '0.875rem', borderRadius: '14px',
        backgroundColor: `${color}12`, color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: `inset 0 0 10px ${color}10`,
        border: `1px solid ${color}20`
      }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: 500 }}>{title}</p>
        <h3 style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: 1, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          {formatValue(displayValue)}
        </h3>
      </div>
      <style>{`
        .kpi-card-hover:hover {
          transform: translateY(-3px);
          border-color: ${color}40 !important;
          box-shadow: 0 10px 20px -10px ${color}30;
        }
      `}</style>
    </div>
  );
};

export default KpiCard;
