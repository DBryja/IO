import { useState, useEffect } from 'react';
import { EventData, SystemStats } from '../types';
import { eventApi } from '../services/eventApi';

export function useEvents(organizerId: string) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    if (!organizerId) return;
    
    setLoading(true);
    try {
      const response = await eventApi.getOrganizerEvents(organizerId);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [organizerId]);

  return {
    events,
    loading,
    refetch: loadEvents,
  };
}

export function usePublicEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventApi.getPublishedEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading public events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,
    refetch: loadEvents,
  };
}

export function useSystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await eventApi.getSystemStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    refetch: loadStats,
  };
}
