import { EventId, OrganizerId, EventType, TicketType, Money, Location } from './value-objects';

// Domain Events
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  
  constructor() {
    this.occurredOn = new Date();
  }
}

export class EventCreated extends DomainEvent {
  constructor(
    public readonly eventId: EventId,
    public readonly organizerId: OrganizerId,
    public readonly name: string,
    public readonly description: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly location: Location,
    public readonly eventType: EventType,
    public readonly ticketType: TicketType,
    public readonly ticketPrice?: Money
  ) {
    super();
  }
}

// Aggregate Root
export class Event {
  private _domainEvents: DomainEvent[] = [];
  
  constructor(
    public readonly id: EventId,
    public readonly organizerId: OrganizerId,
    public name: string,
    public description: string,
    public startDate: Date,
    public endDate: Date,
    public location: Location,
    public eventType: EventType,
    public ticketType: TicketType,
    public ticketPrice?: Money,
    public isPublished: boolean = false
  ) {}

  static create(
    organizerId: OrganizerId,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: Location,
    eventType: EventType,
    ticketType: TicketType,
    ticketPrice?: Money
  ): Event {
    this.validateEventData(name, description, startDate, endDate, ticketType, ticketPrice);
    
    const eventId = EventId.generate();
    const event = new Event(
      eventId,
      organizerId,
      name,
      description,
      startDate,
      endDate,
      location,
      eventType,
      ticketType,
      ticketPrice
    );

    event.addDomainEvent(new EventCreated(
      eventId,
      organizerId,
      name,
      description,
      startDate,
      endDate,
      location,
      eventType,
      ticketType,
      ticketPrice
    ));

    return event;
  }

  private static validateEventData(
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    ticketType: TicketType,
    ticketPrice?: Money
  ): void {
    if (!name.trim()) {
      throw new Error('Event name is required');
    }
    
    if (!description.trim()) {
      throw new Error('Event description is required');
    }
    
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    
    if (startDate < new Date()) {
      throw new Error('Event cannot be in the past');
    }
    
    if (ticketType === TicketType.PAID && (!ticketPrice || ticketPrice.amount <= 0)) {
      throw new Error('Paid events must have a valid ticket price');
    }
    
    if (ticketType === TicketType.FREE && ticketPrice && ticketPrice.amount > 0) {
      throw new Error('Free events cannot have a ticket price');
    }
  }

  update(
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: Location,
    eventType: EventType,
    ticketType: TicketType,
    ticketPrice?: Money
  ): void {
    Event.validateEventData(name, description, startDate, endDate, ticketType, ticketPrice);
    
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.eventType = eventType;
    this.ticketType = ticketType;
    this.ticketPrice = ticketPrice;
  }

  publish(): void {
    this.isPublished = true;
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
