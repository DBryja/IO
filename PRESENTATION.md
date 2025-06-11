# 🎉 System zarządzania wydarzeniami - SQLite CQRS

## 📋 Status projektu: GOTOWY DO PREZENTACJI ✅

System zarządzania wydarzeniami z architekturą CQRS opartą na dwóch bazach SQLite został pomyślnie zaimplementowany i jest w pełni funkcjonalny.

## 🚀 Jak uruchomić

```bash
# Przejdź do katalogu projektu
cd "d:\szkola\IO"

# Uruchom serwer
bun run start

# Otwórz w przeglądarce
# http://localhost:3000
```

## 🏗️ Architektura CQRS z SQLite

### Dual Database Implementation
- **`events_command.db`** - Write Model (Command Side)
  - Operacje zapisu (CREATE, UPDATE, PUBLISH)
  - Gwarantuje spójność transakcyjną
  - Optymalizowane dla komend

- **`events_query.db`** - Read Model (Query Side)  
  - Operacje odczytu (SELECT, FILTER, SEARCH)
  - Denormalizowane dla szybkości
  - Automatyczna synchronizacja z Write Model

### Separacja odpowiedzialności
- **Commands:** Zmieniają stan w Command DB
- **Queries:** Czytają z Query DB (zoptymalizowane)
- **Sync:** Automatyczna po każdej operacji zapisu

## 🎯 Co można zaprezentować

### 1. **Architektura CQRS z SQLite w praktyce**
- **Write Model** - `events_command.db` dla operacji zapisu
- **Read Model** - `events_query.db` dla zapytań (zoptymalizowane)
- **Separacja odpowiedzialności** - czytelny kod, łatwa rozszerzalność
- **Automatyczna synchronizacja** - Write → Read po każdej operacji

### 2. **Scenariusz główny: Tworzenie wydarzenia** ✅
- Organizator wypełnia formularz w przeglądarce
- System waliduje dane biznesowe
- Zapis do Command Database
- Automatyczna synchronizacja do Query Database
- Dostępne w panelu zarządzania (Read Model)

### 3. **Dual Database Operations**
- **Command operations:** CREATE, UPDATE, PUBLISH → `events_command.db`
- **Query operations:** SELECT, FILTER → `events_query.db`
- **Real-time sync:** Command changes propagated to Query DB
- **Performance:** Read queries optimized independently

### 4. **Walidacja biznesowa**
- Nazwa i opis wymagane
- Data rozpoczęcia < data zakończenia  
- Wydarzenia nie mogą być w przeszłości
- Płatne wydarzenia muszą mieć cenę > 0
- Bezpłatne wydarzenia nie mogą mieć ceny

### 5. **Funkcjonalności systemu**
- **Tworzenie wydarzeń** - pełny formularz z walidacją
- **Edycja wydarzeń** - modyfikacja wszystkich parametrów
- **Publikacja** - przełączenie z szkicu na publiczne
- **Panel organizatora** - lista własnych wydarzeń (Read Model)
- **Katalog publiczny** - opublikowane wydarzenia (Query DB)
- **Statystyki** - podsumowanie z obu baz danych

### 6. **Technologie**
- **Bun** - Runtime z natywną obsługą SQLite
- **TypeScript** - Bezpieczeństwo typów
- **SQLite** - Dual database (Command + Query)
- **REST API** - Pełny CRUD z CQRS endpoints
- **Frontend** - Vanilla JS (zero dependencies)
- **CQRS** - Architektura aplikacji
- **DDD** - Domain-Driven Design
- **Vanilla JS** - Frontend bez frameworków

## 🎨 Interfejs użytkownika

### Zakładki systemu:
1. **📝 Tworzenie** - Formularz nowego wydarzenia
2. **🎛️ Zarządzanie** - Lista wydarzeń organizatora
3. **🌍 Katalog** - Publiczne wydarzenia  
4. **📊 Statystyki** - Podsumowanie systemu

### Możliwości demonstracji:
- ✅ Tworzenie różnych typów wydarzeń (online/offline, płatne/bezpłatne)
- ✅ Edycja istniejących wydarzeń
- ✅ Publikacja szkiców
- ✅ Zmiana organizatora (symulacja różnych użytkowników)
- ✅ Walidacja błędnych danych
- ✅ Responsywny interfejs

## 🏗️ Architektura do omówienia

```
Frontend (Vanilla JS)
       ↕ HTTP/JSON
REST API (Native Bun)
       ↕ 
Application Layer (CQRS)
├── Commands & Handlers
├── Queries & Handlers  
├── Command Bus
└── Query Bus
       ↕
Domain Layer (DDD)
├── Event Aggregate
├── Value Objects
├── Domain Events
└── Repository Interface
       ↕
Infrastructure Layer
├── In-Memory Repository (Mock)
└── Dependency Injection
```

## 📈 Możliwe rozszerzenia (do dyskusji)

1. **Baza danych** - PostgreSQL z Drizzle ORM
2. **Event Sourcing** - Historia zmian wydarzeń
3. **Authentication** - JWT, OAuth2
4. **Real-time** - WebSockets dla powiadomień
5. **Aplikacja mobilna** - React Native / Flutter
6. **Mikroserwisy** - Podział na domeny biznesowe
7. **CI/CD** - Automatyczne wdrażanie
8. **Monitoring** - Logi, metryki, alerty

## 🎭 Scenariusze demo

### Scenariusz 1: Podstawowe tworzenie
1. Utwórz bezpłatne wydarzenie online
2. Sprawdź panel zarządzania
3. Opublikuj wydarzenie
4. Sprawdź katalog publiczny

### Scenariusz 2: Płatne wydarzenie
1. Utwórz płatne wydarzenie stacjonarne
2. Ustaw cenę i lokalizację
3. Publikuj i sprawdź w katalogu

### Scenariusz 3: Walidacja
1. Spróbuj utworzyć wydarzenie bez nazwy
2. Ustaw datę w przeszłości
3. Ustaw cenę dla bezpłatnego biletu
4. Pokaż błędy walidacji

### Scenariusz 4: Edycja
1. Edytuj istniejące wydarzenie
2. Zmień typ z bezpłatnego na płatny
3. Zaktualizuj datę i lokalizację

### Scenariusz 5: Różni organizatorzy
1. Zmień organizatora
2. Utwórz wydarzenia dla różnych organizatorów
3. Pokaż separację danych

## 💻 Techniczne szczegóły

- **Port:** 3000
- **API Base:** `/api`
- **Frontend:** Single Page Application
- **Architektura:** Layered + CQRS + DDD
- **Runtime:** Bun (natywny HTTP server)
- **Zależności:** Minimalne (tylko uuid)

## ✅ Gotowość do prezentacji

- [x] ✅ System uruchomiony i działający
- [x] ✅ Frontend responsywny i funkcjonalny  
- [x] ✅ API kompletne i przetestowane
- [x] ✅ Architektura CQRS zaimplementowana
- [x] ✅ Walidacja biznesowa działająca
- [x] ✅ Dokumentacja kompletna
- [x] ✅ Migracja na natywny Bun zakończona

**🎯 System jest w pełni gotowy do prezentacji i demonstracji możliwości!**
