import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEventDetail, useRsvpMutation } from '../../application/hooks/useEventsQuery';

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

describe('RSVP integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('increments attending count when a user RSVPs ATTENDING', async () => {
    const { result: detail } = renderHook(() => useEventDetail('evt-2'), { wrapper });
    await waitFor(() => expect(detail.current.isSuccess).toBe(true));

    const initialAttending = detail.current.data?.attendingCount ?? 0;

    const { result: rsvp } = renderHook(() => useRsvpMutation(), { wrapper });
    await rsvp.current.mutateAsync({
      eventId: 'evt-2',
      userId: 'user-rsvp-integration',
      status: 'ATTENDING',
    });

    await act(async () => {
      await detail.current.refetch();
    });

    await waitFor(() => expect(detail.current.data?.attendingCount).toBe(initialAttending + 1));
  });

  it('moves counts from attending to declined when RSVP status changes', async () => {
    const userId = 'user-rsvp-switch-integration';

    const { result: detail } = renderHook(() => useEventDetail('evt-3'), { wrapper });
    await waitFor(() => expect(detail.current.isSuccess).toBe(true));

    const { result: rsvp } = renderHook(() => useRsvpMutation(), { wrapper });

    const initialAttending = detail.current.data?.attendingCount ?? 0;
    const initialDeclined = detail.current.data?.declinedCount ?? 0;

    await rsvp.current.mutateAsync({ eventId: 'evt-3', userId, status: 'ATTENDING' });
    await act(async () => {
      await detail.current.refetch();
    });
    await waitFor(() => expect(detail.current.data?.attendingCount).toBe(initialAttending + 1));

    await rsvp.current.mutateAsync({ eventId: 'evt-3', userId, status: 'DECLINED' });
    await act(async () => {
      await detail.current.refetch();
    });

    await waitFor(() => {
      expect(detail.current.data?.attendingCount).toBe(initialAttending);
      expect(detail.current.data?.declinedCount).toBe(initialDeclined + 1);
    });
  });
});
