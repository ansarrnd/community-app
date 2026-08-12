import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { FirebaseEventRepository } from '../repositories/FirebaseEventRepository';
import { MockEventRepository } from '../repositories/MockEventRepository';
import { MockUserRepository } from '../repositories/MockUserRepository';
import { MockAuthRepository } from '../repositories/MockAuthRepository';

class RepositoryFactoryClass {
  private eventRepoInstance: IEventRepository | null = null;
  private userRepoInstance: MockUserRepository | null = null;
  private authRepoInstance: MockAuthRepository | null = null;

  getEventRepository(): IEventRepository {
    if (!this.eventRepoInstance) {
      const provider = process.env.EXPO_PUBLIC_BACKEND_PROVIDER || 'mock';
      if (provider === 'firebase') {
        this.eventRepoInstance = new FirebaseEventRepository();
      } else {
        this.eventRepoInstance = new MockEventRepository();
      }
    }
    return this.eventRepoInstance;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepoInstance) {
      this.userRepoInstance = new MockUserRepository();
    }
    return this.userRepoInstance;
  }

  getAuthRepository(): IAuthRepository {
    if (!this.authRepoInstance) {
      this.authRepoInstance = new MockAuthRepository(this.userRepoInstance ?? new MockUserRepository());
    }
    return this.authRepoInstance;
  }
}

export const RepositoryFactory = new RepositoryFactoryClass();
