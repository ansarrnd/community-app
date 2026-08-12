import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCreateEventMutation,
  usePendingEvents,
} from '../../application/hooks/useEventsQuery';

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

describe('Create event integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('adds a resident-submitted event to the pending events list', async () => {
    const { result: pending } = renderHook(() => usePendingEvents(), { wrapper });
    await waitFor(() => expect(pending.current.isSuccess).toBe(true));

    const initialCount = pending.current.data?.length ?? 0;

    const { result: create } = renderHook(() => useCreateEventMutation(), { wrapper });

    await create.current.mutateAsync({
      input: {
        title: 'Neighborhood Blood Drive',
        category: 'CULTURAL',
        date: '2026-09-30',
        time: '09:00 AM',
        venue: 'Community Hall Main Room',
        details: 'Blood donation camp organized by local health volunteers.',
        organizerId: 'usr-integration-1',
      },
      userRole: 'USER',
    });

    await waitFor(() => expect(pending.current.data?.length).toBe(initialCount + 1));
    expect(pending.current.data?.some((e) => e.title === 'Neighborhood Blood Drive')).toBe(true);
    expect(
      pending.current.data?.find((e) => e.title === 'Neighborhood Blood Drive')?.status
    ).toBe('PENDING');
  });
});
