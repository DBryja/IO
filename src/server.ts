import { handleRequest, cleanup } from './api/rest-api';

const port = 3001;

console.log('🚀 Starting Event Management System with SQLite CQRS...');
console.log(`📊 Architecture: CQRS with dual SQLite databases`);
console.log(`🗄️ Write Model: events_command.db`);
console.log(`📖 Read Model: events_query.db`);
console.log(`🌐 Server running at: http://localhost:${port}`);
console.log(`📋 API endpoints available at: http://localhost:${port}/api`);
console.log(`🎨 Frontend available at: http://localhost:${port}`);

// Serve static files
async function serveStatic(pathname: string): Promise<Response | null> {
  // Remove leading slash and handle root path
  const cleanPath = pathname === '/' ? '/index.html' : pathname;
  
  let filePath: string;
  
  if (cleanPath.startsWith('/static/')) {
    // Serve files from public/static/
    filePath = `./public${cleanPath}`;
  } else if (cleanPath === '/index.html' || cleanPath === '/') {
    // Serve index.html for root
    filePath = './public/index.html';
  } else {
    // For other paths, try to serve from public directory
    filePath = `./public${cleanPath}`;
  }

  try {
    const file = Bun.file(filePath);
    const exists = await file.exists();
    
    if (!exists) {
      // If file doesn't exist, try to serve index.html (SPA routing)
      const indexFile = Bun.file('./public/index.html');
      const indexExists = await indexFile.exists();
      
      if (indexExists) {
        return new Response(indexFile, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }
      
      return null;
    }

    // Determine content type
    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.json')) contentType = 'application/json';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';

    return new Response(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache static files for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving static file:', error);
    return null;
  }
}

// Main server handler
const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return handleRequest(request);
    }
    
    // Handle static files and frontend
    const staticResponse = await serveStatic(url.pathname);
    if (staticResponse) {
      return staticResponse;
    }
    
    // 404 for everything else
    return new Response('404 Not Found', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  },
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Otrzymano sygnał przerwania (Ctrl+C)...');
  console.log('🧹 Zamykanie serwera i czyszczenie zasobów...');
  cleanup();
  server.stop();
  console.log('✅ Serwer został zamknięty gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Otrzymano sygnał zakończenia...');
  console.log('🧹 Zamykanie serwera i czyszczenie zasobów...');
  cleanup();
  server.stop();
  console.log('✅ Serwer został zamknięty gracefully');
  process.exit(0);
});

console.log('✅ SQLite CQRS Event Management System is ready!');
console.log('🔗 Try these endpoints:');
console.log('   📊 GET /api/health - Health check');
console.log('   📈 GET /api/stats - Database statistics');
console.log('   🌍 GET /api/events/published - Published events');
console.log('   📝 POST /api/events - Create new event');
console.log('');
console.log('💡 Use Ctrl+C to stop the server gracefully');
