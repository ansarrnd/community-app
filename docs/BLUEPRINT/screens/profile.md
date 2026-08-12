# Screen: Profile

| | |
|---|---|
| **Route** | `/profile` (tab: Profile) |
| **Source** | `app/(tabs)/_profileScreen.tsx` |
| **Screenshot** | `docs/screenshots/ios/03-profile.png` |

---

## Layout regions

1. **Profile card** — `LiquidGlassCard`: avatar glow, name, phone, `RoleBadge`
2. **Theme preference** — `SegmentPill` row: Dark, Light, System
3. **Demo role switch** — `SelectableCard` per role: Resident (USER), Moderator (MOD), Administrator (ADMIN)
4. **My RSVPs** — list of events user has RSVP'd to

---

## Data dependencies

| Hook / store | Purpose |
|--------------|---------|
| `useAuthStore` | User profile display |
| `useTheme` / `ThemeContext` | `themeMode`, `setThemeMode` (MMKV persist) |
| `useUserRsvps` + event lookups | RSVP history |
| `MockAuthRepository.signInDemoUser` / Firebase | Role switch triggers auth repo |

---

## User journeys

1. **Theme toggle** — Dark/Light/System → `getAppTheme` + MMKV `COMMUNITY_APP_THEME_MODE`
2. **Role switch** — demo sign-in as USER/MOD/ADMIN → updates auth store + tab visibility (Moderation)
3. **View RSVPs** — attending/declined events list

---

## E2E reference

- Role switch to USER → Moderation tab hidden (`regression.spec.ts`)
- Light theme toggle → explore readable (`regression.spec.ts`)
