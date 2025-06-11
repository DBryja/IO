import React from 'react';
import { EventData } from '../types';

interface EventCardProps {
  event: EventData;
  isOwnEvent: boolean;
  onPublish?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
}

export function EventCard({ event, isOwnEvent, onPublish, onEdit }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };
  const formatPrice = (ticketPrice?: { amount: number; currency: string } | number, currency?: string) => {
    if (!ticketPrice) return 'Bezpłatne';
    
    if (typeof ticketPrice === 'object') {
      return `${ticketPrice.amount.toFixed(2)} ${ticketPrice.currency}`;
    } else {
      return `${ticketPrice.toFixed(2)} ${currency || 'PLN'}`;
    }
  };

  const getStatusBadge = () => {
    if (event.isPublished) {
      return <span className="status-badge published">Opublikowane</span>;
    } else {
      return <span className="status-badge draft">Szkic</span>;
    }
  };

  const getEventTypeIcon = () => {
    return event.eventType === 'public' ? 'fas fa-globe' : 'fas fa-lock';
  };

  const getLocationDisplay = () => {
    // Handle both old and new data formats
    const isOnline = event.location?.isOnline ?? event.isOnline ?? false;
    const address = event.location?.address ?? event.address;
    
    if (isOnline) {
      return (
        <span>
          <i className="fas fa-wifi"></i> Online
        </span>
      );
    } else {
      return (
        <span>
          <i className="fas fa-map-marker-alt"></i> {address || 'Lokalizacja nieokreślona'}
        </span>
      );
    }
  };

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-title">{event.name}</h3>
        <div className="event-badges">
          {getStatusBadge()}
          <span className={`event-type ${event.eventType}`}>
            <i className={getEventTypeIcon()}></i>
            {event.eventType === 'public' ? 'Publiczne' : 'Prywatne'}
          </span>
        </div>
      </div>

      <div className="event-card-body">
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="event-detail">
            <i className="fas fa-calendar"></i>
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>
          
          <div className="event-detail">
            {getLocationDisplay()}
          </div>
            <div className="event-detail">
            <i className="fas fa-ticket-alt"></i>
            <span>{formatPrice(event.ticketPrice)}</span>
          </div>
          
          <div className="event-detail">
            <i className="fas fa-user"></i>
            <span>Org: {event.organizerId}</span>
          </div>
        </div>
      </div>

      {isOwnEvent && (
        <div className="event-card-actions">
          {!event.isPublished && onPublish && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onPublish(event.id)}
              title="Publikuj wydarzenie"
            >
              <i className="fas fa-paper-plane"></i>
              Publikuj
            </button>
          )}
          
          {onEdit && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(event.id)}
              title="Edytuj wydarzenie"
            >
              <i className="fas fa-edit"></i>
              Edytuj
            </button>
          )}
        </div>
      )}
        <div className="event-card-footer">
        {event.createdAt && (
          <small className="text-muted">
            Utworzone: {formatDate(event.createdAt)}
            {event.updatedAt && event.updatedAt !== event.createdAt && (
              <> | Zaktualizowane: {formatDate(event.updatedAt)}</>
            )}
          </small>
        )}
      </div>
    </div>
  );
}
