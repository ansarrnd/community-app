# Compose Multiplatform Front-End Migration

## Purpose and scope

Track the work to replace the Expo/React Native **Android and iOS clients** with a Kotlin/Compose Multiplatform front end while preserving the current product behavior.

This plan covers the client application only. It does not include a backend or data migration: Firebase Auth, Firestore, Cloud Functions, security rules, and existing data remain the system of record unless a later decision changes that scope.

**Migration scope:** Android and iOS; the existing Expo web app remains unchanged and out of scope. **Current implementation phase:** Android first. Keep iOS targets and source-set configuration in the KMP project, but defer iOS implementation and build validation until the Android slice is ready.

## Current implementation status

The `composeApp` Kotlin Multiplatform project now includes a minimal Android Compose application shell and a Room-backed RSVP outbox, shared retry/lease coordinator, Android WorkManager adapter, Android Firebase RSVP transaction gateway, runtime composition hook, and Android/iOS Room database builders. Keep Android, JVM test, and iOS targets configured; focus current implementation and validation on Android, then resume iOS work without removing its target or source-set configuration. The JVM suite (`:shared:jvmTest`) passes, covering coordinator behavior, Room persistence, and RSVP count transitions. The Android debug APK builds successfully with JDK 21; it is a launcher shell only, not feature-complete. Firebase Android app configuration, startup wiring for `RsvpSyncAndroidRuntime.install`, and UI/foreground drain integration remain outstanding. iOS build validation is deferred to the later phase and requires a macOS host. The repository's Gradle 8.8 wrapper does not run under the installed JDK 27; JDK 21 was used for validation.

## Feature implementation guide

Use these pages as implementation-level companion specs. They describe the behavior to preserve, suggested Compose responsibilities, data/state flows, and verification points. They do not prescribe unresolved library choices; record those under [Decisions and open questions](#decisions-and-open-questions).

| Feature area | Implementation details |
|--------------|------------------------|
| Explore, navigation, and event discovery | [01 — Explore and navigation](COMPOSE_MULTIPLATFORM/01-EXPLORE-AND-NAVIGATION.md) |
| Event creation, detail, RSVP, and moderation | [02 — Event lifecycle](COMPOSE_MULTIPLATFORM/02-EVENT-LIFECYCLE.md) |
| Sign-in, profile, theme, and kinship | [03 — Identity and kinship](COMPOSE_MULTIPLATFORM/03-IDENTITY-AND-KINSHIP.md) |
| Design system and native integrations | [04 — UI and platform integrations](COMPOSE_MULTIPLATFORM/04-UI-AND-PLATFORM-INTEGRATIONS.md) |
| Tests, acceptance, and rollout | [05 — Verification and rollout](COMPOSE_MULTIPLATFORM/05-VERIFICATION-AND-ROLLOUT.md) |
| CI/CD lanes and scope coverage | [06 — CI/CD and test coverage](COMPOSE_MULTIPLATFORM/06-CI-CD-AND-TEST-COVERAGE.md) |
| Proposed client/backend/CI architecture | [07 — Compose Multiplatform architecture](COMPOSE_MULTIPLATFORM/07-ARCHITECTURE.md) |
| Feature-by-feature high-level design | [08 — HLD](COMPOSE_MULTIPLATFORM/08-HLD.md) |
| Feature-by-feature low-level design | [09 — LLD](COMPOSE_MULTIPLATFORM/09-LLD.md) |

## How to track progress

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked; explain the blocker in the notes or decision log

Update this file as work lands. Check off an item only when its completion criteria are met. Record material scope and architecture decisions in the decision log, and append completed milestones to the change log.

## Migration checklist

### 1. Scope and baseline

- [x] Confirm target platforms: Android and iOS. Compose web is out of scope for now.
- [ ] Choose the migration/cutover strategy: parallel native app, phased screen replacement, or another approach.
- [ ] Inventory existing user journeys and edge cases using [the acceptance matrix](BLUEPRINT/06-ACCEPTANCE-TESTS.md).
- [ ] Capture baseline behavior, screen references, and current accessibility expectations.
- [ ] Agree on parity criteria and the first release milestone.

**Complete when:** scope, rollout strategy, and parity criteria are recorded below and the acceptance matrix is reviewed.

### 1a. Feature implementation specifications

- [ ] Review [Explore and navigation](COMPOSE_MULTIPLATFORM/01-EXPLORE-AND-NAVIGATION.md) and confirm route/state behavior.
- [ ] Review [Event lifecycle](COMPOSE_MULTIPLATFORM/02-EVENT-LIFECYCLE.md) and confirm create, RSVP, and moderation contracts.
- [ ] Review [Identity and kinship](COMPOSE_MULTIPLATFORM/03-IDENTITY-AND-KINSHIP.md), including the demo role switch's production implications.
- [ ] Review [UI and platform integrations](COMPOSE_MULTIPLATFORM/04-UI-AND-PLATFORM-INTEGRATIONS.md) and resolve platform-specific unknowns.
- [ ] Review [Verification and rollout](COMPOSE_MULTIPLATFORM/05-VERIFICATION-AND-ROLLOUT.md) and agree on release gates.
- [ ] Review [CI/CD and test coverage](COMPOSE_MULTIPLATFORM/06-CI-CD-AND-TEST-COVERAGE.md) and agree which proposed CI lanes are required for merge and release.
- [ ] Review [the proposed architecture](COMPOSE_MULTIPLATFORM/07-ARCHITECTURE.md) and confirm layer/platform boundaries.
- [ ] Review the [feature HLD](COMPOSE_MULTIPLATFORM/08-HLD.md) and [feature LLD](COMPOSE_MULTIPLATFORM/09-LLD.md); resolve decisions before implementation.

**Complete when:** implementation specifications are reviewed and unresolved product or platform choices are recorded in the decision log.

### 2. Kotlin/Compose app foundation

- [~] Create the shared Kotlin Multiplatform library with Android, JVM test, and retained iOS targets, plus a minimal Android Compose app shell.
- [~] Build the Android debug APK successfully. Verify app launch and shared Android source sets on-device; keep iOS target/source-set configuration and defer iOS build/launch validation to its follow-on phase.
- [ ] Select and record libraries for navigation, serialization, dependency injection, image loading, and persistence.
- [ ] Define package/module boundaries for presentation, application state, and shared domain logic.
- [ ] Set up development configurations for mock data and Firebase emulators without exposing production credentials.

**Complete when:** a minimal app launches on Android and iOS, and setup decisions and run instructions are documented.

### 3. Design system and shared UI

- [ ] Translate [`design-tokens.json`](BLUEPRINT/design-tokens.json) into Compose theme tokens.
- [ ] Rebuild shared primitives: themed text, cards, segment pills, action chips, selectable cards, search fields, and role badges.
- [ ] Implement light and dark themes, system insets, accessibility semantics, and responsive layouts.
- [ ] Decide how to handle React Native-specific effects such as blur, shadows, and the aurora background.
- [ ] Compare Compose output against the existing [iOS and Android screenshots](screenshots/).

**Complete when:** shared components use the documented tokens and the visual review records intentional differences.

### 4. Shared product logic and app state

- [ ] Port domain models, validation, and use-case behavior from `domain/` to Kotlin.
- [ ] Preserve the existing role gates and event status rules.
- [ ] Implement shared state and data flows for authentication, event queries, filters, pagination, and mutations.
- [ ] Preserve RSVP switching/count semantics and optimistic UI behavior.
- [ ] Define local persistence ownership, cache contents/retention, and sign-out clearing rules before implementing cache persistence.
- [~] Implement the initial Room-backed RSVP outbox slice with coalescing, revision-safe acknowledgements, leases, retry classification, and user-scoped observation. Firebase gateway integration and production wiring remain.
- [ ] Define idempotency and partial-failure handling for any event/kinship submission before allowing it into the outbox; until then retain an offline draft and submit only when online.
- [ ] Make retry, duplicate-submit protection, partial failure, and server reconciliation explicit for create, RSVP, moderation, and kinship writes.
- [ ] Port kinship taxonomy and event-member/organizer relationships from `modules/kinship/`.

**Complete when:** Kotlin unit tests cover business rules and recovery behavior; persistence and offline decisions are recorded and tested with fake repositories.

### 5. Firebase client integration

- [ ] Choose and record the Kotlin Firebase SDK/integration approach for Android and iOS.
- [ ] Connect authentication, Firestore event/user data, and required Cloud Functions to the existing Firebase project.
- [ ] Preserve custom-claim role behavior and current permission boundaries.
- [ ] Verify emulator configuration and data flows using the existing seed/demo scenarios.
- [ ] Confirm errors, loading states, retries, and authorization failures are surfaced consistently.
- [ ] Exercise auth restoration and safe cache behavior after process death, app restart, and sign-out.

**Complete when:** the Compose app can complete core journeys against emulators and existing production-compatible contracts without changing backend data.

### 6. Navigation and screen parity

- [ ] Implement Explore: approved event feed, category filters, search, and infinite scroll.
- [ ] Implement Event Detail: venue/maps, invitation image, RSVP state, and counts.
- [ ] Implement Create: category-specific fields, validation, image selection, and member/organizer selection.
- [ ] Implement Moderation: role-gated pending queue and approve/reject actions.
- [ ] Implement Profile: profile and role display, theme selection, and existing settings.
- [ ] Match current navigation destinations and role-dependent visibility.
- [ ] Verify empty, loading, error, offline, and permission-denied states on every screen.

**Complete when:** all documented screens and navigation flows meet parity criteria on Android and iOS.

### 7. Platform integrations

- [ ] Implement image picking, preview, upload, and failure handling on Android and iOS.
- [ ] Implement WhatsApp sharing and other supported deep links.
- [ ] Implement secure storage for sensitive local values and platform-appropriate permissions.
- [ ] Verify system back behavior, keyboard behavior, status/navigation bars, and safe areas.
- [ ] Verify lifecycle-aware cancellation, configuration changes, process recreation, and repeated navigation for critical flows.
- [~] Add Android WorkManager scheduling for the RSVP outbox; application startup wiring, foreground trigger integration, and iOS background scheduling remain.
- [ ] Confirm native behavior for network connectivity and any platform-specific notifications.
- [ ] Test responsive layouts on Android phones and tablets; tablet-specific layout changes must preserve the same workflows and role gates.

**Complete when:** platform flows and lifecycle/restart scenarios work on representative Android/iOS devices, and tablet behavior is verified where applicable.

### 8. Quality, release, and cutover

- [ ] Port acceptance journeys from [the acceptance matrix](BLUEPRINT/06-ACCEPTANCE-TESTS.md) to Kotlin unit, integration, and UI tests.
- [ ] Add coverage for role restrictions, event creation/moderation, RSVP transitions, and auth restoration.
- [ ] Implement the required CI lanes in [the CI/CD and test coverage plan](COMPOSE_MULTIPLATFORM/06-CI-CD-AND-TEST-COVERAGE.md).
- [ ] Set up Android CI builds, signing, artifact delivery, and release pipeline for the current phase; add iOS CI and release lanes in the follow-on phase.
- [ ] Add production diagnostics for crashes, startup failures, backend/sync failures, and performance without logging sensitive member or kinship data.
- [ ] Define rollout cohorts, feature-flag/remote-config use if needed, health thresholds, pause/rollback ownership, and staged expansion.
- [ ] Run parity testing against the current app and document accepted differences.
- [ ] Pilot the Compose client and monitor crashes, backend errors, and workflow completion.
- [ ] Define staged rollout, support ownership, rollback criteria, and the Expo app's maintenance period.
- [ ] Cut over only after release criteria are met; keep the rollback path available through the agreed stabilization period.

**Complete when:** release criteria are met on both platforms and cutover/rollback outcomes are documented.

## Decisions and open questions

| ID | Question | Status | Decision / notes |
|----|----------|--------|------------------|
| D-1 | Which platforms are in scope for this migration? | Decided | Android and iOS only. Keep the existing Expo web app unchanged; Compose web is out of scope for now. |
| D-2 | What is the intended native migration and cutover strategy? | Open | |
| D-3 | Which Kotlin Firebase integration will be used on both Android and iOS? | Android decided; iOS open | Use the native Firebase Android SDK for the Android-first phase. Choose and validate the iOS integration during the iOS follow-on phase. |
| D-4 | Which libraries will be used for navigation, state, persistence, serialization, and images? | Open | Select during foundation work. |
| D-5 | What visual differences from the Expo app are acceptable? | Open | Compare against the existing screenshot baselines. |
| D-6 | What release signals and rollback thresholds are required for rollout? | Open | |
| D-7 | Is admin role-management UI part of native parity? | Open | The use case and Firebase role-grant function exist, but the documented screen inventory does not define this UI. |
| D-8 | What offline guarantees should each feature provide, and which data may be persisted locally? | Decided — hybrid outbox | Persist eligible operations durably; coalesce RSVP to latest intent; use server-authoritative version checks for edits; never queue moderation or broadcasts. The existing Firestore RSVP transaction is idempotent for repeated desired statuses. Retain/cache and sign-out rules are specified in the LLD. |
| D-9 | Does the product require scheduled/background sync or notifications? | Decided — conditional sync | Drain eligible outbox work in foreground and schedule best-effort OS background work on Android/iOS. Background execution is not guaranteed; no push-notification scope is implied. |
| D-10 | What Android/iOS lifecycle and tablet support is required for the first release? | Open | Include process death/restart, configuration changes, responsive tablet behavior, and supported OS/device matrix. |
| D-11 | Which observability and staged rollout controls are available? | Open | Select crash/performance monitoring, non-sensitive diagnostics, cohort/flag strategy, and rollback thresholds. |
| D-12 | Which persistence library should back shared native data? | Decided — Room | Use Room KMP with bundled SQLite for the initial durable RSVP outbox. Broader cache ownership and retention remain open. |
| D-13 | Which native platform should be implemented first? | Decided — Android first | Implement and validate Android first. Keep iOS targets and source-set configuration in Gradle; defer iOS implementation/build validation rather than removing iOS from the project. |

## Change log

| Date | Change | Related checklist / decision |
|------|--------|------------------------------|
| 2026-10-18 | Created the initial front-end migration checklist. Scope assumes Android/iOS Compose clients with the existing Firebase backend and Expo web client retained for now. | Scope; D-1 |
| 2026-10-18 | Confirmed migration scope is Android and iOS only; Expo web remains unchanged and out of scope. | Scope; D-1 |
| 2026-10-18 | Added project-wide feature coverage mapping and proposed Compose test/CI/CD lanes; documented the admin WhatsApp Cloud broadcast and role-management scope question. | Quality; D-7 |
| 2026-10-18 | Added proposed architecture diagrams for client layers, Firebase integration, platform adapters, data flows, CI, and the unchanged web pipeline. | Architecture |
| 2026-10-18 | Added feature-by-feature HLD and LLD documents for the Android/iOS Compose migration. | Feature specifications |
| 2026-10-18 | Added senior Android engineering concerns: persistence/offline policy, recovery, lifecycle/concurrency, tablet behavior, observability, and staged rollout. | Reliability; D-8–D-11 |
| 2026-10-18 | Selected a hybrid durable outbox baseline: coalesced RSVP intent, server-authoritative version checks for edits, and no queued moderation/broadcast actions. | Sync/conflicts; D-8–D-9 |
| 2026-10-18 | Added the first Kotlin Multiplatform RSVP outbox slice: Room schema/store, retry and lease coordinator, Android WorkManager adapter, iOS/Android database builders, and coordinator/Room tests. | Foundation; offline/sync; D-12 |
| 2026-10-18 | Set the delivery sequence to Android first while retaining iOS target and source-set configuration for the follow-on phase. | Foundation; platform integrations; D-13 |
| 2026-10-18 | Added an Android Firebase RSVP transaction gateway with authenticated-user matching, server count reconciliation, retry classification, and an Android runtime composition hook. Compose app startup/configuration wiring remains. | Offline/sync; Firebase; D-3 |
| 2026-10-18 | Added a minimal Android Compose application module and successfully built its debug APK locally; on-device launch and feature UI remain to be verified/implemented. | Foundation; D-13 |
