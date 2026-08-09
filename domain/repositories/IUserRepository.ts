import { User, UserRole } from '../models/User';

export interface IUserRepository {
  getUserById(uid: string): Promise<User | null>;
  createUserProfile(user: User): Promise<User>;
  updateUserRole(uid: string, newRole: UserRole): Promise<void>;
  getAllUsers(): Promise<User[]>;
}
