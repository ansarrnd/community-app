import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { User, UserRole } from '../../domain/models/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { DEMO_CREDENTIALS_BY_ROLE } from '../config/demoAuthCredentials';
import { FirebaseUserRepository } from './FirebaseUserRepository';

export class FirebaseAuthRepository implements IAuthRepository {
  constructor(private userRepo: FirebaseUserRepository = new FirebaseUserRepository()) {}

  subscribeAuthState(listener: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        listener(null);
        return;
      }
      listener(await this.mapFirebaseUser(firebaseUser));
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    return this.mapFirebaseUser(firebaseUser);
  }

  async signInDemoUser(role: UserRole): Promise<User> {
    const credentials = DEMO_CREDENTIALS_BY_ROLE[role];
    const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    await this.ensureUserProfile(result.user, credentials.role);
    return this.mapFirebaseUser(result.user);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  private async mapFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
    const tokenResult = await firebaseUser.getIdTokenResult();
    const claimRole = tokenResult.claims.role as UserRole | undefined;

    const profile = await this.userRepo.getUserById(firebaseUser.uid);
    const role = claimRole ?? profile?.role ?? 'USER';

    return {
      uid: firebaseUser.uid,
      phoneNumber: profile?.phoneNumber ?? firebaseUser.phoneNumber ?? '',
      displayName: profile?.displayName ?? firebaseUser.displayName ?? 'Community Member',
      role,
      createdAt: profile?.createdAt,
    };
  }

  private async ensureUserProfile(firebaseUser: FirebaseUser, role: UserRole): Promise<void> {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const cred = Object.values(DEMO_CREDENTIALS_BY_ROLE).find((c) => c.uid === firebaseUser.uid);
      await setDoc(ref, {
        phoneNumber: cred?.phoneNumber ?? '',
        displayName: cred?.displayName ?? firebaseUser.displayName ?? 'Community Member',
        role,
        createdAt: new Date().toISOString(),
      });
    }
  }
}
