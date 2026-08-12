# Infrastructure Blueprint

Backend adapters, environment, Cloud Functions, and mock data. See also [.env.example](../../.env.example).

---

## Environment variables

Regenerate: `node scripts/export-env-example.mjs`

| Variable | Required when | Purpose |
|----------|---------------|---------|
| `EXPO_PUBLIC_BACKEND_PROVIDER` | optional | `firebase` or unset (mock) |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | firebase | Firebase web config |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | firebase | |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | firebase | |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | firebase | |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | firebase | |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | firebase | |
| `EXPO_PUBLIC_USE_EMULATORS` | dev | `true` → local emulators |
| `EXPO_PUBLIC_RECAPTCHA_SITE_KEY` | prod | App Check |
| `EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN` | dev | App Check debug |
| `EXPO_PUBLIC_USE_SKIA_AURORA` | optional | Skia background |
| `EXPO_PUBLIC_META_WA_*` | optional | WhatsApp Cloud API |

**Shell-only (seed/emulators):**

- `FIRESTORE_EMULATOR_HOST=localhost:8080`
- `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`

---

## Mock backend (default)

No env required. In-memory repos with seeded demo data.

| Repo | Seed highlights |
|------|-----------------|
| `MockEventRepository` | evt-1..4 (approved + pending), pagination |
| `MockUserRepository` | demo-user-resident, mod, admin |
| `MockAuthRepository` | `signInDemoUser(role)` maps to demo UIDs |

**Demo credentials:** `infrastructure/config/demoAuthCredentials.ts`

---

## Firebase bootstrap

1. Create Firebase project; enable Auth (phone), Firestore
2. Deploy `firestore.rules`, `firestore.indexes.json`
3. Set `EXPO_PUBLIC_BACKEND_PROVIDER=firebase` + client config in `.env`
4. Emulators: `npm run emulators` + `EXPO_PUBLIC_USE_EMULATORS=true`
5. Seed: `npm run seed` with emulator env vars

**Client init:** `config/firebase.ts` — App Check, emulator wiring

---

## Firestore security (`firestore.rules`)

| Collection | Read | Write |
|------------|------|-------|
| `events` | APPROVED public to auth; all if auth | Create if organizer; update if MOD+ or organizer (no status self-change) |
| `users` | auth | self create/update (not role field) |
| `rsvps` | auth | auth |
| `persons`, `relationships`, `villages` | auth | auth |
| `templates` | auth | ADMIN only |

Custom claims: `request.auth.token.role` = USER | MOD | ADMIN

---

## Cloud Functions (`functions/src/`)

| Export | Type | Purpose |
|--------|------|---------|
| `grantRole` | callable | ADMIN sets Auth custom claim + Firestore user.role |
| `eventSharePage` | HTTP | Open Graph HTML for `/e/{id}` |
| `whatsappWebhook` | HTTP | Meta webhook handler |

Deploy: `cd functions && npm run build && firebase deploy --only functions`

---

## External services

| Service | File | Notes |
|---------|------|-------|
| WhatsApp deep link | `infrastructure/services/whatsappService.ts` | `whatsapp://` / web share URL |
| Meta Cloud API | `infrastructure/services/metaWhatsAppCloudService.ts` | Admin broadcast |
| Open Graph | `infrastructure/services/openGraphService.ts` | Meta tags generation |
| Grant role client | `infrastructure/services/grantRoleService.ts` | Calls `grantRole` function |

---

## EAS / OTA (manual)

Profiles in `eas.json`: development, preview, production.  
OTA: `expo-updates` via `UpdatesBootstrap`. Replace `YOUR_EAS_PROJECT_ID` in `app.json`.

---

## Supabase (optional alternate)

`supabase/schema.sql` — SQL schema + RLS. Not wired in app factory; reference for SQL-first ports.

---

## Bundle / web export

- `npm run build:web` → `dist/` + `patch-web-export.mjs` (`type=module` on script tag)
- Playwright E2E serves `dist` with SPA fallback (`serve -s`)
