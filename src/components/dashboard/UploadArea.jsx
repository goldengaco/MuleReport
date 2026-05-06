import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

const UploadArea = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Por favor, selecciona un archivo CSV válido.');
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndProcessFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndProcessFile(file);
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div 
        className={`glass-panel ${isDragging ? 'dragging' : ''}`}
        style={{ 
          padding: '4rem', 
          textAlign: 'center', 
          maxWidth: '800px', 
          width: '100%',
          border: isDragging ? '2px dashed var(--accent-primary)' : '1px solid var(--border-subtle)',
          transition: 'var(--transition-normal)',
          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-surface)'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          {isLoading ? (
            <Loader2 size={64} className="text-gradient" style={{ animation: 'spin 2s linear infinite' }} />
          ) : (
            <div style={{ 
              position: 'relative',
              animation: isDragging ? 'pulse 1.5s infinite' : 'none'
            }}>
              <Upload 
                size={64} 
                className={isDragging ? 'text-gradient' : ''} 
                style={{ 
                  color: isDragging ? 'var(--accent-primary)' : 'var(--text-muted)',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isDragging ? 'scale(1.1) translateY(-5px)' : 'scale(1)'
                }} 
              />
              {isDragging && (
                <div style={{
                  position: 'absolute',
                  inset: -10,
                  border: '2px solid var(--accent-primary)',
                  borderRadius: '50%',
                  animation: 'ripple 1.5s infinite'
                }} />
              )}
            </div>
          )}
        </div>

        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {isLoading ? 'Procesando Logs...' : 'Audit Log Analyzer'}
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          {isLoading 
            ? 'DuckDB está indexando los datos en memoria para consultas instantáneas.' 
            : 'Arrastra tu Audit Log de MuleSoft (.csv) aquí o haz clic para buscar.'}
        </p>

        {!isLoading && (
          <>
            <button 
              className="glass-panel" 
              style={{ 
                padding: '1rem 3rem', 
                background: 'var(--accent-gradient)', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar Archivo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv" 
              style={{ display: 'none' }} 
            />
          </>
        )}

        {error && (
          <div style={{ marginTop: '2rem', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <FileText size={16} />
            <span>Formatos CSV</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            <span>Local & Seguro</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default UploadArea;
