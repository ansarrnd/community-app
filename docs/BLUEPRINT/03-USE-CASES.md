# Use Cases

Source: `domain/usecases/`. Each use case is a class with `execute()` — port as plain functions or service classes.

---

## Permission matrix

| Action | Minimum role |
|--------|--------------|
| Create event (pending) | USER |
| Create event (auto-approved) | MOD |
| Moderate approve/reject | MOD |
| Grant user roles | ADMIN |
| RSVP | any authenticated user |

`hasPermission(actor, required)` from `domain/models/User.ts`.

---

## CreateEventUseCase

**File:** `domain/usecases/CreateEventUseCase.ts`

| | |
|---|---|
| **Input** | `CreateEventInput`, `userRole: UserRole` |
| **Output** | `CommunityEvent` |
| **Precondition** | Valid Zod schema |
| **Role rule** | MOD+ → auto `APPROVED`; USER → stays `PENDING` unless repo sets status |
| **Side effects** | `eventRepo.createEvent`; optional `updateEventStatus(APPROVED)`; kinship `processEventKinshipPayload` |
| **Errors** | Zod validation throws |

**Steps:**

1. `CreateEventInputSchema.parse(input)`
2. `isAutoApproved = hasPermission(userRole, 'MOD')`
3. `eventRepo.createEvent(validatedInput)`
4. If auto-approved: `updateEventStatus(id, APPROVED, organizerId)`
5. If kinship repo + members/relationships: normalize and `processEventKinshipPayload`

---

## ModerateEventUseCase

**File:** `domain/usecases/ModerateEventUseCase.ts`

| | |
|---|---|
| **Input** | `eventId`, `status` (APPROVED\|REJECTED), `moderatorId`, `moderatorRole` |
| **Output** | `void` |
| **Precondition** | `hasPermission(moderatorRole, 'MOD')` |
| **Side effects** | `eventRepo.updateEventStatus` |
| **Errors** | `Unauthorized` if USER role |

---

## RsvpEventUseCase

**File:** `domain/usecases/RsvpEventUseCase.ts`

| | |
|---|---|
| **Input** | `eventId`, `userId`, `status` (ATTENDING\|DECLINED) |
| **Output** | `RSVP` |
| **Precondition** | `eventId` and `userId` non-empty |
| **Side effects** | `eventRepo.rsvpToEvent` (count updates in repo) |
| **Errors** | Missing ids |

---

## ManageRoleUseCase

**File:** `domain/usecases/ManageRoleUseCase.ts`

| | |
|---|---|
| **Input** | `actorRole`, `targetUid`, `newRole`, `actorUid?` |
| **Output** | `void` |
| **Precondition** | `hasPermission(actorRole, 'ADMIN')` |
| **Side effects** | `userRepo.updateUserRole` |
| **Errors** | Non-ADMIN; ADMIN cannot demote self |

---

## React Query mapping (current app)

| Use case | Hook mutation | Invalidates |
|----------|---------------|-------------|
| CreateEvent | `useCreateEventMutation` | `approvedEvents`, `pendingEvents` |
| ModerateEvent | `useModerateEventMutation` | `approvedEvents`, `pendingEvents` |
| RsvpEvent | `useRsvpMutation` | `userRsvps`, `event`, `approvedEvents` (optimistic on `userRsvps`) |
