const mockOnAuthStateChanged = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetIdTokenResult = jest.fn();

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../../config/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

import { FirebaseAuthRepository } from '../../infrastructure/repositories/FirebaseAuthRepository';
import { FirebaseUserRepository } from '../../infrastructure/repositories/FirebaseUserRepository';
import { DEMO_CREDENTIALS_BY_ROLE } from '../../infrastructure/config/demoAuthCredentials';

describe('FirebaseAuthRepository', () => {
  let userRepo: FirebaseUserRepository;
  let authRepo: FirebaseAuthRepository;

  beforeEach(() => {
    userRepo = {
      getUserById: jest.fn(),
    } as unknown as FirebaseUserRepository;
    authRepo = new FirebaseAuthRepository(userRepo);
    mockOnAuthStateChanged.mockReset();
    mockSignInWithEmailAndPassword.mockReset();
    mockSignOut.mockReset();
    mockGetIdTokenResult.mockReset();
  });

  it('registers subscribeAuthState via onAuthStateChanged', () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const listener = jest.fn();
    const returned = authRepo.subscribeAuthState(listener);

    expect(mockOnAuthStateChanged).toHaveBeenCalled();
    expect(returned).toBe(unsubscribe);
  });

  it('signs in demo users with email/password credentials', async () => {
    const adminCred = DEMO_CREDENTIALS_BY_ROLE.ADMIN;
    const firebaseUser = {
      uid: adminCred.uid,
      displayName: adminCred.displayName,
      phoneNumber: adminCred.phoneNumber,
      getIdTokenResult: mockGetIdTokenResult,
    };

    mockSignInWithEmailAndPassword.mockResolvedValue({ user: firebaseUser });
    mockGetIdTokenResult.mockResolvedValue({ claims: { role: 'ADMIN' } });
    (userRepo.getUserById as jest.Mock).mockResolvedValue({
      uid: adminCred.uid,
      displayName: adminCred.displayName,
      phoneNumber: adminCred.phoneNumber,
      role: 'ADMIN',
    });

    const { getDoc, setDoc } = jest.requireMock('firebase/firestore');
    getDoc.mockResolvedValue({ exists: () => true });

    const user = await authRepo.signInDemoUser('ADMIN');

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      adminCred.email,
      adminCred.password
    );
    expect(user.role).toBe('ADMIN');
    expect(setDoc).not.toHaveBeenCalled();
  });
});
