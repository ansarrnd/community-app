/**
 * Captures UI screenshots into docs/screenshots/ios and docs/screenshots/android
 * using Playwright device viewports (web export). For native fidelity, use Maestro flows in .maestro/.
 *
 * Usage:
 *   npm run build:web && npm run screenshots
 *   npm run screenshots:ios
 *   npm run screenshots:android
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');
const SCREENSHOTS_ROOT = join(ROOT, 'docs/screenshots');
const PORT = 4173;

const candidateMode = process.argv.includes('--candidate');
const SCREENSHOTS_BASE = candidateMode
  ? join(SCREENSHOTS_ROOT, '.ci-candidate')
  : SCREENSHOTS_ROOT;

const SCREENS = [
  { name: '01-explore', path: '/' },
  { name: '02-create', path: '/create' },
  { name: '03-profile', path: '/profile' },
];

const PLATFORMS = {
  ios: {
    dir: join(SCREENSHOTS_BASE, 'ios'),
    device: devices['iPhone 14'],
  },
  android: {
    dir: join(SCREENSHOTS_BASE, 'android'),
    device: devices['Pixel 7'],
  },
};

function startStaticServer() {
  const mime = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.json': 'application/json',
  };

  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = req.url?.split('?')[0] || '/';
      let filePath = join(DIST, urlPath === '/' ? 'index.html' : urlPath);

      if (!existsSync(filePath) || !extname(filePath)) {
        filePath = join(DIST, 'index.html');
      }

      const ext = extname(filePath);
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      res.end(readFileSync(filePath));
    });

    server.listen(PORT, () => resolve(server));
  });
}

async function capturePlatform(platformKey) {
  const { dir, device } = PLATFORMS[platformKey];
  mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({
    args: ['--font-render-hinting=none', '--disable-lcd-text'],
  });
  const context = await browser.newContext({
    ...device,
    baseURL: `http://127.0.0.1:${PORT}`,
  });
  const page = await context.newPage();

  for (const screen of SCREENS) {
    await page.goto(screen.path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (screen.name === '01-explore') {
      await page.getByText('Grand Royal Wedding').waitFor({ timeout: 20000 });
      await page.waitForTimeout(1500);
    } else {
      await page.waitForTimeout(2500);
    }
    await page.screenshot({
      path: join(dir, `${screen.name}.png`),
      fullPage: false,
    });
    console.log(`[screenshots] ${platformKey}: ${screen.name}.png`);
  }

  await browser.close();
}

async function main() {
  const arg = process.argv.find((value) => value === 'ios' || value === 'android');
  const targets = arg ? [arg] : ['ios', 'android'];

  if (!existsSync(join(DIST, 'index.html'))) {
    console.error('Missing dist/. Run: npm run build:web');
    process.exit(1);
  }

  const server = await startStaticServer();

  try {
    for (const platform of targets) {
      await capturePlatform(platform);
    }
    console.log(`[screenshots] Done → ${SCREENSHOTS_BASE}`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
