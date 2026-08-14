/**
 * Checks total web export JS size after `npm run build:web`.
 *
 * Usage:
 *   npm run build:web && npm run bundle:check
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — Firebase client SDK is in the web graph

function collectJsBytes(dir) {
  if (!existsSync(dir)) return 0;

  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += collectJsBytes(path);
    } else if (entry.name.endsWith('.js')) {
      total += statSync(path).size;
    }
  }
  return total;
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('[bundle:check] Missing dist/. Run: npm run build:web');
  process.exit(1);
}

const totalBytes = collectJsBytes(DIST);
const totalMb = totalBytes / (1024 * 1024);

console.log(`[bundle:check] Web export JS total: ${totalMb.toFixed(2)} MB (${totalBytes} bytes)`);

if (totalBytes > MAX_BYTES) {
  console.error(`[bundle:check] Exceeded budget of ${(MAX_BYTES / (1024 * 1024)).toFixed(2)} MB`);
  process.exit(1);
}

console.log('[bundle:check] Within budget.');
