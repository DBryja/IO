import { EventType, TicketType } from '../domain/value-objects';

// Queries
export interface Query {
  readonly type: string;
}

export class GetEventByIdQuery implements Query {
  readonly type = 'GET_EVENT_BY_ID';
  
  constructor(public readonly eventId: string) {}
}

export class GetEventsByOrganizerQuery implements Query {
  readonly type = 'GET_EVENTS_BY_ORGANIZER';
  
  constructor(public readonly organizerId: string) {}
}

export class GetPublishedEventsQuery implements Query {
  readonly type = 'GET_PUBLISHED_EVENTS';
}

// DTOs for responses
export interface EventDto {
  id: string;
  organizerId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: {
    address?: string;
    isOnline: boolean;
  };
  eventType: EventType;
  ticketType: TicketType;
  ticketPrice?: {
    amount: number;
    currency: string;
  };
  isPublished: boolean;
}
