import React, { useState, useEffect } from 'react';
import { CreateEventRequest } from '../types';

interface CreateEventFormProps {
  organizerId: string;
  onSubmit: (eventData: CreateEventRequest) => Promise<boolean>;
  isLoading?: boolean;
  onMessage?: (text: string, type: 'success' | 'error' | 'info') => void;
}

export function CreateEventForm({ organizerId, onSubmit, isLoading, onMessage }: CreateEventFormProps) {
  const STORAGE_KEY = 'createEventFormData';
  
  // Initialize form data from localStorage if available
  const getInitialFormData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Notify user that data was restored
        if (onMessage) {
          onMessage('📋 Przywrócono dane formularza z poprzedniej sesji', 'info');
        }
        return parsedData;
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
    
    return {
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
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }, [formData]);

  // Clear saved data when component unmounts
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  };

  // Manual clear form function
  const clearForm = () => {
    const emptyFormData = {
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
    };
    setFormData(emptyFormData);
    clearSavedData();
    if (onMessage) {
      onMessage('🗑️ Formularz został wyczyszczony', 'info');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({ ...prev, isOnline: e.target.value === 'online' }));
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

    try {
      const success = await onSubmit(eventData);
      
      // Only reset form and clear saved data on successful submission
      if (success) {
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
        clearSavedData();
      }
      // If submission failed, form data is preserved
    } catch (error) {
      // On error, form data remains intact
      console.error('Form submission error:', error);
    }
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

        <div className="form-actions">
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
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearForm}
            disabled={isLoading}
            title="Wyczyść wszystkie pola formularza"
          >
            <i className="fas fa-trash"></i>
            Wyczyść formularz
          </button>
        </div>
      </form>
    </div>
  );
}
