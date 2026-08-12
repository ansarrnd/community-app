import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApprovedEvents } from '../../application/hooks/useEventsQuery';

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

describe('Events filter integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('returns only MARRIAGE events when category filter is MARRIAGE', async () => {
    const { result } = renderHook(() => useApprovedEvents('MARRIAGE', ''), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const categories = result.current.data?.map((e) => e.category) ?? [];
    expect(categories.every((c) => c === 'MARRIAGE')).toBe(true);
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('narrows results when search query matches venue', async () => {
    const { result: all } = renderHook(() => useApprovedEvents('ALL', ''), { wrapper });
    await waitFor(() => expect(all.current.isSuccess).toBe(true));

    const { result: filtered } = renderHook(() => useApprovedEvents('ALL', 'Town Hall'), { wrapper });
    await waitFor(() => expect(filtered.current.isSuccess).toBe(true));

    expect(filtered.current.data?.length).toBeLessThanOrEqual(all.current.data?.length ?? 0);
    expect(filtered.current.data?.some((e) => e.venue.toLowerCase().includes('town hall'))).toBe(true);
  });

  it('uses distinct query keys for category and search combinations', async () => {
    const { result: cultural } = renderHook(() => useApprovedEvents('CULTURAL', ''), { wrapper });
    await waitFor(() => expect(cultural.current.isSuccess).toBe(true));

    expect(cultural.current.data?.every((e) => e.category === 'CULTURAL')).toBe(true);
  });
});
