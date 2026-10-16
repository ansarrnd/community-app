/**
 * Static web export for GitHub Pages (project site, not domain root).
 *
 * Sets expo.experiments.baseUrl for this build only, then restores app.json.
 * Adds .nojekyll (Metro emits _expo) and 404.html (client-side routing).
 *
 * Env:
 *   GITHUB_PAGES_BASE  default /community-app
 */
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const APP_JSON = join(ROOT, 'app.json');
const DIST = join(ROOT, 'dist');

const baseUrl = (process.env.GITHUB_PAGES_BASE || '/community-app').replace(/\/$/, '') || '/community-app';
const original = readFileSync(APP_JSON, 'utf8');

function restoreAppJson() {
  writeFileSync(APP_JSON, original);
}

try {
  const app = JSON.parse(original);
  app.expo = app.expo || {};
  app.expo.experiments = { ...(app.expo.experiments || {}), baseUrl };
  writeFileSync(APP_JSON, `${JSON.stringify(app, null, 2)}\n`);

  const exportResult = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--clear'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (exportResult.status !== 0) {
    process.exit(exportResult.status ?? 1);
  }

  const patch = spawnSync('node', [join(ROOT, 'scripts/patch-web-export.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (patch.status !== 0) {
    process.exit(patch.status ?? 1);
  }

  writeFileSync(join(DIST, '.nojekyll'), '');
  copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'));
  console.log(`[build-web-github-pages] baseUrl=${baseUrl} · wrote dist/.nojekyll and dist/404.html`);
} finally {
  restoreAppJson();
}
