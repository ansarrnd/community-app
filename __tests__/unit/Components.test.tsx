import React from 'react';
import { render } from '@testing-library/react-native';
import { RoleBadge } from '../../components/RoleBadge';
import { ThemedText } from '../../components/ThemedText';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useNetworkGuard } from '../../application/hooks/useNetworkGuard';

jest.mock('../../application/hooks/useNetworkGuard', () => ({
  useNetworkGuard: jest.fn(),
}));

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
  });

  describe('OfflineBanner', () => {
    it('returns null when network is connected', () => {
      (useNetworkGuard as jest.Mock).mockReturnValue({ isConnected: true, isInternetReachable: true });
      const { queryByText } = render(<OfflineBanner />);
      expect(queryByText(/Offline Mode/i)).toBeNull();
    });

    it('renders offline warning message when network is disconnected', () => {
      (useNetworkGuard as jest.Mock).mockReturnValue({ isConnected: false, isInternetReachable: false });
      const { getByText } = render(<OfflineBanner />);
      expect(getByText(/Offline Mode: Showing cached events. Writes are queued./i)).toBeTruthy();
    });
  });
});
