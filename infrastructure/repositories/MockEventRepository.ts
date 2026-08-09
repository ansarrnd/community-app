import { CommunityEvent, CreateEventInput, EventStatus, RSVP } from '../../domain/models/Event';
import { IEventRepository } from '../../domain/repositories/IEventRepository';

const INITIAL_MOCK_EVENTS: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'Grand Royal Wedding: Rahul & Priya',
    category: 'MARRIAGE',
    date: '2026-10-24',
    time: '06:30 PM',
    venue: 'Royal Palace Convention Center, Main Hall',
    googleMapsUrl: 'https://maps.google.com/?q=Royal+Palace+Convention+Center',
    details: 'Join us in celebrating the joyful wedding union of Rahul and Priya! Dinner and cultural dance performances to follow.',
    inviteCardUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    organizerId: 'usr-org-1',
    organizerName: 'Kapoor Family',
    status: 'APPROVED',
    groomName: 'Rahul Kapoor',
    brideName: 'Priya Sharma',
    rsvpCount: 42,
    attendingCount: 38,
    declinedCount: 4,
    version: 1,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Annual Diwali Cultural Night & Feast',
    category: 'CULTURAL',
    date: '2026-11-01',
    time: '05:00 PM',
    venue: 'Community Park Amphitheater & Gardens',
    googleMapsUrl: 'https://maps.google.com/?q=Community+Park+Amphitheater',
    details: 'Experience vibrant lights, traditional music concerts, kids lantern parade, and delicious local food stalls.',
    inviteCardUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    organizerId: 'usr-org-2',
    organizerName: 'Resident Cultural Association',
    status: 'APPROVED',
    rsvpCount: 128,
    attendingCount: 115,
    declinedCount: 13,
    version: 1,
    createdAt: '2026-08-02T12:00:00Z',
  },
  {
    id: 'evt-3',
    title: 'Quarterly Neighborhood Safety & Infrastructure General Meeting',
    category: 'MEETING',
    date: '2026-09-15',
    time: '10:00 AM',
    venue: 'Town Hall Meeting Room 2B',
    googleMapsUrl: 'https://maps.google.com/?q=Town+Hall',
    details: 'Community discussion regarding new solar street lighting, park maintenance budget allocation, and traffic calming measures.',
    inviteCardUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    organizerId: 'usr-org-3',
    organizerName: 'Community Welfare Board',
    status: 'APPROVED',
    agenda: '1. Solar Lights\n2. Park Budget\n3. Security Patrols',
    rsvpCount: 29,
    attendingCount: 25,
    declinedCount: 4,
    version: 1,
    createdAt: '2026-08-03T09:00:00Z',
  },
  {
    id: 'evt-4',
    title: 'Youth Sports & Athletics Championship 2026',
    category: 'CULTURAL',
    date: '2026-09-20',
    time: '08:00 AM',
    venue: 'Community Sports Complex Stadium',
    googleMapsUrl: 'https://maps.google.com/?q=Community+Sports+Complex',
    details: 'Inter-neighborhood soccer tournament, track events, and badminton matches. Medals and refreshments provided for participants.',
    inviteCardUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    organizerId: 'usr-res-1',
    organizerName: 'Anand Kumar',
    status: 'PENDING',
    rsvpCount: 0,
    attendingCount: 0,
    declinedCount: 0,
    version: 1,
    createdAt: '2026-08-08T15:00:00Z',
  },
];

export class MockEventRepository implements IEventRepository {
  private events: CommunityEvent[] = [...INITIAL_MOCK_EVENTS];
  private rsvps: Record<string, Record<string, 'ATTENDING' | 'DECLINED'>> = {};

  async getApprovedEvents(categoryFilter?: string, searchQuery?: string): Promise<CommunityEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate realistic JSI latency
    return this.events.filter((evt) => {
      if (evt.status !== 'APPROVED') return false;
      if (categoryFilter && categoryFilter !== 'ALL' && evt.category !== categoryFilter) return false;
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return evt.title.toLowerCase().includes(query) || evt.venue.toLowerCase().includes(query);
      }
      return true;
    });
  }

  async getPendingEvents(): Promise<CommunityEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.events.filter((evt) => evt.status === 'PENDING');
  }

  async getEventById(id: string): Promise<CommunityEvent | null> {
    const evt = this.events.find((e) => e.id === id);
    return evt ? { ...evt } : null;
  }

  async createEvent(input: CreateEventInput): Promise<CommunityEvent> {
    const newEvent: CommunityEvent = {
      ...input,
      id: `evt-${Date.now()}`,
      status: 'PENDING',
      rsvpCount: 0,
      attendingCount: 0,
      declinedCount: 0,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  async updateEventStatus(id: string, status: EventStatus, moderatorId: string): Promise<void> {
    const evt = this.events.find((e) => e.id === id);
    if (evt) {
      evt.status = status;
      evt.version += 1;
      evt.updatedAt = new Date().toISOString();
    }
  }

  async rsvpToEvent(eventId: string, userId: string, status: 'ATTENDING' | 'DECLINED'): Promise<RSVP> {
    const evt = this.events.find((e) => e.id === eventId);
    if (!this.rsvps[userId]) {
      this.rsvps[userId] = {};
    }

    const previousStatus = this.rsvps[userId][eventId];
    this.rsvps[userId][eventId] = status;

    if (evt) {
      if (!previousStatus) {
        evt.rsvpCount += 1;
        if (status === 'ATTENDING') evt.attendingCount += 1;
        else evt.declinedCount += 1;
      } else if (previousStatus !== status) {
        if (status === 'ATTENDING') {
          evt.attendingCount += 1;
          evt.declinedCount = Math.max(0, evt.declinedCount - 1);
        } else {
          evt.declinedCount += 1;
          evt.attendingCount = Math.max(0, evt.attendingCount - 1);
        }
      }
    }

    return {
      id: `rsvp-${Date.now()}`,
      eventId,
      userId,
      status,
      timestamp: new Date().toISOString(),
    };
  }

  async getUserRsvps(userId: string): Promise<Record<string, 'ATTENDING' | 'DECLINED'>> {
    return this.rsvps[userId] || {};
  }
}
