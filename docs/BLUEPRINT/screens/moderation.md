# Screen: Moderation

| | |
|---|---|
| **Route** | `/admin` (tab: Moderation) |
| **Source** | `app/(tabs)/_adminScreen.tsx` |
| **Role gate** | Tab hidden for USER (`href: null` in `_layout.tsx`) |

---

## Layout regions

1. **Hub header** — "Community Moderation Hub"
2. **Stats banner** — `LiquidGlassCard` queue summary
3. **Pending list** — cards per pending event (title, category, organizer)
4. **Actions per card** — `ActionChip`: Approve & Publish, Reject
5. **Empty state** — "Queue Clean" / no pending events

---

## Data dependencies

| Hook | Purpose |
|------|---------|
| `usePendingEvents` | `queryKey: ['pendingEvents']`, staleTime 30s |
| `useModerateEventMutation` | `ModerateEventUseCase` |
| `useAuthStore` | `moderatorId`, `moderatorRole` |
| `useRoleGuard` | `isMod`, `isAdmin` |

---

## User journeys

1. MOD/ADMIN opens Moderation tab
2. Views pending events (e.g. "Youth Sports & Athletics Championship 2026")
3. Approve → event moves to approved feed; removed from queue
4. Reject → event status REJECTED; removed from explore

---

## E2E reference

`e2e/regression.spec.ts` — approve first pending → empty queue message
