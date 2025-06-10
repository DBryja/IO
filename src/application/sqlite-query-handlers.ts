import { GetEventByIdQuery, GetEventsByOrganizerQuery, GetPublishedEventsQuery, EventDto } from './queries';
import { BunSQLiteEventQueryRepository } from '../infrastructure/bun-sqlite-repositories';

// Query Result
export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Query Handlers for Read Model
export interface IQueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}

export class SQLiteGetEventByIdQueryHandler implements IQueryHandler<GetEventByIdQuery, EventDto | null> {
  constructor(private queryRepository: BunSQLiteEventQueryRepository) {}

  async handle(query: GetEventByIdQuery): Promise<QueryResult<EventDto | null>> {
    try {
      const event = await this.queryRepository.findById(query.eventId);
      
      return {
        success: true,
        data: event
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export class SQLiteGetEventsByOrganizerQueryHandler implements IQueryHandler<GetEventsByOrganizerQuery, EventDto[]> {
  constructor(private queryRepository: BunSQLiteEventQueryRepository) {}

  async handle(query: GetEventsByOrganizerQuery): Promise<QueryResult<EventDto[]>> {
    try {
      const events = await this.queryRepository.findByOrganizer(query.organizerId);
      
      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export class SQLiteGetPublishedEventsQueryHandler implements IQueryHandler<GetPublishedEventsQuery, EventDto[]> {
  constructor(private queryRepository: BunSQLiteEventQueryRepository) {}

  async handle(query: GetPublishedEventsQuery): Promise<QueryResult<EventDto[]>> {
    try {
      const events = await this.queryRepository.findPublishedEvents();
      
      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
