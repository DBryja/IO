// Frontend types for Event Management System

export interface EventData {
  id: string;
  organizerId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: {
    address?: string;
    isOnline: boolean;
  };
  address?: string; // For backward compatibility
  isOnline?: boolean; // For backward compatibility
  eventType: 'public' | 'private';
  ticketType: 'free' | 'paid';
  ticketPrice?: {
    amount: number;
    currency: string;
  };
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventRequest {
  organizerId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  address?: string;
  isOnline: boolean;
  eventType: 'public' | 'private';
  ticketType: 'free' | 'paid';
  ticketPrice?: number;
  currency: string;
}

export interface UpdateEventRequest extends CreateEventRequest {
  id: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  source?: string;
}

export interface SystemStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalOrganizers: number;
  avgEventsPerOrganizer: number;
  commandDbSize: string;
  queryDbSize: string;
}

export type TabType = 'create' | 'manage' | 'public' | 'stats';

export type MessageType = 'success' | 'error' | 'info';

export interface Message {
  text: string;
  type: MessageType;
}
