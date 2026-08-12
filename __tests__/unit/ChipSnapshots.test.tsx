import React from 'react';
import { SegmentPill, ActionChip, SelectableCard } from '../../components/ui';
import { renderWithProviders } from '../helpers/renderWithProviders';

describe('UI component snapshots', () => {
  it('matches SegmentPill selected and unselected trees', () => {
    const unselected = renderWithProviders(<SegmentPill label="Cultural" selected={false} />);
    const selected = renderWithProviders(<SegmentPill label="Cultural" selected />);

    expect(unselected.toJSON()).toMatchSnapshot('segment-pill-unselected');
    expect(selected.toJSON()).toMatchSnapshot('segment-pill-selected');
  });

  it('matches ActionChip variant trees', () => {
    const success = renderWithProviders(<ActionChip variant="success" label="Going" selected={false} />);
    const danger = renderWithProviders(<ActionChip variant="danger" label="No" selected />);

    expect(success.toJSON()).toMatchSnapshot('action-chip-success-unselected');
    expect(danger.toJSON()).toMatchSnapshot('action-chip-danger-selected');
  });

  it('matches SelectableCard trees', () => {
    const tree = renderWithProviders(
      <SelectableCard title="Moderator (MOD)" description="Approve events." selected />
    );

    expect(tree.toJSON()).toMatchSnapshot('selectable-card-selected');
  });
});
