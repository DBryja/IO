import { 
  CreateEventCommandHandler, 
  UpdateEventCommandHandler, 
  PublishEventCommandHandler 
} from '../application/command-handlers';
import { 
  SQLiteGetEventByIdQueryHandler, 
  SQLiteGetEventsByOrganizerQueryHandler, 
  SQLiteGetPublishedEventsQueryHandler 
} from '../application/query-handlers';
import { EventCommandRepository, EventQueryRepository } from './repositories';
import { InMemoryDomainEventPublisher } from '../domain/domain-events';

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

// CQRS Container with dual SQLite databases
export class Container {
  private commandRepository: EventCommandRepository;
  private queryRepository: EventQueryRepository;
  private commandBus: CommandBus;
  private queryBus: QueryBus;
  private eventPublisher: InMemoryDomainEventPublisher;

  constructor() {
    // Initialize the domain event publisher
    this.eventPublisher = new InMemoryDomainEventPublisher();
    
    // Separate databases for Commands (write) and Queries (read)
    this.commandRepository = new EventCommandRepository('events_command.db', this.eventPublisher);
    this.queryRepository = new EventQueryRepository('events_query.db');
    
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
    
    this.setupHandlers();
    
    console.log('🗄️ SQLite CQRS Container initialized with dual databases:');
    console.log('📝 Command DB: events_command.db (Write operations)');
    console.log('📖 Query DB: events_query.db (Read operations)');
    console.log('📡 Event Publisher: Domain events for CQRS synchronization');
  }
  private setupHandlers(): void {
    // Register command handlers - they use the command repository (write model)
    this.commandBus.register('CREATE_EVENT', new CreateEventCommandHandler(this.commandRepository));
    this.commandBus.register('UPDATE_EVENT', new UpdateEventCommandHandler(this.commandRepository));
    this.commandBus.register('PUBLISH_EVENT', new PublishEventCommandHandler(this.commandRepository, this.eventPublisher));

    // Register query handlers - they use the query repository (read model)
    this.queryBus.register('GET_EVENT_BY_ID', new SQLiteGetEventByIdQueryHandler(this.queryRepository));
    this.queryBus.register('GET_EVENTS_BY_ORGANIZER', new SQLiteGetEventsByOrganizerQueryHandler(this.queryRepository));
    this.queryBus.register('GET_PUBLISHED_EVENTS', new SQLiteGetPublishedEventsQueryHandler(this.queryRepository));
  }

  getCommandBus(): CommandBus {
    return this.commandBus;
  }

  getQueryBus(): QueryBus {
    return this.queryBus;
  }  getCommandRepository(): EventCommandRepository {
    return this.commandRepository;
  }
  getQueryRepository(): EventQueryRepository {
    return this.queryRepository;
  }

  getEventPublisher(): InMemoryDomainEventPublisher {
    return this.eventPublisher;
  }

  // Cleanup method to close database connections
  close(): void {
    this.commandRepository.close();
    this.queryRepository.close();
    console.log('🔒 Database connections closed');
  }
}

// SQLite CQRS Container is now the default implementation
