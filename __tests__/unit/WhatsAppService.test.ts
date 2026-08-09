import { WhatsAppService } from '../../infrastructure/services/whatsappService';
import { CommunityEvent } from '../../domain/models/Event';
import * as Linking from 'expo-linking';

jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

describe('WhatsAppService Unit Tests', () => {
  let service: WhatsAppService;
  const mockWeddingEvent: CommunityEvent = {
    id: 'evt-wed-1',
    title: 'Marriage Ceremony',
    category: 'MARRIAGE',
    date: '2026-10-10',
    time: '06:00 PM',
    venue: 'Grand Palace',
    googleMapsUrl: 'https://maps.google.com/?q=GrandPalace',
    details: 'Grand wedding ceremony and feast for family and friends.',
    organizerId: 'usr-1',
    groomName: 'John',
    brideName: 'Jane',
    status: 'APPROVED',
    rsvpCount: 10,
    attendingCount: 8,
    declinedCount: 2,
    version: 1,
  };

  const mockCulturalEvent: CommunityEvent = {
    id: 'evt-cult-1',
    title: 'Music Festival',
    category: 'CULTURAL',
    date: '2026-11-15',
    time: '04:00 PM',
    venue: 'City Gardens',
    details: 'Annual classical and folk music night in the open gardens.',
    organizerId: 'usr-2',
    status: 'APPROVED',
    rsvpCount: 50,
    attendingCount: 45,
    declinedCount: 5,
    version: 1,
  };

  const mockMeetingEvent: CommunityEvent = {
    id: 'evt-meet-1',
    title: 'Town Assembly',
    category: 'MEETING',
    date: '2026-12-01',
    time: '10:00 AM',
    venue: 'Community Center Room 1',
    details: 'General assembly for all residents regarding neighborhood upgrades.',
    organizerId: 'usr-3',
    status: 'APPROVED',
    rsvpCount: 20,
    attendingCount: 18,
    declinedCount: 2,
    version: 1,
  };

  beforeEach(() => {
    service = new WhatsAppService();
    jest.clearAllMocks();
  });

  describe('buildShareMessage', () => {
    it('formats a MARRIAGE invitation share message correctly', () => {
      const msg = service.buildShareMessage(mockWeddingEvent);
      expect(msg).toContain('WEDDING INVITATION');
      expect(msg).toContain('*John* & *Jane*');
      expect(msg).toContain('📅 *Date:* 2026-10-10');
      expect(msg).toContain('⏰ *Time:* 06:00 PM');
      expect(msg).toContain('📍 *Venue:* Grand Palace');
      expect(msg).toContain('🗺️ *Google Maps:* https://maps.google.com/?q=GrandPalace');
    });

    it('formats a CULTURAL event share message correctly', () => {
      const msg = service.buildShareMessage(mockCulturalEvent);
      expect(msg).toContain('COMMUNITY CULTURAL EVENT');
      expect(msg).toContain('*Music Festival*');
      expect(msg).not.toContain('Google Maps');
    });

    it('formats a MEETING event share message correctly', () => {
      const msg = service.buildShareMessage(mockMeetingEvent);
      expect(msg).toContain('COMMUNITY MEETING NOTICE');
      expect(msg).toContain('*Town Assembly*');
    });
  });

  describe('shareEventToWhatsApp', () => {
    it('opens native whatsapp deep link when device supports whatsapp://', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

      const result = await service.shareEventToWhatsApp(mockWeddingEvent);

      expect(result).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith(expect.stringContaining('whatsapp://send?text='));
      expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('whatsapp://send?text='));
    });

    it('falls back to web whatsapp URL when native url cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

      const result = await service.shareEventToWhatsApp(mockWeddingEvent);

      expect(result).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/?text='));
    });

    it('handles exception in openURL gracefully and attempts web fallback', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Device error'));
      (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

      const result = await service.shareEventToWhatsApp(mockWeddingEvent);

      expect(result).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/?text='));
    });
  });

  describe('triggerMetaCloudBroadcast', () => {
    it('returns successful broadcast status and recipient count', async () => {
      const response = await service.triggerMetaCloudBroadcast(mockWeddingEvent);
      expect(response.success).toBe(true);
      expect(response.recipientCount).toBeGreaterThan(0);
    });
  });
});
