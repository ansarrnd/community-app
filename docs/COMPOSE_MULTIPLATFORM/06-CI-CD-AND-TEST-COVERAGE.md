# 06 — CI/CD and Test Coverage

Plan for carrying this repository's existing quality contract forward while adding real Compose Multiplatform validation on Android and iOS. This is a proposed target for the migration, not a description of CI that already exists.

**Delivery sequence:** implement and validate Android first. Keep iOS targets and source-set configuration in Gradle, but defer iOS implementation, build validation, and required iOS CI checks to the follow-on phase. The eventual migration scope remains Android and iOS.

## Current pipeline versus migration target

The current [`ci.yml`](../../.github/workflows/ci.yml) runs on Ubuntu for pull requests and pushes to `main`/`develop`. It type-checks and tests the Expo app, then runs web export/Playwright/bundle checks and web-viewport screenshot comparison. [`deploy-web.yml`](../../.github/workflows/deploy-web.yml) deploys the existing web app to GitHub Pages.

The current workflow does **not** build or test a Compose client. Native Maestro CI, Firebase emulator integration in CI, and EAS release automation are documented as disabled or manual in the [CI/CD plan](../CI_CD_PLAN.md). The local Maestro screenshot flows and current React Native/Jest snapshots are useful references, but they are not Compose native UI verification.

Keep the Expo web CI and Pages deployment while web remains supported. Add Compose checks rather than replacing the current pipeline prematurely. Existing Jest/use-case tests are behavioral references; reimplement tests in Kotlin for migrated code instead of treating the old React component tests as proof of native parity.

## Feature and project-scope coverage

| Existing project scope | Compose migration verification | Boundary / notes |
|-------------------------|---------------------------------|------------------|
| Explore: approved feed, categories, debounced search, pagination | Shared state/repository tests + Android/iOS UI tests; Firebase emulator feed test | Verify approved-only visibility, filter reset, cursor behavior, and retry states. |
| Event detail: content, invitation image, maps link | Shared state tests + Android/iOS UI tests + platform link/image checks | Keep Open Graph page generation on the existing web/backend path. |
| Event creation: validation, categories, preview, image, optional kinship | Domain/form tests + UI tests + emulator create flow | Assert organizer identity, USER pending state, and moderator auto-approval contract. |
| RSVP: attending/declined, switching, counts, optimistic state | Use-case/state tests + emulator transaction test + UI tests | Backend transaction remains authoritative for shared counts. |
| Moderation: pending queue, approve/reject, role gate | Role/use-case tests + emulator authorization and status tests + UI tests | Exercise both hidden navigation and rejected unauthorized operation. |
| Authentication, profile, role display, session restore | Auth state tests + emulator auth integration + UI tests | Demo role switching is test-only/local and must not elevate production users. |
| Theme and design system | Token/semantics tests + Android/iOS screenshot or UI checks + accessibility checks | Current React tree snapshots do not validate Compose rendering. |
| Kinship taxonomy and event relationships | Kotlin domain tests + emulator write/read test + picker UI tests | Include Tamil labels, inverse mapping, context tags, and no-kinship event path. |
| Offline/cache/network behavior | State/cache tests + airplane-mode/device checks | Explicitly verify cached content, reconnect behavior, and mutation failure rollback. |
| Process/lifecycle recovery and concurrency | State-holder cancellation, auth-session isolation, mutation interruption and restart tests | Verify no stale result overwrites a new session and unacknowledged writes are not displayed as success. |
| Local persistence/data retention | Outbox/cache adapter tests, schema migration/version tests, sign-out/user-switch clearing | Durable outbox is required for selected offline RSVP; test UID partitioning, retention, cache freshness, and sensitive data boundaries. |
| Background execution/sync | Outbox state-machine tests, duplicate delivery/coalescing, retry/backoff, Android unique WorkManager scheduling, iOS best-effort resumption | Queue only RSVP latest intent initially; version-check future edits; never queue moderation/broadcast. Test constraints, cancellation, auth expiry, and server reconciliation. |
| Android tablet and adaptive layouts | Compose width-class/window resize UI tests plus device review | Verify existing workflows remain usable in landscape, split-screen, and expanded width. |
| Diagnostics and staged rollout | Redaction tests, monitoring integration validation, rollout/rollback drill | No personal, phone, token, event or kinship payloads in telemetry; use explicit health thresholds and an owner. |
| WhatsApp/share and maps | Android/iOS platform tests or documented device smoke | Exercise installed and unavailable target cases; web Open Graph is unchanged. |
| Admin WhatsApp Cloud broadcast | Preserve the Moderation screen's per-event broadcast action; test success, provider/configuration failure, and in-flight/duplicate-tap state | Currently exposed in the admin UI via `whatsappService.triggerMetaCloudBroadcast`; keep this optional integration's configuration and failure messaging explicit. |
| Admin role management | Preserve role-grant use-case and Firebase callable contract; add Compose UI tests only if role-management screens/actions are part of the intended native scope | `ManageRoleUseCase` and `grantRole` exist, but the documented screen inventory does not specify an admin role-management screen. Resolve this scope before declaring parity. |
| Firebase rules, Functions, and existing data | Existing backend tests plus compatibility/emulator checks from the Compose app | No backend/data migration in this plan; backend changes require separately scoped tests and review. |
| Expo web, Playwright, Pages deployment | Keep existing CI and workflow running | Web is maintained but Compose web is out of scope. |
| Native release/update path | Internal Android/iOS artifact tests, then controlled store/TestFlight rollout | EAS is not assumed to be the Compose release mechanism; choose a Kotlin-compatible release path. |

Every in-scope feature in pages [01](01-EXPLORE-AND-NAVIGATION.md) through [04](04-UI-AND-PLATFORM-INTEGRATIONS.md) should map to at least one automated test and, where platform APIs or visual presentation are involved, one Android/iOS verification. Record any accepted manual-only test and its release owner.

## Proposed CI lanes

### Pull request: shared and fast checks

- Run Kotlin formatting and static analysis (for example, the selected formatter/linter and Kotlin static checks).
- Compile shared KMP code and Android debug target.
- Run shared Kotlin unit tests for models, use cases, validation, state, paging, caching, and error handling.
- Run Android local/unit tests and enforce agreed code/test quality gates.
- Keep the existing Expo quality job while the Expo web application remains in service.

**Merge gate:** all shared checks, required target builds, and existing web CI must pass. Do not make iOS optional for code that changes shared Compose code or iOS-specific code.

### Android target

- Build the Android app on a supported Linux or macOS runner.
- Run Android unit tests on every relevant pull request.
- Run focused emulator/instrumentation UI journeys on pull requests; run the full device matrix nightly or before release if runtime cost is high.
- Publish debug/internal test APK or bundle as a retained CI artifact for review; never publish a production-signed artifact from untrusted pull requests.

### iOS target

- Use a macOS runner with supported Xcode to compile shared Kotlin Native/iOS frameworks and the iOS app.
- Run iOS simulator unit/UI tests on relevant pull requests; expand simulator/device coverage before release.
- Publish an unsigned or internal simulator artifact as appropriate. Signing and App Store/TestFlight distribution must use protected credentials and trusted release triggers only.
- Keep iOS checks required for changes to shared code, iOS source sets, Gradle configuration, or Xcode integration.

### Backend contract and emulator lane

- Start Firebase Auth/Firestore/Functions emulators with isolated demo configuration and seed deterministic data.
- Run Compose client integration tests for auth claims, approved/pending queries, event creation, status transitions, RSVP atomic counts, and kinship persistence.
- Run on pull requests that affect data adapters/contracts; promote to a required merge gate once stable. Until reliable CI emulator startup is available, require the documented local/release check and track the CI gap explicitly.
- Never use production Firebase credentials/data for automated test jobs.

### Visual, accessibility, and performance lanes

- Maintain reviewed Android and iOS Compose screenshot baselines for core screen/theme states; upload candidate images and diffs for review.
- Cover Explore, Create, Event Detail, Moderation (authorized and restricted), and Profile in light/dark themes, with loading/empty/error states where they materially differ.
- Add accessibility checks for labels, selected states, text scaling, focus/navigation, contrast, and touch target usability; include manual VoiceOver/TalkBack checks before release.
- Measure startup, large-list scroll, image loading, and memory on representative low/mid-range devices; set explicit budgets before making performance a blocking CI threshold.
- Include Android phone/tablet width classes and lifecycle scenarios (background/foreground, configuration change, process restart, sign-out during request) in native UI/device coverage.
- Test persistence versioning and sign-out/user-switch cleanup if durable local storage is introduced.
- Validate bounded retry/backoff, duplicate suppression, constraints, cancellation, and recovery after process restart for eligible RSVP sync. Assert moderation/broadcast use foreground requests and ambiguous results are reconciled before retry.
- Verify outbox schema migration, UID partitioning, sign-out/account-switch isolation, and that pending RSVP state is visibly distinct from server-confirmed state.
- Validate telemetry redaction and staged rollout pause/rollback using test builds before production rollout.
- Keep web pixelmatch checks for the Expo web client. They are not a substitute for native Compose baselines.

### Release and deployment

- On trusted release tags or approved manual dispatch, build versioned Android and iOS release artifacts.
- Store signing keys, certificates, provisioning profiles, and store credentials only in protected CI secret storage; scope access to trusted release jobs and avoid secrets on fork PRs.
- Distribute first to internal testers (Android internal track and iOS TestFlight or an agreed alternative), then pilot to a limited audience before wider rollout.
- Record build version, commit, test evidence, known issues, release approver, rollout stage, crash/error signals, and rollback decision.
- Keep current Expo web Pages deployment unchanged. Retire Expo native release/update workflows only after Compose native cutover and stabilization are explicitly approved.

## Triggers and required checks

| Trigger | Required work |
|---------|---------------|
| Pull request changing shared Compose/Kotlin code | Format/static checks, shared tests, Android build/tests, iOS compile/tests, existing web CI |
| Pull request changing a platform source set | Shared tests plus the affected platform build/UI tests; maintain the other target's shared-code checks |
| Pull request changing Firebase data adapter/contracts | Emulator contract lane plus shared tests and relevant platform builds |
| Nightly or scheduled run | Expanded Android emulator/iOS simulator matrix, full UI journeys, screenshot diff, performance sampling |
| Release tag / protected manual dispatch | Full test suite, signed versioned builds, internal distribution, approval and rollout record |

Define path filters carefully: changes in shared source, Gradle settings, plugin versions, generated code, or shared design tokens must trigger both platform checks. Prefer a required workflow/status check that reports completion even when a job is skipped.

## Acceptance criteria for this plan

- [ ] Every in-scope feature row above has an automated test reference or a documented manual exception/owner.
- [ ] Decide whether admin role-management UI is in native parity scope; do not equate the demo role switch with real role management.
- [ ] Android and iOS builds and test jobs run from CI on the agreed triggers.
- [ ] Required branch checks include the relevant Compose jobs and retain current Expo web checks.
- [ ] Firebase emulator contract tests are repeatable and isolated from production.
- [ ] Native screenshot, accessibility, and performance coverage has agreed scope and release expectations.
- [ ] Lifecycle, process-death, persistence-clearing, tablet/resizing, and sync/retry recovery checks are covered.
- [ ] Durable outbox tests prove RSVP coalescing, duplicate-delivery safety, bounded retry, and no replay after user/session change.
- [ ] Diagnostics are privacy-reviewed and staged rollout pause/rollback has an owner and measurable thresholds.
- [ ] Internal distribution, signing-secret handling, staged rollout, monitoring, and rollback are documented.
- [ ] Compose cutover does not disable Expo web builds, Playwright checks, or Pages deployment.

## Proposed implementation milestones

| Milestone | Status | Exit evidence |
|-----------|--------|---------------|
| Kotlin formatting, shared test, and Android build PR lane | Not started | Required CI checks pass on a sample PR. |
| iOS compile and simulator test PR lane | Not started | macOS/Xcode job passes and reports required status. |
| Deterministic Firebase emulator contract lane | Not started | Seeded integration tests pass without production credentials. |
| Android/iOS UI and visual regression lanes | Not started | Core journeys and reviewed native baselines run in CI. |
| Protected internal release pipeline | Not started | Versioned Android/iOS artifacts reach internal testers safely. |
| Staged native rollout with rollback | Not started | Pilot evidence and approved rollback procedure recorded. |
