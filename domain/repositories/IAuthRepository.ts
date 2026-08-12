import { User, UserRole } from '../models/User';

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  signInDemoUser(role: UserRole): Promise<User>;
  signOut(): Promise<void>;
  /** Firebase: live auth state; Mock: no-op unsubscribe */
  subscribeAuthState?(listener: (user: User | null) => void): () => void;
}
