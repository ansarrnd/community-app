# Automated Regression Plan — GitHub Actions Only

**Scope:** Reduce manual regression on every PR using **ubuntu-latest** GitHub Actions.  
**Out of scope (manual / local):** Maestro native CI, self-hosted macOS, EAS preview builds, Firebase emulator suites, nightly infra beyond `ci.yml`.

---

## What runs on every PR (`ci.yml`)

| Job | Regression signal | Command |
|-----|-------------------|---------|
| **quality** | Types, domain/use-case logic, hooks, snapshots, integration | `npm run type-check` · `npm test` · `npm run test:perf` |
| **web-e2e** | Web export boots, tab flows, moderation, RSVP, create | `npm run build:web` · `npm run test:e2e` |
| **screenshots** | Viewport PNG drift (iOS/Android web viewports) | `npm run screenshots:candidate` · `npm run screenshots:compare` |

All jobs use `npm ci` on Node 22. No macOS runners.

---

## Coverage map (automated vs manual)

| User journey | Automated layer | File(s) | Manual only |
|--------------|-----------------|---------|-------------|
| Explore feed + category filter | Jest integration + Playwright | `EventsFilter.integration.test.tsx`, `web-smoke.spec.ts` | Native scroll physics |
| Search debounce | Playwright | `web-smoke.spec.ts` | — |
| Infinite scroll (2nd page) | Jest integration | `EventsInfinite.integration.test.tsx` | Native FlashList onEndReached |
| Event detail + RSVP | Jest + Playwright | `Rsvp.integration.test.tsx`, `regression.spec.ts` | WhatsApp share sheet |
| Create event → pending | Jest + Playwright | `CreateEvent.integration.test.tsx`, `regression.spec.ts` | Image picker / camera |
| Moderation approve | Jest + Playwright | `Moderate.integration.test.tsx`, `regression.spec.ts` | — |
| Role switch hides Moderation tab | Playwright | `regression.spec.ts` | Native tab bar |
| Auth bootstrap → Zustand | Jest integration | `AuthBootstrap.integration.test.tsx` | Real Firebase Auth |
| Theme light/dark legibility | Snapshots + Playwright | `ScreenSnapshots.test.tsx`, `regression.spec.ts` | OLED / native blur |
| OTA updates | — | — | `expo-updates` on device |
| OpenGraph / WhatsApp Cloud | Unit tests | `OpenGraphService.test.ts` | Production webhook |

---

## Test inventory (current)

| Layer | Count | Location |
|-------|-------|----------|
| Jest (all) | **166** | `__tests__/` |
| Integration | **9** | `__tests__/integration/` |
| Playwright E2E | **10** | `e2e/web-smoke.spec.ts` (5) · `e2e/regression.spec.ts` (5) |
| Screen snapshots | 19 | `ScreenSnapshots.test.tsx`, `ChipSnapshots.test.tsx` |

---

## Web export requirement (`build:web`)

Expo web export emits a classic `<script>` tag, but Metro bundles (e.g. zustand) reference `import.meta.env`. Browsers require `type="module"` for that to work in Playwright and screenshot capture.

`npm run build:web` runs `expo export --platform web` then `scripts/patch-web-export.mjs`, which adds `type="module"` to `dist/index.html`.

Playwright serves `dist` with SPA fallback: `npx serve dist -l 4173 -s` (see `playwright.config.ts`).

---

## Explicitly skipped (per project policy)

| Item | Reason |
|------|--------|
| Maestro on CI | Requires macOS / self-hosted runner |
| EAS Build / Submit in CI | Credentials + queue time; run `eas build` manually |
| Firebase emulator integration in CI | Emulator boot + seed complexity |
| Detox | Evaluated and deferred (`DETOX_EVALUATION.md`) |
| Chromatic / Percy | pixelmatch covers PR visual gate |

---

## Local commands (mirror CI)

```bash
npm ci
npm run type-check
npm test
npm run test:integration
npm run test:perf
npm run build:web
npm run bundle:check
npm run test:e2e
npm run screenshots:candidate && npm run screenshots:compare
```

---

## When to extend automation

Add Jest integration when a bug is **data/state** (React Query, repos, stores).  
Add Playwright when a bug is **navigation / role gating / form submit on web export**.  
Keep Maestro flows in `.maestro/` for **pre-release native smoke** only — not wired to CI.
