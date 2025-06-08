import { EventType, TicketType } from '../domain/value-objects';

// Commands
export interface Command {
  readonly type: string;
}

export class CreateEventCommand implements Command {
  readonly type = 'CREATE_EVENT';
  
  constructor(
    public readonly organizerId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly address?: string,
    public readonly isOnline: boolean = false,
    public readonly eventType: EventType = EventType.PUBLIC,
    public readonly ticketType: TicketType = TicketType.FREE,
    public readonly ticketPrice?: number,
    public readonly currency: string = 'PLN'
  ) {}
}

export class UpdateEventCommand implements Command {
  readonly type = 'UPDATE_EVENT';
  
  constructor(
    public readonly eventId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly address?: string,
    public readonly isOnline: boolean = false,
    public readonly eventType: EventType = EventType.PUBLIC,
    public readonly ticketType: TicketType = TicketType.FREE,
    public readonly ticketPrice?: number,
    public readonly currency: string = 'PLN'
  ) {}
}

export class PublishEventCommand implements Command {
  readonly type = 'PUBLISH_EVENT';
  
  constructor(
    public readonly eventId: string
  ) {}
}
