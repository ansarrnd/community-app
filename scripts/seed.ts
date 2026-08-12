/**
 * Seed script for Mock validation or Firebase Local Emulators.
 *
 * Usage:
 *   npm run seed                    # mock repo validation
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npm run seed   # emulator seed
 */
import { MockEventRepository } from '../infrastructure/repositories/MockEventRepository';

async function seedMock() {
  const repo = new MockEventRepository();
  const page = await repo.getApprovedEvents();
  console.log(`[Seed] Mock repository validated — ${page.items.length} approved events`);
}

async function seedEmulators() {
  const admin = await import('firebase-admin');
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'demo-community-app';

  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  const db = admin.firestore();
  const batch = db.batch();

  const demoEvents = [
    {
      title: 'Seeded Community Feast',
      category: 'CULTURAL',
      date: '2026-11-15',
      time: '06:00 PM',
      venue: 'Village Community Hall',
      details: 'Seeded event for local emulator development.',
      organizerId: 'demo-user-resident',
      organizerName: 'Alex Mercer',
      status: 'APPROVED',
      rsvpCount: 12,
      attendingCount: 10,
      declinedCount: 2,
      version: 1,
      createdAt: new Date().toISOString(),
    },
    {
      title: 'Seeded Pending Sports Day',
      category: 'CULTURAL',
      date: '2026-12-01',
      time: '08:00 AM',
      venue: 'Sports Complex',
      details: 'Pending moderation seed event.',
      organizerId: 'demo-user-resident',
      organizerName: 'Alex Mercer',
      status: 'PENDING',
      rsvpCount: 0,
      attendingCount: 0,
      declinedCount: 0,
      version: 1,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const event of demoEvents) {
    const ref = db.collection('events').doc();
    batch.set(ref, event);
  }

  await batch.commit();
  console.log(`[Seed] Firestore emulator seeded with ${demoEvents.length} events`);
}

async function main() {
  console.log('[Seed] Community Connect seed starting...');

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    await seedEmulators();
  } else {
    await seedMock();
    console.log('[Seed] Tip: set FIRESTORE_EMULATOR_HOST=localhost:8080 to seed emulators');
  }
}

main().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
