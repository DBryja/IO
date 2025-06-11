import { Database } from 'bun:sqlite';
import { IEventRepository } from '../domain/repositories';
import { Event } from '../domain/event';
import { EventId, OrganizerId, EventType, TicketType, Money, Location } from '../domain/value-objects';
import { EventDto } from '../application/queries';
import { 
  DomainEvent, 
  EventCreatedDomainEvent, 
  EventUpdatedDomainEvent, 
  DomainEventPublisher,
  InMemoryDomainEventPublisher 
} from '../domain/domain-events';

// Database schema interface
interface EventRow {
  id: string;
  organizer_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  address: string | null;
  is_online: number;
  event_type: string;
  ticket_type: string;
  ticket_price_amount: number | null;
  ticket_price_currency: string | null;
  is_published: number;
  created_at: string;
  updated_at: string;
}

// Abstract base class for SQLite repositories using Bun's native SQLite
abstract class BaseSQLiteRepository {
  protected db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema(): void {
    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        organizer_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        address TEXT,
        is_online INTEGER NOT NULL DEFAULT 0,
        event_type TEXT NOT NULL CHECK (event_type IN ('public', 'private')),
        ticket_type TEXT NOT NULL CHECK (ticket_type IN ('free', 'paid')),
        ticket_price_amount REAL,
        ticket_price_currency TEXT,
        is_published INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createOrganizerIndex = `
      CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id)
    `;

    const createPublishedIndex = `
      CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published)
    `;

    this.db.run(createEventsTable);
    this.db.run(createOrganizerIndex);
    this.db.run(createPublishedIndex);
  }

  protected eventFromRow(row: EventRow): Event {
    const location = new Location(row.address || undefined, Boolean(row.is_online));
    const ticketPrice = row.ticket_price_amount && row.ticket_price_currency 
      ? new Money(row.ticket_price_amount, row.ticket_price_currency)
      : undefined;

    return new Event(
      new EventId(row.id),
      new OrganizerId(row.organizer_id),
      row.name,
      row.description,
      new Date(row.start_date),
      new Date(row.end_date),
      location,
      row.event_type as EventType,
      row.ticket_type as TicketType,
      ticketPrice,
      Boolean(row.is_published)
    );
  }

  protected eventToRow(event: Event): Omit<EventRow, 'created_at' | 'updated_at'> {
    return {
      id: event.id.value,
      organizer_id: event.organizerId.value,
      name: event.name,
      description: event.description,
      start_date: event.startDate.toISOString(),
      end_date: event.endDate.toISOString(),
      address: event.location.address || null,
      is_online: event.location.isOnline ? 1 : 0,
      event_type: event.eventType,
      ticket_type: event.ticketType,
      ticket_price_amount: event.ticketPrice?.amount || null,
      ticket_price_currency: event.ticketPrice?.currency || null,
      is_published: event.isPublished ? 1 : 0
    };
  }

  close(): void {
    this.db.close();
  }
}

// Command Model Repository (Write Side)
export class EventCommandRepository extends BaseSQLiteRepository implements IEventRepository {
  private eventPublisher: DomainEventPublisher;

  constructor(dbPath: string = 'events_command.db', eventPublisher?: DomainEventPublisher) {
    super(dbPath);
    this.eventPublisher = eventPublisher || new InMemoryDomainEventPublisher();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Subscribe to domain events for read model synchronization
    this.eventPublisher.subscribe('EventCreated', this.handleEventCreated.bind(this));
    this.eventPublisher.subscribe('EventUpdated', this.handleEventUpdated.bind(this));
    this.eventPublisher.subscribe('EventPublished', this.handleEventPublished.bind(this));
  }
  async save(event: Event): Promise<void> {
    const row = this.eventToRow(event);
    
    try {
      // Check if event already exists to determine if it's create or update
      const existingQuery = 'SELECT id FROM events WHERE id = ?';
      const existing = this.db.query(existingQuery).get(event.id.value);
      const isUpdate = !!existing;
      
      // Use upsert pattern with Bun SQLite
      const upsertQuery = `
        INSERT INTO events (
          id, organizer_id, name, description, start_date, end_date,
          address, is_online, event_type, ticket_type, ticket_price_amount,
          ticket_price_currency, is_published, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          start_date = excluded.start_date,
          end_date = excluded.end_date,
          address = excluded.address,
          is_online = excluded.is_online,
          event_type = excluded.event_type,
          ticket_type = excluded.ticket_type,
          ticket_price_amount = excluded.ticket_price_amount,
          ticket_price_currency = excluded.ticket_price_currency,
          is_published = excluded.is_published,
          updated_at = CURRENT_TIMESTAMP
      `;

      this.db.run(upsertQuery, [
        row.id, row.organizer_id, row.name, row.description,
        row.start_date, row.end_date, row.address, row.is_online,
        row.event_type, row.ticket_type, row.ticket_price_amount,
        row.ticket_price_currency, row.is_published
      ]);

      console.log(`📝 Event saved to command DB: ${event.name} (ID: ${event.id.value})`);
      
      // Publish appropriate domain event
      const eventData = {
        id: event.id.value,
        organizerId: event.organizerId.value,
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        address: event.location.address,
        isOnline: event.location.isOnline,
        eventType: event.eventType,
        ticketType: event.ticketType,
        ticketPrice: event.ticketPrice ? {
          amount: event.ticketPrice.amount,
          currency: event.ticketPrice.currency
        } : undefined,
        isPublished: event.isPublished
      };

      if (isUpdate) {
        const domainEvent = new EventUpdatedDomainEvent(eventData, ['name', 'description']); // In real app, track actual changes
        await this.eventPublisher.publish(domainEvent);
      } else {
        const domainEvent = new EventCreatedDomainEvent(eventData);
        await this.eventPublisher.publish(domainEvent);
      }
      
    } catch (error) {
      console.error('❌ Error saving event to command database:', error);
      throw error;
    }
  }

  // Domain event handlers for read model synchronization
  private async handleEventCreated(domainEvent: DomainEvent): Promise<void> {
    const event = (domainEvent as EventCreatedDomainEvent).event;
    console.log(`🔄 Handling EventCreated for read model: ${event.name}`);
    await this.syncEventToReadModel(event, 'create');
  }

  private async handleEventUpdated(domainEvent: DomainEvent): Promise<void> {
    const event = (domainEvent as EventUpdatedDomainEvent).event;
    console.log(`🔄 Handling EventUpdated for read model: ${event.name}`);
    await this.syncEventToReadModel(event, 'update');
  }

  private async handleEventPublished(domainEvent: DomainEvent): Promise<void> {
    const publishedEvent = domainEvent as any; // EventPublishedDomainEvent
    console.log(`🔄 Handling EventPublished for read model: ${publishedEvent.eventName}`);
    
    // Update published status in read model
    const readDb = new Database('events_query.db');
    this.initializeReadModelSchema(readDb);
    
    const updateQuery = 'UPDATE events SET is_published = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    readDb.run(updateQuery, [publishedEvent.aggregateId]);
    readDb.close();
  }

  private async syncEventToReadModel(eventData: any, operation: 'create' | 'update'): Promise<void> {
    try {
      const readDb = new Database('events_query.db');
      this.initializeReadModelSchema(readDb);
      
      if (operation === 'create') {
        const insertQuery = `
          INSERT INTO events (
            id, organizer_id, name, description, start_date, end_date,
            address, is_online, event_type, ticket_type, ticket_price_amount,
            ticket_price_currency, is_published, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        readDb.run(insertQuery, [
          eventData.id,
          eventData.organizerId,
          eventData.name,
          eventData.description,
          eventData.startDate.toISOString(),
          eventData.endDate.toISOString(),
          eventData.address || null,
          eventData.isOnline ? 1 : 0,
          eventData.eventType,
          eventData.ticketType,
          eventData.ticketPrice?.amount || null,
          eventData.ticketPrice?.currency || null,
          eventData.isPublished ? 1 : 0
        ]);
        console.log(`➕ Event created in read model: ${eventData.name}`);
      } else {
        const updateQuery = `
          UPDATE events SET
            organizer_id = ?,
            name = ?,
            description = ?,
            start_date = ?,
            end_date = ?,
            address = ?,
            is_online = ?,
            event_type = ?,
            ticket_type = ?,
            ticket_price_amount = ?,
            ticket_price_currency = ?,
            is_published = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        readDb.run(updateQuery, [
          eventData.organizerId,
          eventData.name,
          eventData.description,
          eventData.startDate.toISOString(),
          eventData.endDate.toISOString(),
          eventData.address || null,
          eventData.isOnline ? 1 : 0,
          eventData.eventType,
          eventData.ticketType,
          eventData.ticketPrice?.amount || null,
          eventData.ticketPrice?.currency || null,
          eventData.isPublished ? 1 : 0,
          eventData.id
        ]);
        console.log(`📝 Event updated in read model: ${eventData.name}`);
      }

      readDb.close();
    } catch (error) {
      console.error(`❌ Error syncing ${operation} to read model:`, error);
      throw error;
    }
  }  
  private initializeReadModelSchema(db: Database): void {
    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        organizer_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        address TEXT,
        is_online INTEGER NOT NULL DEFAULT 0,
        event_type TEXT NOT NULL,
        ticket_type TEXT NOT NULL,
        ticket_price_amount REAL,
        ticket_price_currency TEXT,
        is_published INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createOrganizerIndex = `
      CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id)
    `;

    const createPublishedIndex = `
      CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published)
    `;

    db.run(createEventsTable);
    db.run(createOrganizerIndex);
    db.run(createPublishedIndex);
  }

  async findById(id: EventId): Promise<Event | null> {
    const query = 'SELECT * FROM events WHERE id = ?';
    const row = this.db.query(query).get(id.value) as EventRow | null;
    return row ? this.eventFromRow(row) : null;
  }

  async findByOrganizer(organizerId: OrganizerId): Promise<Event[]> {
    const query = 'SELECT * FROM events WHERE organizer_id = ?';
    const rows = this.db.query(query).all(organizerId.value) as EventRow[];
    return rows.map(row => this.eventFromRow(row));
  }

  async findPublishedEvents(): Promise<Event[]> {
    const query = 'SELECT * FROM events WHERE is_published = 1';
    const rows = this.db.query(query).all() as EventRow[];
    return rows.map(row => this.eventFromRow(row));
  }
}

// Query Model Repository (Read Side)
export class EventQueryRepository extends BaseSQLiteRepository {
  constructor(dbPath: string = 'events_query.db') {
    super(dbPath);
  }

  async findById(id: string): Promise<EventDto | null> {
    const query = 'SELECT * FROM events WHERE id = ?';
    const row = this.db.query(query).get(id) as EventRow | null;
    return row ? this.eventRowToDto(row) : null;
  }

  async findByOrganizer(organizerId: string): Promise<EventDto[]> {
    const query = 'SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC';
    const rows = this.db.query(query).all(organizerId) as EventRow[];
    return rows.map(row => this.eventRowToDto(row));
  }

  async findPublishedEvents(): Promise<EventDto[]> {
    const query = 'SELECT * FROM events WHERE is_published = 1 ORDER BY start_date ASC';
    const rows = this.db.query(query).all() as EventRow[];
    return rows.map(row => this.eventRowToDto(row));
  }

  async findAllEvents(): Promise<EventDto[]> {
    const query = 'SELECT * FROM events ORDER BY created_at DESC';
    const rows = this.db.query(query).all() as EventRow[];
    return rows.map(row => this.eventRowToDto(row));
  }

  private eventRowToDto(row: EventRow): EventDto {
    return {
      id: row.id,
      organizerId: row.organizer_id,
      name: row.name,
      description: row.description,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      location: {
        address: row.address || undefined,
        isOnline: Boolean(row.is_online)
      },
      eventType: row.event_type as EventType,
      ticketType: row.ticket_type as TicketType,
      ticketPrice: row.ticket_price_amount && row.ticket_price_currency 
        ? { amount: row.ticket_price_amount, currency: row.ticket_price_currency }
        : undefined,
      isPublished: Boolean(row.is_published)
    };
  }
}
