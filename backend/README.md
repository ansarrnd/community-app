# Community Connect — Go API (startup)

Run-of-the-mill bootstrap backend. Architecture comparison (startup vs enterprise): [docs/BLUEPRINT/10-GO-BACKEND.md](../docs/BLUEPRINT/10-GO-BACKEND.md).

## Run

```bash
cd backend
go test ./...
go run ./cmd/api
```

Listens on `http://127.0.0.1:8088` (override with `HTTP_ADDR`). SQLite file from `DATABASE_URL` (default `file:community.db`).

Demo password for all seeded accounts: `DemoPass123!`

| Role | Email |
|------|--------|
| USER | resident@demo.community |
| MOD | mod@demo.community |
| ADMIN | admin@demo.community |

```bash
curl -s http://127.0.0.1:8088/v1/auth/demo -H 'content-type: application/json' \
  -d '{"role":"ADMIN"}'
```

## Env

| Variable | Default |
|----------|---------|
| `HTTP_ADDR` | `127.0.0.1:8088` |
| `DATABASE_URL` | `file:community.db?_pragma=busy_timeout(5000)&_pragma=foreign_keys(1)` |
| `JWT_SECRET` | `dev-only-change-me` |
| `PUBLIC_SHARE_HOST` | `http://127.0.0.1:8088` |
| `META_WA_VERIFY_TOKEN` | `community-connect-verify-token` |
| `CORS_ORIGIN` | `*` |

## Expo

```
EXPO_PUBLIC_BACKEND_PROVIDER=go
EXPO_PUBLIC_GO_API_URL=http://127.0.0.1:8088
```

On a physical phone, use your machine's LAN IP, not `127.0.0.1`.
