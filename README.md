# System do organizacji i zarządzania wydarzeniami - React + SQLite CQRS

## Opis projektu

System do zarządzania wydarzeniami oparty na architekturze CQRS (Command Query Responsibility Segregation) z dedykowanymi bazami danych SQLite. Frontend zbudowany w React z TypeScript dla lepszej organizacji kodu i czytelności. System umożliwia organizatorom tworzenie, modyfikowanie i publikowanie wydarzeń z wykorzystaniem wzorca separacji operacji odczytu i zapisu.

## Architektura techniczna

### Frontend - React + TypeScript
```
frontend/
├── src/
│   ├── App.tsx                 # Główny komponent aplikacji
│   ├── index.tsx              # Entry point React
│   ├── components/            # Komponenty React
│   │   ├── Header.tsx         # Nagłówek z info o organizatorze
│   │   ├── Navigation.tsx     # Nawigacja zakładkowa
│   │   ├── CreateEventForm.tsx # Formularz tworzenia wydarzeń
│   │   ├── EventCard.tsx      # Karta pojedynczego wydarzenia
│   │   ├── OrganizerEvents.tsx # Lista wydarzeń organizatora
│   │   ├── PublicEvents.tsx   # Katalog publicznych wydarzeń
│   │   ├── SystemStats.tsx    # Statystyki systemu
│   │   └── MessageDisplay.tsx # Wyświetlanie komunikatów
│   ├── hooks/                 # React hooks
│   │   ├── useOrganizer.ts    # Zarządzanie ID organizatora
│   │   ├── useMessages.ts     # Komunikaty success/error
│   │   └── useData.ts         # Hooks do ładowania danych
│   ├── services/              # Warstwa komunikacji
│   │   └── eventApi.ts        # API client dla REST endpoints
│   └── types/                 # TypeScript typy
│       └── index.ts           # Definicje typów aplikacji
```

### Backend - CQRS z SQLite

Projekt implementuje wzorzec CQRS z pełną separacją danych:
- **Commands** (Write Model) - operacje zmieniające stan w `events_command.db`
- **Queries** (Read Model) - operacje odczytujące z `events_query.db`
- **Automatyczna synchronizacja** między modelami po każdej operacji zapisu

### Struktura projektu

```
src/
├── domain/                    # Warstwa domeny
│   ├── event.ts              # Agregat Event + zdarzenia domenowe
│   ├── value-objects.ts      # Obiekty wartości (EventId, Money, Location)
│   └── repositories.ts       # Interfejsy repozytoriów
├── application/              # Warstwa aplikacji
│   ├── commands.ts           # Definicje komend
│   ├── queries.ts            # Definicje zapytań + DTOs
│   ├── command-handlers.ts   # Obsługa komend
│   └── query-handlers.ts     # Obsługa zapytań (SQLite)
├── infrastructure/           # Warstwa infrastruktury
│   ├── repositories.ts       # SQLite implementacje repozytoriów
│   └── cqrs.ts              # Command/Query Bus + DI Container
├── api/                      # Warstwa API
│   └── rest-api.ts          # REST API endpoints
├── event-management.service.ts # Serwis wysokiego poziomu
├── server.ts                 # HTTP server z Bun
└── main.ts                   # Demonstracja z CLI
```

### Bazy danych SQLite

- **`events_command.db`** - Write Model (Command Side)
  - Optymalizowana dla operacji zapisu
  - Gwarantuje spójność transakcyjną
  - Obsługuje komend (CREATE, UPDATE, PUBLISH)

- **`events_query.db`** - Read Model (Query Side)  
  - Zoptymalizowana dla szybkich zapytań
  - Denormalizowana struktura danych
  - Indeksy na często używanych polach
  - Automatycznie synchronizowana z Write Model

## Implementowane scenariusze

### Scenariusz główny: Tworzenie wydarzenia

**Aktorzy:** Organizator zalogowany do systemu

**Przebieg:**
1. Organizator wybiera "Utwórz nowe wydarzenie"
2. Wprowadza dane wydarzenia:
   - Nazwę wydarzenia
   - Opis
   - Datę i godzinę rozpoczęcia/zakończenia
   - Lokalizację (adres lub online)
   - Typ wydarzenia (publiczne/prywatne)
   - Typ biletów (płatne/bezpłatne)
   - Cenę biletów (jeśli płatne)
3. System weryfikuje poprawność danych
4. Wydarzenie zostaje zapisane w systemie
5. Wydarzenie pojawia się w panelu zarządzania organizatora

**Dodatkowe funkcje:**
- Modyfikacja wydarzenia
- Publikacja wydarzenia
- Przeglądanie wydarzeń organizatora
- Katalog publicznych wydarzeń

## Uruchomienie

### Wymagania
- Bun (najnowsza wersja)

### Instalacja i uruchomienie

```bash
# Instalacja zależności  
bun install

# Uruchomienie serwera HTTP z frontendem (port 3000)
bun run start
# lub w trybie development z auto-reload
bun run dev

# Demonstracja CLI (bez frontendu)
bun run demo

# Czyszczenie baz danych SQLite
bun run clean
```

### Dostępne interfejsy

1. **Frontend webowy:** http://localhost:3000
2. **REST API:** http://localhost:3000/api  
3. **Demonstracja CLI:** `bun run demo`

## Przykład użycia

```typescript
import { EventManagementService } from './event-management.service';
import { EventType, TicketType } from './domain/value-objects';

// Serwis automatycznie inicjalizuje SQLite CQRS
const eventService = new EventManagementService();

// Tworzenie wydarzenia (zapisywane do Command DB + sync do Query DB)
const eventId = await eventService.createEvent({
  organizerId: 'org-123',
  name: 'Konferencja IT 2025',
  description: 'Najnowsze trendy w technologii i programowaniu',
  startDate: new Date('2025-07-15T09:00:00'),
  endDate: new Date('2025-07-15T17:00:00'),
  address: 'Centrum Konferencyjne, ul. Technologiczna 5, Warszawa',
  isOnline: false,
  eventType: EventType.PUBLIC,
  ticketType: TicketType.PAID,
  ticketPrice: 299,
  currency: 'PLN'
});

// Publikacja wydarzenia (aktualizacja obu baz)
await eventService.publishEvent(eventId);

// Pobranie wydarzeń organizatora (z Query DB - zoptymalizowane)
const events = await eventService.getOrganizerEvents('org-123');

// Publiczne wydarzenia (z Read Model)
const published = await eventService.getPublishedEvents();

// Statystyki systemowe
await eventService.showDatabaseStats();

// Zamknięcie połączeń z bazami danych
eventService.close();
```

## Walidacja danych

System automatycznie waliduje:
- ✅ Nazwa i opis wydarzenia nie mogą być puste
- ✅ Data rozpoczęcia musi być wcześniejsza niż zakończenia
- ✅ Wydarzenia nie mogą być tworzone w przeszłości
- ✅ Płatne wydarzenia muszą mieć podaną cenę > 0
- ✅ Bezpłatne wydarzenia nie mogą mieć podanej ceny
- ✅ Wydarzenia muszą mieć lokalizację (adres lub być online)

## Wzorce projektowe

- **CQRS** - Separacja komend i zapytań z dwoma bazami SQLite
- **Domain-Driven Design** - Agregaty, obiekty wartości, zdarzenia domenowe  
- **Repository Pattern** - Abstrakcja dostępu do danych (Command/Query separation)
- **Command Pattern** - Enkapsulacja operacji jako obiekty
- **Dependency Injection** - Odwrócenie zależności przez Container

## Technologie

- **Runtime:** Bun (natywna obsługa SQLite, HTTP server)
- **Frontend:** React 18 + TypeScript (komponenty, hooks, services)
- **Język:** TypeScript (bezpieczeństwo typów)
- **Baza danych:** SQLite (dual database CQRS)
- **Architektura:** Layered + CQRS + DDD + Component-based UI

## React Frontend - Struktura komponentów

### Główne komponenty:
- **App.tsx** - Główny komponent z zarządzaniem stanu
- **Header.tsx** - Nagłówek z informacjami o organizatorze
- **Navigation.tsx** - Zakładki nawigacyjne
- **CreateEventForm.tsx** - Formularz tworzenia wydarzeń z walidacją
- **EventCard.tsx** - Karta pojedynczego wydarzenia
- **OrganizerEvents.tsx** - Lista wydarzeń z opcjami zarządzania
- **PublicEvents.tsx** - Publiczny katalog wydarzeń
- **SystemStats.tsx** - Statystyki systemu CQRS
- **MessageDisplay.tsx** - System powiadomień

### Custom hooks:
- **useOrganizer()** - Zarządzanie ID organizatora w localStorage
- **useMessages()** - Komunikaty success/error z auto-hide
- **useData()** - Hooks do ładowania danych (events, stats)

## Status projektu

✅ **Wdrożony** - Pełnofunkcjonalny system React + SQLite CQRS
- ✅ React frontend z TypeScript
- ✅ Komponenty z separacją odpowiedzialności
- ✅ Custom hooks do zarządzania stanem
- ✅ Tworzenie wydarzeń (Command Model)
- ✅ Modyfikacja wydarzeń (Command → Query sync)
- ✅ Publikacja wydarzeń (dual database update)
- ✅ Panel zarządzania organizatora (Read Model)
- ✅ Katalog publicznych wydarzeń (optimized queries)
- ✅ Walidacja danych biznesowych
- ✅ REST API z pełnym CRUD
- ✅ Responsywny UI z modern design
- ✅ Automatyczna synchronizacja Write → Read Model
- ✅ SQLite database per CQRS side
- ✅ Graceful shutdown i cleanup zasobów
