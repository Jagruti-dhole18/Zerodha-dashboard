import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress console warnings from Chart.js SVG rendering
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0]?.includes?.('Invalid DOM property `class`')) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

