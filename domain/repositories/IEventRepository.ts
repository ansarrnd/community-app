import { CommunityEvent, CreateEventInput, EventStatus, RSVP } from '../models/Event';
import { PaginatedResult, PaginationOptions } from '../models/Pagination';

export interface IEventRepository {
  getApprovedEvents(
    categoryFilter?: string,
    searchQuery?: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<CommunityEvent>>;
  getPendingEvents(): Promise<CommunityEvent[]>;
  getEventById(id: string): Promise<CommunityEvent | null>;
  createEvent(input: CreateEventInput): Promise<CommunityEvent>;
  updateEventStatus(id: string, status: EventStatus, moderatorId: string): Promise<void>;
  rsvpToEvent(eventId: string, userId: string, status: 'ATTENDING' | 'DECLINED'): Promise<RSVP>;
  getUserRsvps(userId: string): Promise<Record<string, 'ATTENDING' | 'DECLINED'>>;
}
