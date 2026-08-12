import React from 'react';
import ExploreEventsScreen from '../../app/(tabs)/index';
import CreateEventScreen from '../../app/(tabs)/create';
import ProfileScreen from '../../app/(tabs)/profile';
import AdminModerationScreen from '../../app/(tabs)/admin';
import EventDetailScreen from '../../app/e/[id]';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { renderWithProviders, renderWithThemeMode } from '../helpers/renderWithProviders';
import {
  snapshotApprovedEvents,
  snapshotPendingEvents,
  snapshotEventDetail,
} from '../helpers/screenFixtures';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'evt-1' }),
}));

jest.mock('expo-image-picker', () => ({
  MediaTypeOptions: { Images: 'Images' },
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('../../application/hooks/useLayoutInsets', () => ({
  useLayoutInsets: () => ({
    contentBottomPadding: 0,
    stackBottomPadding: 0,
    tabBarHeight: 60,
  }),
  TAB_BAR_BASE_HEIGHT: 52,
}));

jest.mock('../../application/hooks/useNetworkGuard', () => ({
  useNetworkGuard: () => ({
    isConnected: true,
    isInternetReachable: true,
    checkConnection: jest.fn(() => true),
  }),
}));

jest.mock('../../application/hooks/useEventsQuery', () => ({
  useApprovedEvents: jest.fn(),
  usePendingEvents: jest.fn(),
  useEventDetail: jest.fn(),
  useUserRsvps: jest.fn(),
  useRsvpMutation: jest.fn(() => ({ mutate: jest.fn() })),
  useCreateEventMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useModerateEventMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FlashList: ({ data, renderItem }: { data: unknown[]; renderItem: (info: { item: unknown }) => React.ReactNode }) => (
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

import {
  useApprovedEvents,
  usePendingEvents,
  useEventDetail,
  useUserRsvps,
} from '../../application/hooks/useEventsQuery';

const mockedUseApprovedEvents = useApprovedEvents as jest.Mock;
const mockedUsePendingEvents = usePendingEvents as jest.Mock;
const mockedUseEventDetail = useEventDetail as jest.Mock;
const mockedUseUserRsvps = useUserRsvps as jest.Mock;

function setupDefaultQueryMocks() {
  mockedUseApprovedEvents.mockReturnValue({
    data: snapshotApprovedEvents,
    isLoading: false,
    refetch: jest.fn(),
    isRefetching: false,
  });
  mockedUsePendingEvents.mockReturnValue({
    data: snapshotPendingEvents,
    isLoading: false,
  });
  mockedUseEventDetail.mockReturnValue({
    data: snapshotEventDetail,
    isLoading: false,
  });
  mockedUseUserRsvps.mockReturnValue({
    data: { 'evt-1': 'ATTENDING' },
  });
}

describe('Screen snapshots (dark theme)', () => {
  beforeEach(() => {
    setupDefaultQueryMocks();
    useAuthStore.getState().setRole('ADMIN');
  });

  it('matches Explore (Home) screen tree', () => {
    const tree = renderWithProviders(<ExploreEventsScreen />);
    expect(tree.toJSON()).toMatchSnapshot('screen-explore-dark');
  });

  it('matches Create Event screen tree', () => {
    const tree = renderWithProviders(<CreateEventScreen />);
    expect(tree.toJSON()).toMatchSnapshot('screen-create-dark');
  });

  it('matches Profile screen tree', () => {
    const tree = renderWithProviders(<ProfileScreen />);
    expect(tree.toJSON()).toMatchSnapshot('screen-profile-dark');
  });

  it('matches Admin moderation screen tree (authorized)', () => {
    const tree = renderWithProviders(<AdminModerationScreen />);
    expect(tree.toJSON()).toMatchSnapshot('screen-admin-mod-dark');
  });

  it('matches Admin moderation screen when access restricted', () => {
    useAuthStore.getState().setRole('USER');
    const tree = renderWithProviders(<AdminModerationScreen />);
    expect(tree.toJSON()).toMatchSnapshot('screen-admin-restricted-dark');
  });

  it('matches Event detail screen tree', () => {
    const tree = renderWithProviders(<EventDetailScreen />);
    expect(tree.toJSON()).toMatchSnapshot('screen-event-detail-dark');
  });
});

describe('Screen snapshots (light theme — legibility-sensitive)', () => {
  beforeEach(() => {
    setupDefaultQueryMocks();
    useAuthStore.getState().setRole('ADMIN');
  });

  it('matches Explore screen in light mode', () => {
    const tree = renderWithThemeMode(<ExploreEventsScreen />, 'light');
    expect(tree.toJSON()).toMatchSnapshot('screen-explore-light');
  });

  it('matches Create Event screen in light mode', () => {
    const tree = renderWithThemeMode(<CreateEventScreen />, 'light');
    expect(tree.toJSON()).toMatchSnapshot('screen-create-light');
  });

  it('matches Profile screen in light mode', () => {
    const tree = renderWithThemeMode(<ProfileScreen />, 'light');
    expect(tree.toJSON()).toMatchSnapshot('screen-profile-light');
  });
});
