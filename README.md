# MuleSoft Audit Log Analyzer (Master Edition)

Este sistema es una herramienta de auditoría de grado empresarial diseñada para procesar archivos CSV de Audit Log de MuleSoft directamente en el navegador.

## 🚀 Características
- **Procesamiento Instantáneo:** Utiliza **DuckDB-WASM** para indexar y consultar archivos de más de 50MB en milisegundos.
- **Privacidad Total:** Los datos nunca salen de tu máquina; todo el procesamiento ocurre en la memoria RAM local.
- **Interfaz Premium:** Diseño moderno con efectos Glassmorphism, modo oscuro profundo y animaciones fluidas.
- **Análisis Visual:** Gráficos interactivos para identificar tendencias y acciones más frecuentes.
- **Filtros Avanzados:** Búsqueda y filtrado por tipo de acción en tiempo real mediante SQL nativo.

## 🛠️ Stack Tecnológico
- **Frontend:** React 18 + Vite
- **Base de Datos:** DuckDB WebAssembly
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Estilos:** Vanilla CSS (CSS Variables)

## 🏃 Cómo ejecutarlo
1. Instala las dependencias: `npm install`
2. Inicia el servidor de desarrollo: `npm run dev`
3. Abre tu navegador en la dirección indicada (usualmente `http://localhost:5173`)
4. Arrastra tu archivo de Audit Log de MuleSoft y comienza el análisis.

---
Desarrollado con ❤️ para auditorías de alta velocidad.
