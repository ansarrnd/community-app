import { useAuthStore } from '../../application/stores/useAuthStore';
import { useFilterStore } from '../../application/stores/useFilterStore';
import { useRoleGuard } from '../../application/hooks/useRoleGuard';
import { renderHook } from '@testing-library/react-native';

describe('Application Stores & Custom Hooks Unit Tests', () => {
  describe('useAuthStore', () => {
    it('initializes with default demo admin user', () => {
      const state = useAuthStore.getState();
      expect(state.user.uid).toBe('demo-user-admin');
      expect(state.user.displayName).toBe('Arun Administrator');
      expect(state.user.role).toBe('ADMIN');
    });

    it('updates role when setRole is called', () => {
      useAuthStore.getState().setRole('USER');
      expect(useAuthStore.getState().user.role).toBe('USER');

      useAuthStore.getState().setRole('MOD');
      expect(useAuthStore.getState().user.role).toBe('MOD');
    });

    it('updates user object when setUser is called', () => {
      const newUser = {
        uid: 'user-new-99',
        phoneNumber: '+19998887777',
        displayName: 'Sam Wilson',
        role: 'USER' as const,
      };

      useAuthStore.getState().setUser(newUser);
      expect(useAuthStore.getState().user).toEqual(newUser);
    });
  });

  describe('useFilterStore', () => {
    it('initializes with default category ALL and empty searchQuery', () => {
      const state = useFilterStore.getState();
      expect(state.category).toBe('ALL');
      expect(state.searchQuery).toBe('');
    });

    it('updates category when setCategory is called', () => {
      useFilterStore.getState().setCategory('MARRIAGE');
      expect(useFilterStore.getState().category).toBe('MARRIAGE');
    });

    it('updates searchQuery when setSearchQuery is called', () => {
      useFilterStore.getState().setSearchQuery('Diwali');
      expect(useFilterStore.getState().searchQuery).toBe('Diwali');
    });
  });

  describe('useRoleGuard hook logic', () => {
    it('returns isMod=true and isAdmin=true for ADMIN user', () => {
      useAuthStore.getState().setRole('ADMIN');
      const { result } = renderHook(() => useRoleGuard());

      expect(result.current.userRole).toBe('ADMIN');
      expect(result.current.isUser).toBe(true);
      expect(result.current.isMod).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.canAccess('MOD')).toBe(true);
      expect(result.current.canAccess('ADMIN')).toBe(true);
    });

    it('returns isMod=true and isAdmin=false for MOD user', () => {
      useAuthStore.getState().setRole('MOD');
      const { result } = renderHook(() => useRoleGuard());

      expect(result.current.userRole).toBe('MOD');
      expect(result.current.isMod).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.canAccess('MOD')).toBe(true);
      expect(result.current.canAccess('ADMIN')).toBe(false);
    });

    it('returns isMod=false and isAdmin=false for standard USER', () => {
      useAuthStore.getState().setRole('USER');
      const { result } = renderHook(() => useRoleGuard());

      expect(result.current.userRole).toBe('USER');
      expect(result.current.isMod).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.canAccess('MOD')).toBe(false);
      expect(result.current.canAccess('ADMIN')).toBe(false);
    });
  });
});
