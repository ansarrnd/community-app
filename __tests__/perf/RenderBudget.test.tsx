import React, { Profiler, ProfilerOnRenderCallback } from 'react';
import ExploreEventsScreen from '../../app/(tabs)/index';
import { EventList } from '../../components/EventList';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { LARGE_EVENT_LIST_FIXTURE } from '../helpers/largeEventFixtures';
import { PERF_BUDGETS } from '../helpers/perfBudgets';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('../../application/hooks/useLayoutInsets', () => ({
  useLayoutInsets: () => ({
    contentBottomPadding: 0,
    stackBottomPadding: 0,
    tabBarHeight: 60,
  }),
  TAB_BAR_BASE_HEIGHT: 52,
}));

jest.mock('../../application/hooks/useEventsQuery', () => ({
  useApprovedEventsInfinite: jest.fn(() => ({
    data: { pages: [{ items: [], nextCursor: null }] },
    isLoading: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: jest.fn(),
    isRefetching: false,
  })),
  useUserRsvps: jest.fn(() => ({ data: {} })),
  useRsvpMutation: jest.fn(() => ({ mutate: jest.fn() })),
}));

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
    }: {
      data: unknown[];
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <View>
        {data.map((item, index) => (
          <View key={index}>{renderItem({ item })}</View>
        ))}
      </View>
    ),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

jest.mock('../../infrastructure/services/whatsappService', () => ({
  whatsappService: {
    shareEventToWhatsApp: jest.fn(),
    broadcastEvent: jest.fn(),
  },
}));

function measureProfilerMount(element: React.ReactElement): number {
  let mountDuration = 0;

  const onRender: ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    if (phase === 'mount') {
      mountDuration += actualDuration;
    }
  };

  renderWithProviders(
    <Profiler id="perf-target" onRender={onRender}>
      {element}
    </Profiler>
  );

  return mountDuration;
}

describe('Render performance budgets', () => {
  it('mounts Explore screen within profiler budget', () => {
    const duration = measureProfilerMount(<ExploreEventsScreen />);
    expect(duration).toBeLessThan(PERF_BUDGETS.exploreMountMs);
  });

  it('renders 50-item EventList within budget', () => {
    const start = performance.now();

    renderWithProviders(
      <EventList
        events={LARGE_EVENT_LIST_FIXTURE}
        onSelectEvent={jest.fn()}
        userRsvps={{}}
        onRsvp={jest.fn()}
      />
    );

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(PERF_BUDGETS.eventList50ItemsMs);
  });
});
