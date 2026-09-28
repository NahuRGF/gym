import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { registrarServiceWorker } from './lib/pwa'
import './index.css'

const contenedor = document.getElementById('root')

if (!contenedor) {
  throw new Error('No se encontró el elemento #root en index.html')
}

// HashRouter y no BrowserRouter: GitHub Pages no tiene rewrites, asi que una URL
// limpia tipo /gym/socios devolveria 404 al recargar. El hash resuelve eso sin
// necesitar un 404.html duplicado que pueda desincronizarse del index.html.
createRoot(contenedor).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)

registrarServiceWorker()
