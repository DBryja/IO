import { Database, Statement } from 'bun:sqlite';
import { IEventRepository } from '../domain/repositories';
import { Event } from '../domain/event';
import { EventId, OrganizerId, EventType, TicketType, Money, Location } from '../domain/value-objects';
import { EventDto } from '../application/queries';

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

// Abstract base class for SQLite repositories
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

    this.db.exec(createEventsTable);
    this.db.exec(createOrganizerIndex);
    this.db.exec(createPublishedIndex);
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
export class SQLiteEventCommandRepository extends BaseSQLiteRepository implements IEventRepository {
  private insertStmt!: Statement;
  private updateStmt!: Statement;
  private selectByIdStmt!: Statement;
  private selectByOrganizerStmt!: Statement;
  private selectPublishedStmt!: Statement;

  constructor(dbPath: string = 'events_command.db') {
    super(dbPath);
    this.prepareStatements();
  }

  private prepareStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO events (
        id, organizer_id, name, description, start_date, end_date,
        address, is_online, event_type, ticket_type, ticket_price_amount,
        ticket_price_currency, is_published, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    this.updateStmt = this.db.prepare(`
      UPDATE events SET
        name = ?, description = ?, start_date = ?, end_date = ?,
        address = ?, is_online = ?, event_type = ?, ticket_type = ?,
        ticket_price_amount = ?, ticket_price_currency = ?, is_published = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    this.selectByIdStmt = this.db.prepare('SELECT * FROM events WHERE id = ?');
    this.selectByOrganizerStmt = this.db.prepare('SELECT * FROM events WHERE organizer_id = ?');
    this.selectPublishedStmt = this.db.prepare('SELECT * FROM events WHERE is_published = 1');
  }

  async save(event: Event): Promise<void> {
    const row = this.eventToRow(event);
    
    try {
      // Try to update first
      const updateResult = this.updateStmt.run(
        row.name, row.description, row.start_date, row.end_date,
        row.address, row.is_online, row.event_type, row.ticket_type,
        row.ticket_price_amount, row.ticket_price_currency, row.is_published,
        row.id
      );

      // If no rows were updated, insert new record
      if (updateResult.changes === 0) {
        this.insertStmt.run(
          row.id, row.organizer_id, row.name, row.description,
          row.start_date, row.end_date, row.address, row.is_online,
          row.event_type, row.ticket_type, row.ticket_price_amount,
          row.ticket_price_currency, row.is_published
        );
      }

      console.log(`Event saved to command DB: ${event.name} (ID: ${event.id.value})`);
      
      // Synchronize to read model
      await this.synchronizeToReadModel(event);
    } catch (error) {
      console.error('Error saving event to command database:', error);
      throw error;
    }
  }

  private async synchronizeToReadModel(event: Event): Promise<void> {
    try {
      // In a real scenario, this would be done via domain events or a separate sync process
      // For this demo, we'll directly sync to the read database
      const readDb = new Database('events_query.db');
      readDb.exec('PRAGMA journal_mode = WAL');
      
      // Ensure read model schema exists
      this.initializeReadModelSchema(readDb);
      
      const row = this.eventToRow(event);
      
      const upsertStmt = readDb.prepare(`
        INSERT OR REPLACE INTO events (
          id, organizer_id, name, description, start_date, end_date,
          address, is_online, event_type, ticket_type, ticket_price_amount,
          ticket_price_currency, is_published, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      upsertStmt.run(
        row.id, row.organizer_id, row.name, row.description,
        row.start_date, row.end_date, row.address, row.is_online,
        row.event_type, row.ticket_type, row.ticket_price_amount,
        row.ticket_price_currency, row.is_published
      );

      readDb.close();
      console.log(`Event synchronized to read model: ${event.name}`);
    } catch (error) {
      console.error('Error synchronizing to read model:', error);
      // In production, this would be handled by a retry mechanism
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

    db.exec(createEventsTable);
    db.exec(createOrganizerIndex);
    db.exec(createPublishedIndex);
  }

  async findById(id: EventId): Promise<Event | null> {
    const row = this.selectByIdStmt.get(id.value) as EventRow | undefined;
    return row ? this.eventFromRow(row) : null;
  }

  async findByOrganizer(organizerId: OrganizerId): Promise<Event[]> {
    const rows = this.selectByOrganizerStmt.all(organizerId.value) as EventRow[];
    return rows.map(row => this.eventFromRow(row));
  }

  async findPublishedEvents(): Promise<Event[]> {
    const rows = this.selectPublishedStmt.all() as EventRow[];
    return rows.map(row => this.eventFromRow(row));
  }
}

// Query Model Repository (Read Side)
export class SQLiteEventQueryRepository extends BaseSQLiteRepository {
  private selectByIdStmt!: Statement;
  private selectByOrganizerStmt!: Statement;
  private selectPublishedStmt!: Statement;

  constructor(dbPath: string = 'events_query.db') {
    super(dbPath);
    this.prepareStatements();
  }

  private prepareStatements(): void {
    this.selectByIdStmt = this.db.prepare('SELECT * FROM events WHERE id = ?');
    this.selectByOrganizerStmt = this.db.prepare('SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC');
    this.selectPublishedStmt = this.db.prepare('SELECT * FROM events WHERE is_published = 1 ORDER BY start_date ASC');
  }

  async findById(id: string): Promise<EventDto | null> {
    const row = this.selectByIdStmt.get(id) as EventRow | undefined;
    return row ? this.eventRowToDto(row) : null;
  }

  async findByOrganizer(organizerId: string): Promise<EventDto[]> {
    const rows = this.selectByOrganizerStmt.all(organizerId) as EventRow[];
    return rows.map(row => this.eventRowToDto(row));
  }

  async findPublishedEvents(): Promise<EventDto[]> {
    const rows = this.selectPublishedStmt.all() as EventRow[];
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
