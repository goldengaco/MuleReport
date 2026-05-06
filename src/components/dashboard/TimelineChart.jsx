import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TimelineChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      No hay datos temporales disponibles
    </div>
  );

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="hour" 
            stroke="var(--text-muted)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => value.split(' ')[1]} // Solo mostrar la hora
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="var(--accent-primary)" 
            fillOpacity={1} 
            fill="url(#colorCount)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimelineChart;
