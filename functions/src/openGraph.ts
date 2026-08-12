import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface EventDoc {
  title?: string;
  details?: string;
  inviteCardUrl?: string;
  category?: string;
  date?: string;
  time?: string;
  venue?: string;
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

function buildShareHtml(eventId: string, data: EventDoc, host: string): string {
  const title = data.title || 'Community Event';
  const descriptionRaw = data.details || '';
  const description =
    descriptionRaw.length > 160 ? `${descriptionRaw.slice(0, 157).trimEnd()}...` : descriptionRaw;
  const image = data.inviteCardUrl || '';
  const url = `${host.replace(/\/$/, '')}/e/${eventId}`;

  const meta = [
    `<meta property="og:title" content="${escapeHtmlAttr(title)}" />`,
    `<meta property="og:description" content="${escapeHtmlAttr(description)}" />`,
    image ? `<meta property="og:image" content="${escapeHtmlAttr(image)}" />` : '',
    `<meta property="og:url" content="${escapeHtmlAttr(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Community Connect" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
    .filter(Boolean)
    .join('\n  ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtmlText(title)}</title>
  ${meta}
</head>
<body>
  <main>
    <h1>${escapeHtmlText(title)}</h1>
    <p>${escapeHtmlText(description)}</p>
    <p>📅 ${escapeHtmlText(data.date || '')} · ⏰ ${escapeHtmlText(data.time || '')}</p>
    <p>📍 ${escapeHtmlText(data.venue || '')}</p>
    <p><a href="${escapeHtmlAttr(url)}">Open in Community Connect</a></p>
  </main>
</body>
</html>`;
}

/**
 * HTTP handler: GET /eventSharePage?eventId=evt-1
 * Serves Open Graph HTML for crawlers and social preview testing.
 */
export const eventSharePage = functions.https.onRequest(async (req, res) => {
  const eventId = (req.query.eventId as string) || req.path.split('/').pop();
  if (!eventId || eventId === 'eventSharePage') {
    res.status(400).send('Missing eventId query parameter.');
    return;
  }

  const snap = await admin.firestore().collection('events').doc(eventId).get();
  if (!snap.exists) {
    res.status(404).send('Event not found.');
    return;
  }

  const host = process.env.PUBLIC_SHARE_HOST || 'https://community.yourdomain.com';
  const html = buildShareHtml(eventId, snap.data() as EventDoc, host);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).send(html);
});
