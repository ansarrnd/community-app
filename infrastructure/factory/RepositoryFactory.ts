import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { FirebaseEventRepository } from '../repositories/FirebaseEventRepository';
import { MockEventRepository } from '../repositories/MockEventRepository';

class RepositoryFactoryClass {
  private eventRepoInstance: IEventRepository | null = null;

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
}

export const RepositoryFactory = new RepositoryFactoryClass();
