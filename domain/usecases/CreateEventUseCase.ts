import { CommunityEvent, CreateEventInput, CreateEventInputSchema } from '../models/Event';
import { UserRole, hasPermission } from '../models/User';
import { IEventRepository } from '../repositories/IEventRepository';

export class CreateEventUseCase {
  constructor(private eventRepo: IEventRepository) {}

  async execute(input: CreateEventInput, userRole: UserRole): Promise<CommunityEvent> {
    const validatedInput = CreateEventInputSchema.parse(input);
    const isAutoApproved = hasPermission(userRole, 'MOD');
    const createdEvent = await this.eventRepo.createEvent(validatedInput);

    if (isAutoApproved) {
      await this.eventRepo.updateEventStatus(createdEvent.id, 'APPROVED', validatedInput.organizerId);
      createdEvent.status = 'APPROVED';
    }

    return createdEvent;
  }
}
