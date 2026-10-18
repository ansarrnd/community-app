# 07 — Compose Multiplatform Architecture

Proposed target architecture for replacing the native Android and iOS front ends while preserving the existing Firebase backend. This is a migration target, not an implemented architecture; library and SDK choices remain open in the [migration tracker](../COMPOSE_MULTIPLATFORM_MIGRATION.md#decisions-and-open-questions).

## System context

```mermaid
flowchart LR
  subgraph native["Compose Multiplatform native clients (in scope)"]
    android["Android app"]
    ios["iOS app"]
    shared["Shared Kotlin application"]
    android --> shared
    ios --> shared
  end

  subgraph backend["Existing backend (preserved)"]
    auth["Firebase Auth + role claims"]
    firestore["Firestore + security rules"]
    functions["Cloud Functions"]
    storage["Existing invitation image storage/service"]
  end

  shared --> auth
  shared --> firestore
  shared --> functions
  shared --> storage

  subgraph web["Existing web client (unchanged; out of scope)"]
    expo["Expo / React Native Web"]
    webci["Existing web CI + Pages deployment"]
    expo --> webci
  end
```

The Compose clients connect to the same Firebase project, collections, roles, and backend behavior as the current app. This migration does not copy data or make the Expo web client a Compose target.

## Shared and platform-specific responsibilities

```mermaid
flowchart TB
  subgraph presentation["Shared presentation"]
    nav["Navigation and role-aware destinations"]
    screens["Explore · Create · Event Detail · Moderation · Profile"]
    components["Compose design system and reusable components"]
    state["Screen state holders / ViewModels"]
    sync["Shared sync coordinator"]
    nav --> screens
    screens --> components
    screens --> state
    state --> sync
  end

  subgraph application["Shared application and domain"]
    actions["Feature actions / use cases"]
    models["Models · validation · permission rules"]
    contracts["Repository contracts"]
    cache["Query, pagination, and persisted cache policy"]
    outbox["Durable user-scoped outbox"]
    state --> actions
    state --> cache
    actions --> models
    actions --> contracts
    cache --> contracts
    sync --> outbox
    sync --> contracts
  end

  subgraph adapters["Infrastructure adapters"]
    fake["Fake/mock repositories"]
    firebase["Firebase repositories"]
    services["Firebase Auth / Firestore / Functions adapters"]
    contracts --> fake
    contracts --> firebase
    firebase --> services
  end

  subgraph platform["Platform source sets"]
    android["Android implementations"]
    ios["iOS implementations"]
    image["Image picker and file access"]
    links["WhatsApp, share sheet, maps, deep links"]
    secure["Secure storage and OS integration"]
    android --> image
    android --> links
    android --> secure
    ios --> image
    ios --> links
    ios --> secure
  end

  screens --> platform
  android -->|"WorkManager: best-effort drain"| sync
  ios -->|"Background task: best-effort drain"| sync
```

### Layer boundaries

| Layer | Owns | Must not own |
|-------|------|--------------|
| Shared presentation | Compose screens, navigation, design system, accessible rendering | Firebase calls, authorization decisions, OS APIs directly |
| Shared application/state | Loading/error/content state, filter state, pagination coordination, mutation lifecycle | UI widgets or platform-specific implementations |
| Domain | Typed models, validation, use cases, business permission rules, repository contracts | Compose, Firebase SDK, Android/iOS framework types |
| Infrastructure | Mock and Firebase implementations of repository contracts; mapping and error translation | Screen navigation or rendering |
| Android/iOS source sets | Image/document pickers, share/link intents, secure storage, system UI and lifecycle interop | Duplicated product rules that can be shared |
| Existing web app | Expo web client and its existing release pipeline | Compose migration dependencies |

## Representative data flows

### Browse and filter

```mermaid
sequenceDiagram
  actor User
  participant UI as Compose Explore
  participant State as Shared screen state
  participant Repo as Event repository contract
  participant Firebase as Existing Firestore

  User->>UI: Choose category / enter search
  UI->>State: Update filter state
  State->>State: Debounce search; reset cursor on filter change
  State->>Repo: Request approved page
  Repo->>Firebase: Query approved events with cursor
  Firebase-->>Repo: Page of events
  Repo-->>State: Typed page or explicit error
  State-->>UI: Feed, loading, empty, offline, or error state
```

### Create, moderate, and RSVP

```mermaid
flowchart LR
  create["Create form"] --> validate["Shared validation / CreateEvent use case"]
  validate --> eventRepo["Event repository contract"]
  eventRepo --> createBackend["Existing Firestore rules and event data"]
  validate -->|"optional members"| kinship["Kinship repository contract"]
  kinship --> existingKinship["Existing persons / relationships data"]

  queue["Moderation screen"] --> moderate["Role-checked moderation use case"]
  moderate --> eventRepo
  eventRepo --> status["Existing event status transition"]

  rsvp["Feed/detail RSVP"] --> rsvpUseCase["RSVP use case + optimistic UI state"]
  rsvpUseCase --> rsvpRepo["RSVP repository contract"]
  rsvpRepo --> transaction["Existing atomic RSVP/count transaction"]
```

Shared use cases preserve the documented rules: USER-created events remain pending; MOD/ADMIN event creation follows current auto-approval behavior; only MOD+ may moderate; RSVP aggregates remain authoritative in the backend transaction. Navigation visibility is not an authorization boundary.

### External platform actions

```mermaid
flowchart LR
  screen["Shared Compose screen"] --> contract["Shared platform capability interface"]
  contract --> android["Android actual implementation"]
  contract --> ios["iOS actual implementation"]
  android --> os["Android picker / intents / secure storage"]
  ios --> os2["iOS picker / share sheet / secure storage"]
```

Keep message composition, URL validation, and result/error modeling shared where practical. Platform implementations handle OS interaction and return explicit success, cancellation, unavailable, permission-denied, or failure results.

## CI/CD context

```mermaid
flowchart LR
  pr["Pull request"] --> sharedCI["Shared Kotlin checks + tests"]
  sharedCI --> androidCI["Android build + tests"]
  sharedCI --> iosCI["iOS/macOS build + simulator tests"]
  pr --> webCI["Existing Expo web CI"]
  androidCI --> artifacts["Internal native artifacts"]
  iosCI --> artifacts
  artifacts --> pilot["Controlled Android/iOS pilot"]
  pilot --> release["Approved staged rollout"]
  main["main branch"] --> pages["Existing Expo web Pages deployment"]
```

The Compose jobs shown are planned; the current repository CI only runs the Expo/web pipeline. See [06 — CI/CD and Test Coverage](06-CI-CD-AND-TEST-COVERAGE.md) for proposed checks and release gates.

## Architecture constraints

- Keep backend schemas and security rules compatible; do not introduce a backend migration as an implicit part of the client port.
- Keep auth role claims and backend permission checks authoritative. The Profile demo role switch must remain confined to mock/emulator or explicitly approved QA builds.
- Use repository contracts between feature logic and Firebase so fake repositories can test shared flows.
- Use the shared sync coordinator and durable outbox for offline RSVP desired state; coalesce to the latest user/event intent and reconcile the result with the server transaction.
- Never queue moderation, role grants, or WhatsApp broadcasts. Keep event creation as a local draft until idempotent create and event/kinship partial-commit recovery are specified.
- For future edits, use server version tokens and surface conflicts; do not silently apply last-write-wins based on device clocks.
- Drain eligible work in foreground and use platform background scheduling only as a best-effort opportunity; never promise execution timing.
- Isolate platform APIs behind small interfaces and implement them separately for Android and iOS.
- Treat image uploads, WhatsApp Cloud broadcast, deep links, cache/offline policy, and auth persistence as explicit integration decisions with tests.
- Preserve Expo web and its CI/Pages deployment until separately changed by an explicit scope decision.
