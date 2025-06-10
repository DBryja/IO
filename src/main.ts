import { EventManagementService } from './event-management.service';
import { EventType, TicketType, OrganizerId } from './domain/value-objects';

// Demo aplikacji z SQLite CQRS
async function runSQLiteDemo() {
  console.log('🚀 === DEMO SYSTEMU ZARZĄDZANIA WYDARZENIAMI (SQLite CQRS) ===');
  console.log('📊 Architektura: Command Query Responsibility Segregation');
  console.log('🗄️ Bazy danych: SQLite (Write Model + Read Model)');
  console.log('=' .repeat(70));

  const eventService = new EventManagementService();
  
  try {
    // Pokazanie statystyk baz danych
    await eventService.showDatabaseStats();

    // Generowanie ID organizatora
    const organizerId = OrganizerId.generate().value;
    console.log(`\n👤 Organizator ID: ${organizerId}`);

    // === SCENARIUSZ 1: Tworzenie wydarzenia ===
    console.log('\n🎯 SCENARIUSZ 1: Organizator tworzy nowe wydarzenie');
    
    const eventId1 = await eventService.createEvent({
      organizerId: organizerId,
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

    // === SCENARIUSZ 2: Tworzenie wydarzenia online ===
    console.log('\n🎯 SCENARIUSZ 2: Organizator tworzy wydarzenie online');
    
    const eventId2 = await eventService.createEvent({
      organizerId: organizerId,
      name: 'Webinar: AI w Biznesie',
      description: 'Praktyczne zastosowania sztucznej inteligencji',
      startDate: new Date('2025-07-20T18:00:00'),
      endDate: new Date('2025-07-20T20:00:00'),
      isOnline: true,
      eventType: EventType.PUBLIC,
      ticketType: TicketType.FREE
    });

    // === SCENARIUSZ 3: Modyfikacja wydarzenia ===
    console.log('\n🎯 SCENARIUSZ 3: Organizator modyfikuje wydarzenie');
    
    await eventService.updateEvent(eventId1, {
      name: 'Konferencja IT 2025 - PREMIUM',
      description: 'Najnowsze trendy w technologii i programowaniu + warsztaty praktyczne',
      startDate: new Date('2025-07-15T09:00:00'),
      endDate: new Date('2025-07-15T18:00:00'),
      address: 'Centrum Konferencyjne VIP, ul. Technologiczna 5, Warszawa',
      isOnline: false,
      eventType: EventType.PUBLIC,
      ticketType: TicketType.PAID,
      ticketPrice: 399,
      currency: 'PLN'
    });

    // === SCENARIUSZ 4: Pobieranie wydarzeń organizatora ===
    console.log('\n🎯 SCENARIUSZ 4: Panel organizatora - lista wydarzeń');
    
    await eventService.getOrganizerEvents(organizerId);

    // === SCENARIUSZ 5: Publikacja wydarzeń ===
    console.log('\n🎯 SCENARIUSZ 5: Publikacja wydarzeń');
    
    await eventService.publishEvent(eventId1);
    await eventService.publishEvent(eventId2);

    // === SCENARIUSZ 6: Katalog publicznych wydarzeń ===
    console.log('\n🎯 SCENARIUSZ 6: Katalog publicznych wydarzeń');
    
    await eventService.getPublishedEvents();

    // === SCENARIUSZ 7: Pobieranie szczegółów wydarzenia ===
    console.log('\n🎯 SCENARIUSZ 7: Szczegóły konkretnego wydarzenia');
    
    const eventDetails = await eventService.getEventById(eventId1);
    if (eventDetails) {
      console.log('📋 Szczegóły wydarzenia:');
      console.log(`   Nazwa: ${eventDetails.name}`);
      console.log(`   Opis: ${eventDetails.description}`);
      console.log(`   Data: ${eventDetails.startDate.toLocaleDateString('pl-PL')}`);
      console.log(`   Lokalizacja: ${eventDetails.location.isOnline ? '🌐 Online' : `📍 ${eventDetails.location.address}`}`);
      console.log(`   Cena: ${eventDetails.ticketPrice ? `${eventDetails.ticketPrice.amount} ${eventDetails.ticketPrice.currency}` : 'Bezpłatne'}`);
      console.log(`   Status: ${eventDetails.isPublished ? '🌍 Opublikowane' : '📝 Szkic'}`);
    }

    // === SCENARIUSZ 8: Drugi organizator ===
    console.log('\n🎯 SCENARIUSZ 8: Drugi organizator dodaje swoje wydarzenia');
    
    const organizerId2 = OrganizerId.generate().value;
    
    const eventId3 = await eventService.createEvent({
      organizerId: organizerId2,
      name: 'Warsztat Fotograficzny',
      description: 'Nauka kompozycji i technik fotograficznych',
      startDate: new Date('2025-08-10T10:00:00'),
      endDate: new Date('2025-08-10T16:00:00'),
      address: 'Studio Foto, ul. Artystyczna 12, Kraków',
      eventType: EventType.PRIVATE,
      ticketType: TicketType.PAID,
      ticketPrice: 150,
      currency: 'PLN'
    });

    await eventService.publishEvent(eventId3);

    // === PODSUMOWANIE ===
    console.log('\n🎯 PODSUMOWANIE: Wszystkie publiczne wydarzenia');
    await eventService.getPublishedEvents();

    console.log('\n✅ === DEMO ZAKOŃCZONE POMYŚLNIE ===');
    console.log('🗄️ Dane zostały zapisane w plikach:');
    console.log('   📝 events_command.db (Write Model)');
    console.log('   📖 events_query.db (Read Model)');
    console.log('🔄 Oba modele są automatycznie synchronizowane');

  } catch (error) {
    console.error('❌ Błąd podczas wykonywania demo:', error);
  } finally {
    // Zamknięcie połączeń z bazami danych
    eventService.close();
    console.log('\n🔒 Połączenia z bazami danych zostały zamknięte');
  }
}

// Uruchomienie demo z obsługą błędów
async function main() {
  try {
    await runSQLiteDemo();
  } catch (error) {
    console.error('💥 Krytyczny błąd aplikacji:', error);
    process.exit(1);
  }
}

// Obsługa zamykania aplikacji
process.on('SIGINT', () => {
  console.log('\n🛑 Otrzymano sygnał przerwania...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Otrzymano sygnał zakończenia...');
  process.exit(0);
});

// Uruchomienie aplikacji
if (import.meta.main) {
  main();
}
