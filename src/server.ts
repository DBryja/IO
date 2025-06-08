import { handleRequest } from './api/rest-api';

const port = 3000;

console.log('🚀 Starting Event Management System...');
console.log(`📊 CQRS Architecture - Native Bun HTTP Server + Frontend`);
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
    else if (filePath.endsWith('.ico')) contentType = 'image/x-icon';

    return new Response(file, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    return null;
  }
}

// Main server
Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle API routes
    if (pathname.startsWith('/api/') || pathname === '/health') {
      return await handleRequest(request);
    }

    // Handle static files
    const staticResponse = await serveStatic(pathname);
    if (staticResponse) {
      return staticResponse;
    }

    // 404 for other routes
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`✅ Native Bun HTTP Server started successfully!`);
