# Domain Models

Source: `domain/models/`. All validation uses **Zod**; port by copying schemas or translating to your stack's validator.

---

## User

**File:** `domain/models/User.ts`

| Field | Type | Rules |
|-------|------|-------|
| `uid` | string | required |
| `phoneNumber` | string | min 10 chars |
| `displayName` | string | min 2 chars |
| `role` | `USER` \| `MOD` \| `ADMIN` | default `USER` |
| `createdAt` | string \| Date | optional |

### Role hierarchy

`hasPermission(userRole, requiredRole)` — numeric hierarchy:

| Role | Level |
|------|-------|
| USER | 1 |
| MOD | 2 |
| ADMIN | 3 |

Returns true when `userRole >= requiredRole`.

---

## Event

**File:** `domain/models/Event.ts`

### Enums

| Name | Values |
|------|--------|
| `EventCategory` | `MARRIAGE`, `CULTURAL`, `MEETING` |
| `EventStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| RSVP status | `ATTENDING`, `DECLINED` |

### `CreateEventInput` (Zod: `CreateEventInputSchema`)

| Field | Type | Validation |
|-------|------|------------|
| `title` | string | min 3 |
| `category` | enum | MARRIAGE, CULTURAL, MEETING |
| `date` | string | min 1 |
| `time` | string | min 1 |
| `venue` | string | min 3 |
| `googleMapsUrl` | string | valid URL or empty |
| `details` | string | min 10 |
| `inviteCardUrl` | string | optional |
| `organizerId` | string | required |
| `organizerName` | string | optional |
| `groomName` | string | optional (MARRIAGE) |
| `brideName` | string | optional (MARRIAGE) |
| `agenda` | string | optional (MEETING) |
| `attachedMembers` | array | optional; see kinship |
| `attachedRelationships` | array | optional; see kinship |

### `CommunityEvent` (extends create + persisted fields)

| Field | Type | Default |
|-------|------|---------|
| `id` | string | — |
| `status` | EventStatus | PENDING |
| `rsvpCount` | number | 0 |
| `attendingCount` | number | 0 |
| `declinedCount` | number | 0 |
| `version` | number | 1 |
| `createdAt`, `updatedAt` | string \| Date | optional |

### `RSVP`

| Field | Type |
|-------|------|
| `id` | string |
| `eventId` | string |
| `userId` | string |
| `status` | ATTENDING \| DECLINED |
| `timestamp` | string |

### `EventTemplate`

| Field | Type |
|-------|------|
| `id` | string |
| `category` | EventCategory |
| `templateText` | string |
| `variables` | string[] |

---

## Pagination

**File:** `domain/models/Pagination.ts`

| Type | Fields |
|------|--------|
| `PaginationOptions` | `cursor?` (event id), `limit?` |
| `PaginatedResult<T>` | `items: T[]`, `nextCursor: string \| null` |
| `DEFAULT_PAGE_SIZE` | `20` |

---

## Demo users (mock backend)

| Role | UID | Display name |
|------|-----|--------------|
| USER | `demo-user-resident` | Resident demo |
| MOD | `demo-user-mod` | Moderator demo |
| ADMIN | `demo-user-admin` | Administrator demo |

Defined in `MockAuthRepository` / `MockUserRepository` seed data.
