import { Container } from './infrastructure/cqrs';
import { EventManagementService } from './event-management.service';
import { EventType, TicketType } from './domain/value-objects';

async function main() {
  console.log('🚀 System do organizacji i zarządzania wydarzeniami - CQRS Prototype');
  console.log('='.repeat(70));

  // Inicjalizacja systemu
  const container = new Container();
  const eventService = new EventManagementService(container);

  // Mock ID organizatora (symulacja zalogowanego użytkownika)
  const organizerId = crypto.randomUUID();
  console.log(`👤 Organizator zalogowany: ${organizerId}`);

  try {
    // Scenariusz 1: Tworzenie bezpłatnego wydarzenia online
    const eventId1 = await eventService.createEvent({
      organizerId,
      name: 'Konferencja IT 2025',
      description: 'Największa konferencja technologiczna w Polsce. Poznaj najnowsze trendy w programowaniu, AI i chmurze.',
      startDate: new Date('2025-09-15T09:00:00'),
      endDate: new Date('2025-09-15T18:00:00'),
      isOnline: true,
      eventType: EventType.PUBLIC,
      ticketType: TicketType.FREE
    });

    // Scenariusz 2: Tworzenie płatnego wydarzenia stacjonarnego
    const eventId2 = await eventService.createEvent({
      organizerId,
      name: 'Warsztaty z React.js',
      description: 'Praktyczne warsztaty dla początkujących programistów React.js. Nauczysz się od podstaw.',
      startDate: new Date('2025-10-20T10:00:00'),
      endDate: new Date('2025-10-20T16:00:00'),
      address: 'ul. Technologiczna 1, Warszawa',
      eventType: EventType.PUBLIC,
      ticketType: TicketType.PAID,
      ticketPrice: 199,
      currency: 'PLN'
    });

    // Scenariusz 3: Tworzenie prywatnego wydarzenia
    const eventId3 = await eventService.createEvent({
      organizerId,
      name: 'Spotkanie zespołu projektowego',
      description: 'Miesięczne spotkanie zespołu do omówienia postępów w projekcie.',
      startDate: new Date('2025-07-15T14:00:00'),
      endDate: new Date('2025-07-15T16:00:00'),
      address: 'Biuro firmy, sala konferencyjna A',
      eventType: EventType.PRIVATE,
      ticketType: TicketType.FREE
    });

    // Wyświetlenie panelu zarządzania organizatora
    await eventService.getOrganizerEvents(organizerId);

    // Publikacja wybranych wydarzeń
    await eventService.publishEvent(eventId1);
    await eventService.publishEvent(eventId2);
    // Prywatne wydarzenie nie jest publikowane

    // Wyświetlenie publicznego katalogu wydarzeń
    await eventService.getPublishedEvents();

    // Modyfikacja wydarzenia
    await eventService.updateEvent(eventId1, {
      name: 'Konferencja IT 2025 - AKTUALIZACJA',
      description: 'Największa konferencja technologiczna w Polsce. Poznaj najnowsze trendy w programowaniu, AI i chmurze. NOWI PRELEGENCI!',
      startDate: new Date('2025-09-15T08:30:00'), // Zmiana godziny rozpoczęcia
      endDate: new Date('2025-09-15T18:30:00'),
      isOnline: true,
      eventType: EventType.PUBLIC,
      ticketType: TicketType.FREE
    });

    // Ponowne wyświetlenie panelu organizatora po modyfikacji
    await eventService.getOrganizerEvents(organizerId);

    console.log('\n🎉 Wszystkie scenariusze zostały wykonane pomyślnie!');
    console.log('✅ System CQRS działa poprawnie');

  } catch (error) {
    console.error('❌ Wystąpił błąd:', error);
  }

  // Wyświetlenie statystyk systemu
  console.log('\n📊 STATYSTYKI SYSTEMU:');
  console.log(`📋 Łączna liczba wydarzeń: ${container.getEventRepository().getEventCount()}`);
  console.log(`🌍 Opublikowane wydarzenia: ${(await eventService.getPublishedEvents()).length}`);
}

// Uruchomienie aplikacji
main().catch(console.error);
