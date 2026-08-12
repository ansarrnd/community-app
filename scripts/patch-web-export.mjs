/**
 * Expo web export emits a classic <script> tag, but Metro bundles (e.g. zustand)
 * reference import.meta.env. Browsers only allow import.meta in module scripts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const indexPath = join(ROOT, 'dist/index.html');

let html = readFileSync(indexPath, 'utf8');

if (!html.includes('type="module"')) {
  html = html.replace(/<script\s+src="/g, '<script type="module" src="');
  writeFileSync(indexPath, html);
  console.log('[patch-web-export] Added type="module" to dist/index.html script tags');
} else {
  console.log('[patch-web-export] dist/index.html already patched');
}
