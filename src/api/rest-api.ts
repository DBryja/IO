import { Container } from '../infrastructure/cqrs';
import { EventManagementService } from '../event-management.service';
import { 
  GetEventByIdQuery, 
  GetEventsByOrganizerQuery, 
  GetPublishedEventsQuery 
} from '../application/queries';
import { QueryResult } from '../application/query-handlers';
import { EventType, TicketType } from '../domain/value-objects';

// Initialize CQRS system
const container = new Container();
const eventService = new EventManagementService(container);

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

// Router function
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
    // Health check
    if (pathname === '/health' && method === 'GET') {
      return jsonResponse({ status: 'OK', timestamp: new Date().toISOString() });
    }

    // Get all published events (public catalog)
    if (pathname === '/api/events/published' && method === 'GET') {
      const events = await eventService.getPublishedEvents();
      return jsonResponse({ 
        success: true, 
        data: events,
        count: events.length 
      });
    }

    // Get events by organizer
    if (pathname.startsWith('/api/events/organizer/') && method === 'GET') {
      const organizerId = pathname.split('/').pop();
      if (!organizerId) {
        return jsonResponse({ success: false, error: 'Organizer ID is required' }, 400);
      }
      
      const events = await eventService.getOrganizerEvents(organizerId);
      return jsonResponse({ 
        success: true, 
        data: events,
        count: events.length 
      });
    }

    // Get event by ID
    if (pathname.startsWith('/api/events/') && !pathname.includes('/publish') && !pathname.includes('/organizer/') && method === 'GET') {
      const eventId = pathname.split('/').pop();
      if (!eventId) {
        return jsonResponse({ success: false, error: 'Event ID is required' }, 400);
      }
        const command = new GetEventByIdQuery(eventId);
      const result = await container.getQueryBus().execute<GetEventByIdQuery, QueryResult<any>>(command);
      
      if (result.success) {
        return jsonResponse({ 
          success: true, 
          data: result.data 
        });
      } else {
        return jsonResponse({ 
          success: false, 
          error: result.error 
        }, 404);
      }
    }

    // Create new event
    if (pathname === '/api/events' && method === 'POST') {
      const body = await parseBody(request);
      
      if (!body) {
        return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
      }

      // Validation
      if (!body.organizerId || !body.name || !body.description || !body.startDate || !body.endDate) {
        return jsonResponse({ 
          success: false, 
          error: 'Missing required fields: organizerId, name, description, startDate, endDate' 
        }, 400);
      }

      const eventId = await eventService.createEvent({
        organizerId: body.organizerId,
        name: body.name,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        address: body.address,
        isOnline: body.isOnline || false,
        eventType: body.eventType || EventType.PUBLIC,
        ticketType: body.ticketType || TicketType.FREE,
        ticketPrice: body.ticketPrice,
        currency: body.currency || 'PLN'
      });

      return jsonResponse({ 
        success: true, 
        data: { eventId },
        message: 'Event created successfully' 
      });
    }

    // Update event
    if (pathname.startsWith('/api/events/') && !pathname.includes('/publish') && method === 'PUT') {
      const eventId = pathname.split('/').pop();
      if (!eventId) {
        return jsonResponse({ success: false, error: 'Event ID is required' }, 400);
      }
      
      const body = await parseBody(request);
      if (!body) {
        return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
      }
      
      await eventService.updateEvent(eventId, {
        name: body.name,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        address: body.address,
        isOnline: body.isOnline || false,
        eventType: body.eventType || EventType.PUBLIC,
        ticketType: body.ticketType || TicketType.FREE,
        ticketPrice: body.ticketPrice,
        currency: body.currency || 'PLN'
      });

      return jsonResponse({ 
        success: true, 
        message: 'Event updated successfully' 
      });
    }

    // Publish event
    if (pathname.endsWith('/publish') && method === 'POST') {
      const eventId = pathname.split('/')[3]; // /api/events/{eventId}/publish
      if (!eventId) {
        return jsonResponse({ success: false, error: 'Event ID is required' }, 400);
      }
      
      await eventService.publishEvent(eventId);

      return jsonResponse({ 
        success: true, 
        message: 'Event published successfully' 
      });
    }

    // Statistics endpoint
    if (pathname === '/api/stats' && method === 'GET') {
      const totalEvents = container.getEventRepository().getEventCount();
      const publishedEvents = await eventService.getPublishedEvents();
      
      return jsonResponse({
        success: true,
        data: {
          totalEvents,
          publishedEvents: publishedEvents.length,
          draftEvents: totalEvents - publishedEvents.length
        }
      });
    }

    // Route not found
    return jsonResponse({ success: false, error: 'Route not found' }, 404);

  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
}
