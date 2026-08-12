# Framework Porting Guide

How to reimplement Community Connect in another stack using this blueprint.

---

## Port order

1. **Domain** — copy/translate `domain/models`, `domain/usecases`, repository interfaces
2. **Repositories** — mock first, then Firebase or your backend
3. **Application state** — queries, mutations, filters, auth session (see `08-APPLICATION-LAYER.md`)
4. **UI** — screens from `screens/*.md` + `design-tokens.json`
5. **Verify** — `06-ACCEPTANCE-TESTS.md` matrix + `npm run ci` equivalent

---

## Concept mapping

| RN / Expo (this project) | Flutter | Next.js / React web | Notes |
|------------------------|---------|---------------------|-------|
| Expo Router file routes | `go_router` | App Router `app/` pages | Tab + stack for `/e/[id]` |
| FlashList | `ListView.builder` / `SliverList` | `@tanstack/react-virtual` | Infinite scroll + `onEndReached` |
| expo-blur LiquidGlassCard | `BackdropFilter` + `ImageFilter.blur` | CSS `backdrop-filter` | `blurEnabled=false` on list rows |
| Zustand | Riverpod / Bloc | Zustand or Redux | Auth + filter stores |
| TanStack Query v5 | Riverpod async / `flutter_hooks` | Same TanStack Query | Keys from `08-APPLICATION-LAYER.md` |
| MMKV persist | Hive / shared_preferences | localStorage persister | Query cache offline |
| `subscribeAuthState` | `authStateChanges()` | `onAuthStateChanged` | Hydrate session store |
| Zod validation | `freezed` + validators | Zod (same) | Domain schemas portable in TS |
| lucide-react-native | `lucide_icons` | `lucide-react` | Icon names align |
| expo-image | `cached_network_image` | `next/image` or `<img>` | Event invitation images |
| expo-secure-store | `flutter_secure_storage` | httpOnly cookies / server session | Sensitive prefs |
| Skia aurora | `CustomPaint` | Canvas / CSS gradients | Optional; LinearGradient default |

---

## Layer portability

| Layer | Port strategy |
|-------|---------------|
| `domain/` | **Verbatim** in TypeScript, or translate types 1:1 to Dart/Kotlin |
| `domain/usecases/` | **Verbatim** logic — plain classes/functions |
| Repository interfaces | **Verbatim** — implement per backend |
| `application/hooks/` | **Reimplement** with your async/state library |
| `app/`, `components/` | **Rebuild** from screen specs + tokens |
| `infrastructure/` | **New adapters** — same interface contracts |
| `modules/kinship/` | **Optional** — swap taxonomy file for locale |

---

## Backend options

| Backend | Effort | Blueprint refs |
|---------|--------|----------------|
| In-memory mock | Low | `Mock*Repository`, demo users |
| Firebase | Medium | `09-INFRASTRUCTURE.md`, `firestore.rules` |
| REST API | Medium | Implement `IEventRepository` etc. |
| Supabase | Medium | `supabase/schema.sql` as SQL reference |

---

## Navigation parity

| Route | Tab? | Role gate |
|-------|------|-----------|
| `/` | Explore | all |
| `/create` | Create | all |
| `/admin` | Moderation | MOD+ only (hide tab) |
| `/profile` | Profile | all |
| `/e/:id` | Stack | all |

---

## UI rebuild checklist per screen

1. Read `screens/{name}.md`
2. Apply tokens from `design-tokens.json` (colors, spacing, radius)
3. Compose primitives: segment pill, action chip, glass card, search field
4. Wire data hooks equivalent to `08-APPLICATION-LAYER.md`
5. Compare to `docs/screenshots/ios/*.png`

---

## What not to port blindly

| Item | Reason |
|------|--------|
| Maestro YAML | Native-only; run separately if needed |
| Expo OTA | Use your platform's update mechanism |
| `patch-web-export.mjs` | Web bundler-specific |
| Skia aurora | Optional visual; default gradient sufficient |

---

## Verification commands (reference stack)

```bash
npm run ci:fast          # type-check · jest · perf
npm run build:web
npm run test:e2e         # 10 Playwright tests
npm run ci               # full golden pipeline
```

Replicate these stages in your CI for the ported project.

---

## Optional: shared core package

Extract to `packages/core`:

- `domain/models/*`
- `domain/usecases/*`
- `domain/repositories/*` (interfaces only)
- `modules/kinship/domain/*`, `taxonomy/*`

Publish as `@community-connect/core` for TypeScript web + React Native consumers.
