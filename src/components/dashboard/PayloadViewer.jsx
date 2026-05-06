import { useState } from 'react';
import { X, Copy, CheckCheck } from 'lucide-react';

// Syntax highlighting para JSON
const highlight = (json) => {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-string';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
};

const PayloadViewer = ({ value }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!value || value === 'null' || value === '') {
    return <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>—</span>;
  }

  let parsed = null;
  let formatted = value;
  try {
    parsed = JSON.parse(value);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    // No es JSON válido, mostrar como texto
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem',
          background: parsed ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${parsed ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color: parsed ? '#a78bfa' : '#94a3b8', cursor: 'pointer',
          fontFamily: 'monospace', whiteSpace: 'nowrap',
        }}
        title="Ver Payload completo"
      >
        {parsed ? '{ JSON }' : 'Ver'}
      </button>

      {open && (
        <div
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '1rem', backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', width: '100%', maxWidth: '720px', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                {parsed ? '📦 Payload (JSON)' : '📄 Payload (Texto)'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.65rem', color: copied ? '#4ade80' : '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {copied ? <><CheckCheck size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                </button>
                <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.5rem', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ overflowY: 'auto', padding: '1rem 1.25rem' }}>
              {parsed ? (
                <pre
                  dangerouslySetInnerHTML={{ __html: highlight(formatted) }}
                  style={{ margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace", fontSize: '0.8rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                />
              ) : (
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .json-key    { color: #79c0ff; }
        .json-string { color: #a5d6ff; }
        .json-number { color: #ffa657; }
        .json-bool   { color: #ff7b72; font-weight: bold; }
        .json-null   { color: #8b949e; font-style: italic; }
      `}</style>
    </>
  );
};

export default PayloadViewer;
