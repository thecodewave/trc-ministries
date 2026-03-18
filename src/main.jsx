// ============================================================
// TRC Ministries — main.jsx
// Entry point. Imports global styles then mounts React.
// ============================================================

import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'

// Global styles — order matters
import './styles/variables.css'
import './styles/reset.css'
import './styles/typography.css'

import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
