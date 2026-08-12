import { CommunityEvent } from '../../domain/models/Event';

const DEFAULT_SHARE_HOST = 'https://community.yourdomain.com';

export interface OpenGraphTags {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
}

export function getEventShareUrl(eventId: string, host = DEFAULT_SHARE_HOST): string {
  return `${host.replace(/\/$/, '')}/e/${eventId}`;
}

export function buildOpenGraphTags(event: CommunityEvent, host = DEFAULT_SHARE_HOST): OpenGraphTags {
  const description =
    event.details.length > 160 ? `${event.details.slice(0, 157).trimEnd()}...` : event.details;

  return {
    title: event.title,
    description,
    image: event.inviteCardUrl || '',
    url: getEventShareUrl(event.id, host),
    type: 'website',
    siteName: 'Community Connect',
  };
}

export function buildOpenGraphMetaHtml(event: CommunityEvent, host = DEFAULT_SHARE_HOST): string {
  const tags = buildOpenGraphTags(event, host);
  const lines = [
    `<meta property="og:title" content="${escapeHtmlAttr(tags.title)}" />`,
    `<meta property="og:description" content="${escapeHtmlAttr(tags.description)}" />`,
    tags.image ? `<meta property="og:image" content="${escapeHtmlAttr(tags.image)}" />` : '',
    `<meta property="og:url" content="${escapeHtmlAttr(tags.url)}" />`,
    `<meta property="og:type" content="${tags.type}" />`,
    `<meta property="og:site_name" content="${escapeHtmlAttr(tags.siteName)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtmlAttr(tags.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtmlAttr(tags.description)}" />`,
    tags.image ? `<meta name="twitter:image" content="${escapeHtmlAttr(tags.image)}" />` : '',
  ].filter(Boolean);

  return lines.join('\n');
}

export function buildEventShareHtmlPage(event: CommunityEvent, host = DEFAULT_SHARE_HOST): string {
  const tags = buildOpenGraphTags(event, host);
  const meta = buildOpenGraphMetaHtml(event, host);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtmlText(tags.title)}</title>
  ${meta}
</head>
<body>
  <main>
    <h1>${escapeHtmlText(tags.title)}</h1>
    <p>${escapeHtmlText(tags.description)}</p>
    <p><a href="${escapeHtmlAttr(tags.url)}">View on Community Connect</a></p>
  </main>
</body>
</html>`;
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
