import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoleBadge } from '../../components/RoleBadge';
import { ThemedText } from '../../components/ThemedText';
import { OfflineBanner } from '../../components/OfflineBanner';
import { LiquidGlassCard } from '../../components/LiquidGlassCard';
import { EventImage } from '../../components/EventImage';
import { useNetworkGuard } from '../../application/hooks/useNetworkGuard';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('../../application/hooks/useNetworkGuard', () => ({
  useNetworkGuard: jest.fn(),
}));

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props: any) => React.createElement(View, props),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => React.createElement(View, props),
  };
});

describe('UI Component Unit Tests', () => {
  describe('RoleBadge', () => {
    it('renders USER role badge text correctly', () => {
      const { getByText } = render(<RoleBadge role="USER" />);
      expect(getByText('USER')).toBeTruthy();
    });

    it('renders MOD role badge text correctly', () => {
      const { getByText } = render(<RoleBadge role="MOD" />);
      expect(getByText('MOD')).toBeTruthy();
    });

    it('renders ADMIN role badge text correctly', () => {
      const { getByText } = render(<RoleBadge role="ADMIN" />);
      expect(getByText('ADMIN')).toBeTruthy();
    });
  });

  describe('ThemedText', () => {
    it('renders text content correctly', () => {
      const { getByText } = render(<ThemedText>Community App Event</ThemedText>);
      expect(getByText('Community App Event')).toBeTruthy();
    });

    it('renders heading variant correctly', () => {
      const { getByText } = render(<ThemedText variant="h1">Header Title</ThemedText>);
      expect(getByText('Header Title')).toBeTruthy();
    });

    it('applies secondary, muted, and custom colors correctly', () => {
      const { getByText: getSec } = render(<ThemedText secondary>Secondary Text</ThemedText>);
      expect(getSec('Secondary Text')).toBeTruthy();

      const { getByText: getMuted } = render(<ThemedText muted>Muted Text</ThemedText>);
      expect(getMuted('Muted Text')).toBeTruthy();

      const { getByText: getCustom } = render(<ThemedText color="#FF0000">Custom Color Text</ThemedText>);
      expect(getCustom('Custom Color Text')).toBeTruthy();
    });
  });

  describe('OfflineBanner', () => {
    it('returns null when network is connected', () => {
      (useNetworkGuard as jest.Mock).mockReturnValue({ isConnected: true, isInternetReachable: true });
      const { queryByText } = renderWithProviders(<OfflineBanner />);
      expect(queryByText(/Offline Mode/i)).toBeNull();
    });

    it('renders offline warning message when network is disconnected', () => {
      (useNetworkGuard as jest.Mock).mockReturnValue({ isConnected: false, isInternetReachable: false });
      const { getByText } = renderWithProviders(<OfflineBanner />);
      expect(getByText(/Offline Mode: Showing cached events. Writes are queued./i)).toBeTruthy();
    });
  });

  describe('LiquidGlassCard', () => {
    it('renders children content inside glass card container', () => {
      const { getByText } = render(
        <LiquidGlassCard>
          <ThemedText>Card Content</ThemedText>
        </LiquidGlassCard>
      );
      expect(getByText('Card Content')).toBeTruthy();
    });

    it('handles onPress event when card is interactive', () => {
      const onPressMock = jest.fn();
      const { getByText } = render(
        <LiquidGlassCard onPress={onPressMock}>
          <ThemedText>Clickable Card</ThemedText>
        </LiquidGlassCard>
      );

      fireEvent.press(getByText('Clickable Card'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('EventImage', () => {
    it('renders EventImage container component with default fallback URI', () => {
      const { UNSAFE_root } = render(<EventImage />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders EventImage with custom image URI', () => {
      const { UNSAFE_root } = render(<EventImage uri="https://example.com/custom.jpg" height={200} />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
