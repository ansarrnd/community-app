import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useApprovedEvents,
  useCreateEventMutation,
  useModerateEventMutation,
  usePendingEvents,
} from '../../application/hooks/useEventsQuery';

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

describe('Moderate event integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('moves a pending resident event to the approved feed after moderation', async () => {
    const { result: pending } = renderHook(() => usePendingEvents(), { wrapper });
    const { result: approved } = renderHook(() => useApprovedEvents(), { wrapper });
    await waitFor(() => expect(pending.current.isSuccess).toBe(true));
    await waitFor(() => expect(approved.current.isSuccess).toBe(true));

    const initialPending = pending.current.data?.length ?? 0;
    const initialApproved = approved.current.data?.length ?? 0;

    const { result: create } = renderHook(() => useCreateEventMutation(), { wrapper });
    const created = await create.current.mutateAsync({
      input: {
        title: 'Integration Moderation Target',
        category: 'MEETING',
        date: '2026-10-05',
        time: '10:00 AM',
        venue: 'Town Hall Room B',
        details: 'Event created to verify moderator approval flow in integration tests.',
        organizerId: 'demo-user-resident',
      },
      userRole: 'USER',
    });

    await waitFor(() => expect(pending.current.data?.length).toBe(initialPending + 1));

    const { result: moderate } = renderHook(() => useModerateEventMutation(), { wrapper });
    await moderate.current.mutateAsync({
      eventId: created.id,
      status: 'APPROVED',
      moderatorId: 'demo-user-mod',
      moderatorRole: 'MOD',
    });

    await waitFor(() =>
      expect(approved.current.data?.some((event) => event.id === created.id)).toBe(true)
    );
    expect(approved.current.data?.length).toBe(initialApproved + 1);
    expect(pending.current.data?.some((event) => event.id === created.id)).toBe(false);
  });
});
