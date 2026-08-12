import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import ExploreEventsScreen from '../../app/(tabs)/index';
import CreateEventScreen from '../../app/(tabs)/_createScreen';
import { useFilterStore } from '../../application/stores/useFilterStore';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { snapshotApprovedEvents } from '../helpers/screenFixtures';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
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

const mockMutate = jest.fn();

jest.mock('../../application/hooks/useEventsQuery', () => ({
  useApprovedEvents: jest.fn(),
  usePendingEvents: jest.fn(),
  useEventDetail: jest.fn(),
  useUserRsvps: jest.fn(),
  useRsvpMutation: jest.fn(() => ({ mutate: jest.fn() })),
  useCreateEventMutation: jest.fn(() => ({ mutate: mockMutate, isPending: false })),
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

import {
  useApprovedEvents,
  useUserRsvps,
} from '../../application/hooks/useEventsQuery';

const mockedUseApprovedEvents = useApprovedEvents as jest.Mock;
const mockedUseUserRsvps = useUserRsvps as jest.Mock;

describe('Screen interactions', () => {
  beforeEach(() => {
    useFilterStore.getState().setCategory('ALL');
    useFilterStore.getState().setSearchQuery('');
    useAuthStore.getState().setRole('USER');

    mockedUseApprovedEvents.mockReturnValue({
      data: snapshotApprovedEvents,
      isLoading: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
    mockedUseUserRsvps.mockReturnValue({ data: {} });
    mockMutate.mockClear();
  });

  it('updates category filter when a category pill is pressed on Explore', () => {
    const { getByLabelText } = renderWithProviders(<ExploreEventsScreen />);

    fireEvent.press(getByLabelText('💍 Weddings'));

    expect(useFilterStore.getState().category).toBe('MARRIAGE');
  });

  it('submits create event form via mutation when fields are valid', async () => {
    const { getByTestId } = renderWithProviders(<CreateEventScreen />);

    fireEvent.changeText(getByTestId('input-event-title'), 'Community Blood Drive');
    fireEvent.changeText(getByTestId('input-event-venue'), 'Town Hall Room 2B');
    fireEvent.changeText(
      getByTestId('input-event-details'),
      'Blood donation camp organized by local health volunteers.'
    );

    fireEvent.press(getByTestId('btn-submit-event'));

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));

    const mutationArgs = mockMutate.mock.calls[0][0];
    expect(mutationArgs.input.title).toBe('Community Blood Drive');
    expect(mutationArgs.input.venue).toBe('Town Hall Room 2B');
  });
});
