import { CreateEventPayload, EventItem } from '../types/event';
import { apiClient } from './client';

export async function listEvents(): Promise<EventItem[]> {
  const response = await apiClient.get<EventItem[]>('/events');
  return response.data;
}

export async function createEvent(payload: CreateEventPayload): Promise<EventItem> {
  const response = await apiClient.post<EventItem>('/events', payload);
  return response.data;
}
