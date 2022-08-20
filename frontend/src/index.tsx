import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

const container = document.getElementById('app')
if (!container) {
  throw new Error('container not found')
}

createRoot(container).render(
  <StrictMode>
    <App/>
  </StrictMode>
)
