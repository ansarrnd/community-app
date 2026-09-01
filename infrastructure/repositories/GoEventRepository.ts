import { CommunityEvent, CreateEventInput, EventStatus, RSVP } from '../../domain/models/Event';
import { DEFAULT_PAGE_SIZE, PaginatedResult, PaginationOptions } from '../../domain/models/Pagination';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { goFetch } from '../http/goApiClient';

export class GoEventRepository implements IEventRepository {
  async getApprovedEvents(
    categoryFilter?: string,
    searchQuery?: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<CommunityEvent>> {
    const params = new URLSearchParams();
    if (categoryFilter && categoryFilter !== 'ALL') params.set('category', categoryFilter);
    if (searchQuery) params.set('q', searchQuery);
    if (pagination?.cursor) params.set('cursor', pagination.cursor);
    params.set('limit', String(pagination?.limit ?? DEFAULT_PAGE_SIZE));
    return goFetch<PaginatedResult<CommunityEvent>>(`/v1/events?${params.toString()}`);
  }

  async getPendingEvents(): Promise<CommunityEvent[]> {
    return goFetch<CommunityEvent[]>('/v1/events/pending');
  }

  async getEventById(id: string): Promise<CommunityEvent | null> {
    try {
      return await goFetch<CommunityEvent>(`/v1/events/${id}`);
    } catch {
      return null;
    }
  }

  async createEvent(input: CreateEventInput): Promise<CommunityEvent> {
    return goFetch<CommunityEvent>('/v1/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateEventStatus(id: string, status: EventStatus, _moderatorId: string): Promise<void> {
    await goFetch(`/v1/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async rsvpToEvent(eventId: string, _userId: string, status: 'ATTENDING' | 'DECLINED'): Promise<RSVP> {
    return goFetch<RSVP>(`/v1/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async getUserRsvps(_userId: string): Promise<Record<string, 'ATTENDING' | 'DECLINED'>> {
    return goFetch<Record<string, 'ATTENDING' | 'DECLINED'>>('/v1/rsvps/me');
  }
}
