# Screen: Create Event

| | |
|---|---|
| **Route** | `/create` (tab: Create) |
| **Source** | `app/(tabs)/_createScreen.tsx` (lazy via `create.tsx`) |
| **Screenshot** | `docs/screenshots/ios/02-create.png` |

---

## Layout regions

1. **Header** — "Host a Community Event"
2. **Category segments** — `SegmentPill` row: MARRIAGE, CULTURAL, MEETING
3. **Dynamic fields** — category-specific (groom/bride for MARRIAGE, agenda for MEETING)
4. **Core fields** — title, date, time, venue, maps URL, details (`testID`: `input-event-title`, etc.)
5. **Kinship picker** — `KinshipMemberPicker` (optional members)
6. **Live preview** — `LiquidGlassCard` invitation preview
7. **Submit CTA** — `btn-submit-event` → primary button + shadow

---

## Data dependencies

| Hook / store | Purpose |
|--------------|---------|
| `useCreateEventMutation` | `CreateEventUseCase.execute` |
| `useAuthStore` | `organizerId`, `userRole` for auto-approve |
| `react-hook-form` + Zod | Form validation mirroring `CreateEventInputSchema` |

---

## Role behavior

| Role | On submit |
|------|-----------|
| USER | Event → `PENDING` moderation queue |
| MOD / ADMIN | Event → `APPROVED` (auto-approve in use case) |

---

## User journeys

1. Select category → show template-specific fields
2. Fill form → live preview updates
3. Attach kinship members (optional)
4. Submit → mutation → navigate back to Explore (or show success)
5. Validation errors from Zod surface on fields

---

## Form testIDs (E2E)

- `input-event-title`
- `input-event-venue`
- `input-event-details`
- `btn-submit-event`
