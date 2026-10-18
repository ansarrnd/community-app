# 05 — Verification and Rollout

Implementation spec for parity testing, pilot, and replacement of the existing Expo native clients. Detailed platform coverage and CI lanes are in [06 — CI/CD and Test Coverage](06-CI-CD-AND-TEST-COVERAGE.md). Source references: [acceptance matrix](../BLUEPRINT/06-ACCEPTANCE-TESTS.md), [testing strategy](../testing/TESTING_STRATEGY.md), [automated regression plan](../testing/AUTOMATED_REGRESSION_PLAN.md), [current CI/CD plan](../CI_CD_PLAN.md).

## Test layers

### Shared domain and state tests

- Port current model/schema validation and use-case tests to Kotlin.
- Verify USER versus MOD/ADMIN create behavior, moderation permission enforcement, role-management constraints if surfaced, and RSVP ID validation.
- Test feed filter/search identity, debounce behavior, pagination cursor progression, auth bootstrap, theme persistence, and optimistic RSVP rollback.
- Use fake repositories and deterministic data; no Firebase or platform dependency should be required for these tests.

### Backend integration tests

- Run against Firebase emulators before production integration.
- Verify auth/session restoration, approved/pending visibility, event creation, moderator status transitions, RSVP transaction count changes, and kinship writes.
- Confirm the Compose clients use the existing collections, claims, rules, and field contracts without unintended schema changes.
- Keep test data separate and repeatable; never point automated tests at production data.

### Android and iOS UI tests

Port the current journeys from [the acceptance matrix](../BLUEPRINT/06-ACCEPTANCE-TESTS.md):

1. Explore loads an approved feed; category and search filters work.
2. Infinite scroll loads a second page and stops at the end.
3. USER creates an event that appears in moderation as pending.
4. MOD/ADMIN creation follows the existing auto-approval rule.
5. MOD/ADMIN approves and rejects pending events.
6. Admin WhatsApp Cloud broadcast handles success, configuration/provider failure, and duplicate submission safely.
7. RSVP attend/decline transitions update visible state and counts.
8. Auth bootstrap updates the signed-in user and role-dependent navigation; role grants retain ADMIN-only and no-self-demotion rules.
9. USER cannot access moderation; light/dark/system theme remains legible.
10. Tabs, detail back navigation, image selection, share, and maps links behave correctly.

Run key journeys on representative Android and iOS versions/devices, including Android phones/tablets, small screens, resized/split-screen windows, and accessibility settings. Keep platform-only tests for OS pickers, share sheets, deep links, permissions, system UI, process recreation, and OS background limits.

## Parity and rollout gates

Before wider rollout, record evidence that:

- All required acceptance journeys pass on Android and iOS.
- No known authorization bypass exists for moderation or role operations.
- Existing users can authenticate and see their existing events/RSVP state.
- Core flows have understandable loading, empty, offline, permission-denied, and retry behavior.
- Process interruption, app restart, sign-out during requests, and approved offline/retry scenarios do not lose or falsely confirm critical writes.
- Persistence is limited to documented data with tested retention, invalidation, and sign-out clearing behavior.
- Offline RSVP intent is durably queued, visibly pending, coalesced to the latest user choice, and reconciled against backend transaction state after retry.
- Moderation and WhatsApp broadcasts are never automatically replayed from the outbox; ambiguous results are reconciled before offering another action.
- Background sync is constrained and best-effort on both platforms, with foreground drain as the primary recovery path and no promised execution deadline.
- Android tablet layouts and agreed startup/list/image memory budgets meet the release bar.
- Image, WhatsApp/share, maps, back navigation, theme, and accessibility checks pass.
- Privacy-safe diagnostics and staged rollout pause/rollback controls are verified with a named owner.
- A rollback path to the current Expo native release is documented and executable.

Use a limited pilot first. Expand only after reviewing crash-free behavior, backend error rates, and feedback against pre-agreed thresholds. Keep the existing web app unchanged throughout this migration.

## Release record

| Milestone | Status | Date | Evidence / notes |
|-----------|--------|------|------------------|
| Android foundation build | Not started | | |
| iOS foundation build | Not started | | |
| Firebase emulator journeys | Not started | | |
| Android/iOS parity sign-off | Not started | | |
| Pilot and rollout approval | Not started | | |
| Native cutover and stabilization | Not started | | |
