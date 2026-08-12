# Community Connect — Portability Blueprint

Framework-agnostic specification for reimplementing Community Connect in another stack (Flutter, Next.js, native Swift/Kotlin, etc.).

**Principle:** Separate **what the product does** from **how Expo/React Native implements it**.

---

## Document index

| Doc | Contents |
|-----|----------|
| [00-ARCHITECTURE.md](00-ARCHITECTURE.md) | Layers, factory pattern, module boundaries, backend surfaces |
| [01-DOMAIN-MODELS.md](01-DOMAIN-MODELS.md) | Entities, Zod schemas, enums |
| [02-REPOSITORY-CONTRACTS.md](02-REPOSITORY-CONTRACTS.md) | `IEventRepository`, `IAuthRepository`, `IUserRepository` |
| [03-USE-CASES.md](03-USE-CASES.md) | Business rules, role gates, side effects |
| [04-KINSHIP-MODULE.md](04-KINSHIP-MODULE.md) | Tamil kinship taxonomy, optional plug-in |
| [05-UI-DESIGN-TOKENS.md](05-UI-DESIGN-TOKENS.md) | Visual system, component catalog |
| [design-tokens.json](design-tokens.json) | Machine-readable tokens (dark/light) |
| [08-APPLICATION-LAYER.md](08-APPLICATION-LAYER.md) | React Query keys, Zustand stores, data flows |
| [09-INFRASTRUCTURE.md](09-INFRASTRUCTURE.md) | Firebase, env vars, Cloud Functions, mock backend |
| [06-ACCEPTANCE-TESTS.md](06-ACCEPTANCE-TESTS.md) | Journey → test mapping (porting contract) |
| [07-FRAMEWORK-PORTING-GUIDE.md](07-FRAMEWORK-PORTING-GUIDE.md) | RN → Flutter/Next mappings, port order |

### Screen specs

| Screen | Route | Spec |
|--------|-------|------|
| Explore | `/` | [screens/explore.md](screens/explore.md) |
| Create | `/create` | [screens/create.md](screens/create.md) |
| Moderation | `/admin` | [screens/moderation.md](screens/moderation.md) |
| Profile | `/profile` | [screens/profile.md](screens/profile.md) |
| Event detail | `/e/[id]` | [screens/event-detail.md](screens/event-detail.md) |

---

## Recommended port order

1. **Domain** — models + use cases (`domain/`, copy or translate types)
2. **Repositories** — implement contracts for chosen backend
3. **Application layer** — state management + API (see `08-APPLICATION-LAYER.md`)
4. **UI** — rebuild screens using `design-tokens.json` + screen specs
5. **Verify** — run acceptance matrix (`06-ACCEPTANCE-TESTS.md`) or `npm run ci`

---

## Regenerate artifacts

```bash
node scripts/export-design-tokens.mjs   # → docs/BLUEPRINT/design-tokens.json
node scripts/export-env-example.mjs     # → .env.example
```

---

## Related

- [CI/CD plan](../CI_CD_PLAN.md)
- [Testing strategy](../testing/TESTING_STRATEGY.md)
- [Automated regression plan](../testing/AUTOMATED_REGRESSION_PLAN.md)
