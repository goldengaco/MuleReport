import { useState } from 'react'
import UploadArea from './components/dashboard/UploadArea'
import DashboardView from './components/dashboard/DashboardView'
import { importCSV, resetDB } from './db/duckdb-service'

function App() {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async (selectedFile) => {
    setIsLoading(true)
    try {
      await importCSV(selectedFile)
      setFile(selectedFile)
    } catch (error) {
      console.error('Error al importar CSV:', error)
      alert(`Error al procesar el archivo: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    await resetDB()
    setFile(null)
  }

  return (
    <div className="app-container">
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} isLoading={isLoading} />
      ) : (
        <DashboardView file={file} onReset={handleReset} />
      )}
      
      <footer className="footer">
        MuleSoft Audit Log Analyzer &copy; 2026 - Powered by DuckDB WASM
      </footer>
    </div>
  )
}

export default App
