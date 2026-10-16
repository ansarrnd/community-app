# Security review summary

## Findings

### 1) WhatsApp webhook accepted unverified POST requests
- Severity: High
- File: `functions/src/whatsapp.ts`
- Issue: The webhook endpoint accepted incoming Meta POST traffic without validating the `X-Hub-Signature-256` header. Any attacker who can reach the Cloud Function endpoint could forge payloads and append bogus inbound WhatsApp messages to Firestore.
- Fix: Require `META_WA_APP_SECRET`, verify the request signature against the raw request body, and reject invalid or missing signatures before writing any data.

### 2) Meta WhatsApp credentials were treated like public app config
- Severity: High
- File: `infrastructure/services/metaWhatsAppCloudService.ts`
- Issue: The service used public Expo environment variables for the WhatsApp access token and phone number configuration. Because `EXPO_PUBLIC_*` values are embedded in the client bundle, they can be exposed to browser users or extracted from the app bundle.
- Fix: Use server-only environment variables (`META_WA_*`) and fail closed when running in browser contexts.

### 3) Demo auth secrets were committed in source files
- Severity: Medium
- File: `infrastructure/config/demoAuthCredentials.ts`
- Issue: Known demo credentials were hardcoded in the repository. While intended for emulator-only use, they are still credentials in version control and increase the risk of accidental reuse in other environments.
- Fix: Source the demo password from environment variables and keep emulator credentials as clearly non-production values.

## Validation
- `npm run type-check -- --pretty false`
- `cd functions && npm run build -- --pretty false`

## Notes
The repository still contains a transitive package audit issue in the Expo toolchain (`@expo/cli` → `node-forge`), which should be addressed in a broader dependency upgrade project rather than as a local runtime fix.
