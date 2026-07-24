import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply the saved theme before first paint so the login screen (which mounts
// before AppProvider) honours the user's preference too.
if (JSON.parse(localStorage.getItem('darkMode') || 'false')) {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
