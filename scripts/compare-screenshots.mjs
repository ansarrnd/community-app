/**
 * Compares committed baseline PNGs in docs/screenshots/ against a CI candidate directory.
 *
 * Usage:
 *   npm run build:web
 *   npm run screenshots:candidate
 *   npm run screenshots:compare
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const BASELINE_ROOT = join(ROOT, 'docs/screenshots');
const CANDIDATE_ROOT = join(ROOT, 'docs/screenshots/.ci-candidate');
const MAX_DIFF_PIXELS = 10000;
const PLATFORMS = ['ios', 'android'];

function listPngs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.png'))
    .sort();
}

function comparePng(baselinePath, candidatePath) {
  const baseline = PNG.sync.read(readFileSync(baselinePath));
  const candidate = PNG.sync.read(readFileSync(candidatePath));

  if (baseline.width !== candidate.width || baseline.height !== candidate.height) {
    return { diffPixels: Number.MAX_SAFE_INTEGER, widthMismatch: true };
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const diffPixels = pixelmatch(
    baseline.data,
    candidate.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.1 }
  );

  return { diffPixels, widthMismatch: false };
}

let failed = false;

for (const platform of PLATFORMS) {
  const baselineDir = join(BASELINE_ROOT, platform);
  const candidateDir = join(CANDIDATE_ROOT, platform);

  if (!existsSync(candidateDir)) {
    console.error(`[screenshots:compare] Missing candidate dir: ${candidateDir}`);
    failed = true;
    continue;
  }

  const baselineFiles = listPngs(baselineDir);
  if (baselineFiles.length === 0) {
    console.error(`[screenshots:compare] No baseline PNGs in ${baselineDir}`);
    failed = true;
    continue;
  }

  for (const file of baselineFiles) {
    const baselinePath = join(baselineDir, file);
    const candidatePath = join(candidateDir, file);

    if (!existsSync(candidatePath)) {
      console.error(`[screenshots:compare] Missing candidate file: ${platform}/${file}`);
      failed = true;
      continue;
    }

    const { diffPixels, widthMismatch } = comparePng(baselinePath, candidatePath);

    if (widthMismatch) {
      console.error(`[screenshots:compare] Size mismatch: ${platform}/${file}`);
      failed = true;
      continue;
    }

    if (diffPixels > MAX_DIFF_PIXELS) {
      console.error(
        `[screenshots:compare] Visual diff too large for ${platform}/${file}: ${diffPixels} pixels (max ${MAX_DIFF_PIXELS})`
      );
      failed = true;
    } else {
      console.log(`[screenshots:compare] OK ${platform}/${file} (${diffPixels} diff pixels)`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('[screenshots:compare] All screenshots within tolerance.');
