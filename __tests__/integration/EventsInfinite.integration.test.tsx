jest.mock('../../domain/models/Pagination', () => ({
  DEFAULT_PAGE_SIZE: 2,
}));

jest.mock('../../infrastructure/repositories/FirebaseEventRepository', () => ({
  FirebaseEventRepository: jest.fn(),
}));

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApprovedEventsInfinite } from '../../application/hooks/useEventsQuery';

describe('Infinite approved events integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('loads a second page when more approved events exist', async () => {
    const { result } = renderHook(() => useApprovedEventsInfinite(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstPage = result.current.data?.pages[0];
    expect(firstPage?.items.length).toBe(2);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.data?.pages.length).toBe(2));

    const allItems = result.current.data?.pages.flatMap((page) => page.items) ?? [];
    expect(allItems.length).toBe(3);
    expect(result.current.hasNextPage).toBe(false);
  });
});
