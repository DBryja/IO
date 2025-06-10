import { 
  CreateEventCommandHandler, 
  UpdateEventCommandHandler, 
  PublishEventCommandHandler 
} from '../application/command-handlers';
import { 
  SQLiteGetEventByIdQueryHandler, 
  SQLiteGetEventsByOrganizerQueryHandler, 
  SQLiteGetPublishedEventsQueryHandler 
} from '../application/sqlite-query-handlers';
import { BunSQLiteEventCommandRepository, BunSQLiteEventQueryRepository } from './bun-sqlite-repositories';

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

// SQLite CQRS Container with dual databases
export class SQLiteContainer {
  private commandRepository: BunSQLiteEventCommandRepository;
  private queryRepository: BunSQLiteEventQueryRepository;
  private commandBus: CommandBus;
  private queryBus: QueryBus;

  constructor() {
    // Separate databases for Commands (write) and Queries (read)
    this.commandRepository = new BunSQLiteEventCommandRepository('events_command.db');
    this.queryRepository = new BunSQLiteEventQueryRepository('events_query.db');
    
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
    
    this.setupHandlers();
    
    console.log('🗄️ SQLite CQRS Container initialized with dual databases:');
    console.log('   📝 Command DB: events_command.db (Write operations)');
    console.log('   📖 Query DB: events_query.db (Read operations)');
  }

  private setupHandlers(): void {
    // Register command handlers - they use the command repository (write model)
    this.commandBus.register('CREATE_EVENT', new CreateEventCommandHandler(this.commandRepository));
    this.commandBus.register('UPDATE_EVENT', new UpdateEventCommandHandler(this.commandRepository));
    this.commandBus.register('PUBLISH_EVENT', new PublishEventCommandHandler(this.commandRepository));

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
  }
  getCommandRepository(): BunSQLiteEventCommandRepository {
    return this.commandRepository;
  }

  getQueryRepository(): BunSQLiteEventQueryRepository {
    return this.queryRepository;
  }

  // Cleanup method to close database connections
  close(): void {
    this.commandRepository.close();
    this.queryRepository.close();
    console.log('🔒 Database connections closed');
  }
}

// Export both containers for backward compatibility and choice
export { Container } from './cqrs'; // Original in-memory container
