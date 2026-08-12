import { CommunityEvent } from '../../domain/models/Event';

export const snapshotApprovedEvents: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'Grand Royal Wedding: Rahul & Priya',
    category: 'MARRIAGE',
    date: '2026-10-24',
    time: '06:30 PM',
    venue: 'Royal Palace Convention Center',
    details: 'Wedding celebration with dinner and dance.',
    organizerId: 'usr-1',
    organizerName: 'Kapoor Family',
    status: 'APPROVED',
    groomName: 'Rahul',
    brideName: 'Priya',
    rsvpCount: 42,
    attendingCount: 38,
    declinedCount: 4,
    version: 1,
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Annual Diwali Cultural Night',
    category: 'CULTURAL',
    date: '2026-11-01',
    time: '05:00 PM',
    venue: 'Community Park Amphitheater',
    details: 'Lights, music, and food stalls.',
    organizerId: 'usr-2',
    organizerName: 'Cultural Association',
    status: 'APPROVED',
    rsvpCount: 128,
    attendingCount: 115,
    declinedCount: 13,
    version: 1,
    createdAt: '2026-08-02T12:00:00Z',
  },
];

export const snapshotPendingEvents: CommunityEvent[] = [
  {
    id: 'evt-pending-1',
    title: 'Youth Sports Championship',
    category: 'CULTURAL',
    date: '2026-09-20',
    time: '08:00 AM',
    venue: 'Sports Complex',
    details: 'Inter-neighborhood tournament.',
    organizerId: 'usr-3',
    organizerName: 'Anand Kumar',
    status: 'PENDING',
    rsvpCount: 0,
    attendingCount: 0,
    declinedCount: 0,
    version: 1,
    createdAt: '2026-08-08T15:00:00Z',
  },
];

export const snapshotEventDetail: CommunityEvent = snapshotApprovedEvents[0];
