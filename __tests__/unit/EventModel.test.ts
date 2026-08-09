import { CreateEventInputSchema, EventSchema } from '../../domain/models/Event';
import { UserSchema, hasPermission } from '../../domain/models/User';

describe('Domain Models & Schema Validation Unit Tests', () => {
  describe('CreateEventInputSchema', () => {
    it('validates a correct CreateEventInput payload', () => {
      const validPayload = {
        title: 'Community Tree Plantation Drive',
        category: 'CULTURAL',
        date: '2026-08-20',
        time: '10:00 AM',
        venue: 'Green Valley Community Park',
        googleMapsUrl: 'https://maps.google.com/?q=Park',
        details: 'Join us to plant 500 saplings in the local community park.',
        organizerId: 'usr-101',
        organizerName: 'Jane Doe',
      };

      const result = CreateEventInputSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Community Tree Plantation Drive');
      }
    });

    it('fails validation when title is less than 3 characters', () => {
      const invalidPayload = {
        title: 'Hi',
        category: 'CULTURAL',
        date: '2026-08-20',
        time: '10:00 AM',
        venue: 'Green Valley Community Park',
        details: 'Join us to plant 500 saplings in the local community park.',
        organizerId: 'usr-101',
      };

      const result = CreateEventInputSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('fails validation when details length is under 10 characters', () => {
      const invalidPayload = {
        title: 'Valid Title',
        category: 'MEETING',
        date: '2026-08-20',
        time: '10:00 AM',
        venue: 'Meeting Room A',
        details: 'Too short',
        organizerId: 'usr-101',
      };

      const result = CreateEventInputSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('fails validation when invalid category is passed', () => {
      const invalidPayload = {
        title: 'Valid Title',
        category: 'SPORTS', // Not in enum
        date: '2026-08-20',
        time: '10:00 AM',
        venue: 'Meeting Room A',
        details: 'This is a valid long description for testing.',
        organizerId: 'usr-101',
      };

      const result = CreateEventInputSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('accepts valid template variables like groomName, brideName, and agenda', () => {
      const marriagePayload = {
        title: 'Royal Wedding Celebration',
        category: 'MARRIAGE',
        date: '2026-10-10',
        time: '05:00 PM',
        venue: 'Grand Palace Hall',
        details: 'Join us for dinner and drinks at the wedding reception.',
        organizerId: 'usr-202',
        groomName: 'Alex',
        brideName: 'Sam',
        agenda: '1. Reception 2. Dinner',
      };

      const result = CreateEventInputSchema.safeParse(marriagePayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.groomName).toBe('Alex');
        expect(result.data.brideName).toBe('Sam');
      }
    });

    it('accepts empty string or valid URL for googleMapsUrl', () => {
      const emptyUrlPayload = {
        title: 'Valid Title',
        category: 'MEETING',
        date: '2026-08-20',
        time: '10:00 AM',
        venue: 'Meeting Room A',
        googleMapsUrl: '',
        details: 'This is a valid long description for testing.',
        organizerId: 'usr-101',
      };

      const result = CreateEventInputSchema.safeParse(emptyUrlPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('EventSchema Defaults', () => {
    it('applies default values for status, rsvpCount, attendingCount, declinedCount, version', () => {
      const rawEvent = {
        id: 'evt-999',
        title: 'Sample Event Title',
        category: 'CULTURAL',
        date: '2026-08-25',
        time: '11:00 AM',
        venue: 'City Center',
        details: 'Detailed description of the upcoming cultural event.',
        organizerId: 'usr-1',
      };

      const result = EventSchema.parse(rawEvent);
      expect(result.status).toBe('PENDING');
      expect(result.rsvpCount).toBe(0);
      expect(result.attendingCount).toBe(0);
      expect(result.declinedCount).toBe(0);
      expect(result.version).toBe(1);
    });
  });

  describe('UserSchema & Permission Hierarchy', () => {
    it('validates a valid User object with default role USER', () => {
      const rawUser = {
        uid: 'u-123',
        phoneNumber: '+12345678901',
        displayName: 'John Smith',
      };

      const parsed = UserSchema.parse(rawUser);
      expect(parsed.role).toBe('USER');
    });

    it('rejects invalid phone numbers with less than 10 digits', () => {
      const rawUser = {
        uid: 'u-123',
        phoneNumber: '123',
        displayName: 'John Smith',
      };

      const result = UserSchema.safeParse(rawUser);
      expect(result.success).toBe(false);
    });

    it('correctly evaluates permission hierarchy with hasPermission', () => {
      // USER permissions
      expect(hasPermission('USER', 'USER')).toBe(true);
      expect(hasPermission('USER', 'MOD')).toBe(false);
      expect(hasPermission('USER', 'ADMIN')).toBe(false);

      // MOD permissions
      expect(hasPermission('MOD', 'USER')).toBe(true);
      expect(hasPermission('MOD', 'MOD')).toBe(true);
      expect(hasPermission('MOD', 'ADMIN')).toBe(false);

      // ADMIN permissions
      expect(hasPermission('ADMIN', 'USER')).toBe(true);
      expect(hasPermission('ADMIN', 'MOD')).toBe(true);
      expect(hasPermission('ADMIN', 'ADMIN')).toBe(true);
    });
  });
});
