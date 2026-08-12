# Repository Contracts

Source: `domain/repositories/`. Implement these interfaces for any backend (Firestore, REST, SQLite, in-memory mock).

---

## IEventRepository

**File:** `domain/repositories/IEventRepository.ts`

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `getApprovedEvents` | `categoryFilter?`, `searchQuery?`, `pagination?` | `PaginatedResult<CommunityEvent>` | Only `APPROVED` events; cursor = last event id |
| `getPendingEvents` | — | `CommunityEvent[]` | Moderation queue |
| `getEventById` | `id` | `CommunityEvent \| null` | |
| `createEvent` | `CreateEventInput` | `CommunityEvent` | Initial status PENDING in repo; use case may auto-approve |
| `updateEventStatus` | `id`, `status`, `moderatorId` | `void` | Audit moderator id |
| `rsvpToEvent` | `eventId`, `userId`, `status` | `RSVP` | Must update attending/declined counts atomically (Firebase: transaction) |
| `getUserRsvps` | `userId` | `Record<eventId, ATTENDING\|DECLINED>` | Map for UI chips |

---

## IAuthRepository

**File:** `domain/repositories/IAuthRepository.ts`

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `getCurrentUser` | — | `User \| null` | Restored session |
| `signInDemoUser` | `UserRole` | `User` | Demo/QA role switch |
| `signOut` | — | `void` | |
| `subscribeAuthState?` | `listener` | `unsubscribe fn` | Firebase: live; Mock: immediate + notify |

---

## IUserRepository

**File:** `domain/repositories/IUserRepository.ts`

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `getUserById` | `uid` | `User \| null` | |
| `createUserProfile` | `User` | `User` | |
| `updateUserRole` | `uid`, `newRole` | `void` | ADMIN-only in use case |
| `getAllUsers` | — | `User[]` | Admin tooling |

---

## Kinship repository (module)

**File:** `modules/kinship/database/RelationshipRepository.ts` (interface)

See [04-KINSHIP-MODULE.md](04-KINSHIP-MODULE.md). Used by `CreateEventUseCase` via `processEventKinshipPayload`.

---

## Factory wiring

```text
RepositoryFactory.getEventRepository()
RepositoryFactory.getAuthRepository()   // depends on UserRepository
RepositoryFactory.getUserRepository()
```

Env: `EXPO_PUBLIC_BACKEND_PROVIDER=firebase` switches all three to Firebase implementations.

---

## Firestore mapping (Firebase adapter)

| Contract method | Firestore |
|-----------------|-----------|
| `getApprovedEvents` | `events` where `status==APPROVED`, optional `category`, client search, `startAfter` cursor |
| `getPendingEvents` | `events` where `status==PENDING` |
| `rsvpToEvent` | `rsvps` doc + transaction on event count fields |
| Custom claims | Auth `role` claim synced via `grantRole` Cloud Function |

Security: `firestore.rules` — read approved events public to auth; create requires `organizerId == auth.uid`.
