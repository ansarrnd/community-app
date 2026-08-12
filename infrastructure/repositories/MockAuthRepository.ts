import { User, UserRole } from '../../domain/models/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { MockUserRepository } from './MockUserRepository';

const ROLE_TO_DEMO_UID: Record<UserRole, string> = {
  USER: 'demo-user-resident',
  MOD: 'demo-user-mod',
  ADMIN: 'demo-user-admin',
};

export class MockAuthRepository implements IAuthRepository {
  private currentUser: User | null = null;

  constructor(private userRepo: MockUserRepository = new MockUserRepository()) {}

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  async signInDemoUser(role: UserRole): Promise<User> {
    const uid = ROLE_TO_DEMO_UID[role];
    const user = await this.userRepo.getUserById(uid);
    if (!user) {
      throw new Error(`Demo user for role ${role} is not configured.`);
    }
    this.currentUser = { ...user };
    return { ...this.currentUser };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }

  /** Demo helper — switch active session without full sign-in flow */
  setSessionUser(user: User): void {
    this.currentUser = { ...user };
  }
}
