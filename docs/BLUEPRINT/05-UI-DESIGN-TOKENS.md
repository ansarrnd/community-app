# UI Design Tokens & Component Catalog

Machine-readable tokens: [design-tokens.json](design-tokens.json)  
Source: `constants/theme.ts` · Regenerate: `node scripts/export-design-tokens.mjs`

---

## Design philosophy

Tamil/community-inspired palette:

- **Dark:** Midnight Soil canvas (`#0B0D13`) + Nilavilakku gold accents
- **Light:** Cream canvas (`#F9F6F0`) + terracotta accents

**Token families must stay distinct:**

| Family | Use | Tokens |
|--------|-----|--------|
| Segment | Category filters, theme picker, toggles | `segmentBg`, `segmentBorder`, `segmentText*` |
| Input | Text fields | `bgInput`, `borderInput` |
| Chip | RSVP, moderation actions | `chipSuccess*`, `chipDanger*` |
| Glow | Card category halos | `glowCategoryMarriage`, etc. |

---

## Typography (`themeTypography`)

| Variant | Size | Weight | Use |
|---------|------|--------|-----|
| h1 | 28 | 800 | Screen titles |
| h2 | 22 | 700 | Section headers |
| h3 | 18 | 700 | Card titles |
| subtitle | 16 | 600 | Feed headers |
| body | 15 | 400 | Default text |
| caption | 13 | 500 | Labels, pills |
| button | 15 | 700 | CTAs |

---

## Spacing & radius

| Spacing | px |
|---------|-----|
| xs–xxl | 4, 8, 16, 24, 32, 48 |

| Radius | px | Use |
|--------|-----|-----|
| sm | 8 | Small cards |
| md | 14 | Images |
| lg | 20 | Glass cards |
| xl | 28 | Hero |
| pill | 999 | Pills, search |

---

## Component catalog

### SegmentPill (`components/ui/SegmentPill.tsx`)

| Prop | Type | Default |
|------|------|---------|
| `label` | string | — |
| `selected` | boolean | false |
| `compact` | boolean | false (pill radius when true) |
| `flex` | boolean | false |
| `icon` | ReactNode | optional |

**States:** selected → `segmentBgActive`, `segmentBorderActive`, `segmentTextActive`

**Used on:** Explore categories, Create category row, Profile theme picker

### ActionChip (`components/ui/ActionChip.tsx`)

| Prop | Type |
|------|------|
| `label` | string |
| `variant` | `success` \| `danger` \| `accent` |
| `selected` | boolean |
| `compact` | boolean (pill shape) |
| `icon` | optional |

**Unselected:** falls back to segment tokens. **Selected:** variant chip colors.

**Used on:** Event list RSVP, event detail RSVP, admin approve/reject

### SelectableCard (`components/ui/SelectableCard.tsx`)

Selectable list row for role picker. Selected state uses accent border/background.

### SearchField (`components/ui/SearchField.tsx`)

Pill-shaped search with `accessibilityRole="search"`. Tokens: `bgInput`, `borderInput`.

### LiquidGlassCard (`components/LiquidGlassCard.tsx`)

| Aspect | Spec |
|--------|------|
| Surface | `bgCard`, `borderCard`, radius 20, padding 16 |
| Blur | `expo-blur` native; web `backdrop-filter: blur(16px)` |
| Shadow | `platformShadow('card')` |
| Performance | `blurEnabled={false}` on list items |
| Category glow | Marriage/Cultural/Meeting border glow colors |

### ThemedText (`components/ThemedText.tsx`)

Props: `variant`, `muted`, `secondary`, `bold`, `center` → maps to `themeTypography` + text colors.

### RoleBadge (`components/RoleBadge.tsx`)

Pill showing USER/MOD/ADMIN with `roleUser`, `roleMod`, `roleAdmin` colors.

---

## Background stack

1. `FluidAuroraBackground` — 3 gradient orbs from `auroraMesh` in tokens
2. Optional: `SkiaFluidAuroraBackground` when `EXPO_PUBLIC_USE_SKIA_AURORA=true`
3. Transparent screen backgrounds; content on glass cards

---

## Visual regression baselines

| Asset | Path |
|-------|------|
| Screen snapshots | `__tests__/unit/ScreenSnapshots.test.tsx` |
| Chip snapshots | `__tests__/unit/ChipSnapshots.test.tsx` |
| PNG baselines | `docs/screenshots/ios/`, `docs/screenshots/android/` |

Screenshot naming: `01-explore`, `02-create`, `03-profile`

---

## Screen specs

See [screens/](screens/) for per-screen layout, data dependencies, and journeys.
