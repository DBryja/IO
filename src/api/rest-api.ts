import { EventManagementService } from '../event-management.service';
import { EventType, TicketType } from '../domain/value-objects';

// Initialize CQRS system
const eventService = new EventManagementService();

// Helper function to parse JSON body
async function parseBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Helper function to create JSON response
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Router function for SQLite-based API
export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Routes
    if (pathname === '/api/events' && method === 'POST') {      // Create new event
      const body = await parseBody(request);
      if (!body) {
        return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
      }

      const { organizerId, name, description, startDate, endDate, address, isOnline, eventType, ticketType, ticketPrice, currency } = body;      
      if (!organizerId || !name || !description || !startDate || !endDate) {
        return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
      }

      try {
        const eventId = await eventService.createEvent({
          organizerId,
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          address,
          isOnline: isOnline || false,
          eventType: eventType || EventType.PUBLIC,
          ticketType: ticketType || TicketType.FREE,
          ticketPrice,
          currency: currency || 'PLN'
        });      
        
        return jsonResponse({ 
          success: true,
          eventId, 
          message: 'Event created successfully',
          database: 'SQLite CQRS (Command + Query separation)'
        }, 201);
      } catch (error) {
        console.error('❌ Błąd podczas tworzenia wydarzenia:', error instanceof Error ? error.message : error);
        return jsonResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, 400);
      }
    } else if (pathname === '/api/events/published' && method === 'GET') {
      // Get published events (from read model)
      const events = await eventService.getPublishedEvents();
      return jsonResponse({ 
        success: true,
        data: events,
        count: events.length,
        source: 'Read Model (Query Database)'
      });

    } else if (pathname.startsWith('/api/events/organizer/') && method === 'GET') {
      // Get events by organizer (from read model)
      const organizerId = pathname.split('/').pop();
      if (!organizerId) {
        return jsonResponse({ error: 'Invalid organizer ID' }, 400);
      }      const events = await eventService.getOrganizerEvents(organizerId);
      return jsonResponse({ 
        success: true,
        data: events,
        count: events.length,
        organizerId,
        source: 'Read Model (Query Database)'
      });

    } else if (pathname.startsWith('/api/events/') && method === 'GET') {
      // Get specific event by ID (from read model)
      const eventId = pathname.split('/').pop();
      if (!eventId) {
        return jsonResponse({ error: 'Invalid event ID' }, 400);
      }      const event = await eventService.getEventById(eventId);
      if (!event) {
        return jsonResponse({ success: false, error: 'Event not found' }, 404);
      }

      return jsonResponse({ 
        success: true,
        data: event,
        source: 'Read Model (Query Database)'
      });    } else if (pathname.startsWith('/api/events/') && pathname.endsWith('/publish') && method === 'POST') {
      // Publish event
      const eventId = pathname.split('/')[3]; // /api/events/{id}/publish
      if (!eventId) {
        return jsonResponse({ success: false, error: 'Invalid event ID' }, 400);
      }

      await eventService.publishEvent(eventId);
      return jsonResponse({ 
        success: true,
        message: 'Event published successfully',
        eventId,
        action: 'Synchronized to Read Model'
      });    } else if (pathname.startsWith('/api/events/') && method === 'PUT') {
      // Update event
      const eventId = pathname.split('/').pop();
      if (!eventId) {
        return jsonResponse({ success: false, error: 'Invalid event ID' }, 400);
      }      const body = await parseBody(request);
      if (!body) {
        return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
      }

      const { name, description, startDate, endDate, address, isOnline, eventType, ticketType, ticketPrice, currency } = body;

      if (!name || !description || !startDate || !endDate) {
        return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
      }

      try {
        await eventService.updateEvent(eventId, {
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          address,
          isOnline: isOnline || false,
          eventType: eventType || EventType.PUBLIC,
          ticketType: ticketType || TicketType.FREE,
          ticketPrice,
          currency: currency || 'PLN'
        });      

        return jsonResponse({ 
          success: true,
          message: 'Event updated successfully',
          eventId,
          action: 'Synchronized to Read Model'
        });
      } catch (error) {
        console.error('❌ Błąd podczas aktualizacji wydarzenia:', error instanceof Error ? error.message : error);
        return jsonResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, 400);
      }    } else if (pathname === '/api/stats' && method === 'GET') {
      // Database statistics - get real data from databases
      await eventService.showDatabaseStats();
        // Get actual statistics from the databases
      const allEvents = await eventService.getAllEvents();
      const publishedEvents = allEvents.filter((event: any) => event.isPublished);
      const draftEvents = allEvents.filter((event: any) => !event.isPublished);
      
      return jsonResponse({
        success: true,
        data: {
          totalEvents: allEvents.length,
          publishedEvents: publishedEvents.length,
          draftEvents: draftEvents.length,
          message: 'Database statistics retrieved successfully',
          architecture: 'CQRS with SQLite',
          databases: {
            command: 'events_command.db (Write Model)',
            query: 'events_query.db (Read Model)'
          },
          features: [
            'Automatic synchronization between models',
            'Optimized read queries',
            'Transactional write operations',
            'Dual database separation'
          ]
        }
      });

    } else if (pathname === '/api/health' && method === 'GET') {
      // Health check
      return jsonResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'SQLite CQRS',
        version: '2.0.0'
      });

    } else {
      // Route not found
      return jsonResponse({ 
        error: 'Route not found',
        availableRoutes: [
          'POST /api/events - Create event',
          'GET /api/events/published - Get published events',
          'GET /api/events/organizer/{id} - Get organizer events',
          'GET /api/events/{id} - Get event by ID',
          'POST /api/events/{id}/publish - Publish event',
          'PUT /api/events/{id} - Update event',
          'GET /api/stats - Database statistics',
          'GET /api/health - Health check'
        ]
      }, 404);
    }
  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

// Cleanup function for graceful shutdown
export function cleanup() {
  eventService.close();
  console.log('🔒 API cleanup: Database connections closed');
}
