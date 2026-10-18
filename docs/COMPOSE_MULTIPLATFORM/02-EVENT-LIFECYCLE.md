# 02 — Event Lifecycle

Implementation spec for event creation, event detail, RSVP, and moderation. Source references: [Create screen](../BLUEPRINT/screens/create.md), [Event Detail](../BLUEPRINT/screens/event-detail.md), [Moderation](../BLUEPRINT/screens/moderation.md), [use cases](../BLUEPRINT/03-USE-CASES.md), [repository contracts](../BLUEPRINT/02-REPOSITORY-CONTRACTS.md).

## Event creation

### Form behavior

- Provide `MARRIAGE`, `CULTURAL`, and `MEETING` category selection.
- Show category-specific fields: bride/groom details for marriage and agenda for meeting, as applicable to the existing schema.
- Capture the existing core fields: title, date, time, venue, maps URL, details, and invitation image where supported.
- Provide the optional kinship member/relationship picker and an invitation preview.
- Validate against the same constraints as `CreateEventInputSchema`; show field-level errors and preserve entered values when submission fails.
- Associate the event with the current user's ID as organizer. Do not accept organizer identity from an editable form field.

### Submit flow and role rules

1. Validate locally for a responsive form; the domain/use-case validation remains authoritative.
2. Disable duplicate submission while a create request is in flight.
3. Submit a typed event input and the authenticated user's role through the application/domain boundary.
4. USER-created events enter `PENDING`; MOD/ADMIN-created events are auto-approved by the existing use-case rule.
5. If kinship is enabled and members are supplied, persist the event kinship payload through the existing kinship behavior.
6. On success, show clear confirmation and return to Explore or the documented success destination; refresh/invalidate approved and pending feed state.
7. On failure, show an actionable error and keep form content available for correction/retry.

Do not implement auto-approval as a UI-only decision. The rule belongs in trusted business logic and existing backend permission enforcement.

## Event Detail

### Content and actions

- Load the event by ID and distinguish loading, not found, and load failure.
- Show invitation image or the current fallback, category/status badges, title, date/time, venue, category-specific information, and description.
- Show attending and declined counts alongside the signed-in user's selected RSVP.
- Provide WhatsApp share and maps actions only when the event has the relevant share/map data.
- Preserve back-stack behavior and support configured deep links to event IDs.

### Share and external links

- Use an Android/iOS platform adapter for opening a WhatsApp share target or system share path while keeping message/link composition in shared code.
- If WhatsApp is unavailable, surface a supported fallback (such as the system share sheet) rather than swallowing the error.
- Validate/parse maps URLs before opening the platform browser or maps handler; report inability to open the link.
- Keep web-only Open Graph behavior out of this native feature migration; the existing web page/backend remains unchanged.

## RSVP

### Rules and state

- Authenticated users may choose `ATTENDING` or `DECLINED`.
- Switching from attending to declined (and back) must move counts correctly; tapping a choice should follow the current product behavior for selecting/reselecting it.
- Treat the repository/backend transaction as the source of truth for aggregate counts. Never calculate authoritative shared totals only on-device.
- Update the current user's RSVP optimistically for responsiveness, then reconcile with the server result.
- On failure, roll back the optimistic state, keep counts consistent with the last confirmed data, and show an error/retry affordance.
- Refresh affected RSVP, event-detail, and approved-feed state after a successful mutation.

### Acceptance checks

- New attending/declined RSVP is reflected on the detail and feed.
- Switching RSVP state changes the server-backed counts exactly once in each direction.
- Network failure does not leave the UI in a success-shaped state.
- A stale count is reconciled after the server responds.

## Moderation

### Queue and actions

- Show the pending queue to MOD/ADMIN only, with event title, category, and organizer details.
- Show queue loading/error states and an explicit empty state when no events are pending.
- Approve and reject through the moderation use case with event ID, target status, moderator ID, and role.
- On success, remove the item from pending; approved events become discoverable in Explore, while rejected events remain out of the public feed.
- Prevent duplicate taps while a decision is pending and display errors if the operation fails.
- Keep the role check in the use case and backend rules even though the tab is role-gated.

### Acceptance checks

- USER cannot see the Moderation tab and cannot approve/reject by calling the underlying action.
- Approve transitions a pending event to approved and updates both queue and Explore data.
- Reject transitions it to rejected and does not expose it in Explore.
- Empty queue and request failure are distinct visible states.

### Admin WhatsApp Cloud broadcast

- Preserve the existing per-event `WA Broadcast` action on the moderation screen for eligible admins.
- Keep this path separate from ordinary WhatsApp sharing: it calls the configured Meta WhatsApp Cloud integration to broadcast to subscribers.
- Show an in-flight state and prevent duplicate submissions for the same event.
- On success, report the result using the provider's recipient count; on missing configuration or provider failure, show an actionable failure and restore the action.
- Do not make event approval depend on broadcast success.

**Acceptance checks:** verify success, provider/configuration failure, and duplicate-tap prevention with a mocked service; exercise the real integration only in a controlled environment with approved test recipients.
