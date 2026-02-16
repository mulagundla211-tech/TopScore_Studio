import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("index.tsx: Script starting...");

const initApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("index.tsx: Root element #root not found.");
    return;
  }

  try {
    console.log("index.tsx: Creating React root...");
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("index.tsx: Render called successfully.");
  } catch (err) {
    console.error("index.tsx: Failed to mount React app:", err);
    const errorDiv = document.getElementById('bootstrap-error');
    if (errorDiv) {
      errorDiv.style.display = 'block';
      errorDiv.innerText = "React mounting failed. Check console for details.";
    }
  }
};

// Ensure DOM is ready if script loads early
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}