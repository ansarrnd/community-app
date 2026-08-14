/**
 * Generate .env.example from documented EXPO_PUBLIC_* variables.
 * Run: node scripts/export-env-example.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.env.example');

const content = `# Community Connect — environment variables
# Copy to .env.local or set in EAS / CI. Expo exposes EXPO_PUBLIC_* to the client bundle.

# --- Backend provider ---
# mock (default) | firebase
# For private $0 local testing, copy these two lines into .env.local:
#   EXPO_PUBLIC_BACKEND_PROVIDER=firebase
#   EXPO_PUBLIC_USE_EMULATORS=true
# That uses Firebase emulators on 127.0.0.1. No Firebase account, credit card, or cloud project required.
EXPO_PUBLIC_BACKEND_PROVIDER=

# Firebase client (required when BACKEND_PROVIDER=firebase against a cloud project)
# Leave unset for emulators — config/firebase.ts falls back to demo-community-app.
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Use local Firebase emulators (dev only). Must be true for the $0 private workflow.
EXPO_PUBLIC_USE_EMULATORS=false

# App Check (production: reCAPTCHA; dev: debug token)
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=
EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN=

# --- UI (optional) ---
# Use Skia aurora background instead of LinearGradient
EXPO_PUBLIC_USE_SKIA_AURORA=false

# --- Meta WhatsApp Cloud API (optional admin broadcast) ---
EXPO_PUBLIC_META_WA_PHONE_NUMBER_ID=
EXPO_PUBLIC_META_WA_ACCESS_TOKEN=
EXPO_PUBLIC_META_WA_API_VERSION=v21.0
EXPO_PUBLIC_META_WA_SUBSCRIBER_PHONES=

# --- Server / seed only (not EXPO_PUBLIC — set in shell for scripts) ---
# FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
# FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
`;

writeFileSync(OUT, content);
console.log(`[export-env-example] Written ${OUT}`);
