import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import { AuthBootstrap } from '../../application/providers/AuthBootstrap';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { MockAuthRepository } from '../../infrastructure/repositories/MockAuthRepository';
import { MockUserRepository } from '../../infrastructure/repositories/MockUserRepository';
import { RepositoryFactory } from '../../infrastructure/factory/RepositoryFactory';

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

describe('AuthBootstrap integration', () => {
  let authRepo: MockAuthRepository;

  beforeEach(() => {
    authRepo = new MockAuthRepository(new MockUserRepository());
    (RepositoryFactory as unknown as { authRepoInstance: MockAuthRepository | null }).authRepoInstance =
      authRepo;
    useAuthStore.getState().setUser({
      uid: 'demo-user-admin',
      phoneNumber: '+15550192836',
      displayName: 'Arun Administrator',
      role: 'ADMIN',
    });
  });

  it('updates auth store when subscribeAuthState receives a signed-in user', async () => {
    render(
      <AuthBootstrap>
        <Text testID="boot-child">ready</Text>
      </AuthBootstrap>
    );

    await authRepo.signInDemoUser('MOD');

    await waitFor(() => {
      expect(useAuthStore.getState().user.role).toBe('MOD');
      expect(useAuthStore.getState().user.uid).toBe('demo-user-mod');
    });
  });
});
