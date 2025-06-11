// Domain Events for CQRS Event Sourcing
import { EventId, OrganizerId } from './value-objects';

// Base domain event interface
export interface DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly version: number;
}

// Event Created Domain Event
export class EventCreatedDomainEvent implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly eventType = 'EventCreated';
  readonly version = 1;

  constructor(
    public readonly event: {
      id: string;
      organizerId: string;
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      address?: string;
      isOnline: boolean;
      eventType: string;
      ticketType: string;
      ticketPrice?: { amount: number; currency: string };
      isPublished: boolean;
    }
  ) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = event.id;
    this.occurredOn = new Date();
  }
}

// Event Updated Domain Event
export class EventUpdatedDomainEvent implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly eventType = 'EventUpdated';
  readonly version = 1;

  constructor(
    public readonly event: {
      id: string;
      organizerId: string;
      name: string;
      description: string;
      startDate: Date;
      endDate: Date;
      address?: string;
      isOnline: boolean;
      eventType: string;
      ticketType: string;
      ticketPrice?: { amount: number; currency: string };
      isPublished: boolean;
    },
    public readonly changes: string[] // List of changed fields
  ) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = event.id;
    this.occurredOn = new Date();
  }
}

// Event Published Domain Event
export class EventPublishedDomainEvent implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;
  readonly eventType = 'EventPublished';
  readonly version = 1;

  constructor(
    public readonly eventId_: string,
    public readonly organizerId: string,
    public readonly eventName: string
  ) {
    this.eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.aggregateId = eventId_;
    this.occurredOn = new Date();
  }
}

// Domain Event Publisher Interface
export interface DomainEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}

// Simple in-memory event publisher for this implementation
export class InMemoryDomainEventPublisher implements DomainEventPublisher {
  private handlers: Map<string, ((event: DomainEvent) => Promise<void>)[]> = new Map();

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    console.log(`📡 Publishing domain event: ${event.eventType} for aggregate ${event.aggregateId}`);
    
    const eventHandlers = this.handlers.get(event.eventType) || [];
    
    // Execute all handlers in parallel
    const promises = eventHandlers.map(handler => {
      return handler(event).catch(error => {
        console.error(`❌ Error in domain event handler for ${event.eventType}:`, error);
        // In production: send to dead letter queue or retry mechanism
      });
    });

    await Promise.all(promises);
    console.log(`✅ Domain event published: ${event.eventType}`);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    const promises = events.map(event => this.publish(event));
    await Promise.all(promises);
  }
}
