import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RepositoryFactory } from '../../infrastructure/factory/RepositoryFactory';
import { CreateEventUseCase } from '../../domain/usecases/CreateEventUseCase';
import { ModerateEventUseCase } from '../../domain/usecases/ModerateEventUseCase';
import { RsvpEventUseCase } from '../../domain/usecases/RsvpEventUseCase';
import { CreateEventInput, EventStatus } from '../../domain/models/Event';
import { UserRole } from '../../domain/models/User';

const eventRepo = RepositoryFactory.getEventRepository();
const createEventUseCase = new CreateEventUseCase(eventRepo);
const moderateEventUseCase = new ModerateEventUseCase(eventRepo);
const rsvpEventUseCase = new RsvpEventUseCase(eventRepo);

export const useApprovedEvents = (categoryFilter?: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ['approvedEvents', categoryFilter, searchQuery],
    queryFn: async () => {
      const page = await eventRepo.getApprovedEvents(categoryFilter, searchQuery);
      return page.items;
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous,
  });
};

export const usePendingEvents = () => {
  return useQuery({
    queryKey: ['pendingEvents'],
    queryFn: () => eventRepo.getPendingEvents(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useEventDetail = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventRepo.getEventById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUserRsvps = (userId: string) => {
  return useQuery({
    queryKey: ['userRsvps', userId],
    queryFn: () => eventRepo.getUserRsvps(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, userRole }: { input: CreateEventInput; userRole: UserRole }) =>
      createEventUseCase.execute(input, userRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
    },
  });
};

export const useModerateEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      status,
      moderatorId,
      moderatorRole,
    }: {
      eventId: string;
      status: EventStatus;
      moderatorId: string;
      moderatorRole: UserRole;
    }) => moderateEventUseCase.execute(eventId, status, moderatorId, moderatorRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
    },
  });
};

export const useRsvpMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      status,
    }: {
      eventId: string;
      userId: string;
      status: 'ATTENDING' | 'DECLINED';
    }) => rsvpEventUseCase.execute(eventId, userId, status),
    onMutate: async ({ eventId, userId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['userRsvps', userId] });
      const previousRsvps = queryClient.getQueryData(['userRsvps', userId]);
      queryClient.setQueryData(['userRsvps', userId], (old: Record<string, 'ATTENDING' | 'DECLINED'> = {}) => ({
        ...old,
        [eventId]: status,
      }));
      return { previousRsvps };
    },
    onError: (_err, { userId }, context) => {
      if (context?.previousRsvps) {
        queryClient.setQueryData(['userRsvps', userId], context.previousRsvps);
      }
    },
    onSettled: (_data, _error, { userId, eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['userRsvps', userId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['approvedEvents'] });
    },
  });
};
