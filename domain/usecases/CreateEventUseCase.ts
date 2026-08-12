import { CommunityEvent, CreateEventInput, CreateEventInputSchema } from '../models/Event';
import { UserRole, hasPermission } from '../models/User';
import { IEventRepository } from '../repositories/IEventRepository';
import {
  RelationshipRepository,
  processEventKinshipPayload,
  EventMemberInput,
  EventRelationshipInput,
} from '../../modules/kinship';

export class CreateEventUseCase {
  constructor(
    private eventRepo: IEventRepository,
    private kinshipRepo?: RelationshipRepository
  ) {}

  async execute(input: CreateEventInput, userRole: UserRole): Promise<CommunityEvent> {
    // 1. Validate Input Schema with Zod
    const validatedInput = CreateEventInputSchema.parse(input);

    // 2. Determine initial status based on role governance
    // Moderators and Admins get auto-approved events; Residents submit as PENDING
    const isAutoApproved = hasPermission(userRole, 'MOD');

    // 3. Delegate creation to repository
    const createdEvent = await this.eventRepo.createEvent(validatedInput);

    if (isAutoApproved) {
      await this.eventRepo.updateEventStatus(createdEvent.id, 'APPROVED', validatedInput.organizerId);
      createdEvent.status = 'APPROVED';
    }

    // 4. Process and insert event members and kinship relationships if provided
    if (this.kinshipRepo && (validatedInput.attachedMembers?.length || validatedInput.attachedRelationships?.length)) {
      const members = (validatedInput.attachedMembers ?? [])
        .filter((member): member is typeof member & { fullName: string } => Boolean(member.fullName?.trim()))
        .map(
          (member): EventMemberInput => ({
            personId: member.personId,
            fullName: member.fullName,
            gender: member.gender,
            roleInEvent: member.roleInEvent,
            relationshipTypeToOrganizer: member.relationshipTypeToOrganizer,
            contextTag: member.contextTag,
            phone: member.phone,
          })
        );
      const relationships = (validatedInput.attachedRelationships ?? []).map(
        (rel): EventRelationshipInput => ({
          sourcePersonId: rel.sourcePersonId,
          sourcePersonName: rel.sourcePersonName,
          targetPersonId: rel.targetPersonId,
          targetPersonName: rel.targetPersonName,
          relationshipType: rel.relationshipType,
          contextTag: rel.contextTag,
        })
      );

      await processEventKinshipPayload(
        validatedInput.organizerId,
        members,
        relationships,
        this.kinshipRepo
      );
    }

    return createdEvent;
  }
}

