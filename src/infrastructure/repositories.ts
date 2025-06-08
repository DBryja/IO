import { IEventRepository } from '../domain/repositories';
import { Event } from '../domain/event';
import { EventId, OrganizerId } from '../domain/value-objects';

// Mock implementation of Event Repository
export class InMemoryEventRepository implements IEventRepository {
  private events: Map<string, Event> = new Map();

  async save(event: Event): Promise<void> {
    this.events.set(event.id.value, event);
    console.log(`Event saved: ${event.name} (ID: ${event.id.value})`);
  }

  async findById(id: EventId): Promise<Event | null> {
    const event = this.events.get(id.value);
    return event || null;
  }

  async findByOrganizer(organizerId: OrganizerId): Promise<Event[]> {
    const organizerEvents: Event[] = [];
    
    for (const event of this.events.values()) {
      if (event.organizerId.equals(organizerId)) {
        organizerEvents.push(event);
      }
    }
    
    return organizerEvents;
  }

  async findPublishedEvents(): Promise<Event[]> {
    const publishedEvents: Event[] = [];
    
    for (const event of this.events.values()) {
      if (event.isPublished) {
        publishedEvents.push(event);
      }
    }
    
    return publishedEvents;
  }

  // Additional utility methods for testing/debugging
  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  clear(): void {
    this.events.clear();
  }

  getEventCount(): number {
    return this.events.size;
  }
}
