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
| ⬜ | Expo SDK 55+ | Current: Expo 51 |
| ⬜ | Bridgeless New Architecture | Not in `app.json` |
| ⬜ | `eas.json` build profiles | |
| ⬜ | `expo-updates` OTA | |
| ⬜ | Maestro native CI (self-hosted Mac) | Flows exist locally |

---

## P3 — Optional / plan extras

| Status | Item | Notes |
|--------|------|-------|
| ⬜ | Supabase + RLS (`supabase/schema.sql`) | |
| ⬜ | `@shopify/react-native-skia` aurora | Using `expo-linear-gradient` |
| ⬜ | OpenGraph preview generator | |
| ⬜ | Meta WhatsApp Cloud webhooks | Broadcast is simulated |
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
| `cursor/tab-legibility-fix-729a` | UI, testing, Phase 2–4, gap P0/P1 complete |
