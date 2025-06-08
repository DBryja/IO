import { Event } from './event';
import { EventId, OrganizerId } from './value-objects';

// Repository interface
export interface IEventRepository {
  save(event: Event): Promise<void>;
  findById(id: EventId): Promise<Event | null>;
  findByOrganizer(organizerId: OrganizerId): Promise<Event[]>;
  findPublishedEvents(): Promise<Event[]>;
}
