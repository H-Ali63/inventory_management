import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e2535',
            color: '#e8ecf4',
            border: '1px solid #2a3147',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13.5px',
          },
          success: { iconTheme: { primary: '#34d17a', secondary: '#1e2535' } },
          error: { iconTheme: { primary: '#f05252', secondary: '#1e2535' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
