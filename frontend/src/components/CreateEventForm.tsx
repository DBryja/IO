import React, { useState } from 'react';
import { CreateEventRequest } from '../types';

interface CreateEventFormProps {
  organizerId: string;
  onSubmit: (eventData: CreateEventRequest) => Promise<void>;
  isLoading?: boolean;
}

export function CreateEventForm({ organizerId, onSubmit, isLoading }: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    address: '',
    isOnline: false,
    eventType: 'public' as 'public' | 'private',
    ticketType: 'free' as 'free' | 'paid',
    ticketPrice: '',
    currency: 'PLN',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isOnline: e.target.value === 'online' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: CreateEventRequest = {
      organizerId,
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      address: formData.isOnline ? undefined : formData.address,
      isOnline: formData.isOnline,
      eventType: formData.eventType,
      ticketType: formData.ticketType,
      ticketPrice: formData.ticketType === 'paid' ? parseFloat(formData.ticketPrice) : undefined,
      currency: formData.currency,
    };

    await onSubmit(eventData);
    
    // Reset form on success
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      address: '',
      isOnline: false,
      eventType: 'public',
      ticketType: 'free',
      ticketPrice: '',
      currency: 'PLN',
    });
  };

  return (
    <div className="tab-content">
      <h2>
        <i className="fas fa-plus-circle"></i>
        Utwórz nowe wydarzenie
      </h2>
      
      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="event-name">Nazwa wydarzenia *</label>
          <input
            type="text"
            id="event-name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="np. Konferencja IT 2025"
          />
        </div>

        <div className="form-group">
          <label htmlFor="event-description">Opis wydarzenia *</label>
          <textarea
            id="event-description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Szczegółowy opis wydarzenia..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start-date">Data rozpoczęcia *</label>
            <input
              type="datetime-local"
              id="start-date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="end-date">Data zakończenia *</label>
            <input
              type="datetime-local"
              id="end-date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Lokalizacja *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="location-type"
                value="offline"
                checked={!formData.isOnline}
                onChange={handleLocationTypeChange}
              />
              <span>Stacjonarnie</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="location-type"
                value="online"
                checked={formData.isOnline}
                onChange={handleLocationTypeChange}
              />
              <span>Online</span>
            </label>
          </div>
          
          {!formData.isOnline && (
            <input
              type="text"
              id="event-address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Adres wydarzenia"
              className="mt-2"
            />
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-type">Typ wydarzenia</label>
            <select
              id="event-type"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
            >
              <option value="public">Publiczne</option>
              <option value="private">Prywatne</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="ticket-type">Typ biletów</label>
            <select
              id="ticket-type"
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
              <label htmlFor="ticket-price">Cena biletu</label>
              <input
                type="number"
                id="ticket-price"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="currency">Waluta</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <option value="PLN">PLN</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Tworzenie...
            </>
          ) : (
            <>
              <i className="fas fa-plus"></i>
              Utwórz wydarzenie
            </>
          )}
        </button>
      </form>
    </div>
  );
}
