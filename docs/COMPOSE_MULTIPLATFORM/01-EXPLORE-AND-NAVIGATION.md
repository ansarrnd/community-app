# 01 — Explore and Navigation

Implementation spec for the Explore tab, event discovery, and navigation to event details. Source references: [Explore screen spec](../BLUEPRINT/screens/explore.md), [application layer](../BLUEPRINT/08-APPLICATION-LAYER.md), [repository contracts](../BLUEPRINT/02-REPOSITORY-CONTRACTS.md).

## Explore feature

### User-visible behavior to preserve

- Show approved events by default; never include pending or rejected events in the public feed.
- Filter by `ALL`, `MARRIAGE`, `CULTURAL`, or `MEETING`.
- Search the feed with the current 300 ms debounce.
- Load additional pages as the user reaches the end of the list.
- Show each event's category, title, date/time, venue, and the signed-in user's RSVP selection.
- Open the event detail screen when an event card is selected.
- Display useful loading, empty, error, and offline states; retain the current offline banner behavior.

### Compose implementation

- Build an `ExploreRoute` that collects current auth, filter, feed, and RSVP state and dispatches user actions.
- Keep feed retrieval and pagination out of composables. A screen state holder/ViewModel should expose state such as selected category, search text, event items, next-page availability, loading/refreshing, and errors.
- Keep the search text responsive immediately, but delay applying it to the feed request by 300 ms. Reset paging when the effective category or debounced query changes.
- Model category selection as a typed value; map `ALL` to no category filter, consistent with the current repository contract.
- Flatten loaded pages for the lazy list and request the next page only when one exists and a request is not already in progress.
- Render each card from shared design-system components. Keep RSVP controls available in the feed and reflect the current user's state.
- Avoid triggering a separate detail fetch just to render feed cards. Fetch the selected event by ID for the detail destination.

### Data and state flow

1. User changes category or search text.
2. Screen state holder updates filter state; search is debounced before becoming a query input.
3. Approved-events data source requests the matching page from the event repository.
4. Feed state combines page items with the signed-in user's RSVP map.
5. Reaching the list threshold requests the next page using the repository's cursor contract.
6. Selecting a card navigates to Event Detail with its event ID.

The existing React Query cache keys are behavioral guidance, not a requirement to reproduce the same key implementation. Keep category and search in feed identity so a filter change cannot display a stale result as the new filter's result. Preserve the existing 5-minute approved-feed freshness intent unless testing or product decisions change it.

### Acceptance checks

- Initial feed contains approved events only.
- Each category filter returns only matching events; `ALL` clears the category constraint.
- Search applies after the debounce and changing it resets pagination.
- Scrolling loads each next page at most once; the final page does not trigger an empty request loop.
- RSVP selection on a feed card matches the user's current RSVP.
- A failed request exposes a recoverable error state without silently presenting failure as an empty feed.

## Navigation

### Destinations

| Destination | Access | Entry / behavior |
|-------------|--------|------------------|
| Explore | All signed-in roles | Default tab |
| Create Event | All signed-in roles | Tab; opens event creation |
| Moderation | MOD and ADMIN | Tab hidden from USER; screen and mutation remain role-protected |
| Profile | All signed-in roles | Tab |
| Event Detail | Existing accessible event | Push destination keyed by event ID; supports app/deep-link entry where configured |

Implement a persistent bottom tab scaffold for the four tab destinations and a back-stack destination for Event Detail. A hidden Moderation tab must not make its route or use case an authorization boundary: the domain/backend must still reject unauthorized actions.

### Acceptance checks

- Tab switching preserves the intended state and does not create duplicate destinations unexpectedly.
- Event Detail back returns to the prior screen and feed context.
- A USER does not see or navigate to Moderation through ordinary app navigation.
- An external event link resolves to the matching detail when the app is configured to handle it; invalid/missing IDs show an explicit not-found state.
