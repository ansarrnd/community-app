# Kinship Module

Optional plug-in for Tamil family-relationship taxonomy and event member attachment. Source: `modules/kinship/`.

---

## Public API

**Barrel:** `modules/kinship/index.ts`

Exports: config, domain types, taxonomy, utils, components, hooks, repositories, factory.

---

## Domain types

**File:** `modules/kinship/domain/types.ts`

| Type | Purpose |
|------|---------|
| `LineageCategory` | PATERNAL, MATERNAL, AFFINAL, NUCLEAR, COUSIN, EXTERNAL, SOCIAL, GENERAL |
| `ContextTag` | `In-Village`, `Out-Village` |
| `Person` | Kinship network person node |
| `Relationship` | Edge between persons with lineage + context |
| `EventMemberInput` | Attach member to event (name, role, relationship to organizer) |
| `EventRelationshipInput` | Attach relationship pair to event |

---

## Taxonomy

**File:** `modules/kinship/taxonomy/tamilTaxonomy.ts`

Tamil labels and inverse relationship mapping for UI pickers. **Portable as data** — swap file for another culture's taxonomy.

**Config:** `modules/kinship/config/kinshipOptions.ts` — picker options for create flow.

---

## Event kinship processing

**File:** `modules/kinship/domain/eventKinshipUtils.ts`

`processEventKinshipPayload(organizerId, members, relationships, kinshipRepo)`:

- Creates/updates persons and relationships when resident submits create form with attached members
- Invoked only from `CreateEventUseCase` when `kinshipRepo` is provided

---

## Repository factory

**File:** `modules/kinship/factory/KinshipRepositoryFactory.ts`

Same `EXPO_PUBLIC_BACKEND_PROVIDER` flag as main factory:

- mock → in-memory / local
- firebase → `FirebaseKinshipRepository`

---

## Firestore collections

| Collection | Purpose |
|------------|---------|
| `persons` | Kinship persons |
| `relationships` | Kinship edges |
| `villages` | Village metadata |

Rules: auth read/write in `firestore.rules`.

---

## UI components (framework-bound)

| Component | Use |
|-----------|-----|
| `KinshipMemberPicker` | Create event — add event members |
| `RelationshipCard` | Display relationship with lineage border colors |
| `GroupedKinshipSection` | Grouped kinship list |

Theme tokens: `kinship.lineageBorders`, `kinship.tags` in `constants/theme.ts` / `design-tokens.json`.

---

## Porting notes

1. **Keep optional** — app works without kinship if create form omits member attachment
2. **Replace taxonomy** — swap `tamilTaxonomy.ts` for your locale
3. **Decouple** — only `CreateEventUseCase` imports kinship; remove coupling by dropping step 4 in use case
4. **Tests** — `__tests__/unit/KinshipModule.test.ts`, `KinshipMemberPicker.test.tsx`
