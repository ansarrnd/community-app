# Implementation Gap Analysis — Community Connect

Cross-check of the **Production Enterprise Edition** plan vs the current codebase.  
Update status as work lands: ⬜ open · 🔄 in progress · ✅ done · ➖ deferred.

**Last updated:** 2026-08-12

---

## P0 — Production security & repository layer

| Status | Item | Notes / path |
|--------|------|----------------|
| ✅ | `firestore.rules` with `USER`/`MOD`/`ADMIN` | `firestore.rules` |
| ✅ | `IAuthRepository` implementation | `MockAuthRepository` + factory |
| ✅ | `IUserRepository` implementation | `MockUserRepository` + factory |
| ✅ | `ManageRoleUseCase` | `domain/usecases/ManageRoleUseCase.ts` |
| ✅ | Auth bootstrap (repo → Zustand) | `application/providers/AuthBootstrap.tsx` |
| ✅ | Firebase Auth sign-in (phone / emulator) | `FirebaseAuthRepository` + seed Auth emulator |
| ✅ | Custom claims on Auth tokens | `grantRole` + `seed.ts` `setCustomUserClaims` |
| ✅ | `grantRole` Cloud Function (skeleton) | `functions/src/index.ts` |
| ✅ | App Check initialization stub | `config/firebase.ts` |
| ✅ | App Check enforced in production | `EXPO_PUBLIC_RECAPTCHA_SITE_KEY` or debug token in dev |
| ✅ | Demo role switch via `signInDemoUser` | Profile + `FirebaseAuthRepository` / mock |

---

## P1 — Scale & data layer

| Status | Item | Notes / path |
|--------|------|----------------|
| ✅ | Cursor pagination on approved events | `PaginatedResult` + mock/Firebase `startAfter` |
| ✅ | Infinite scroll UI (`useInfiniteQuery`) | `useApprovedEventsInfinite` + Explore `onEndReached` |
| ✅ | Firestore `count()` / transaction RSVP counts | `FirebaseEventRepository.rsvpToEvent` transaction |
| ✅ | MMKV-backed query persister | `mmkvStorage.ts` uses MMKV on native, fallback on web/Jest |
| ✅ | Emulator seed (events + auth users) | `scripts/seed.ts` + emulator env vars |

---

## P2 — Platform & release

| Status | Item | Notes |
|--------|------|-------|
| ✅ | Expo SDK 55+ | Expo `^55.0.0`, React 19, RN 0.83 |
| ✅ | Bridgeless New Architecture | `newArchEnabled: true` in `app.json` |
| ✅ | `eas.json` build profiles | `eas.json` (development / preview / production) |
| ✅ | `expo-updates` OTA | `UpdatesBootstrap` + `app.json` updates config |
| ✅ | Maestro native CI (self-hosted Mac) | `.github/workflows/maestro-native.yml` |

---

## P3 — Optional / plan extras

| Status | Item | Notes |
|--------|------|-------|
| ✅ | Supabase + RLS (`supabase/schema.sql`) | `supabase/schema.sql` |
| ✅ | `@shopify/react-native-skia` aurora | `SkiaFluidAuroraBackground` + env toggle |
| ✅ | OpenGraph preview generator | `openGraphService` + `eventSharePage` function + `npm run og:generate` |
| ✅ | Meta WhatsApp Cloud webhooks | `whatsappWebhook` function + Cloud API broadcast path |
| ➖ | Detox E2E | Deferred — see `docs/testing/DETOX_EVALUATION.md` |

---

## Fulfilled (original plan baseline)

| Area | Status |
|------|--------|
| Clean Architecture (events domain) | ✅ |
| Use cases: Create, Moderate, RSVP | ✅ |
| FlashList + `expo-image` | ✅ |
| Liquid glass UI (`expo-blur`) | ✅ |
| `useNetworkGuard` | ✅ |
| React Query v5 persist | ✅ |
| `expo-secure-store` helpers | ✅ |
| WhatsApp deep links | ✅ |
| Admin moderation UI | ✅ |
| Firebase emulator config | ✅ |
| Web export + Playwright E2E | ✅ |
| Jest / RNTL / integration / perf budgets | ✅ (exceeds plan) |
| Kinship module | ✅ (beyond original plan) |

---

## Verification commands

```bash
npm run emulators          # Firebase emulator suite
npm run seed               # Mock or emulator seed (see script output)
npm test                   # Unit + integration + perf
npm run type-check
npm run build:web
```

---

## PR tracking

| PR / branch | Scope |
|-------------|-------|
| `cursor/tab-legibility-fix-729a` | UI, testing, gap P0–P3 complete (Detox deferred) |
