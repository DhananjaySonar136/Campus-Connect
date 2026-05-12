export type EventItem = {
  id: string;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  collegeName: string;
  city: string;
  state: string;
  category: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  contactPhone: string;
  registrationLink?: string | null;
  bannerImageUrl?: string | null;
  status: string;
  createdByUserId: string;
  createdAt: string;
};

export type CreateEventPayload = {
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  collegeName: string;
  city: string;
  state: string;
  category: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  contactPhone: string;
  registrationLink?: string;
  bannerImageUrl?: string;
};
