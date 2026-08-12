# Screen: Explore

| | |
|---|---|
| **Route** | `/` (tab: Explore) |
| **Source** | `app/(tabs)/index.tsx` |
| **Screenshot** | `docs/screenshots/ios/01-explore.png` |

---

## Layout regions

1. **Search bar** — `SearchField`, debounced 300ms
2. **Category pills** — horizontal `ScrollView` of `SegmentPill`: ALL, MARRIAGE, CULTURAL, MEETING
3. **Feed header** — "Upcoming Community Events (N)" or "{category} Events"
4. **Event list** — `EventList` (FlashList), infinite scroll `onEndReached`
5. **Tab bar inset** — `contentBottomPadding` from `useLayoutInsets`

---

## Data dependencies

| Hook / store | Purpose |
|--------------|---------|
| `useFilterStore` | `category`, `searchQuery` |
| `useDebouncedValue(searchQuery, 300)` | Debounced search |
| `useApprovedEventsInfinite(category, debouncedSearch)` | Paginated approved feed |
| `useUserRsvps(user.uid)` | RSVP chip state per event |
| `useRsvpMutation` | Going / Declined |
| `useAuthStore` | Current user id |

---

## Role visibility

All roles. Moderation tab separate (not on this screen).

---

## User journeys

1. **Browse** — default feed shows approved events
2. **Filter category** — tap pill → refetch with category (ALL passes no filter)
3. **Search** — type in search → debounce → refetch
4. **RSVP** — tap Going/No on list item → optimistic `userRsvps` update
5. **Open detail** — tap card → navigate `/e/{id}`
6. **Infinite scroll** — end of list → `fetchNextPage` when `hasNextPage`

---

## List item anatomy (`EventListItem`)

- `LiquidGlassCard` with category glow border
- Category badge, title, date/time, venue
- `ActionChip` pair: Attending / Declined
