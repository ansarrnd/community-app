/**
 * Generate static Open Graph HTML preview files for events (web/CDN hosting).
 *
 * Usage:
 *   npx ts-node scripts/generate-og-preview.ts evt-1 evt-2
 */
import { MockEventRepository } from '../infrastructure/repositories/MockEventRepository';
import { buildEventShareHtmlPage } from '../infrastructure/services/openGraphService';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const eventIds = process.argv.slice(2);
  const repo = new MockEventRepository();
  const outputDir = path.join(process.cwd(), 'docs', 'og-previews');

  fs.mkdirSync(outputDir, { recursive: true });

  const targets =
    eventIds.length > 0
      ? eventIds
      : (await repo.getApprovedEvents()).items.map((event) => event.id);

  for (const id of targets) {
    const event = await repo.getEventById(id);
    if (!event) {
      console.warn(`[OG] Skipping missing event ${id}`);
      continue;
    }

    const html = buildEventShareHtmlPage(event);
    const filePath = path.join(outputDir, `${id}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`[OG] Wrote ${filePath}`);
  }
}

main().catch((err) => {
  console.error('[OG Preview Error]:', err);
  process.exit(1);
});
