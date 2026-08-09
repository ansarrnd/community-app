/**
 * Seed script for populating Local Firebase Emulators or Mock data
 */
import { MockEventRepository } from '../infrastructure/repositories/MockEventRepository';

async function seedData() {
  console.log('[Seed] Initializing seed script for Community Connect app...');
  const repo = new MockEventRepository();
  const events = await repo.getApprovedEvents();
  console.log(`[Seed] Successfully validated ${events.length} approved initial community events!`);
}

seedData().catch((err) => {
  console.error('[Seed Error]:', err);
});
