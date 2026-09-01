import { User, UserRole } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { goFetch } from '../http/goApiClient';

export class GoUserRepository implements IUserRepository {
  async getUserById(uid: string): Promise<User | null> {
    try {
      return await goFetch<User>(`/v1/users/${uid}`);
    } catch {
      return null;
    }
  }

  async createUserProfile(user: User): Promise<User> {
    return user;
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    await goFetch(`/v1/users/${uid}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return goFetch<User[]>('/v1/users');
  }
}
