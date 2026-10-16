import * as crypto from 'crypto';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN;
const APP_SECRET = process.env.META_WA_APP_SECRET;

function getRequestBodyBuffer(req: functions.Request): Buffer {
  const requestWithRawBody = req as functions.Request & { rawBody?: Buffer | string };

  if (Buffer.isBuffer(requestWithRawBody.rawBody)) return requestWithRawBody.rawBody;
  if (typeof requestWithRawBody.rawBody === 'string') return Buffer.from(requestWithRawBody.rawBody, 'utf8');
  if (req.body === undefined || req.body === null) return Buffer.alloc(0);
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  return Buffer.from(JSON.stringify(req.body), 'utf8');
}

function validateMetaWebhookSignature(req: functions.Request): boolean {
  if (!APP_SECRET) return false;

  const signatureHeader = (req.get('x-hub-signature-256') || '').trim();
  if (!signatureHeader.startsWith('sha256=')) return false;

  const rawBody = getRequestBodyBuffer(req);
  const expected = `sha256=${crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex')}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

interface WhatsAppWebhookBody {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{ from?: string; text?: { body?: string } }>;
        statuses?: Array<{ id?: string; status?: string }>;
      };
    }>;
  }>;
}

/**
 * Meta WhatsApp Cloud API webhook — verification + inbound message logging.
 * Configure callback URL in Meta Developer Console to this function endpoint.
 */
export const whatsappWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method === 'GET') {
    if (!VERIFY_TOKEN) {
      res.status(500).send('Webhook verification token is not configured.');
      return;
    }

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
      res.status(200).send(challenge);
      return;
    }

    res.status(403).send('Verification failed.');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  if (!APP_SECRET) {
    res.status(500).send('Webhook app secret is not configured.');
    return;
  }

  if (!validateMetaWebhookSignature(req)) {
    res.status(401).send('Invalid webhook signature.');
    return;
  }

  const body = req.body as WhatsAppWebhookBody;
  if (body.object !== 'whatsapp_business_account') {
    res.status(404).send('Not found');
    return;
  }

  const batch = admin.firestore().batch();
  let writes = 0;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value) continue;

      for (const message of value.messages || []) {
        const ref = admin.firestore().collection('whatsapp_inbound').doc();
        batch.set(ref, {
          from: message.from || '',
          text: message.text?.body || '',
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        writes += 1;
      }

      for (const status of value.statuses || []) {
        const ref = admin.firestore().collection('whatsapp_statuses').doc(status.id || refId());
        batch.set(ref, {
          messageId: status.id || '',
          status: status.status || '',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        writes += 1;
      }
    }
  }

  if (writes > 0) {
    await batch.commit();
  }

  res.status(200).send('EVENT_RECEIVED');
});

function refId(): string {
  return `status-${Date.now()}`;
}
