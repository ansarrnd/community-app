import React, { useEffect } from 'react';
import { RepositoryFactory } from '../../infrastructure/factory/RepositoryFactory';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Hydrates Zustand auth state from IAuthRepository on app boot.
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    RepositoryFactory.getAuthRepository()
      .getCurrentUser()
      .then((user) => {
        if (user) {
          setUser(user);
        }
      })
      .catch((err) => {
        console.warn('[AuthBootstrap] Failed to restore session:', err);
      });
  }, [setUser]);

  return children;
}
