import { useAuthStore } from '../stores/useAuthStore';
import { UserRole, hasPermission } from '../../domain/models/User';

export const useRoleGuard = () => {
  const user = useAuthStore((state) => state.user);

  const canAccess = (requiredRole: UserRole): boolean => {
    return hasPermission(user.role, requiredRole);
  };

  return {
    userRole: user.role,
    isUser: true,
    isMod: canAccess('MOD'),
    isAdmin: canAccess('ADMIN'),
    canAccess,
  };
};
