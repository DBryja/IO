import React, { useState, useEffect } from 'react';
import { EventData, UpdateEventRequest } from '../types';
import { eventApi } from '../services/eventApi';

interface EditEventModalProps {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMessage: (text: string, type: 'success' | 'error' | 'info') => void;
  onSuccess: () => void;
}

export function EditEventModal({ eventId, isOpen, onClose, onMessage, onSuccess }: EditEventModalProps) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    locationType: 'offline' as 'online' | 'offline',
    address: '',
    eventType: 'public' as 'public' | 'private',
    ticketType: 'free' as 'free' | 'paid',
    ticketPrice: '',
    currency: 'PLN'
  });

  // Load event data when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      loadEventData();
    }
  }, [isOpen, eventId]);
  const loadEventData = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const response = await eventApi.getEvent(eventId);

      if (response.success && response.data) {
        const eventData = response.data;
        setEvent(eventData);
        
        // Format dates for datetime-local input
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        
        setFormData({
          name: eventData.name,
          description: eventData.description,
          startDate: formatDateForInput(startDate),
          endDate: formatDateForInput(endDate),
          locationType: eventData.location?.isOnline || eventData.isOnline ? 'online' : 'offline',
          address: eventData.location?.address || eventData.address || '',
          eventType: eventData.eventType,
          ticketType: eventData.ticketType,
          ticketPrice: eventData.ticketPrice?.amount?.toString() || '',
          currency: eventData.ticketPrice?.currency || 'PLN'
        });
      } else {
        onMessage(`❌ Błąd: ${response.error}`, 'error');
        onClose();
      }
    } catch (error) {
      onMessage(`❌ Błąd sieci: ${error}`, 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, locationType: e.target.value as 'online' | 'offline' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !event) return;

    const updateData: UpdateEventRequest = {
      id: eventId,
      organizerId: event.organizerId,
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isOnline: formData.locationType === 'online',
      address: formData.locationType === 'offline' ? formData.address : undefined,
      eventType: formData.eventType,
      ticketType: formData.ticketType,
      ticketPrice: formData.ticketType === 'paid' ? parseFloat(formData.ticketPrice) : undefined,
      currency: formData.currency
    };

    try {
      onMessage('Aktualizowanie wydarzenia...', 'info');
      const response = await eventApi.updateEvent(updateData);

      if (response.success) {
        onMessage('✅ Wydarzenie zostało zaktualizowane!', 'success');
        onSuccess();
        onClose();
      } else {
        onMessage(`❌ Błąd: ${response.error}`, 'error');
      }
    } catch (error) {
      onMessage(`❌ Błąd aktualizacji: ${error}`, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <i className="fas fa-edit"></i>
            Edytuj wydarzenie
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i> Ładowanie danych wydarzenia...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="edit-name">Nazwa wydarzenia *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Opis wydarzenia *</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-startDate">Data rozpoczęcia *</label>
                  <input
                    type="datetime-local"
                    id="edit-startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-endDate">Data zakończenia *</label>
                  <input
                    type="datetime-local"
                    id="edit-endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lokalizacja</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="location-type"
                      value="offline"
                      checked={formData.locationType === 'offline'}
                      onChange={handleRadioChange}
                    />
                    <span>Stacjonarnie</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="location-type"
                      value="online"
                      checked={formData.locationType === 'online'}
                      onChange={handleRadioChange}
                    />
                    <span>Online</span>
                  </label>
                </div>
              </div>

              {formData.locationType === 'offline' && (
                <div className="form-group">
                  <label htmlFor="edit-address">Adres</label>
                  <input
                    type="text"
                    id="edit-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-eventType">Typ wydarzenia</label>
                  <select
                    id="edit-eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                  >
                    <option value="public">Publiczne</option>
                    <option value="private">Prywatne</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-ticketType">Typ biletów</label>
                  <select
                    id="edit-ticketType"
                    name="ticketType"
                    value={formData.ticketType}
                    onChange={handleInputChange}
                  >
                    <option value="free">Bezpłatne</option>
                    <option value="paid">Płatne</option>
                  </select>
                </div>
              </div>

              {formData.ticketType === 'paid' && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-ticketPrice">Cena biletu</label>
                    <div className="price-input">
                      <input
                        type="number"
                        id="edit-ticketPrice"
                        name="ticketPrice"
                        min="0"
                        step="0.01"
                        value={formData.ticketPrice}
                        onChange={handleInputChange}
                      />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                      >
                        <option value="PLN">PLN</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Zapisz zmiany
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  <i className="fas fa-times"></i> Anuluj
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
