# Architecture Blueprint

## Layer diagram

```mermaid
flowchart TB
  subgraph ui [UI Layer - framework-bound]
    Screens["app/ screens"]
    Components["components/"]
    ThemeCtx["context/ThemeContext"]
  end

  subgraph app [Application Layer - reimplement per framework]
    Hooks["application/hooks/"]
    Stores["application/stores/"]
    Providers["application/providers/"]
  end

  subgraph domain [Domain Layer - portable]
    Models["domain/models/"]
    UseCases["domain/usecases/"]
    Interfaces["domain/repositories/"]
  end

  subgraph infra [Infrastructure - adapter per backend]
    Factory["RepositoryFactory"]
    Repos["Mock + Firebase + Go repos"]
    Services["whatsapp, openGraph, grantRole"]
  end

  Screens --> Hooks
  Screens --> Stores
  Screens --> Components
  Components --> ThemeCtx
  Providers --> Factory
  Providers --> Stores
  Hooks --> UseCases
  Hooks --> Factory
  Hooks --> Stores
  UseCases --> Interfaces
  UseCases --> Models
  Factory --> Repos
  Repos --> Interfaces
```

## Layer rules

| Layer | Path | May import | Must not import |
|-------|------|------------|-----------------|
| UI | `app/`, `components/` | application, domain types, context | Firebase SDK directly |
| Application | `application/` | domain, infrastructure factory | UI components |
| Domain | `domain/` | (none — portable) | React, Firebase, Expo |
| Infrastructure | `infrastructure/`, `config/` | domain interfaces | UI, React hooks |

## Backend switching

`RepositoryFactory` (`infrastructure/factory/RepositoryFactory.ts`) selects implementations:

| `EXPO_PUBLIC_BACKEND_PROVIDER` | Event | Auth | User |
|--------------------------------|-------|------|------|
| unset / `mock` | `MockEventRepository` | `MockAuthRepository` | `MockUserRepository` |
| `firebase` | `FirebaseEventRepository` | `FirebaseAuthRepository` | `FirebaseUserRepository` |
| `go` | `GoEventRepository` | `GoAuthRepository` | `GoUserRepository` |

## Navigation (Expo Router)

```mermaid
flowchart LR
  Explore["Explore tab /"]
  Create["Create tab /create"]
  Admin["Moderation /admin - MOD+ only"]
  Profile["Profile tab /profile"]
  Detail["Stack /e/id"]
  Explore --> Detail
```

- Tab bar: floating, absolute bottom (`app/(tabs)/_layout.tsx`)
- Admin tab hidden when `href: null` for USER role

## Backend surfaces

| Surface | Path | Role |
|---------|------|------|
| Firestore rules | `firestore.rules` | Security model |
| Firestore indexes | `firestore.indexes.json` | Category + pagination queries |
| Cloud Functions | `functions/src/` | `grantRole`, `eventSharePage`, `whatsappWebhook` |
| Go API (startup) | `backend/` | SQLite + JWT REST — [10-GO-BACKEND.md](10-GO-BACKEND.md) |
| Supabase (optional) | `supabase/schema.sql` | Alternate SQL + RLS schema |
| EAS / OTA | `eas.json`, `app.json` | Manual release profiles |

## Firestore collections (conceptual)

| Collection | Purpose |
|------------|---------|
| `events` | Community events; `status`: PENDING → APPROVED \| REJECTED |
| `rsvps` | Per-user RSVP documents |
| `users` | Profile + role (synced with Auth custom claims) |
| `templates` | Event invitation templates (ADMIN write) |

## Event lifecycle

```mermaid
stateDiagram-v2
  [*] --> PENDING: USER creates event
  [*] --> APPROVED: MOD/ADMIN creates (auto-approve)
  PENDING --> APPROVED: MOD/ADMIN approves
  PENDING --> REJECTED: MOD/ADMIN rejects
  APPROVED --> [*]: visible in Explore feed
```

## Root providers (`app/_layout.tsx`)

Order: `SafeAreaProvider` → `ThemeProvider` → `QueryClientProvider` (persisted) → `AuthBootstrap` → `UpdatesBootstrap` → `FluidAuroraBackground` → `OfflineBanner` → Stack/Tabs.

## Optional follow-up

- Publish `domain/` as `@community-connect/core` npm package
- Generate OpenAPI-style YAML from repository interface method signatures
