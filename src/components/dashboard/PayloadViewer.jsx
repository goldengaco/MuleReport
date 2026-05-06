import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, CheckCheck, Code2, Eye } from 'lucide-react';

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

  // UX: Atajos de teclado y gestión de scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!value || value === 'null' || value === '') {
    return <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>—</span>;
  }

  let parsed = null;
  let formatted = value;
  try {
    parsed = JSON.parse(value);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    // No es JSON válido
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Modal = (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, padding: '1rem', backdropFilter: 'blur(5px)'
      }}
    >
      <div className="modal-content" style={{
        background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
        animation: 'modalIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.4rem', background: 'rgba(139,92,246,0.1)', borderRadius: '8px' }}>
              <ListIcon size={18} color="#a78bfa" />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              {parsed ? 'Explorador de Payload' : 'Contenido del Evento'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleCopy} className="modal-action-btn">
              {copied ? <><CheckCheck size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
            </button>
            <button onClick={() => setOpen(false)} className="modal-close-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {parsed ? (
            <pre
              dangerouslySetInnerHTML={{ __html: highlight(formatted) }}
              style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            />
          ) : (
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem', color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</pre>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .json-key    { color: #79c0ff; }
        .json-string { color: #a5d6ff; }
        .json-number { color: #ffa657; }
        .json-bool   { color: #ff7b72; font-weight: bold; }
        .json-null   { color: #8b949e; font-style: italic; }
        .modal-action-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0.5rem 0.8rem; color: #e2e8f0;
          cursor: pointer; fontSize: 0.8rem; display: flex; alignItems: center; gap: 0.5rem;
          transition: all 0.2s;
        }
        .modal-action-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .modal-close-btn {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px; padding: 0.4rem; color: #f87171; cursor: pointer;
          transition: all 0.2s;
        }
        .modal-close-btn:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
      `}</style>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`payload-trigger ${parsed ? 'is-json' : 'is-text'}`}
      >
        {parsed ? (
          <>
            <Code2 size={12} />
            <span>JSON</span>
          </>
        ) : (
          <>
            <Eye size={12} />
            <span>Ver</span>
          </>
        )}
      </button>

      {open && createPortal(Modal, document.body)}

      <style>{`
        .payload-trigger {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .payload-trigger.is-json {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #a78bfa;
        }
        .payload-trigger.is-json:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: #8b5cf6;
          box-shadow: 0 0 12px rgba(139, 92, 246, 0.2);
          transform: translateY(-1px);
        }
        .payload-trigger.is-text {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        .payload-trigger.is-text:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: #f8fafc;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
};

const ListIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default PayloadViewer;
