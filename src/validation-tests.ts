import { Container } from './infrastructure/cqrs';
import { EventManagementService } from './event-management.service';
import { EventType, TicketType } from './domain/value-objects';

async function runValidationTests() {
  console.log('🧪 TESTY WALIDACJI DANYCH');
  console.log('='.repeat(50));

  const container = new Container();
  const eventService = new EventManagementService(container);
  const organizerId = crypto.randomUUID();

  // Test 1: Pusta nazwa wydarzenia
  console.log('\n📝 Test 1: Pusta nazwa wydarzenia');
  try {
    await eventService.createEvent({
      organizerId,
      name: '',
      description: 'Opis wydarzenia',
      startDate: new Date('2025-09-15T09:00:00'),
      endDate: new Date('2025-09-15T18:00:00'),
      isOnline: true
    });
    console.log('❌ Test nie przeszedł - powinien rzucić błąd');
  } catch (error) {
    console.log(`✅ Test przeszedł: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 2: Data w przeszłości
  console.log('\n📅 Test 2: Data w przeszłości');
  try {
    await eventService.createEvent({
      organizerId,
      name: 'Wydarzenie w przeszłości',
      description: 'To wydarzenie jest w przeszłości',
      startDate: new Date('2024-01-01T09:00:00'),
      endDate: new Date('2024-01-01T18:00:00'),
      isOnline: true
    });
    console.log('❌ Test nie przeszedł - powinien rzucić błąd');
  } catch (error) {
    console.log(`✅ Test przeszedł: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 3: Data rozpoczęcia po dacie zakończenia
  console.log('\n⏰ Test 3: Nieprawidłowe daty');
  try {
    await eventService.createEvent({
      organizerId,
      name: 'Wydarzenie z błędnymi datami',
      description: 'Data końca przed początkiem',
      startDate: new Date('2025-09-15T18:00:00'),
      endDate: new Date('2025-09-15T09:00:00'),
      isOnline: true
    });
    console.log('❌ Test nie przeszedł - powinien rzucić błąd');
  } catch (error) {
    console.log(`✅ Test przeszedł: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 4: Płatne wydarzenie bez ceny
  console.log('\n💰 Test 4: Płatne wydarzenie bez ceny');
  try {
    await eventService.createEvent({
      organizerId,
      name: 'Płatne wydarzenie',
      description: 'Wydarzenie płatne ale bez ceny',
      startDate: new Date('2025-09-15T09:00:00'),
      endDate: new Date('2025-09-15T18:00:00'),
      isOnline: true,
      ticketType: TicketType.PAID
      // brak ticketPrice
    });
    console.log('❌ Test nie przeszedł - powinien rzucić błąd');
  } catch (error) {
    console.log(`✅ Test przeszedł: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 5: Bezpłatne wydarzenie z ceną
  console.log('\n🎫 Test 5: Bezpłatne wydarzenie z ceną');
  try {
    await eventService.createEvent({
      organizerId,
      name: 'Bezpłatne wydarzenie',
      description: 'Wydarzenie bezpłatne ale z ceną',
      startDate: new Date('2025-09-15T09:00:00'),
      endDate: new Date('2025-09-15T18:00:00'),
      isOnline: true,
      ticketType: TicketType.FREE,
      ticketPrice: 100
    });
    console.log('❌ Test nie przeszedł - powinien rzucić błąd');
  } catch (error) {
    console.log(`✅ Test przeszedł: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 6: Wydarzenie bez lokalizacji
  console.log('\n📍 Test 6: Wydarzenie bez lokalizacji');
  try {
    await eventService.createEvent({
      organizerId,
      name: 'Wydarzenie bez lokalizacji',
      description: 'Wydarzenie nie ma ani adresu ani nie jest online',
      startDate: new Date('2025-09-15T09:00:00'),
      endDate: new Date('2025-09-15T18:00:00'),
      isOnline: false
      // brak address
    });
    console.log('❌ Test nie przeszedł - powinien rzucić błąd');
  } catch (error) {
    console.log(`✅ Test przeszedł: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 7: Prawidłowe wydarzenie
  console.log('\n✨ Test 7: Prawidłowe wydarzenie');
  try {
    const eventId = await eventService.createEvent({
      organizerId,
      name: 'Prawidłowe wydarzenie',
      description: 'To wydarzenie powinno zostać utworzone',
      startDate: new Date('2025-12-15T09:00:00'),
      endDate: new Date('2025-12-15T18:00:00'),
      address: 'ul. Testowa 1, Warszawa',
      eventType: EventType.PUBLIC,
      ticketType: TicketType.PAID,
      ticketPrice: 50
    });
    console.log(`✅ Test przeszedł: Wydarzenie utworzone z ID ${eventId}`);
  } catch (error) {
    console.log(`❌ Test nie przeszedł: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n🏁 Wszystkie testy walidacji zakończone!');
}

// Uruchomienie testów
runValidationTests().catch(console.error);
