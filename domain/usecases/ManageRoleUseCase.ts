import { UserRole, hasPermission } from '../models/User';
import { IUserRepository } from '../repositories/IUserRepository';

export class ManageRoleUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(
    actorRole: UserRole,
    targetUid: string,
    newRole: UserRole,
    actorUid?: string
  ): Promise<void> {
    if (!hasPermission(actorRole, 'ADMIN')) {
      throw new Error('Unauthorized: Only administrators can change user roles.');
    }

    if (actorUid && actorUid === targetUid && newRole !== 'ADMIN') {
      throw new Error('Administrators cannot demote their own account.');
    }

    await this.userRepo.updateUserRole(targetUid, newRole);
  }
}
