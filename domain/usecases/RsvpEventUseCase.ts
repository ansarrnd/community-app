import { RSVP } from '../models/Event';
import { IEventRepository } from '../repositories/IEventRepository';

export class RsvpEventUseCase {
  constructor(private eventRepo: IEventRepository) {}

  async execute(eventId: string, userId: string, status: 'ATTENDING' | 'DECLINED'): Promise<RSVP> {
    if (!eventId || !userId) {
      throw new Error('Event ID and User ID are required to submit RSVP.');
    }

    return await this.eventRepo.rsvpToEvent(eventId, userId, status);
  }
}
