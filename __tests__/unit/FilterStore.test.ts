import { useFilterStore } from '../../application/stores/useFilterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({ category: 'ALL', searchQuery: '' });
  });

  it('updates category filter for event list queries', () => {
    useFilterStore.getState().setCategory('MARRIAGE');
    expect(useFilterStore.getState().category).toBe('MARRIAGE');
  });

  it('updates search query independently of category', () => {
    useFilterStore.getState().setCategory('CULTURAL');
    useFilterStore.getState().setSearchQuery('wedding hall');

    const state = useFilterStore.getState();
    expect(state.category).toBe('CULTURAL');
    expect(state.searchQuery).toBe('wedding hall');
  });

  it('resets cleanly when category returns to ALL', () => {
    useFilterStore.getState().setCategory('MEETING');
    useFilterStore.getState().setCategory('ALL');
    expect(useFilterStore.getState().category).toBe('ALL');
  });
});
