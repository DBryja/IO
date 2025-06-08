# Poprawa typowania w event-management.service.ts

## Zidentyfikowane problemy

1. **Użycie typu `any`** - W metodach `getOrganizerEvents` i `getPublishedEvents` używano typów `any` zamiast właściwych typów.

2. **Brak typów generycznych** - Metody `execute` w `CommandBus` i `QueryBus` nie używały odpowiednich typów generycznych.

3. **Brak importów** - Brakowało importu typów `EventDto` i `QueryResult`.

## Wykonane poprawki

### 1. Poprawka w infrastructure/cqrs.ts

**CommandBus:**
```typescript
// Przed:
async execute<T>(command: T & { type: string }): Promise<any>

// Po:
async execute<T extends { type: string }>(command: T): Promise<any>
```

**QueryBus:**
```typescript
// Przed:
async execute<T, R>(query: T & { type: string }): Promise<R>

// Po:
async execute<T extends { type: string }, R>(query: T): Promise<R>
```

### 2. Poprawka w event-management.service.ts

**Dodano importy:**
```typescript
import { 
  EventDto
} from './application/queries';
import { QueryResult } from './application/query-handlers';
```

**Poprawka metody getOrganizerEvents:**
```typescript
// Przed:
async getOrganizerEvents(organizerId: string) {
  const result:any = await this.container.getQueryBus().execute(query);
  result.data.forEach((event:any, index:number) => {

// Po:
async getOrganizerEvents(organizerId: string): Promise<EventDto[]> {
  const result = await this.container.getQueryBus().execute<GetEventsByOrganizerQuery, QueryResult<EventDto[]>>(query);
  result.data.forEach((event: EventDto, index: number) => {
```

**Poprawka metody getPublishedEvents:**
```typescript
// Przed:
async getPublishedEvents() {
  const result = await this.container.getQueryBus().execute(query);
  result.data.forEach((event, index) => {

// Po:
async getPublishedEvents(): Promise<EventDto[]> {
  const result = await this.container.getQueryBus().execute<GetPublishedEventsQuery, QueryResult<EventDto[]>>(query);
  result.data.forEach((event: EventDto, index: number) => {
```

## Korzyści z poprawek

1. **Bezpieczeństwo typów** - Wszystkie typy są teraz sprawdzane w czasie kompilacji
2. **Lepsze IntelliSense** - IDE może teraz podpowiadać właściwości i metody
3. **Łatwiejsze debugowanie** - Błędy typów są wychwytywane przed uruchomieniem
4. **Czytelność kodu** - Jasne jest co zwracają poszczególne metody
5. **Zgodność z TypeScript** - Projekt kompiluje się bez ostrzeżeń

## Weryfikacja

✅ Projekt kompiluje się bez błędów  
✅ Wszystkie testy przechodzą  
✅ Aplikacja działa poprawnie  
✅ Typowanie jest prawidłowe we wszystkich miejscach
