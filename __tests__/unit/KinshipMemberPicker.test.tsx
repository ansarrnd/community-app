import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { KinshipMemberPicker } from '../../modules/kinship/components/KinshipMemberPicker';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('KinshipMemberPicker', () => {
  it('adds a member when Add Member is pressed', () => {
    const onChange = jest.fn();
    const { getByText } = renderWithProviders(
      <KinshipMemberPicker members={[]} onChange={onChange} />
    );

    fireEvent.press(getByText('Add Member'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toHaveLength(1);
    expect(onChange.mock.calls[0][0][0].relationshipTypeToOrganizer).toBe('MAMA');
  });

  it('updates kinship relation when a relation chip is selected', () => {
    const members = [
      {
        fullName: 'Test',
        gender: 'M' as const,
        roleInEvent: 'GUEST',
        relationshipTypeToOrganizer: 'MAMA',
        contextTag: 'In-Village' as const,
      },
    ];
    const onChange = jest.fn();

    const { getByText } = renderWithProviders(
      <KinshipMemberPicker members={members} onChange={onChange} />
    );

    fireEvent.press(getByText('Father (அப்பா)'));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ relationshipTypeToOrganizer: 'FATHER' }),
    ]);
  });

  it('toggles context tag between In-Village and Out-Village', () => {
    const members = [
      {
        fullName: 'Test',
        gender: 'M' as const,
        roleInEvent: 'GUEST',
        relationshipTypeToOrganizer: 'MAMA',
        contextTag: 'In-Village' as const,
      },
    ];
    const onChange = jest.fn();

    const { getByText } = renderWithProviders(
      <KinshipMemberPicker members={members} onChange={onChange} />
    );

    fireEvent.press(getByText('In-Village'));

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ contextTag: 'Out-Village' }),
    ]);
  });
});
