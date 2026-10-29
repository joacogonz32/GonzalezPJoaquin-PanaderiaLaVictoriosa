import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ToastProvider } from './context/ToastProvider'
import { AuthProvider } from './context/AuthProvider'
import { CartProvider } from './context/CartProvider'
import App from './App.jsx'
import './styles/variables.css'
import './styles/base.css'
import './styles/components.css'
import './styles/pages.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
