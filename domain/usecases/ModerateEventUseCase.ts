import { EventStatus } from '../models/Event';
import { UserRole, hasPermission } from '../models/User';
import { IEventRepository } from '../repositories/IEventRepository';

export class ModerateEventUseCase {
  constructor(private eventRepo: IEventRepository) {}

  async execute(eventId: string, status: EventStatus, moderatorId: string, moderatorRole: UserRole): Promise<void> {
    // Role Governance Check: Only MOD or ADMIN roles can moderate events
    if (!hasPermission(moderatorRole, 'MOD')) {
      throw new Error('Unauthorized: Only Moderators or Administrators can approve/reject community events.');
    }

    await this.eventRepo.updateEventStatus(eventId, status, moderatorId);
  }
}
