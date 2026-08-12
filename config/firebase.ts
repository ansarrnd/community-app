import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-community-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo-community-app',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-community-app.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
};

export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

const useEmulators = __DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS === 'true';
const appCheckSiteKey = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY;
const appCheckDebugToken = process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN;

// App Check — production ReCaptcha or emulator debug token
if (appCheckDebugToken && __DEV__) {
  (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
    appCheckDebugToken;
}

if (appCheckSiteKey) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
    console.log('[Firebase] App Check initialized (ReCaptcha v3)');
  } catch (e) {
    console.warn('[Firebase] App Check setup failed:', e);
  }
} else if (__DEV__) {
  console.warn(
    '[Firebase] App Check not active — set EXPO_PUBLIC_RECAPTCHA_SITE_KEY (prod) or EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN (dev)'
  );
}

if (useEmulators) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('[Firebase] Connected to emulators (Firestore 8080, Auth 9099, Functions 5001)');
  } catch {
    // Emulator connections already established
  }
}

export function isFirebaseProductionBackend(): boolean {
  return process.env.EXPO_PUBLIC_BACKEND_PROVIDER === 'firebase';
}

export function isAppCheckConfigured(): boolean {
  return Boolean(appCheckSiteKey || appCheckDebugToken);
}
