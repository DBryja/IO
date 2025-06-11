import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

console.log('🚀 Event Management System React Frontend - Starting...');

try {
  const container = document.getElementById('react-root');
  if (!container) {
    throw new Error('Failed to find the root element');
  }

  console.log('📦 Container found, creating React root...');
  const root = createRoot(container);
  
  console.log('🎯 Rendering App component...');
  root.render(<App />);
  
  console.log('✅ React Frontend initialized successfully');
} catch (error) {
  console.error('❌ Error initializing React app:', error);
  
  // Fallback error display
  const container = document.getElementById('react-root');
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 8px; margin: 20px;">
        <h2>❌ Błąd ładowania aplikacji React</h2>
        <p>Szczegóły błędu: ${error}</p>
        <p>Sprawdź konsolę przeglądarki (F12) po więcej informacji.</p>
      </div>
    `;
  }
}
