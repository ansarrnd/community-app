import React from 'react';
import { Text, View } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { SegmentPill } from '../../components/SegmentPill';
import { ActionChip } from '../../components/ActionChip';
import { SelectableCard } from '../../components/SelectableCard';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('SegmentPill', () => {
  it('renders label and reflects unselected accessibility state', () => {
    const { getByText, getByRole } = renderWithProviders(
      <SegmentPill label="Cultural" selected={false} />
    );

    expect(getByText('Cultural')).toBeTruthy();
    expect(getByRole('button').props.accessibilityState?.selected).toBe(false);
  });

  it('reflects selected accessibility state', () => {
    const { getByRole } = renderWithProviders(<SegmentPill label="Weddings" selected />);

    expect(getByRole('button').props.accessibilityState?.selected).toBe(true);
  });

  it('invokes onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <SegmentPill label="Meetings" onPress={onPress} />
    );

    fireEvent.press(getByText('Meetings'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with icon and compact layout', () => {
    const { getByText } = renderWithProviders(
      <SegmentPill
        label="Dark"
        compact
        icon={<View testID="segment-icon" />}
      />
    );

    expect(getByText('Dark')).toBeTruthy();
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <SegmentPill label="Disabled" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('ActionChip', () => {
  it('defaults to selected styling for action-only chips', () => {
    const { getByRole } = renderWithProviders(
      <ActionChip variant="success" label="Approve" />
    );

    expect(getByRole('button').props.accessibilityState?.selected).toBe(true);
  });

  it('reflects unselected toggle state for RSVP-style chips', () => {
    const { getByRole } = renderWithProviders(
      <ActionChip variant="success" label="Going" selected={false} />
    );

    expect(getByRole('button').props.accessibilityState?.selected).toBe(false);
  });

  it('invokes onPress for each variant', () => {
    const onDanger = jest.fn();
    const onAccent = jest.fn();

    const { getByText: getDanger } = renderWithProviders(
      <ActionChip variant="danger" label="Reject" onPress={onDanger} />
    );
    fireEvent.press(getDanger('Reject'));
    expect(onDanger).toHaveBeenCalledTimes(1);

    const { getByText: getAccent } = renderWithProviders(
      <ActionChip variant="accent" label="Broadcast" onPress={onAccent} />
    );
    fireEvent.press(getAccent('Broadcast'));
    expect(onAccent).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <ActionChip variant="accent" label="Sending..." disabled onPress={onPress} />
    );

    fireEvent.press(getByText('Sending...'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders compact chips with icon', () => {
    const { getByText } = renderWithProviders(
      <ActionChip
        variant="success"
        label="Going (3)"
        compact
        selected={false}
        icon={<Text testID="chip-icon">icon</Text>}
      />
    );

    expect(getByText('Going (3)')).toBeTruthy();
  });
});

describe('SelectableCard', () => {
  it('renders title and description', () => {
    const { getByText } = renderWithProviders(
      <SelectableCard title="Moderator (MOD)" description="Approve pending events." />
    );

    expect(getByText('Moderator (MOD)')).toBeTruthy();
    expect(getByText('Approve pending events.')).toBeTruthy();
  });

  it('shows trailing icon only when selected', () => {
    const { queryByTestId, rerender } = renderWithProviders(
      <SelectableCard
        title="Resident (USER)"
        selected={false}
        trailingIcon={<View testID="selected-icon" />}
      />
    );

    expect(queryByTestId('selected-icon')).toBeNull();

    rerender(
      <SelectableCard
        title="Resident (USER)"
        selected
        trailingIcon={<View testID="selected-icon" />}
      />
    );

    expect(queryByTestId('selected-icon')).toBeTruthy();
  });

  it('invokes onPress when card is tapped', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <SelectableCard title="Administrator (ADMIN)" onPress={onPress} />
    );

    fireEvent.press(getByText('Administrator (ADMIN)'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
