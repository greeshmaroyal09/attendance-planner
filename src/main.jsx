import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerPwaServiceWorker } from './utils/pwa';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerPwaServiceWorker();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
