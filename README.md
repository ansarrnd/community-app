# Community Connect

[![CI](https://github.com/ansarrnd/community-app/actions/workflows/ci.yml/badge.svg)](https://github.com/ansarrnd/community-app/actions/workflows/ci.yml)

Cross-platform community events app for neighborhoods and village networks — weddings, cultural gatherings, and meetings — with RSVP, moderation, WhatsApp sharing, and Tamil kinship tooling.

**Stack:** Expo SDK 55 · React Native 0.83 · React 19 · Firebase (mock backend by default for local demos)

> This file is the repository homepage. GitHub renders root `README.md` on the default branch (`main`) at  
> https://github.com/ansarrnd/community-app

---

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Local CI (Linux / macOS)](#local-ci-linux--macos)
- [App structure](#app-structure-high-level)
- [Documentation](#documentation)

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
- **166** Jest tests + **10** Playwright web E2E tests, pixelmatch screenshot diffs
- Single active CI workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## Quick start

```bash
git clone https://github.com/ansarrnd/community-app.git
cd community-app
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
| **Firebase emulators** (private, $0) | Local Auth/Firestore/Functions only. No Firebase account, billing, or credit card. |

Emulators bind to `127.0.0.1` so they are not exposed on the network. Copy [`.env.example`](.env.example) to `.env.local`:

```bash
EXPO_PUBLIC_BACKEND_PROVIDER=firebase
EXPO_PUBLIC_USE_EMULATORS=true
```

Then run three terminals:

```bash
npm run emulators
npm run seed:emulators
npm run web:firebase:static
```

`web:firebase:static` builds a local-only static bundle (`127.0.0.1:4173`) that talks to emulators. Use `npm run web:firebase` if you want the Expo dev server instead.

- App (static): http://127.0.0.1:4173
- App (Expo dev, typical): http://localhost:8081
- Firestore Emulator UI (edit data): http://127.0.0.1:4000

Optional check that Firestore round-trips work: `npm run validate:emulators`. After serving the static app, `npm run check:web:emulators` confirms the feed is reading emulator data (not the mock backend).

Demo logins (seeded into the Auth emulator): `resident@demo.community`, `mod@demo.community`, `admin@demo.community` — password `DemoPass123!`. Switch roles on the Profile tab.

Do **not** deploy Cloud Functions or Hosting for this workflow — cloud Functions typically require a Blaze billing account. The seed script sets Auth custom claims locally, so USER/MOD/ADMIN work without `grantRole` in the cloud.

---

## Local CI (Linux / macOS)

Mirror GitHub Actions before every push:

```bash
npm run ci              # full pipeline (quality · web build · e2e · screenshots)
npm run ci:fast         # fast gate: type-check · jest · perf
```

Details: [`docs/CI_CD_PLAN.md`](docs/CI_CD_PLAN.md) · [`scripts/ci-local.sh`](scripts/ci-local.sh)

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

## Documentation

| Doc | Topic |
|-----|-------|
| [`docs/BLUEPRINT/README.md`](docs/BLUEPRINT/README.md) | **Portability blueprint** — domain, UI, architecture, tests |
| [`docs/CI_CD_PLAN.md`](docs/CI_CD_PLAN.md) | GitHub Actions CI + local golden pipeline |
| [`docs/testing/AUTOMATED_REGRESSION_PLAN.md`](docs/testing/AUTOMATED_REGRESSION_PLAN.md) | Regression coverage map |
| [`docs/testing/TESTING_STRATEGY.md`](docs/testing/TESTING_STRATEGY.md) | Test inventory |
| [`docs/IMPLEMENTATION_GAP_ANALYSIS.md`](docs/IMPLEMENTATION_GAP_ANALYSIS.md) | Plan vs codebase |
| [`docs/screenshots/README.md`](docs/screenshots/README.md) | Screenshot capture |

---

## License

Private project (`package.json`).
