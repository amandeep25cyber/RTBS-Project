import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SimulatorProvider } from './context/SimulatorContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SimulatorProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SimulatorProvider>
  </StrictMode>,
)
