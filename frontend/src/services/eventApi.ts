import { EventData, CreateEventRequest, UpdateEventRequest, ApiResponse, SystemStats } from '../types';

class EventApiService {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<{ eventId: string }>> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventData: UpdateEventRequest): Promise<ApiResponse> {
    return this.request(`/events/${eventData.id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }
  async publishEvent(eventId: string): Promise<ApiResponse> {
    return this.request(`/events/${eventId}/publish`, {
      method: 'POST',
    });
  }

  async getEvent(eventId: string): Promise<ApiResponse<EventData>> {
    return this.request(`/events/${eventId}`);
  }

  async getOrganizerEvents(organizerId: string): Promise<ApiResponse<EventData[]>> {
    return this.request(`/events/organizer/${organizerId}`);
  }

  async getPublishedEvents(): Promise<ApiResponse<EventData[]>> {
    return this.request('/events/published');
  }

  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.request('/stats');
  }
}

export const eventApi = new EventApiService();
