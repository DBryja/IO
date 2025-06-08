# System do organizacji i zarządzania wydarzeniami - CQRS Prototype

## Opis projektu

Prototyp systemu do zarządzania wydarzeniami oparty na architekturze CQRS (Command Query Responsibility Segregation). System umożliwia organizatorom tworzenie, modyfikowanie i publikowanie wydarzeń.

## Architektura CQRS

Projekt implementuje wzorzec CQRS dzieląc operacje na:
- **Commands** - operacje zmieniające stan (tworzenie, aktualizacja, publikacja wydarzeń)
- **Queries** - operacje odczytujące dane (pobieranie wydarzeń, listy organizatora)

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
│   └── query-handlers.ts     # Obsługa zapytań
├── infrastructure/           # Warstwa infrastruktury
│   ├── repositories.ts       # Mock implementacje repozytoriów
│   └── cqrs.ts              # Command/Query Bus + DI Container
├── event-management.service.ts # Serwis wysokiego poziomu
└── main.ts                   # Punkt wejścia aplikacji
```

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
- Node.js (jako fallback)

### Instalacja i uruchomienie

```bash
# Instalacja dependencies
bun install

# Uruchomienie w trybie deweloperskim
bun run dev

# Lub jednorazowe uruchomienie
bun run start
```

## Przykład użycia

```typescript
import { EventManagementService } from './event-management.service';
import { Container } from './infrastructure/cqrs';
import { EventType, TicketType } from './domain/value-objects';

const container = new Container();
const eventService = new EventManagementService(container);

// Tworzenie wydarzenia
const eventId = await eventService.createEvent({
  organizerId: 'organizer-123',
  name: 'Konferencja IT 2025',
  description: 'Największa konferencja technologiczna',
  startDate: new Date('2025-09-15T09:00:00'),
  endDate: new Date('2025-09-15T18:00:00'),
  isOnline: true,
  eventType: EventType.PUBLIC,
  ticketType: TicketType.FREE
});

// Publikacja wydarzenia
await eventService.publishEvent(eventId);

// Pobranie wydarzeń organizatora
const events = await eventService.getOrganizerEvents('organizer-123');
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

- **CQRS** - Separacja komend i zapytań
- **Domain-Driven Design** - Agregaty, obiekty wartości, zdarzenia domenowe
- **Repository Pattern** - Abstrakcja dostępu do danych
- **Command Pattern** - Enkapsulacja operacji jako obiekty
- **Dependency Injection** - Odwrócenie zależności

## Rozszerzalność

Architektura umożliwia łatwe dodanie:
- Nowych komend i zapytań
- Obsługi zdarzeń domenowych (Event Sourcing)
- Różnych implementacji repozytoriów (baza danych)
- Warstwy prezentacji (REST API, GraphQL)
- Aplikacji mobilnej (wspólna logika biznesowa)

## Status projektu

🚧 **Prototyp** - Implementuje podstawowe scenariusze z mock danymi
- ✅ Tworzenie wydarzeń
- ✅ Modyfikacja wydarzeń  
- ✅ Publikacja wydarzeń
- ✅ Panel zarządzania organizatora
- ✅ Katalog publicznych wydarzeń
- ✅ Walidacja danych
- ⏳ Integracja z bazą danych (planowane)
- ⏳ REST API (planowane)
- ⏳ Aplikacja mobilna (planowane)
