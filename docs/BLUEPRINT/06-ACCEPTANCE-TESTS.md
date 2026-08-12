# Acceptance Test Matrix

Tests encode the **porting contract**. A reimplementation should pass equivalent scenarios or manually verify each row.

**Golden CI:** `npm run ci` mirrors GitHub Actions (`scripts/ci-local.sh`).

---

## User journeys

| Journey | Expected outcome | Integration | E2E | Unit |
|---------|------------------|-------------|-----|------|
| Explore loads approved feed | Events visible, search works | `EventsFilter.integration` | `web-smoke` loads explore | `EventsQueryHooks`, `ScreenSnapshots` |
| Category filter | Feed shows category subset | `EventsFilter.integration` | `web-smoke` category pill | `ScreenInteractions` |
| Search debounce | Filter after 300ms | — | `web-smoke` search debounce | `useDebouncedValue` |
| Infinite scroll page 2 | 3 items with page size 2 | `EventsInfinite.integration` | — | `EventsQueryHooks` |
| Create → pending (USER) | Event in pending queue | `CreateEvent.integration` | `regression` create submit | `CreateEventUseCase` |
| MOD auto-approve | Event APPROVED on create | `CreateEvent.integration` | — | `CreateEventUseCase` |
| Moderate approve | Pending → approved feed | `Moderate.integration` | `regression` admin approve | `ModerateEventUseCase` |
| RSVP attending | attendingCount +1 | `Rsvp.integration` | `regression` event RSVP | `RsvpEventUseCase`, `MockEventRepository` |
| RSVP switch ATTENDING→DECLINED | Counts move correctly | `Rsvp.integration` | — | `RsvpEventUseCase` |
| Auth bootstrap | Store updates on auth event | `AuthBootstrap.integration` | — | `MockAuthRepository` |
| Role switch hides Moderation | Tab not visible for USER | — | `regression` profile role | `useRoleGuard` |
| Light theme legibility | Explore readable | — | `regression` theme light | `Theme.test`, snapshots |
| Tab navigation | Create/Profile reachable | — | `web-smoke` tab nav | `ScreenSnapshots` |

---

## Layer inventory

| Layer | Count | Location |
|-------|-------|----------|
| Jest (all) | 166 | `__tests__/` |
| Integration | 9 | `__tests__/integration/` |
| Playwright E2E | 10 | `e2e/web-smoke.spec.ts` (5), `e2e/regression.spec.ts` (5) |
| Snapshots | 19 | `ScreenSnapshots`, `ChipSnapshots` |
| Perf | 2 | `__tests__/perf/RenderBudget.test.tsx` |

---

## Domain unit tests (logic contract)

| File | Covers |
|------|--------|
| `EventModel.test.ts` | Zod schemas |
| `CreateEventUseCase.test.ts` | Create + auto-approve |
| `ModerateEventUseCase.test.ts` | Role gate |
| `RsvpEventUseCase.test.ts` | RSVP validation |
| `ManageRoleUseCase.test.ts` | ADMIN gate, self-demotion |
| `MockEventRepository.test.ts` | Repo behavior |
| `FirebaseEventRepository.rsvp.test.ts` | Transaction RSVP |
| `FirebaseAuthRepository.test.ts` | Auth adapter |
| `KinshipModule.test.ts` | Kinship domain |

---

## Visual regression

| Asset | Command |
|-------|---------|
| Jest tree snapshots | `npm run test:snapshots` |
| PNG pixelmatch | `npm run screenshots:candidate && npm run screenshots:compare` |

Baselines: `docs/screenshots/ios/`, `docs/screenshots/android/`

---

## Explicitly not in CI (manual)

| Item | Doc |
|------|-----|
| Maestro native | `docs/testing/MAESTRO_CI.md` |
| Firebase emulator integration | `AUTOMATED_REGRESSION_PLAN.md` |
| Detox | `DETOX_EVALUATION.md` |
| EAS release | `docs/CI_CD_PLAN.md` |

---

## Porter checklist

- [ ] All integration tests scenarios pass (or equivalent)
- [ ] 10 Playwright E2E scenarios pass on web build
- [ ] `type-check` + domain unit tests green
- [ ] Visual baselines match or intentionally updated
- [ ] `npm run ci:fast` on ported codebase (if wired)
