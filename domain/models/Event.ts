import { z } from 'zod';

export type EventCategory = 'MARRIAGE' | 'CULTURAL' | 'MEETING';
export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const CreateEventInputSchema = z.object({
  title: z.string().min(3, 'Event title is required (min 3 characters)'),
  category: z.enum(['MARRIAGE', 'CULTURAL', 'MEETING']),
  date: z.string().min(1, 'Event date is required'),
  time: z.string().min(1, 'Event time is required'),
  venue: z.string().min(3, 'Venue location is required'),
  googleMapsUrl: z.string().url('Must be a valid Google Maps URL').or(z.literal('')).optional(),
  details: z.string().min(10, 'Event description must be at least 10 characters'),
  inviteCardUrl: z.string().optional(),
  organizerId: z.string(),
  organizerName: z.string().optional(),
  // Template dynamic variables
  groomName: z.string().optional(),
  brideName: z.string().optional(),
  agenda: z.string().optional(),
  // Kinship network event member attachment options
  attachedMembers: z
    .array(
      z.object({
        personId: z.string().optional(),
        fullName: z.string().min(1, 'Member name is required'),
        gender: z.enum(['M', 'F']).optional(),
        roleInEvent: z.string().optional(),
        relationshipTypeToOrganizer: z.string().optional(),
        contextTag: z.enum(['In-Village', 'Out-Village']).optional(),
        phone: z.string().optional(),
      })
    )
    .optional(),
  attachedRelationships: z
    .array(
      z.object({
        sourcePersonId: z.string().optional(),
        sourcePersonName: z.string().optional(),
        targetPersonId: z.string().optional(),
        targetPersonName: z.string().optional(),
        relationshipType: z.string(),
        contextTag: z.enum(['In-Village', 'Out-Village']).optional(),
      })
    )
    .optional(),
});


export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

export const EventSchema = CreateEventInputSchema.extend({
  id: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
  rsvpCount: z.number().default(0),
  attendingCount: z.number().default(0),
  declinedCount: z.number().default(0),
  version: z.number().default(1),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});

export type CommunityEvent = z.infer<typeof EventSchema>;

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'ATTENDING' | 'DECLINED';
  timestamp: string;
}

export interface EventTemplate {
  id: string;
  category: EventCategory;
  templateText: string;
  variables: string[];
}
