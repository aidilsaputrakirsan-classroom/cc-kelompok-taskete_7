import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { ServiceStatusProvider } from './context/ServiceStatusContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ServiceStatusProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ServiceStatusProvider>
  </StrictMode>,
)