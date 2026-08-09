import { z } from 'zod';

export type UserRole = 'USER' | 'MOD' | 'ADMIN';

export const UserSchema = z.object({
  uid: z.string(),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['USER', 'MOD', 'ADMIN']).default('USER'),
  createdAt: z.string().or(z.date()).optional(),
});

export type User = z.infer<typeof UserSchema>;

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const hierarchy: Record<UserRole, number> = {
    USER: 1,
    MOD: 2,
    ADMIN: 3,
  };
  return hierarchy[userRole] >= hierarchy[requiredRole];
};
