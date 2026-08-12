# Community Connect

Cross-platform community events app for neighborhoods and village networks — weddings, cultural gatherings, and meetings — with RSVP, moderation, WhatsApp sharing, and Tamil kinship tooling.

Built with **Expo SDK 55**, **React Native**, and **Firebase** (mock backend by default for local demos).

---

## Features

### Events & discovery
- **Explore feed** of approved community events with category filters (Marriage, Cultural, Meeting) and search
- **Infinite scroll** pagination for large event lists
- **Event detail** pages with venue, maps links, invitation imagery, and RSVP actions
- **Create event** flow with category-specific fields (e.g. bride/groom, agenda) and invitation image upload
- **Live invitation card preview** while composing an event

### RSVP & participation
- **Going / Declined** RSVP chips with optimistic UI updates
- **Transactional RSVP counts** (attending / declined / total) on the Firebase backend
- Per-user RSVP state restored across sessions via React Query + MMKV persistence

### Roles & moderation
- Role model: **USER**, **MOD**, **ADMIN**
- **Admin moderation queue** to approve or reject pending events
- Demo **role switch** on Profile for local/QA walkthroughs
- Firebase **custom claims** + `grantRole` Cloud Function for production role grants

### Sharing & outreach
- **WhatsApp deep-link share** for native and web clients
- Optional **Meta WhatsApp Cloud API** broadcast path for admins (env-configured)
- **Open Graph** meta generation for social previews (`npm run og:generate` + Cloud Function page)

### Kinship network
- Dedicated **kinship module** for family relationships (Tamil labels/taxonomy)
- Attach **event members** and organizer relationships when creating events
- In-village / out-village context tags on members

### UI & experience
- Liquid-glass cards, themed chips/pills, and dark/light themes
- Aurora mesh background (LinearGradient by default; optional Skia via `EXPO_PUBLIC_USE_SKIA_AURORA=true`)
- Offline banner via network guard
- iOS, Android, and **web export** targets

### Platform & quality
- Clean Architecture (domain use cases, repositories, factory switching mock ↔ Firebase)
- React Query v5 with persisted cache
- Jest unit/integration/perf tests, Playwright web E2E, pixelmatch screenshot diffs
- Single active CI workflow: `.github/workflows/ci.yml` (see `docs/CI_CD_PLAN.md`)

---

## Quick start

```bash
npm ci
npm start                 # Expo dev server
npm run web               # Web
npm test                  # Jest
npm run type-check
npm run build:web         # Static web export
```

### Backend modes

| Mode | How |
|------|-----|
| **Mock** (default) | No env required — in-memory repos |
| **Firebase emulators** | `EXPO_PUBLIC_BACKEND_PROVIDER=firebase` + `EXPO_PUBLIC_USE_EMULATORS=true`, then `npm run emulators` and seed |

```bash
npm run emulators
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 npm run seed
EXPO_PUBLIC_BACKEND_PROVIDER=firebase EXPO_PUBLIC_USE_EMULATORS=true npm start
```

---

## App structure (high level)

| Area | Path |
|------|------|
| Screens (tabs + event detail) | `app/` |
| Shared UI | `components/` |
| Domain models & use cases | `domain/` |
| Auth / query hooks / stores | `application/` |
| Firebase / mock repositories | `infrastructure/` |
| Kinship module | `modules/kinship/` |
| Cloud Functions | `functions/` |
| Docs (gaps, CI, testing) | `docs/` |

---

## Docs

- [`docs/CI_CD_PLAN.md`](docs/CI_CD_PLAN.md) — active GitHub Actions CI
- [`docs/IMPLEMENTATION_GAP_ANALYSIS.md`](docs/IMPLEMENTATION_GAP_ANALYSIS.md) — plan vs codebase
- [`docs/testing/TESTING_STRATEGY.md`](docs/testing/TESTING_STRATEGY.md) — test inventory
- [`docs/screenshots/README.md`](docs/screenshots/README.md) — screenshot capture

---

## License

Private project (`package.json`).
