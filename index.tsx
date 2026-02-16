import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical Error: Root element #root not found in the DOM.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Mounting Error:", err);
    const errorDiv = document.getElementById('bootstrap-error');
    if (errorDiv) {
      errorDiv.style.display = 'block';
      errorDiv.innerText = "React failed to mount: " + err;
    }
  }
}