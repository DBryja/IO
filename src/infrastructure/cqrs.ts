import { 
  CreateEventCommandHandler, 
  UpdateEventCommandHandler, 
  PublishEventCommandHandler 
} from '../application/command-handlers';
import { 
  GetEventByIdQueryHandler, 
  GetEventsByOrganizerQueryHandler, 
  GetPublishedEventsQueryHandler 
} from '../application/query-handlers';
import { InMemoryEventRepository } from '../infrastructure/repositories';

// CQRS Bus Implementation
export class CommandBus {
  private handlers = new Map<string, any>();

  register<T>(commandType: string, handler: any): void {
    this.handlers.set(commandType, handler);
  }

  async execute<T extends { type: string }>(command: T): Promise<any> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }
    
    return await handler.handle(command);
  }
}

export class QueryBus {
  private handlers = new Map<string, any>();

  register<T, R>(queryType: string, handler: any): void {
    this.handlers.set(queryType, handler);
  }

  async execute<T extends { type: string }, R>(query: T): Promise<R> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query type: ${query.type}`);
    }
    
    return await handler.handle(query);
  }
}

// Dependency Injection Container
export class Container {
  private eventRepository: InMemoryEventRepository;
  private commandBus: CommandBus;
  private queryBus: QueryBus;

  constructor() {
    this.eventRepository = new InMemoryEventRepository();
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
    
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Register command handlers
    this.commandBus.register('CREATE_EVENT', new CreateEventCommandHandler(this.eventRepository));
    this.commandBus.register('UPDATE_EVENT', new UpdateEventCommandHandler(this.eventRepository));
    this.commandBus.register('PUBLISH_EVENT', new PublishEventCommandHandler(this.eventRepository));

    // Register query handlers
    this.queryBus.register('GET_EVENT_BY_ID', new GetEventByIdQueryHandler(this.eventRepository));
    this.queryBus.register('GET_EVENTS_BY_ORGANIZER', new GetEventsByOrganizerQueryHandler(this.eventRepository));
    this.queryBus.register('GET_PUBLISHED_EVENTS', new GetPublishedEventsQueryHandler(this.eventRepository));
  }

  getCommandBus(): CommandBus {
    return this.commandBus;
  }

  getQueryBus(): QueryBus {
    return this.queryBus;
  }

  getEventRepository(): InMemoryEventRepository {
    return this.eventRepository;
  }
}
