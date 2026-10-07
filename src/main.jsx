import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startPagination } from './ui/dossier/pagination'

/* Lays the dossiers out into sheets for this window, and again whenever it
   changes size - see ui/dossier/pagination.jsx. */
startPagination()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
