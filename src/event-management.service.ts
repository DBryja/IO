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

// SQLite-based Event Management Service with CQRS dual databases
export class EventManagementService {
  private container: Container;

  constructor() {
    this.container = new Container();
  }

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
    console.log('\n=== TWORZENIE WYDARZENIA (SQLite CQRS) ===');
    console.log('📝 Zapisywanie do bazy komend (Write Model)...');
    
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

    console.log('🔍 System sprawdza poprawność danych...');
    const result = await this.container.getCommandBus().execute(command);
    
    if (result.success) {
      console.log(`✅ Wydarzenie zostało utworzone w bazie komend! ID: ${result.data.eventId}`);
      console.log('🔄 Automatyczna synchronizacja z bazą zapytań...');
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
    console.log('\n=== MODYFIKACJA WYDARZENIA (SQLite CQRS) ===');
    console.log('📝 Aktualizacja w bazie komend...');
    
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
      console.log(`✅ Wydarzenie zostało zaktualizowane w obu bazach!`);
      console.log('🔄 Synchronizacja Command → Query Model zakończona');
    } else {
      console.log(`❌ Błąd podczas aktualizacji wydarzenia: ${result.error}`);
      throw new Error(result.error);
    }
  }

  async publishEvent(eventId: string) {
    console.log('\n=== PUBLIKACJA WYDARZENIA (SQLite CQRS) ===');
    console.log('📝 Zmiana statusu w bazie komend...');
    
    const command = new PublishEventCommand(eventId);
    const result = await this.container.getCommandBus().execute(command);
    
    if (result.success) {
      console.log(`✅ Wydarzenie zostało opublikowane w obu bazach!`);
      console.log('🌍 Wydarzenie jest teraz widoczne w katalogu publicznym');
      console.log('🔄 Read Model został zsynchronizowany');
    } else {
      console.log(`❌ Błąd podczas publikacji wydarzenia: ${result.error}`);
      throw new Error(result.error);
    }
  }

  async getOrganizerEvents(organizerId: string): Promise<EventDto[]> {
    console.log('\n=== PANEL ZARZĄDZANIA ORGANIZATORA (SQLite Read Model) ===');
    console.log('📖 Pobieranie z bazy zapytań (Read Model)...');
    
    const query = new GetEventsByOrganizerQuery(organizerId);
    const result = await this.container.getQueryBus().execute<GetEventsByOrganizerQuery, QueryResult<EventDto[]>>(query);
    
    if (result.success && result.data) {
      console.log(`📋 Wydarzenia organizatora z Read Model (${result.data.length}):`);
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
    console.log('\n=== KATALOG PUBLICZNYCH WYDARZEŃ (SQLite Read Model) ===');
    console.log('📖 Pobieranie z zoptymalizowanej bazy zapytań...');
    
    const query = new GetPublishedEventsQuery();
    const result = await this.container.getQueryBus().execute<GetPublishedEventsQuery, QueryResult<EventDto[]>>(query);
    
    if (result.success && result.data) {
      console.log(`🌍 Publiczne wydarzenia z Read Model (${result.data.length}):`);
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

  async getEventById(eventId: string): Promise<EventDto | null> {
    console.log('\n=== POBIERANIE SZCZEGÓŁÓW WYDARZENIA (SQLite Read Model) ===');
    console.log('📖 Zapytanie do Read Model...');
    
    const query = new GetEventByIdQuery(eventId);
    const result = await this.container.getQueryBus().execute<GetEventByIdQuery, QueryResult<EventDto | null>>(query);
    
    if (result.success) {
      if (result.data) {
        console.log(`✅ Znaleziono wydarzenie: ${result.data.name}`);
      } else {
        console.log(`⚠️ Nie znaleziono wydarzenia o ID: ${eventId}`);
      }
      return result.data || null;
    } else {
      console.log(`❌ Błąd podczas pobierania wydarzenia: ${result.error}`);
      return null;
    }
  }
  async getAllEvents(): Promise<EventDto[]> {
    console.log('\n=== WSZYSTKIE WYDARZENIA (SQLite Read Model) ===');
    console.log('📖 Pobieranie wszystkich wydarzeń dla statystyk...');
    
    try {
      const queryRepo = this.container.getQueryRepository();
      const allEvents = await queryRepo.findAllEvents();
      
      console.log(`📊 Znaleziono ${allEvents.length} wydarzeń w Read Model`);
      return allEvents;
    } catch (error) {
      console.error('❌ Błąd podczas pobierania wszystkich wydarzeń:', error);
      return [];
    }
  }

  // Utility method to show database statistics
  async showDatabaseStats(): Promise<void> {
    console.log('\n=== STATYSTYKI BAZ DANYCH ===');
    try {
      // Get stats from command repository
      const commandRepo = this.container.getCommandRepository();
      const queryRepo = this.container.getQueryRepository();
      
      console.log('📝 Command Database (Write Model):');
      console.log('   - Optymalizowana dla operacji zapisu');
      console.log('   - Gwarantuje spójność transakcyjną');
      
      console.log('📖 Query Database (Read Model):');
      console.log('   - Zoptymalizowana dla szybkich zapytań');
      console.log('   - Denormalizowana struktura danych');
      console.log('   - Indeksy na często używanych polach');
      
      console.log('🔄 Synchronizacja:');
      console.log('   - Automatyczna po każdej operacji zapisu');
      console.log('   - W produkcji: asynchroniczna przez zdarzenia domenowe');
    } catch (error) {
      console.error('❌ Błąd podczas pobierania statystyk:', error);
    }
  }

  // Cleanup method
  close(): void {
    this.container.close();
  }
}
