import React, { useState } from 'react';
import { EventData } from '../types';
import { EventCard } from './EventCard';
import { EditEventModal } from './EditEventModal';
import { useEvents } from '../hooks/useData';
import { eventApi } from '../services/eventApi';

interface OrganizerEventsProps {
  organizerId: string;
  onMessage: (text: string, type: 'success' | 'error' | 'info') => void;
}

export function OrganizerEvents({ organizerId, onMessage }: OrganizerEventsProps) {
  const { events, loading, refetch } = useEvents(organizerId);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handlePublish = async (eventId: string) => {
    try {
      const response = await eventApi.publishEvent(eventId);
      if (response.success) {
        onMessage('✅ Wydarzenie zostało opublikowane!', 'success');
        refetch(); // Refresh list
      } else {
        onMessage(`❌ Błąd: ${response.error}`, 'error');
      }
    } catch (error) {
      onMessage(`❌ Błąd publikacji: ${error}`, 'error');
    }
  };
  const handleEdit = (eventId: string) => {
    setEditEventId(eventId);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refetch(); // Refresh the events list
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditEventId(null);
  };

  if (loading) {
    return (
      <div className="tab-content">
        <h2>
          <i className="fas fa-cogs"></i>
          Zarządzaj wydarzeniami
        </h2>
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i> Ładowanie wydarzeń...
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h2>
        <i className="fas fa-cogs"></i>
        Zarządzaj wydarzeniami ({events.length})
      </h2>

      {events.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-plus"></i>
          <h3>Brak wydarzeń</h3>
          <p>Nie masz jeszcze żadnych utworzonych wydarzeń.</p>
          <p>Przejdź do zakładki "Utwórz wydarzenie", aby dodać pierwsze.</p>
        </div>
      ) : (        <div className="events-grid">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isOwnEvent={true}
              onPublish={handlePublish}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <EditEventModal
        eventId={editEventId}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onMessage={onMessage}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
