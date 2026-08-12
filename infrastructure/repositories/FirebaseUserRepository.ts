import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User, UserRole } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { callGrantRole } from '../services/grantRoleService';

export class FirebaseUserRepository implements IUserRepository {
  private usersCollection = collection(db, 'users');

  async getUserById(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return this.mapDoc(uid, snap.data() as Record<string, unknown>);
  }

  async createUserProfile(user: User): Promise<User> {
    await setDoc(doc(db, 'users', user.uid), {
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt ?? new Date().toISOString(),
    });
    return { ...user };
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    await callGrantRole(uid, newRole);
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(this.usersCollection);
    return snapshot.docs.map((docSnap) => this.mapDoc(docSnap.id, docSnap.data() as Record<string, unknown>));
  }

  private mapDoc(uid: string, data: Record<string, unknown>): User {
    return {
      uid,
      phoneNumber: String(data.phoneNumber ?? ''),
      displayName: String(data.displayName ?? 'Community Member'),
      role: (data.role as UserRole) ?? 'USER',
      createdAt: data.createdAt ? String(data.createdAt) : undefined,
    };
  }
}
