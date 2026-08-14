/**
 * Headless check that the local static web app (127.0.0.1:4173) is reading emulator Firestore.
 * Requires: npm run emulators, npm run seed:emulators, and a served web:firebase:static build.
 */
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', (msg) => console.log('[browser]', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('[pageerror]', err.message));

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(12000);
const text = await page.locator('body').innerText();
console.log('--- PAGE TEXT START ---');
console.log(text.slice(0, 2500));
console.log('--- PAGE TEXT END ---');

const firebaseFeed =
  text.includes('Edited via Emulator REST') ||
  text.includes('Seeded Pending Sports Day') ||
  text.includes('Seeded Community Feast') ||
  text.includes('Validation pending');
const mockFeed = text.includes('Grand Royal Wedding');
console.log(JSON.stringify({ firebaseFeed, mockFeed }, null, 2));
if (!firebaseFeed) {
  process.exitCode = 1;
}
await browser.close();
