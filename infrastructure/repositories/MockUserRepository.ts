import { User, UserRole } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

const DEMO_USERS: User[] = [
  {
    uid: 'demo-user-resident',
    phoneNumber: '+15550192834',
    displayName: 'Alex Mercer',
    role: 'USER',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'demo-user-mod',
    phoneNumber: '+15550192835',
    displayName: 'Maya Moderator',
    role: 'MOD',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'demo-user-admin',
    phoneNumber: '+15550192836',
    displayName: 'Arun Administrator',
    role: 'ADMIN',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map(DEMO_USERS.map((u) => [u.uid, { ...u }]));

  async getUserById(uid: string): Promise<User | null> {
    const user = this.users.get(uid);
    return user ? { ...user } : null;
  }

  async createUserProfile(user: User): Promise<User> {
    this.users.set(user.uid, { ...user });
    return { ...user };
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    const user = this.users.get(uid);
    if (!user) {
      throw new Error(`User not found: ${uid}`);
    }
    user.role = newRole;
    this.users.set(uid, user);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).map((u) => ({ ...u }));
  }
}
