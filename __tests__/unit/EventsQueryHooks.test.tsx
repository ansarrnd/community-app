import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

import { useApprovedEvents, usePendingEvents, useEventDetail } from '../../application/hooks/useEventsQuery';

describe('useEventsQuery React Query Hooks Unit Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches approved events via useApprovedEvents', async () => {
    const { result } = renderHook(() => useApprovedEvents(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBe(3);
  });

  it('fetches pending events via usePendingEvents', async () => {
    const { result } = renderHook(() => usePendingEvents(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBe(1);
    expect(result.current.data?.[0].status).toBe('PENDING');
  });

  it('fetches event detail by id via useEventDetail', async () => {
    const { result } = renderHook(() => useEventDetail('evt-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.id).toBe('evt-1');
  });
});
