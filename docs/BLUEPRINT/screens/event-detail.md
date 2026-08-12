# Screen: Event Detail

| | |
|---|---|
| **Route** | `/e/[id]` (stack, not tab) |
| **Source** | `app/e/[id].tsx` |

---

## Layout regions

1. **Hero** — invitation image (`EventImage`) or default
2. **Header badges** — category emoji, status, verified label
3. **Title block** — event title (h1)
4. **Meta rows** — date, time, venue with icons
5. **Category extras** — wedding couple details (MARRIAGE), agenda (MEETING)
6. **Description** — details text
7. **RSVP row** — `ActionChip`: Attending (count), Declined (count)
8. **Actions** — WhatsApp share, open maps (if URL)

---

## Data dependencies

| Hook | Purpose |
|------|---------|
| `useEventDetail(id)` | `queryKey: ['event', id]` |
| `useUserRsvps(user.uid)` | Current user's RSVP for chips |
| `useRsvpMutation` | Update RSVP + counts |
| `whatsappService` | Share deep link |

---

## Navigation

Entry: tap event on Explore feed → `router.push('/e/{id}')`  
Back: stack header or gesture

---

## User journeys

1. Load event by id (deep link supported on web export with SPA serve)
2. Toggle Attending / Declined → optimistic RSVP + count refresh
3. Share via WhatsApp
4. Open Google Maps URL in browser

---

## E2E reference

`e2e/regression.spec.ts` — `/e/evt-1`, Grand Royal Wedding, Attending chip interactive

Mock event `evt-1`: MARRIAGE, Royal Palace Convention Center
