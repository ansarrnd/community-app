import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { FirebaseEventRepository } from '../repositories/FirebaseEventRepository';
import { MockEventRepository } from '../repositories/MockEventRepository';
import { MockUserRepository } from '../repositories/MockUserRepository';
import { MockAuthRepository } from '../repositories/MockAuthRepository';
import { FirebaseUserRepository } from '../repositories/FirebaseUserRepository';
import { FirebaseAuthRepository } from '../repositories/FirebaseAuthRepository';
import { GoEventRepository } from '../repositories/GoEventRepository';
import { GoUserRepository } from '../repositories/GoUserRepository';
import { GoAuthRepository } from '../repositories/GoAuthRepository';

function provider(): string {
  return process.env.EXPO_PUBLIC_BACKEND_PROVIDER || 'mock';
}

class RepositoryFactoryClass {
  private eventRepoInstance: IEventRepository | null = null;
  private userRepoInstance: IUserRepository | null = null;
  private authRepoInstance: IAuthRepository | null = null;

  getEventRepository(): IEventRepository {
    if (!this.eventRepoInstance) {
      if (provider() === 'firebase') {
        this.eventRepoInstance = new FirebaseEventRepository();
      } else if (provider() === 'go') {
        this.eventRepoInstance = new GoEventRepository();
      } else {
        this.eventRepoInstance = new MockEventRepository();
      }
    }
    return this.eventRepoInstance;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepoInstance) {
      if (provider() === 'firebase') {
        this.userRepoInstance = new FirebaseUserRepository();
      } else if (provider() === 'go') {
        this.userRepoInstance = new GoUserRepository();
      } else {
        this.userRepoInstance = new MockUserRepository();
      }
    }
    return this.userRepoInstance;
  }

  getAuthRepository(): IAuthRepository {
    if (!this.authRepoInstance) {
      if (provider() === 'firebase') {
        const userRepo = this.getUserRepository() as FirebaseUserRepository;
        this.authRepoInstance = new FirebaseAuthRepository(userRepo);
      } else if (provider() === 'go') {
        this.authRepoInstance = new GoAuthRepository();
      } else {
        const userRepo = this.getUserRepository() as MockUserRepository;
        this.authRepoInstance = new MockAuthRepository(userRepo);
      }
    }
    return this.authRepoInstance;
  }
}

export const RepositoryFactory = new RepositoryFactoryClass();
