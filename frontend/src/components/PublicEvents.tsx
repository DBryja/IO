import React from 'react';
import { EventData } from '../types';
import { EventCard } from './EventCard';
import { usePublicEvents } from '../hooks/useData';

interface PublicEventsProps {
  onMessage: (text: string, type: 'success' | 'error' | 'info') => void;
}

export function PublicEvents({ onMessage }: PublicEventsProps) {
  const { events, loading } = usePublicEvents();

  if (loading) {
    return (
      <div className="tab-content">
        <h2>
          <i className="fas fa-globe"></i>
          Wydarzenia publiczne
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
        <i className="fas fa-globe"></i>
        Wydarzenia publiczne ({events.length})
      </h2>
      
      <div className="section-description">
        <p>
          <i className="fas fa-info-circle"></i>
          Katalog wszystkich opublikowanych wydarzeń publicznych w systemie.
          Dane pobierane z Read Model (Query Database).
        </p>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-globe"></i>
          <h3>Brak publicznych wydarzeń</h3>
          <p>W systemie nie ma jeszcze żadnych opublikowanych wydarzeń publicznych.</p>
          <p>Organizatorzy mogą tworzyć i publikować wydarzenia z poziomu swoich paneli.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isOwnEvent={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
