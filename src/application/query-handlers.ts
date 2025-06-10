import { GetEventByIdQuery, GetEventsByOrganizerQuery, GetPublishedEventsQuery, EventDto } from './queries';
import { IEventRepository } from '../domain/repositories';
import { EventQueryRepository } from '../infrastructure/repositories';
import { EventId, OrganizerId } from '../domain/value-objects';
import { Event } from '../domain/event';

// Query Result
export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Query Handlers
export interface IQueryHandler<TQuery, TResult> {
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}

export class GetEventByIdQueryHandler implements IQueryHandler<GetEventByIdQuery, EventDto | null> {
  constructor(private eventRepository: IEventRepository) {}

  async handle(query: GetEventByIdQuery): Promise<QueryResult<EventDto | null>> {
    try {
      const eventId = new EventId(query.eventId);
      const event = await this.eventRepository.findById(eventId);
      
      return {
        success: true,
        data: event ? this.mapToDto(event) : null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private mapToDto(event: Event): EventDto {
    return {
      id: event.id.value,
      organizerId: event.organizerId.value,
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: {
        address: event.location.address,
        isOnline: event.location.isOnline
      },
      eventType: event.eventType,
      ticketType: event.ticketType,
      ticketPrice: event.ticketPrice ? {
        amount: event.ticketPrice.amount,
        currency: event.ticketPrice.currency
      } : undefined,
      isPublished: event.isPublished
    };
  }
}

export class GetEventsByOrganizerQueryHandler implements IQueryHandler<GetEventsByOrganizerQuery, EventDto[]> {
  constructor(private eventRepository: IEventRepository) {}

  async handle(query: GetEventsByOrganizerQuery): Promise<QueryResult<EventDto[]>> {
    try {
      const organizerId = new OrganizerId(query.organizerId);
      const events = await this.eventRepository.findByOrganizer(organizerId);
      
      return {
        success: true,
        data: events.map(event => this.mapToDto(event))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private mapToDto(event: Event): EventDto {
    return {
      id: event.id.value,
      organizerId: event.organizerId.value,
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: {
        address: event.location.address,
        isOnline: event.location.isOnline
      },
      eventType: event.eventType,
      ticketType: event.ticketType,
      ticketPrice: event.ticketPrice ? {
        amount: event.ticketPrice.amount,
        currency: event.ticketPrice.currency
      } : undefined,
      isPublished: event.isPublished
    };
  }
}

export class GetPublishedEventsQueryHandler implements IQueryHandler<GetPublishedEventsQuery, EventDto[]> {
  constructor(private eventRepository: IEventRepository) {}

  async handle(query: GetPublishedEventsQuery): Promise<QueryResult<EventDto[]>> {
    try {
      const events = await this.eventRepository.findPublishedEvents();
      
      return {
        success: true,
        data: events.map(event => this.mapToDto(event))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private mapToDto(event: Event): EventDto {
    return {
      id: event.id.value,
      organizerId: event.organizerId.value,
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: {
        address: event.location.address,
        isOnline: event.location.isOnline
      },
      eventType: event.eventType,
      ticketType: event.ticketType,
      ticketPrice: event.ticketPrice ? {
        amount: event.ticketPrice.amount,
        currency: event.ticketPrice.currency
      } : undefined,
      isPublished: event.isPublished
    };
  }
}

// SQLite Query Handlers - using EventQueryRepository directly for optimized reads
export class SQLiteGetEventByIdQueryHandler implements IQueryHandler<GetEventByIdQuery, EventDto | null> {
  constructor(private queryRepository: EventQueryRepository) {}

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
  constructor(private queryRepository: EventQueryRepository) {}

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
  constructor(private queryRepository: EventQueryRepository) {}

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
