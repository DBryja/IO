# Event Management System - Diagramy C4

## C1 - Context Diagram (Kontekst systemu)

```mermaid
graph TB
    User["👤 Organizator Wydarzenia<br/>- Tworzy wydarzenia<br/>- Zarządza wydarzeniami<br/>- Publikuje wydarzenia"]
    
    PublicUser["👥 Użytkownicy Publiczni<br/>- Przeglądają wydarzenia<br/>- Sprawdzają szczegóły"]
    
    System["🎯 Event Management System<br/>System zarządzania wydarzeniami<br/>z architekturą CQRS + SQLite"]
    
    User -->|Zarządza wydarzeniami| System
    PublicUser -->|Przegląda wydarzenia| System
    
    style System fill:#667eea,stroke:#333,stroke-width:3px,color:#fff
    style User fill:#e1f5fe,stroke:#333
    style PublicUser fill:#f3e5f5,stroke:#333
```

## C2 - Container Diagram (Kontenery systemu)

```mermaid
graph TB
    subgraph "Event Management System"
        Frontend["🌐 React Frontend<br/>- TypeScript + React 18<br/>- Component Architecture<br/>- Material Design UI"]
        
        Backend["⚙️ Backend API<br/>- Bun + TypeScript<br/>- REST API<br/>- CQRS Architecture"]
        
        CommandDB[("📝 Command Database<br/>events_command.db<br/>SQLite - Write Model")]
        
        QueryDB[("📖 Query Database<br/>events_query.db<br/>SQLite - Read Model")]
        
        EventBus["📡 Domain Event Bus<br/>In-Memory Publisher<br/>Event Synchronization"]
    end
    
    User["👤 Organizator"] -->|HTTPS/JSON| Frontend
    PublicUser["👥 Użytkownicy"] -->|HTTPS/JSON| Frontend
    
    Frontend -->|REST API Calls| Backend
    Backend -->|Commands/Writes| CommandDB
    Backend -->|Queries/Reads| QueryDB
    Backend -.->|Domain Events| EventBus
    EventBus -.->|Synchronization| QueryDB
    
    style Frontend fill:#64b5f6,stroke:#1976d2,color:#fff
    style Backend fill:#81c784,stroke:#388e3c,color:#fff
    style CommandDB fill:#ffb74d,stroke:#f57c00,color:#fff
    style QueryDB fill:#4db6ac,stroke:#00695c,color:#fff
    style EventBus fill:#ba68c8,stroke:#7b1fa2,color:#fff
```

## C3 - Component Diagram (Holistyczny widok aplikacji)

```mermaid
graph TB
    subgraph "🌐 Presentation Layer"
        UI["React Application<br/>🎨 User Interface"]
        
        subgraph "Frontend Components"
            EventMgmt["📋 Event Management<br/>Create, Edit, Publish"]
            EventCatalog["🌍 Public Event Catalog<br/>Browse, Search, View"]
            Dashboard["📊 Organizer Dashboard<br/>Statistics, Overview"]
            Navigation["🧭 Navigation & UX<br/>Routing, Messages, State"]
        end
    end
    
    subgraph "🔗 API Gateway Layer"
        RestEndpoints["REST API Gateway<br/>📡 HTTP/JSON Interface"]
        
        subgraph "API Routes"
            EventRoutes["/api/events/*<br/>CRUD Operations"]
            OrganizerRoutes["/api/organizer/*<br/>Organizer Services"]
            PublicRoutes["/api/public/*<br/>Public Access"]
            SystemRoutes["/api/stats, /api/health<br/>System Services"]
        end
    end
    
    subgraph "⚙️ Business Logic Layer"
        subgraph "📝 Command Processing (Write Side)"
            CommandBus["Command Bus<br/>🎯 Write Operations Routing"]
            CommandLogic["Command Processing<br/>• Event Creation<br/>• Event Updates<br/>• Event Publishing<br/>• Business Validation"]
        end
        
        subgraph "📖 Query Processing (Read Side)"
            QueryBus["Query Bus<br/>🔍 Read Operations Routing"]
            QueryLogic["Query Processing<br/>• Event Retrieval<br/>• Event Filtering<br/>• Statistics Generation<br/>• Search & Pagination"]
        end
        
        subgraph "🎭 Domain Core"
            BusinessRules["Business Rules & Logic<br/>• Event Lifecycle<br/>• Validation Rules<br/>• Domain Constraints"]
            EventModel["Event Domain Model<br/>• Event Entity<br/>• Value Objects<br/>• Business Methods"]
        end
    end
    
    subgraph "📡 Event Infrastructure"
        EventSystem["Domain Event System<br/>🔄 Event-Driven Architecture"]
        
        subgraph "Event Types"
            LifecycleEvents["Lifecycle Events<br/>• Created, Updated<br/>• Published, Cancelled"]
            IntegrationEvents["Integration Events<br/>• Notifications<br/>• External Systems<br/>• Audit Logging"]
        end
    end
    
    subgraph "💾 Data Persistence Layer"
        subgraph "Write Database"
            CommandDB[("📝 Command Store<br/>events_command.db<br/>Optimized for Writes")]
            CommandOps["Write Operations<br/>• Transactional Safety<br/>• Data Integrity<br/>• Audit Trail"]
        end
        
        subgraph "Read Database"  
            QueryDB[("📖 Query Store<br/>events_query.db<br/>Optimized for Reads")]
            QueryOps["Read Operations<br/>• Fast Queries<br/>• Denormalized Views<br/>• Search Indexes"]
        end
    end
    
    subgraph "🔧 Cross-Cutting Concerns"
        Security["🔐 Security & Auth<br/>Organizer Identity"]
        Monitoring["📈 Monitoring & Logging<br/>Performance, Errors"]
        Configuration["⚙️ Configuration<br/>Environment Settings"]
    end
    
    %% Main Flow - User Interactions
    UI --> EventMgmt
    UI --> EventCatalog
    UI --> Dashboard
    UI --> Navigation
    
    %% API Gateway Connections
    EventMgmt -->|HTTP Requests| RestEndpoints
    EventCatalog -->|HTTP Requests| RestEndpoints
    Dashboard -->|HTTP Requests| RestEndpoints
    
    RestEndpoints --> EventRoutes
    RestEndpoints --> OrganizerRoutes  
    RestEndpoints --> PublicRoutes
    RestEndpoints --> SystemRoutes
    
    %% Business Logic Routing
    EventRoutes --> CommandBus
    EventRoutes --> QueryBus
    OrganizerRoutes --> QueryBus
    PublicRoutes --> QueryBus
    SystemRoutes --> QueryBus
    
    %% Command Side Flow
    CommandBus --> CommandLogic
    CommandLogic --> BusinessRules
    CommandLogic --> EventModel
    CommandLogic --> CommandOps
    CommandOps --> CommandDB
    
    %% Query Side Flow
    QueryBus --> QueryLogic
    QueryLogic --> QueryOps
    QueryOps --> QueryDB
    
    %% Event-Driven Synchronization
    CommandLogic -.->|Publishes Events| EventSystem
    EventSystem -.->|Event Handlers| QueryOps
    EventSystem --> LifecycleEvents
    EventSystem --> IntegrationEvents
    
    %% Cross-cutting concerns
    RestEndpoints -.-> Security
    BusinessRules -.-> Security
    CommandLogic -.-> Monitoring
    QueryLogic -.-> Monitoring
    CommandOps -.-> Configuration
    QueryOps -.-> Configuration
    
    %% Styling
    style UI fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style RestEndpoints fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style CommandBus fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    style QueryBus fill:#e0f2f1,stroke:#009688,stroke-width:2px
    style EventSystem fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style CommandDB fill:#fff8e1,stroke:#ff9800,stroke-width:2px
    style QueryDB fill:#e0f7fa,stroke:#00bcd4,stroke-width:2px
    style BusinessRules fill:#fffde7,stroke:#fbc02d,stroke-width:2px
```

## Przepływ danych w architekturze CQRS

```mermaid
sequenceDiagram
    participant F as Frontend
    participant API as REST API
    participant CB as Command Bus
    participant CH as Command Handler
    participant CR as Command Repo
    participant EP as Event Publisher
    participant QB as Query Bus
    participant QH as Query Handler
    participant QR as Query Repo
    
    Note over F,QR: Tworzenie nowego wydarzenia
    
    F->>API: POST /api/events
    API->>CB: CreateEventCommand
    CB->>CH: handle(command)
    CH->>CR: save(event)
    CR->>CR: INSERT Command DB
    CR->>EP: publish(EventCreated)
    EP-->>CR: handleEventCreated
    CR-->>QR: INSERT Query DB
    CH->>API: CommandResult
    API->>F: HTTP 201 Created
    
    Note over F,QR: Pobieranie wydarzeń
    
    F->>API: GET /api/events/organizer/{id}
    API->>QB: GetEventsByOrganizerQuery
    QB->>QH: handle(query)
    QH->>QR: findByOrganizer(id)
    QR->>QH: EventDto[]
    QH->>API: QueryResult
    API->>F: HTTP 200 + Data
```

## Domain Events Flow

```mermaid
graph LR
    subgraph "Domain Aggregate"
        Event[Event Aggregate] 
        DomainEvents[Domain Events<br/>• EventCreated<br/>• EventUpdated<br/>• EventPublished<br/>• EventCancelled]
    end
    
    subgraph "Event Publishing"
        EventPublisher[Event Publisher<br/>InMemoryDomainEventPublisher]
        EventHandlers[Event Handlers<br/>• handleEventCreated<br/>• handleEventUpdated<br/>• handleEventPublished]
    end
    
    subgraph "Side Effects"
        QuerySync[Query DB Sync]
        Notifications[Email Notifications]
        Analytics[Analytics Tracking]
        Audit[Audit Logging]
    end
    
    Event -->|publishes| DomainEvents
    DomainEvents -->|sends to| EventPublisher
    EventPublisher -->|distributes to| EventHandlers
    EventHandlers -->|triggers| QuerySync
    EventHandlers -->|triggers| Notifications
    EventHandlers -->|triggers| Analytics
    EventHandlers -->|triggers| Audit
    
    style Event fill:#e3f2fd,stroke:#1976d2
    style DomainEvents fill:#fff3e0,stroke:#f57c00
    style EventPublisher fill:#f3e5f5,stroke:#9c27b0
    style EventHandlers fill:#e8f5e8,stroke:#4caf50
```

## Kluczowe przepływy funkcjonalne

```mermaid
graph LR
    subgraph "👤 Organizer Journey"
        A[Logowanie] --> B[Tworzenie Wydarzenia]
        B --> C[Edycja Wydarzenia]
        C --> D[Publikacja Wydarzenia]
        D --> E[Zarządzanie Wydarzeniami]
        E --> F[Monitorowanie Statystyk]
    end
    
    subgraph "👥 Public User Journey"
        G[Przeglądanie Katalogu] --> H[Wyszukiwanie Wydarzenia]
        H --> I[Podgląd Szczegółów]
        I --> J[Sprawdzanie Informacji]
    end
    
    subgraph "🔄 System Processes"
        K[Event Creation] --> L[Domain Event Publishing]
        L --> M[Read Model Sync]
        M --> N[Data Consistency]
        N --> O[Statistics Update]
    end
    
    style A fill:#e3f2fd
    style G fill:#f3e5f5
    style K fill:#e8f5e8
```

## Kluczowe cechy architektury

### ✅ **CQRS (Command Query Responsibility Segregation)**
- **Command Side**: Operacje zapisu (CREATE, UPDATE, DELETE)
- **Query Side**: Operacje odczytu (GET, LIST, SEARCH)  
- **Separacja**: Różne modele danych dla zapisów i odczytów
- **Optymalizacja**: Każda strona może być niezależnie skalowana

### ✅ **Domain Events & Event Sourcing**
- **EventCreated**: Nowe wydarzenie utworzone
- **EventUpdated**: Wydarzenie zaktualizowane  
- **EventPublished**: Wydarzenie opublikowane
- **EventCancelled**: Wydarzenie anulowane
- **Event-Driven Sync**: Asynchroniczna synchronizacja między modelami

### ✅ **Clean Architecture & DDD Patterns**
- **Layered Architecture**: Separation of concerns
- **Domain-Driven Design**: Business logic w centrum
- **Repository Pattern**: Abstrakcja dostępu do danych
- **Command/Query Pattern**: Segregacja operacji

### ✅ **Dual Database Architecture**
- **events_command.db**: Optymalizowana do zapisów (ACID, transactions)
- **events_query.db**: Optymalizowana do odczytów (indexy, denormalizacja)
- **Eventual Consistency**: Synchronizacja przez domain events
- **Performance**: Różne strategie optymalizacji dla każdego przypadku

### ✅ **React Frontend Architecture**
- **Component-Based**: Modularna struktura UI
- **Custom Hooks**: Logika biznesowa oddzielona od prezentacji
- **Type Safety**: TypeScript dla całej aplikacji
- **State Management**: React hooks + local state

### 🔄 **Event-Driven Synchronization**
```
Command → Domain Event → Event Handler → Query Model Update
```

### 📐 **Architectural Patterns Applied**

```mermaid
graph TB
    subgraph "Design Patterns"
        CQRS[CQRS Pattern<br/>Command/Query Separation]
        Repository[Repository Pattern<br/>Data Access Abstraction]
        EventSourcing[Event Sourcing<br/>Event-Driven State Changes]
        DomainEvents[Domain Events<br/>Decoupled Communication]
    end
    
    subgraph "Architectural Principles"
        CleanArch[Clean Architecture<br/>Dependency Inversion]
        DDD[Domain-Driven Design<br/>Business Logic Focus]
        EventDriven[Event-Driven Architecture<br/>Loose Coupling]
        Microservices[Modular Design<br/>Single Responsibility]
    end
    
    subgraph "Technical Patterns"
        CommandPattern[Command Pattern<br/>Encapsulated Requests]
        ObserverPattern[Observer Pattern<br/>Event Subscriptions]
        StrategyPattern[Strategy Pattern<br/>Pluggable Components]
        FactoryPattern[Factory Pattern<br/>Object Creation]
    end
    
    CQRS --> CleanArch
    Repository --> DDD
    EventSourcing --> EventDriven
    DomainEvents --> Microservices
    
    CommandPattern --> CQRS
    ObserverPattern --> DomainEvents
    StrategyPattern --> Repository
    FactoryPattern --> EventSourcing
    
    style CQRS fill:#e3f2fd,stroke:#1976d2
    style CleanArch fill:#e8f5e8,stroke:#4caf50
    style CommandPattern fill:#fff3e0,stroke:#f57c00
```

## Architektura React Frontend

```mermaid
graph TB
    subgraph "React Application Structure"
        App[App.tsx<br/>Main Component]
        
        subgraph "Core Components"
            Header[Header.tsx<br/>Organizer Info]
            Navigation[Navigation.tsx<br/>Tab Navigation]
            Messages[MessageDisplay.tsx<br/>Notifications]
        end
        
        subgraph "Feature Components"
            CreateForm[CreateEventForm.tsx<br/>Event Creation]
            EventCard[EventCard.tsx<br/>Event Display]
            EditModal[EditEventModal.tsx<br/>Event Editing]
            OrganizerView[OrganizerEvents.tsx<br/>Organizer Dashboard]
            PublicView[PublicEvents.tsx<br/>Public Catalog]
            Stats[SystemStats.tsx<br/>CQRS Statistics]
        end
        
        subgraph "Custom Hooks"
            useOrganizer[useOrganizer.ts<br/>Organizer State]
            useMessages[useMessages.ts<br/>Notification System]
            useData[useData.ts<br/>API Data Loading]
        end
        
        subgraph "Services & Types"
            EventAPI[eventApi.ts<br/>API Communication]
            Types[types/index.ts<br/>TypeScript Definitions]
        end
    end
    
    App --> Header
    App --> Navigation
    App --> Messages
    App --> CreateForm
    App --> OrganizerView
    App --> PublicView
    App --> Stats
    
    OrganizerView --> EventCard
    OrganizerView --> EditModal
    PublicView --> EventCard
    
    CreateForm --> useOrganizer
    CreateForm --> useMessages
    OrganizerView --> useData
    PublicView --> useData
    Stats --> useData
    
    useData --> EventAPI
    EventAPI --> Types
    
    style App fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style useOrganizer fill:#e8f5e8,stroke:#4caf50
    style useMessages fill:#fff3e0,stroke:#f57c00
    style useData fill:#f3e5f5,stroke:#9c27b0
    style EventAPI fill:#e0f7fa,stroke:#00bcd4
```

Diagramy pokazują kompletną architekturę systemu od poziomu kontekstu biznesowego (C1), przez kontenery techniczne (C2), aż po szczegółowe komponenty i ich interakcje (C3).