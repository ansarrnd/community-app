/**
 * Validates local Firebase emulator Firestore flows used by the web app.
 * Requires emulators running on 127.0.0.1 (npm run emulators) and seeded data.
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-community-app';
const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';

const [fsHost, fsPort] = FIRESTORE_HOST.split(':');
const authUrl = AUTH_HOST.startsWith('http') ? AUTH_HOST : `http://${AUTH_HOST}`;

const app = initializeApp({
  apiKey: 'demo-api-key',
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
});
const db = getFirestore(app);
const auth = getAuth(app);
connectFirestoreEmulator(db, fsHost, Number(fsPort));
connectAuthEmulator(auth, authUrl, { disableWarnings: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function restListEvents() {
  const url = `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/events`;
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer owner' },
  });
  assert(res.ok, `Emulator REST list failed: ${res.status}`);
  const body = await res.json();
  return body.documents ?? [];
}

async function restPatchEventTitle(docPath, title) {
  const url = `http://${FIRESTORE_HOST}/v1/${docPath}?updateMask.fieldPaths=title`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields: { title: { stringValue: title } } }),
  });
  assert(res.ok, `Emulator REST patch failed: ${res.status} ${await res.text()}`);
}

async function main() {
  console.log('[validate] Checking Emulator UI…');
  const ui = await fetch('http://127.0.0.1:4000');
  assert(ui.ok, `Emulator UI not reachable at 127.0.0.1:4000 (${ui.status})`);
  console.log('[validate] Emulator UI OK');

  const restEvents = await restListEvents();
  assert(restEvents.length >= 2, `Expected at least 2 seeded events, got ${restEvents.length}`);
  console.log(`[validate] REST listed ${restEvents.length} events`);

  await signInWithEmailAndPassword(auth, 'resident@demo.community', 'DemoPass123!');
  const approvedSnap = await getDocs(
    query(collection(db, 'events'), where('status', '==', 'APPROVED'), orderBy('createdAt', 'desc'))
  );
  assert(approvedSnap.size >= 1, 'Feed: expected at least one APPROVED event');
  const approved = approvedSnap.docs[0];
  console.log(`[validate] Feed OK — approved "${approved.data().title}" (${approved.id})`);

  await signInWithEmailAndPassword(auth, 'resident@demo.community', 'DemoPass123!');
  const created = await addDoc(collection(db, 'events'), {
    title: `Validation pending ${Date.now()}`,
    category: 'CULTURAL',
    date: '2026-12-15',
    time: '07:00 PM',
    venue: 'Validation Hall',
    details: 'Created by validate-emulator-firestore.mjs',
    organizerId: auth.currentUser.uid,
    organizerName: 'Alex Mercer',
    status: 'PENDING',
    rsvpCount: 0,
    attendingCount: 0,
    declinedCount: 0,
    version: 1,
    createdAt: new Date().toISOString(),
  });
  console.log(`[validate] Created pending event ${created.id}`);

  await signOut(auth);
  await signInWithEmailAndPassword(auth, 'mod@demo.community', 'DemoPass123!');
  const pendingSnap = await getDocs(
    query(collection(db, 'events'), where('status', '==', 'PENDING'), orderBy('createdAt', 'desc'))
  );
  assert(pendingSnap.size >= 1, 'Moderation: expected at least one PENDING event');
  const pending = pendingSnap.docs.find((d) => d.id === created.id) ?? pendingSnap.docs[0];
  await updateDoc(doc(db, 'events', pending.id), {
    status: 'APPROVED',
    moderatedBy: auth.currentUser.uid,
    updatedAt: serverTimestamp(),
  });
  const afterMod = await getDocs(
    query(collection(db, 'events'), where('status', '==', 'PENDING'), orderBy('createdAt', 'desc'))
  );
  assert(afterMod.size === pendingSnap.size - 1, 'Moderation: pending count should drop after approve');
  console.log(`[validate] Moderation OK — approved pending event ${pending.id}`);

  await signOut(auth);
  await signInWithEmailAndPassword(auth, 'resident@demo.community', 'DemoPass123!');
  const userId = auth.currentUser.uid;
  const eventId = approved.id;
  const eventRef = doc(db, 'events', eventId);
  const rsvpRef = doc(db, 'rsvps', `${eventId}_${userId}`);
  await runTransaction(db, async (transaction) => {
    const eventSnap = await transaction.get(eventRef);
    const data = eventSnap.data();
    transaction.update(eventRef, {
      rsvpCount: Number(data.rsvpCount ?? 0) + 1,
      attendingCount: Number(data.attendingCount ?? 0) + 1,
      updatedAt: serverTimestamp(),
    });
    transaction.set(rsvpRef, {
      eventId,
      userId,
      status: 'ATTENDING',
      timestamp: serverTimestamp(),
    });
  });
  const rsvpSnap = await getDocs(query(collection(db, 'rsvps'), where('userId', '==', userId)));
  assert(rsvpSnap.size >= 1, 'RSVP: expected rsvps document for resident');
  console.log(`[validate] RSVP OK — ${rsvpSnap.size} RSVP(s) for ${userId}`);

  const editedTitle = `Edited via Emulator REST ${Date.now()}`;
  await restPatchEventTitle(
    `projects/${PROJECT_ID}/databases/(default)/documents/events/${approved.id}`,
    editedTitle
  );
  const refreshed = await getDoc(eventRef);
  assert(refreshed.data().title === editedTitle, `Expected title "${editedTitle}", got "${refreshed.data().title}"`);
  console.log(`[validate] Emulator UI-style edit OK — title is now "${editedTitle}"`);

  console.log('[validate] All Firestore emulator checks passed (private, $0).');
  process.exit(0);
}

main().catch((err) => {
  console.error('[validate] FAILED:', err);
  process.exit(1);
});
