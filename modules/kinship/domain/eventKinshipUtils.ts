import { EventMemberInput, EventRelationshipInput, Person, Relationship } from './types';
import { RelationshipRepository } from '../database/RelationshipRepository';

export interface ProcessEventKinshipResult {
  addedPersons: Person[];
  addedRelationships: Relationship[];
}

export async function processEventKinshipPayload(
  organizerId: string,
  attachedMembers: EventMemberInput[] = [],
  attachedRelationships: EventRelationshipInput[] = [],
  kinshipRepo: RelationshipRepository
): Promise<ProcessEventKinshipResult> {
  const addedPersons: Person[] = [];
  const addedRelationships: Relationship[] = [];

  const personIdMap = new Map<string, string>(); // fullName -> personId

  // 1. Process and insert attached members
  for (const member of attachedMembers) {
    const personId = member.personId || `person_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    personIdMap.set(member.fullName.toLowerCase(), personId);

    const person: Person = {
      id: personId,
      fullName: member.fullName,
      gender: member.gender || 'M',
      currentLocationTag: member.contextTag || 'In-Village',
      phone: member.phone,
      notes: member.roleInEvent ? `Attached to Event (Role: ${member.roleInEvent})` : undefined,
    };

    await kinshipRepo.addPerson(person);
    addedPersons.push(person);

    // If a relationship to organizer is specified, create relationship payload
    if (member.relationshipTypeToOrganizer) {
      const rels = await kinshipRepo.addRelationship(
        organizerId,
        personId,
        member.relationshipTypeToOrganizer,
        member.contextTag || 'In-Village'
      );
      addedRelationships.push(...rels);
    }
  }

  // 2. Process explicit relationships between event members/organizer
  for (const relInput of attachedRelationships) {
    let sourceId = relInput.sourcePersonId;
    let targetId = relInput.targetPersonId;

    if (!sourceId && relInput.sourcePersonName) {
      sourceId = personIdMap.get(relInput.sourcePersonName.toLowerCase()) || organizerId;
    }
    if (!targetId && relInput.targetPersonName) {
      targetId = personIdMap.get(relInput.targetPersonName.toLowerCase());
    }

    if (sourceId && targetId) {
      const rels = await kinshipRepo.addRelationship(
        sourceId,
        targetId,
        relInput.relationshipType,
        relInput.contextTag || 'In-Village'
      );
      addedRelationships.push(...rels);
    }
  }

  return { addedPersons, addedRelationships };
}
