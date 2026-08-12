import { buildOpenGraphMetaHtml, buildOpenGraphTags, getEventShareUrl } from '../../infrastructure/services/openGraphService';
import { CommunityEvent } from '../../domain/models/Event';

const mockEvent: CommunityEvent = {
  id: 'evt-og-1',
  title: 'Community Feast',
  category: 'CULTURAL',
  date: '2026-10-01',
  time: '06:00 PM',
  venue: 'Village Hall',
  details: 'Annual feast celebration with music and food for all residents.',
  inviteCardUrl: 'https://images.example.com/feast.jpg',
  organizerId: 'org-1',
  organizerName: 'Organizer',
  status: 'APPROVED',
  attendingCount: 5,
  createdAt: '2026-01-01',
};

describe('openGraphService', () => {
  it('builds canonical share URL', () => {
    expect(getEventShareUrl('evt-og-1')).toBe('https://community.yourdomain.com/e/evt-og-1');
  });

  it('builds Open Graph tags from event', () => {
    const tags = buildOpenGraphTags(mockEvent);
    expect(tags.title).toBe('Community Feast');
    expect(tags.image).toContain('feast.jpg');
    expect(tags.url).toContain('/e/evt-og-1');
  });

  it('builds escaped meta HTML', () => {
    const eventWithQuotes: CommunityEvent = {
      ...mockEvent,
      title: 'Feast "Special" <Edition>',
    };
    const html = buildOpenGraphMetaHtml(eventWithQuotes);
    expect(html).toContain('og:title');
    expect(html).not.toContain('<Edition>');
    expect(html).toContain('&quot;');
  });
});
