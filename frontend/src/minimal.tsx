import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('🧪 Minimal React Test - Starting...');

function MinimalApp() {
  console.log('🎯 MinimalApp rendering');
  return (
    <div style={{padding: '20px', background: '#e8f5e8', borderRadius: '8px'}}>
      <h1>✅ React działa!</h1>
      <p>Jeśli widzisz ten tekst, React ładuje się poprawnie.</p>
      <button onClick={() => alert('React event działa!')}>
        Kliknij mnie
      </button>
    </div>
  );
}

try {
  const container = document.getElementById('react-root');
  if (!container) {
    throw new Error('Nie znaleziono #react-root');
  }

  console.log('📦 Tworzenie React root...');
  const root = createRoot(container);
  
  console.log('🎯 Renderowanie MinimalApp...');
  root.render(<MinimalApp />);
  
  console.log('✅ Minimal React App uruchomiona!');
} catch (error) {
  console.error('❌ Błąd minimal app:', error);
}
