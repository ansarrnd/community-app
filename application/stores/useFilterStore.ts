import { create } from 'zustand';

interface FilterState {
  category: string; // 'ALL' | 'MARRIAGE' | 'CULTURAL' | 'MEETING'
  searchQuery: string;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  category: 'ALL',
  searchQuery: '',
  setCategory: (category: string) => set({ category }),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
}));
