# Testing & Performance Strategy

This document maps **current coverage**, **gaps**, **performance risks**, and a **phased plan** for snapshot, UI, integration, and E2E testing.

---

## Current test inventory (166 Jest tests + 10 Playwright E2E)

**Regression plan (GHA-only):** `docs/testing/AUTOMATED_REGRESSION_PLAN.md`

| Layer | What's covered | Location |
|-------|----------------|----------|
| Domain | Use cases, models, validation | `__tests__/unit/*UseCase*.ts` |
| Infrastructure | Mock/Firebase repos, MMKV, WhatsApp, OpenGraph | `__tests__/unit/*` |
| Application | Filter store, React Query hooks (incl. infinite) | `FilterStore.test.ts`, `EventsQueryHooks.test.tsx` |
| UI components | Chips, Kinship picker, EventList RSVP | `ChipComponents.test.tsx`, etc. |
| Theme | Token contracts | `Theme.test.ts` |
| **Screen snapshots** | All 5 screens (dark + light matrix) | `ScreenSnapshots.test.tsx` |
| Chip snapshots | SegmentPill, ActionChip, SelectableCard | `ChipSnapshots.test.tsx` |
| Integration | Filter, create→pending, RSVP, moderate, infinite scroll, auth bootstrap | `__tests__/integration/` |
| Screenshots | Viewport PNGs (web export) + pixelmatch CI | `docs/screenshots/` |
| E2E (web) | Smoke + regression (RSVP, moderation, role gate, create, theme) | `e2e/web-smoke.spec.ts`, `e2e/regression.spec.ts` |
| E2E (native) | Maestro tab/screenshot flows | `.maestro/` + `maestro-native.yml` |

**CI/CD plan:** see `docs/CI_CD_PLAN.md` — sole active workflow `.github/workflows/ci.yml` (GitHub-hosted). Maestro/EAS release workflows are disabled.

### Screen snapshot matrix

| Screen | File | Dark | Light |
|--------|------|------|-------|
| Explore (Home) | `app/(tabs)/index.tsx` | ✅ | ✅ |
| Create Event | `app/(tabs)/create.tsx` | ✅ | ✅ |
| Profile | `app/(tabs)/profile.tsx` | ✅ | ✅ |
| Admin (authorized) | `app/(tabs)/admin.tsx` | ✅ | ⬜ backlog |
| Admin (restricted) | `app/(tabs)/admin.tsx` | ✅ | ⬜ backlog |
| Event detail | `app/e/[id].tsx` | ✅ | ⬜ backlog |

**Update snapshots after intentional UI changes:** `npm run test:snapshots -- -u`

---

## Gap analysis

### Snapshot testing

| Gap | Risk | Planned fix |
|-----|------|-------------|
| No component tree snapshots | Theme/token regressions slip through | `ChipSnapshots.test.tsx` (Jest `toJSON`) |
| No theme-mode matrix | Light/dark legibility breaks | Snapshots per mode in `renderWithProviders` |
| PNG screenshots not diffed in CI | Visual regressions manual only | Optional: Percy/Chromatic on `docs/screenshots/` |

**Commands:** `npm run test:snapshots` · update with `-u` when intentional UI change

### UI testing (component / screen)

| Gap | Risk | Planned fix |
|-----|------|-------------|
| No screen-level RTL tests | Explore/Create flows untested | Add `ExploreScreen.test.tsx` (mock hooks) |
| Maestro flows not in CI | Native tab navigation untested | ✅ `maestro-native.yml` (self-hosted Mac) |
| Accessibility | Missing labels on some controls | `accessibilityLabel` on chips (done) |
| OfflineBanner | Was missing SafeAreaProvider | Fixed via `renderWithProviders` |

**Commands:** `npm test` · `npm run screenshots:native:ios`

### Integration testing

| Gap | Risk | Planned fix |
|-----|------|-------------|
| Filter → query pipeline | Category/search don't re-fetch correctly | `EventsFilter.integration.test.tsx` |
| Create event → pending queue | Form submission not wired E2E | Hook + mock repo integration test |
| RSVP → counts | Count logic only in mock repo unit test | Extend `MockEventRepository.test` |
| Firebase repo | Client-side filter after full fetch | Document; add Firestore composite indexes later |

**Commands:** `npm run test:integration`

### E2E testing

| Gap | Risk | Planned fix |
|-----|------|-------------|
| No Playwright test suite in CI | Web regressions | ✅ `web-e2e.yml` |
| No Detox/Maestro CI | Native-only bugs | Maestro Action disabled — run locally; Detox deferred (`CI_CD_PLAN.md`) |
| No performance budgets in E2E | Slow lists unnoticed | ✅ `ci.yml` quality job runs `test:perf` |

**Commands:** `npm run build:web && npm run test:e2e`

---

## Performance: library & code gaps

### High impact (addressed in this branch)

| Issue | Library / area | Fix |
|-------|----------------|-----|
| **N× BlurView in feed** | `expo-blur` per `LiquidGlassCard` | `blurEnabled={false}` on list cards; blur only on hero/profile cards |
| **Search refetch storm** | React Query + Zustand | `useDebouncedValue(300ms)` before `useApprovedEvents` |
| **List re-renders** | FlashList | `EventListItem` + `memo`, `keyExtractor`, `removeClippedSubviews` |
| **Filter flicker** | TanStack Query v5 | `placeholderData: (prev) => prev` on approved events query |

### Medium impact (backlog)

| Issue | Recommendation |
|-------|----------------|
| Firestore fetches all approved events then filters client-side | Add `where('category', '==', …)` + composite indexes |
| `useUserRsvps` refetches on every screen | `staleTime: 5min`, share query across tabs |
| Aurora background 3 gradients | Reduce to 2 on low-end Android via `Platform` check |
| Lucide icons per row | Tree-shaking OK; consider icon subset if bundle grows |
| Web export 3.6MB JS bundle | Expo router code-splitting, lazy tab screens |
| Mock repo 200ms artificial delay | Remove or reduce in production mock path |

### Library choices (generally sound)

| Library | Role | Note |
|---------|------|------|
| **FlashList** | Event feed | Correct for long lists; keep `estimatedItemSize` tuned |
| **TanStack Query + MMKV persist** | Offline cache | Good; watch persist payload size |
| **Zustand** | Filter store | Lightweight; debounce before network |
| **expo-image** | Event images | Prefer over `Image`; add `cachePolicy` if needed |
| **MMKV** | Sync storage | Fast; already used for query persist |

---

## Phased roadmap (easy → hard)

Phases are ordered by **effort and infra dependency**: quick RTL/integration wins first; native CI and theme migrations last.

### Phase 1 — Done ✅
- Shared UI components + theme tokens (`components/ui/`, `segment*` / chip tokens)
- Component unit tests + `renderWithProviders` / `renderWithThemeMode`
- Chip + **all-screen** Jest tree snapshots (`ScreenSnapshots.test.tsx`)
- Screenshot folders + Playwright capture script + Maestro YAML stubs
- Performance: debounced search, `EventListItem` memo, blur toggle on feed cards
- Integration: filter store → `useApprovedEvents` pipeline
- Web E2E smoke + GitHub Actions workflows (`ui-screenshots.yml`, `web-e2e.yml`)

### Phase 2 — Done ✅
Low infra, mostly Jest/RTL and small hook tweaks.

| ID | Item | Status |
|----|------|--------|
| P2-1 | Light-mode snapshots for Admin + Event detail | ✅ |
| P2-2 | Screen interaction RTL (category tap, Create submit mock) | ✅ `ScreenInteractions.test.tsx` |
| P2-3 | Integration: create event → `usePendingEvents` | ✅ `CreateEvent.integration.test.tsx` |
| P2-4 | Integration: RSVP → attending/declined counts | ✅ `Rsvp.integration.test.tsx` |
| P2-5 | `useUserRsvps` `staleTime: 5min` across tabs | ✅ |
| P2-6 | Remove mock repo artificial delay | ✅ |
| P2-7 | Expand Playwright: category pill + search debounce | ✅ `e2e/web-smoke.spec.ts` |
| P2-8 | Kinship context tag → shared `ActionChip` | ✅ |
| P2-9 | Loading / empty state snapshots | ✅ |

### Phase 3 — Done ✅
Backend filter, visual CI, perf tuning, lazy tabs.

| ID | Item | Status |
|----|------|--------|
| P3-1 | Firestore server-side category filter + composite indexes | ✅ `firestore.indexes.json` |
| P3-2 | PNG screenshot diff in CI (`pixelmatch`) | ✅ `screenshots:compare` + workflow |
| P3-3 | Bundle size CI step | ✅ `bundle:check` (5 MB budget) |
| P3-4 | Aurora background: 2 gradients on Android | ✅ |
| P3-5 | `expo-image` `cachePolicy` on feed images | ✅ |
| P3-6 | Lazy tab screens (create, admin, profile) | ✅ `_createScreen` + `React.lazy` |
| P3-7 | Accessibility labels on search + submit | ✅ |

### Phase 4 — Hard / infra-heavy (last)
Self-hosted runners, SaaS visual CI, or large refactors.

| ID | Item | Effort | Notes |
|----|------|--------|-------|
| P4-1 | Maestro native E2E in CI (self-hosted Mac) | L | ⛔ Workflow disabled — local only (`CI_CD_PLAN.md`) |
| P4-2 | Chromatic or Percy on web export | L | ➖ Deferred — pixelmatch covers PR visual gate |
| P4-3 | Detox evaluation if Maestro insufficient | L | ✅ `docs/testing/DETOX_EVALUATION.md` — defer adoption |
| P4-4 | Fastlane iOS screenshot lane | L | ➖ Deferred — EAS Build/Submit replaces Fastlane |
| P4-5 | Full `villageTheme` / `glassTheme` removal | L | ✅ Kinship tokens on `AppTheme` |
| P4-6 | React DevTools profiler budget (Explore mount) | M | ✅ `test:perf` + Profiler budget |
| P4-7 | FlashList 50-item fixture perf test | M | ✅ `RenderBudget.test.tsx` + list tuning |
| P4-8 | Firebase Auth AsyncStorage persistence in tests | S | Silence auth warnings in Jest |

---

## Master backlog register

Single list of all outstanding work (testing, performance, architecture, CI). **Done** items are in Phase 1 above.

### Testing & quality

| Status | Item | Phase |
|--------|------|-------|
| ✅ | Chip component snapshots (dark/light) | 1 |
| ✅ | Screen tree snapshots — all 5 screens (dark) | 1 |
| ✅ | Screen tree snapshots — Explore, Create, Profile (light) | 1 |
| ✅ | Light snapshots — Admin authorized/restricted | 2 |
| ✅ | Light snapshots — Event detail | 2 |
| ✅ | Screen interaction RTL — Explore category filter | 2 |
| ✅ | Screen interaction RTL — Create form submit (mocked) | 2 |
| ✅ | Integration — create event → pending queue | 2 |
| ✅ | Integration — RSVP → count updates | 2 |
| ✅ | Loading / empty state snapshot matrix | 2 |
| ✅ | Playwright — category pill + search | 2 |
| ✅ | Playwright — RSVP, moderation, role gate, create, theme | 2 | `e2e/regression.spec.ts` |
| ✅ | Integration — moderate pending → approved | 2 | `Moderate.integration.test.tsx` |
| ✅ | Integration — infinite approved events page 2 | 2 | `EventsInfinite.integration.test.tsx` |
| ✅ | Integration — AuthBootstrap → Zustand | 2 | `AuthBootstrap.integration.test.tsx` |
| ⛔ | Maestro native flows in CI (disabled) | 4 |
| ➖ | Chromatic/Percy visual regression | 4 |
| ✅ | Detox evaluation (deferred; see DETOX_EVALUATION.md) | 4 |
| ✅ | PNG `pixelmatch` diff in CI | 3 |

### Performance

| Status | Item | Phase |
|--------|------|-------|
| ✅ | Debounced Explore search (300ms) | 1 |
| ✅ | `EventListItem` memo + FlashList tuning | 1 |
| ✅ | `blurEnabled={false}` on feed `LiquidGlassCard` | 1 |
| ✅ | `placeholderData` on approved events query | 1 |
| ✅ | `useUserRsvps` shared cache / 5min staleTime | 2 |
| ✅ | Remove mock repo 200ms delay | 2 |
| ✅ | Firestore server-side category filter | 3 |
| ✅ | Aurora gradient reduction on Android | 3 |
| ✅ | Web bundle size CI gate | 3 |
| ✅ | Lazy tab screens (web export) | 3 |
| ✅ | Explore mount profiler budget (`test:perf`) | 4 |
| ✅ | FlashList large-list perf fixture | 4 |

### Architecture & UI consistency

| Status | Item | Phase |
|--------|------|-------|
| ✅ | `components/ui` barrel (SegmentPill, ActionChip, etc.) | 1 |
| ✅ | Segment/chip theme tokens vs input styling | 1 |
| ✅ | Babel `@/` alias | 1 |
| ✅ | Kinship context tag → `ActionChip` | 2 |
| ✅ | Kinship tokens on `AppTheme` (replaces villageTheme bridge) | 4 |
| ⬜ | Remaining hardcoded glows → theme tokens | 3 |
| ✅ | Remove `glassTheme` / `villageTheme` duplicates | 4 |

### CI & screenshots

| Status | Item | Phase |
|--------|------|-------|
| ✅ | `docs/screenshots/ios` + `android` folders | 1 |
| ✅ | Playwright web capture script | 1 |
| ✅ | Maestro YAML stubs (local) | 1 |
| ✅ | `ui-screenshots.yml` + `web-e2e.yml` workflows | 1 |
| ✅ | Screenshot diff on PR (pixelmatch) | 3 |
| ⛔ | Maestro on self-hosted Mac runner (disabled) | 4 |
| ➖ | Fastlane iOS screenshot lane | 4 |
| ✅ | CI/CD plan (GitHub Actions only) | — | `docs/CI_CD_PLAN.md` |
| ✅ | Sole active workflow `ci.yml` | — | quality + web-e2e + screenshots |

---

## Quick reference — npm scripts

```bash
npm test                  # All Jest tests
npm run test:integration  # Integration folder only
npm run test:perf         # Profiler + FlashList render budgets
npm run test:snapshots    # UI snapshot tests
npm run test:e2e          # Playwright smoke + regression (10 tests)
npm run screenshots       # PNG capture (iOS + Android viewports)
npm run screenshots:candidate # CI candidate PNGs (.ci-candidate/)
npm run screenshots:compare   # pixelmatch diff vs baseline
npm run bundle:check          # Web JS size budget (5 MB)
npm run test:coverage     # Coverage report (includes app/)
```
