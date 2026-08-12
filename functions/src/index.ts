import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { eventSharePage } from './openGraph';
import { whatsappWebhook } from './whatsapp';

if (!admin.apps.length) {
  admin.initializeApp();
}

type AppRole = 'USER' | 'MOD' | 'ADMIN';

/**
 * Callable function: grantRole({ uid, role })
 * Requires caller custom claim role === ADMIN (set via Firebase Auth admin SDK).
 */
export const grantRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerRole = context.auth.token.role as AppRole | undefined;
  if (callerRole !== 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Only administrators can grant roles.');
  }

  const uid = data?.uid as string | undefined;
  const role = data?.role as AppRole | undefined;

  if (!uid || !role || !['USER', 'MOD', 'ADMIN'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Provide uid and role (USER|MOD|ADMIN).');
  }

  await admin.auth().setCustomUserClaims(uid, { role });
  await admin.firestore().collection('users').doc(uid).set({ role }, { merge: true });

  return { success: true, uid, role };
});

export { eventSharePage, whatsappWebhook };
