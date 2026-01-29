
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root para montar la aplicación.");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Error crítico durante el renderizado inicial:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; text-align: center;">
      <h1 style="color: #3d4a3e;">¡Ups! Algo salió mal</h1>
      <p>La aplicación no pudo cargar correctamente. Por favor, refresca la página.</p>
      <pre style="font-size: 10px; color: #666; background: #eee; padding: 10px; border-radius: 5px; text-align: left;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
