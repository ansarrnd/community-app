import { RelationshipRepository } from '../database/RelationshipRepository';
import { FirebaseKinshipRepository } from '../database/FirebaseKinshipRepository';
import { KinshipModuleConfig, defaultConfig } from '../config/kinshipOptions';

class KinshipRepositoryFactoryClass {
  private localRepoInstance: RelationshipRepository | null = null;
  private firebaseRepoInstance: FirebaseKinshipRepository | null = null;

  public getRepository(config: KinshipModuleConfig = defaultConfig): RelationshipRepository | FirebaseKinshipRepository {
    const provider = process.env.EXPO_PUBLIC_BACKEND_PROVIDER || 'mock';

    if (provider === 'firebase') {
      if (!this.firebaseRepoInstance) {
        this.firebaseRepoInstance = new FirebaseKinshipRepository(config);
      }
      return this.firebaseRepoInstance;
    }

    if (!this.localRepoInstance) {
      this.localRepoInstance = new RelationshipRepository(config);
    }
    return this.localRepoInstance;
  }
}

export const KinshipRepositoryFactory = new KinshipRepositoryFactoryClass();
