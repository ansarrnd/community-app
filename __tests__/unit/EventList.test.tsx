import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { EventList } from '../../components/EventList';
import { CommunityEvent } from '../../domain/models/Event';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View, Pressable, Text } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
      onEndReached,
    }: {
      data: CommunityEvent[];
      renderItem: (info: { item: CommunityEvent }) => React.ReactNode;
      onEndReached?: () => void;
    }) => (
      <View>
        {data.map((item) => renderItem({ item }))}
        {onEndReached ? (
          <Pressable testID="flash-list-end" onPress={onEndReached}>
            <Text>end</Text>
          </Pressable>
        ) : null}
      </View>
    ),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => React.createElement(View, props),
  };
});

jest.mock('../../infrastructure/services/whatsappService', () => ({
  whatsappService: {
    shareEventToWhatsApp: jest.fn(),
  },
}));

const mockEvent: CommunityEvent = {
  id: 'evt-1',
  title: 'Community Feast',
  category: 'CULTURAL',
  date: '2026-10-01',
  time: '06:00 PM',
  venue: 'Village Hall',
  details: 'Annual feast celebration.',
  organizerId: 'org-1',
  organizerName: 'Organizer',
  status: 'APPROVED',
  attendingCount: 5,
  createdAt: '2026-01-01',
};

describe('EventList RSVP chips', () => {
  it('calls onRsvp without triggering onSelectEvent when Going is pressed', () => {
    const onSelectEvent = jest.fn();
    const onRsvp = jest.fn();

    const { getByText } = renderWithProviders(
      <EventList
        events={[mockEvent]}
        onSelectEvent={onSelectEvent}
        onRsvp={onRsvp}
        userRsvps={{}}
      />
    );

    fireEvent.press(getByText('Going (5)'));

    expect(onRsvp).toHaveBeenCalledWith('evt-1', 'ATTENDING');
    expect(onSelectEvent).not.toHaveBeenCalled();
  });

  it('calls onRsvp when Declined chip is pressed', () => {
    const onRsvp = jest.fn();

    const { getByText } = renderWithProviders(
      <EventList
        events={[mockEvent]}
        onSelectEvent={jest.fn()}
        onRsvp={onRsvp}
        userRsvps={{}}
      />
    );

    fireEvent.press(getByText('No'));

    expect(onRsvp).toHaveBeenCalledWith('evt-1', 'DECLINED');
  });

  it('calls onEndReached when list end is triggered', () => {
    const onEndReached = jest.fn();

    const { getByTestId } = renderWithProviders(
      <EventList
        events={[mockEvent]}
        onSelectEvent={jest.fn()}
        onEndReached={onEndReached}
      />
    );

    fireEvent.press(getByTestId('flash-list-end'));

    expect(onEndReached).toHaveBeenCalled();
  });
});
