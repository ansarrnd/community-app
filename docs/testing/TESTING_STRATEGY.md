# Testing & Performance Strategy

This document maps **current coverage**, **gaps**, **performance risks**, and a **phased plan** for snapshot, UI, integration, and E2E testing.

---

## Current test inventory (116+ unit tests)

| Layer | What's covered | Location |
|-------|----------------|----------|
| Domain | Use cases, models, validation | `__tests__/unit/*UseCase*.ts` |
| Infrastructure | Mock repo, MMKV, WhatsApp | `__tests__/unit/Mock*.ts` |
| Application | Filter store, React Query hooks | `FilterStore.test.ts`, `EventsQueryHooks.test.tsx` |
| UI components | Chips, Kinship picker, EventList RSVP | `ChipComponents.test.tsx`, etc. |
| Theme | Token contracts | `Theme.test.ts` |
| Screenshots | Viewport PNGs (web export) | `docs/screenshots/ios`, `android` |
| E2E (web) | Smoke navigation | `e2e/web-smoke.spec.ts` |

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
| Maestro flows not in CI | Native tab navigation untested | Self-hosted job + `screenshots:native:*` |
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
| No Playwright test suite in CI | Web regressions | `e2e/web-smoke.spec.ts` + workflow |
| No Detox/Maestro CI | Native-only bugs | Maestro on self-hosted Mac (see `cicd.yml` comments) |
| No performance budgets in E2E | Slow lists unnoticed | FlashList + blur optimizations (below) |

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

## Phased roadmap

### Phase 1 — Done ✅
- Shared UI components + theme tokens
- Component unit tests + `renderWithProviders`
- Screenshot folders + Playwright capture script
- Performance: debounced search, list memo, blur toggle

### Phase 2 — Next (1–2 PRs)
- [ ] Screen RTL tests (Explore, Create) with mocked `useEventsQuery`
- [ ] Expand integration: create event → pending list
- [ ] Playwright E2E in GitHub Actions on PR
- [ ] Firestore category index + server-side filter

### Phase 3 — Native & visual CI
- [ ] Maestro E2E on self-hosted runner (tab nav, RSVP, create form)
- [ ] Visual diff on `docs/screenshots/` (Chromatic or `pixelmatch` script)
- [ ] Detox alternative evaluation if Maestro insufficient

### Phase 4 — Performance monitoring
- [ ] React DevTools profiler budget: Explore mount < 500ms (dev)
- [ ] Bundle size CI step (`expo export` + size limit)
- [ ] FlashList empty-state + 50-item fixture perf test

---

## Quick reference — npm scripts

```bash
npm test                  # All Jest tests
npm run test:integration  # Integration folder only
npm run test:snapshots    # UI snapshot tests
npm run test:e2e          # Playwright web smoke
npm run screenshots       # PNG capture (iOS + Android viewports)
npm run test:coverage     # Coverage report (includes app/)
```
