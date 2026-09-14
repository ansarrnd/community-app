import { User, UserRole } from '../../domain/models/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { goFetch, setGoApiToken } from '../http/goApiClient';

export class GoAuthRepository implements IAuthRepository {
  private currentUser: User | null = null;
  private authListeners: Array<(user: User | null) => void> = [];

  subscribeAuthState(listener: (user: User | null) => void): () => void {
    this.authListeners.push(listener);
    listener(this.currentUser ? { ...this.currentUser } : null);
    return () => {
      this.authListeners = this.authListeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const snapshot = this.currentUser ? { ...this.currentUser } : null;
    this.authListeners.forEach((l) => l(snapshot));
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await goFetch<User>('/v1/me');
      this.currentUser = user;
      this.notify();
      return { ...user };
    } catch {
      this.currentUser = null;
      return null;
    }
  }

  async signInDemoUser(role: UserRole): Promise<User> {
    const session = await goFetch<{ token: string; user: User }>('/v1/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    setGoApiToken(session.token);
    this.currentUser = session.user;
    this.notify();
    return { ...session.user };
  }

  async signOut(): Promise<void> {
    setGoApiToken(null);
    this.currentUser = null;
    this.notify();
  }
}
