import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './assets/css/global.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/js/custom.js';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
