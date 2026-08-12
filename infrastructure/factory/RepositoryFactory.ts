import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { FirebaseEventRepository } from '../repositories/FirebaseEventRepository';
import { MockEventRepository } from '../repositories/MockEventRepository';
import { MockUserRepository } from '../repositories/MockUserRepository';
import { MockAuthRepository } from '../repositories/MockAuthRepository';
import { FirebaseUserRepository } from '../repositories/FirebaseUserRepository';
import { FirebaseAuthRepository } from '../repositories/FirebaseAuthRepository';

function isFirebaseProvider(): boolean {
  return process.env.EXPO_PUBLIC_BACKEND_PROVIDER === 'firebase';
}

class RepositoryFactoryClass {
  private eventRepoInstance: IEventRepository | null = null;
  private userRepoInstance: IUserRepository | null = null;
  private authRepoInstance: IAuthRepository | null = null;

  getEventRepository(): IEventRepository {
    if (!this.eventRepoInstance) {
      if (isFirebaseProvider()) {
        this.eventRepoInstance = new FirebaseEventRepository();
      } else {
        this.eventRepoInstance = new MockEventRepository();
      }
    }
    return this.eventRepoInstance;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepoInstance) {
      if (isFirebaseProvider()) {
        this.userRepoInstance = new FirebaseUserRepository();
      } else {
        this.userRepoInstance = new MockUserRepository();
      }
    }
    return this.userRepoInstance;
  }

  getAuthRepository(): IAuthRepository {
    if (!this.authRepoInstance) {
      if (isFirebaseProvider()) {
        const userRepo = this.getUserRepository() as FirebaseUserRepository;
        this.authRepoInstance = new FirebaseAuthRepository(userRepo);
      } else {
        const userRepo = this.getUserRepository() as MockUserRepository;
        this.authRepoInstance = new MockAuthRepository(userRepo);
      }
    }
    return this.authRepoInstance;
  }
}

export const RepositoryFactory = new RepositoryFactoryClass();
