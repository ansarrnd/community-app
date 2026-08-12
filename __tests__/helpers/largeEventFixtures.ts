import { CommunityEvent, EventCategory } from '../../domain/models/Event';

const CATEGORIES: EventCategory[] = ['MARRIAGE', 'CULTURAL', 'MEETING'];

export function buildLargeEventFixture(count: number): CommunityEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `evt-perf-${index}`,
    title: `Community Event ${index + 1}`,
    category: CATEGORIES[index % CATEGORIES.length],
    date: '2026-10-01',
    time: '06:00 PM',
    venue: `Venue Hall ${index + 1}`,
    details: 'Performance fixture event for list rendering budget tests.',
    organizerId: 'org-perf',
    organizerName: 'Perf Organizer',
    status: 'APPROVED',
    rsvpCount: index,
    attendingCount: index,
    declinedCount: 0,
    version: 1,
    createdAt: '2026-08-01T10:00:00Z',
  }));
}

export const LARGE_EVENT_LIST_FIXTURE = buildLargeEventFixture(50);
