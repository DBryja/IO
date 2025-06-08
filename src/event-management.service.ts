import { Container } from './infrastructure/cqrs';
import { 
  CreateEventCommand, 
  UpdateEventCommand, 
  PublishEventCommand 
} from './application/commands';
import { 
  GetEventByIdQuery, 
  GetEventsByOrganizerQuery, 
  GetPublishedEventsQuery,
  EventDto
} from './application/queries';
import { QueryResult } from './application/query-handlers';
import { EventType, TicketType } from './domain/value-objects';

// Event Management Service
export class EventManagementService {
  constructor(private container: Container) {}

  // Scenariusz główny: Tworzenie wydarzenia
  async createEvent(eventData: {
    organizerId: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    address?: string;
    isOnline?: boolean;
    eventType?: EventType;
    ticketType?: TicketType;
    ticketPrice?: number;
    currency?: string;
  }) {
    console.log('\n=== TWORZENIE WYDARZENIA ===');
    console.log('Organizator wypełnia formularz...');
    
    const command = new CreateEventCommand(
      eventData.organizerId,
      eventData.name,
      eventData.description,
      eventData.startDate,
      eventData.endDate,
      eventData.address,
      eventData.isOnline || false,
      eventData.eventType || EventType.PUBLIC,
      eventData.ticketType || TicketType.FREE,
      eventData.ticketPrice,
      eventData.currency || 'PLN'
    );

    console.log('System sprawdza poprawność danych...');
    const result = await this.container.getCommandBus().execute(command);
    
    if (result.success) {
      console.log(`✅ Wydarzenie zostało utworzone pomyślnie! ID: ${result.data.eventId}`);
      console.log('📋 Wydarzenie jest gotowe do modyfikacji lub publikacji');
      return result.data.eventId;
    } else {
      console.log(`❌ Błąd podczas tworzenia wydarzenia: ${result.error}`);
      throw new Error(result.error);
    }
  }

  async updateEvent(eventId: string, eventData: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    address?: string;
    isOnline?: boolean;
    eventType?: EventType;
    ticketType?: TicketType;
    ticketPrice?: number;
    currency?: string;
  }) {
    console.log('\n=== MODYFIKACJA WYDARZENIA ===');
    
    const command = new UpdateEventCommand(
      eventId,
      eventData.name,
      eventData.description,
      eventData.startDate,
      eventData.endDate,
      eventData.address,
      eventData.isOnline || false,
      eventData.eventType || EventType.PUBLIC,
      eventData.ticketType || TicketType.FREE,
      eventData.ticketPrice,
      eventData.currency || 'PLN'
    );

    const result = await this.container.getCommandBus().execute(command);
    
    if (result.success) {
      console.log(`✅ Wydarzenie zostało zaktualizowane!`);
    } else {
      console.log(`❌ Błąd podczas aktualizacji wydarzenia: ${result.error}`);
      throw new Error(result.error);
    }
  }

  async publishEvent(eventId: string) {
    console.log('\n=== PUBLIKACJA WYDARZENIA ===');
    
    const command = new PublishEventCommand(eventId);
    const result = await this.container.getCommandBus().execute(command);
    
    if (result.success) {
      console.log(`✅ Wydarzenie zostało opublikowane!`);
      console.log('🌍 Wydarzenie jest teraz widoczne w katalogu publicznym');
    } else {
      console.log(`❌ Błąd podczas publikacji wydarzenia: ${result.error}`);
      throw new Error(result.error);
    }
  }  async getOrganizerEvents(organizerId: string): Promise<EventDto[]> {
    console.log('\n=== PANEL ZARZĄDZANIA ORGANIZATORA ===');
    
    const query = new GetEventsByOrganizerQuery(organizerId);
    const result = await this.container.getQueryBus().execute<GetEventsByOrganizerQuery, QueryResult<EventDto[]>>(query);
    
    if (result.success && result.data) {
      console.log(`📋 Wydarzenia organizatora (${result.data.length}):`);
      result.data.forEach((event: EventDto, index: number) => {
        console.log(`${index + 1}. ${event.name} - ${event.isPublished ? '🌍 Opublikowane' : '📝 Szkic'}`);
      });
      return result.data;
    } else {
      console.log(`❌ Błąd podczas pobierania wydarzeń: ${result.error}`);
      return [];
    }
  }
  async getPublishedEvents(): Promise<EventDto[]> {
    console.log('\n=== KATALOG PUBLICZNYCH WYDARZEŃ ===');
    
    const query = new GetPublishedEventsQuery();
    const result = await this.container.getQueryBus().execute<GetPublishedEventsQuery, QueryResult<EventDto[]>>(query);
    
    if (result.success && result.data) {
      console.log(`🌍 Publiczne wydarzenia (${result.data.length}):`);
      result.data.forEach((event: EventDto, index: number) => {
        const price = event.ticketPrice ? `${event.ticketPrice.amount} ${event.ticketPrice.currency}` : 'Bezpłatne';
        console.log(`${index + 1}. ${event.name} - ${price}`);
      });
      return result.data;
    } else {
      console.log(`❌ Błąd podczas pobierania publicznych wydarzeń: ${result.error}`);
      return [];
    }
  }
}
