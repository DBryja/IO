import { CreateEventCommand, UpdateEventCommand, PublishEventCommand } from './commands';
import { IEventRepository } from '../domain/repositories';
import { Event } from '../domain/event';
import { OrganizerId, EventId, Location, Money } from '../domain/value-objects';
import { EventPublishedDomainEvent, DomainEventPublisher } from '../domain/domain-events';

// Command Result
export interface CommandResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Command Handlers
export interface ICommandHandler<T> {
  handle(command: T): Promise<CommandResult>;
}

export class CreateEventCommandHandler implements ICommandHandler<CreateEventCommand> {
  constructor(private eventRepository: IEventRepository) {}

  async handle(command: CreateEventCommand): Promise<CommandResult> {
    try {
      const organizerId = new OrganizerId(command.organizerId);
      const location = new Location(command.address, command.isOnline);
      
      let ticketPrice: Money | undefined;
      if (command.ticketPrice !== undefined) {
        ticketPrice = new Money(command.ticketPrice, command.currency);
      }

      const event = Event.create(
        organizerId,
        command.name,
        command.description,
        command.startDate,
        command.endDate,
        location,
        command.eventType,
        command.ticketType,
        ticketPrice
      );

      await this.eventRepository.save(event);

      return {
        success: true,
        data: { eventId: event.id.value }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export class UpdateEventCommandHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(private eventRepository: IEventRepository) {}

  async handle(command: UpdateEventCommand): Promise<CommandResult> {
    try {
      const eventId = new EventId(command.eventId);
      const event = await this.eventRepository.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      const location = new Location(command.address, command.isOnline);
      
      let ticketPrice: Money | undefined;
      if (command.ticketPrice !== undefined) {
        ticketPrice = new Money(command.ticketPrice, command.currency);
      }

      event.update(
        command.name,
        command.description,
        command.startDate,
        command.endDate,
        location,
        command.eventType,
        command.ticketType,
        ticketPrice
      );

      await this.eventRepository.save(event);

      return {
        success: true,
        data: { eventId: event.id.value }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export class PublishEventCommandHandler implements ICommandHandler<PublishEventCommand> {
  constructor(
    private eventRepository: IEventRepository,
    private eventPublisher?: DomainEventPublisher
  ) {}

  async handle(command: PublishEventCommand): Promise<CommandResult> {
    try {
      const eventId = new EventId(command.eventId);
      const event = await this.eventRepository.findById(eventId);
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      event.publish();
      await this.eventRepository.save(event);

      // Publish domain event for published event
      if (this.eventPublisher) {
        const publishedEvent = new EventPublishedDomainEvent(
          event.id.value,
          event.organizerId.value,
          event.name
        );
        await this.eventPublisher.publish(publishedEvent);
      }

      return {
        success: true,
        data: { eventId: event.id.value }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
