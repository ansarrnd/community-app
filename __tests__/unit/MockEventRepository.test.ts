import { MockEventRepository } from '../../infrastructure/repositories/MockEventRepository';

describe('MockEventRepository Infrastructure Unit Tests', () => {
  let repo: MockEventRepository;

  beforeEach(() => {
    repo = new MockEventRepository();
  });

  describe('getApprovedEvents', () => {
    it('returns all approved events when no filters are passed', async () => {
      const events = await repo.getApprovedEvents();
      expect(events.length).toBe(3);
      events.forEach((evt) => expect(evt.status).toBe('APPROVED'));
    });

    it('filters approved events by category', async () => {
      const marriageEvents = await repo.getApprovedEvents('MARRIAGE');
      expect(marriageEvents.length).toBe(1);
      expect(marriageEvents[0].category).toBe('MARRIAGE');

      const culturalEvents = await repo.getApprovedEvents('CULTURAL');
      expect(culturalEvents.length).toBe(1);
      expect(culturalEvents[0].category).toBe('CULTURAL');

      const meetingEvents = await repo.getApprovedEvents('MEETING');
      expect(meetingEvents.length).toBe(1);
      expect(meetingEvents[0].category).toBe('MEETING');
    });

    it('filters approved events by searchQuery on title or venue', async () => {
      const titleSearch = await repo.getApprovedEvents('ALL', 'Diwali');
      expect(titleSearch.length).toBe(1);
      expect(titleSearch[0].id).toBe('evt-2');

      const venueSearch = await repo.getApprovedEvents('ALL', 'Town Hall');
      expect(venueSearch.length).toBe(1);
      expect(venueSearch[0].id).toBe('evt-3');
    });

    it('returns empty array when searchQuery matches nothing', async () => {
      const search = await repo.getApprovedEvents('ALL', 'nonexistentquery123');
      expect(search.length).toBe(0);
    });
  });

  describe('getPendingEvents', () => {
    it('returns only pending events', async () => {
      const pending = await repo.getPendingEvents();
      expect(pending.length).toBe(1);
      expect(pending[0].id).toBe('evt-4');
      expect(pending[0].status).toBe('PENDING');
    });
  });

  describe('getEventById', () => {
    it('returns event copy when found', async () => {
      const event = await repo.getEventById('evt-1');
      expect(event).not.toBeNull();
      expect(event?.id).toBe('evt-1');
      expect(event?.title).toContain('Rahul & Priya');
    });

    it('returns null when event id does not exist', async () => {
      const event = await repo.getEventById('invalid-id');
      expect(event).toBeNull();
    });
  });

  describe('createEvent', () => {
    it('creates a new event with status PENDING and initial count 0', async () => {
      const newEvent = await repo.createEvent({
        title: 'New Neighborhood Blood Donation',
        category: 'CULTURAL',
        date: '2026-09-30',
        time: '09:00 AM',
        venue: 'Community Center',
        details: 'Blood donation camp organized by local health volunteers.',
        organizerId: 'usr-vol-1',
      });

      expect(newEvent.id).toBeDefined();
      expect(newEvent.status).toBe('PENDING');
      expect(newEvent.rsvpCount).toBe(0);
      expect(newEvent.attendingCount).toBe(0);
      expect(newEvent.declinedCount).toBe(0);

      const retrieved = await repo.getEventById(newEvent.id);
      expect(retrieved).not.toBeNull();
    });
  });

  describe('updateEventStatus', () => {
    it('updates event status and increments version', async () => {
      const initial = await repo.getEventById('evt-4');
      const initialVersion = initial?.version || 1;

      await repo.updateEventStatus('evt-4', 'APPROVED', 'mod-1');

      const updated = await repo.getEventById('evt-4');
      expect(updated?.status).toBe('APPROVED');
      expect(updated?.version).toBe(initialVersion + 1);
    });
  });

  describe('rsvpToEvent & counters', () => {
    it('increments rsvpCount and attendingCount on first ATTENDING rsvp', async () => {
      const initial = await repo.getEventById('evt-1');
      const initialRsvpCount = initial?.rsvpCount || 0;
      const initialAttending = initial?.attendingCount || 0;

      await repo.rsvpToEvent('evt-1', 'user-new-1', 'ATTENDING');

      const updated = await repo.getEventById('evt-1');
      expect(updated?.rsvpCount).toBe(initialRsvpCount + 1);
      expect(updated?.attendingCount).toBe(initialAttending + 1);
    });

    it('correctly updates counters when user changes RSVP from ATTENDING to DECLINED', async () => {
      await repo.rsvpToEvent('evt-1', 'user-switch-1', 'ATTENDING');
      const afterAttending = await repo.getEventById('evt-1');

      const attendingCountBefore = afterAttending?.attendingCount || 0;
      const declinedCountBefore = afterAttending?.declinedCount || 0;
      const totalRsvpBefore = afterAttending?.rsvpCount || 0;

      await repo.rsvpToEvent('evt-1', 'user-switch-1', 'DECLINED');
      const afterDeclining = await repo.getEventById('evt-1');

      expect(afterDeclining?.rsvpCount).toBe(totalRsvpBefore); // Total RSVPs stay same
      expect(afterDeclining?.attendingCount).toBe(attendingCountBefore - 1);
      expect(afterDeclining?.declinedCount).toBe(declinedCountBefore + 1);
    });
  });
});
