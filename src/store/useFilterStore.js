import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  selectedTags: [],
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  toggleTag: (tag) => set((state) => {
    const isSelected = state.selectedTags.includes(tag);
    if (isSelected) {
      return { selectedTags: state.selectedTags.filter(t => t !== tag) };
    } else {
      return { selectedTags: [...state.selectedTags, tag] };
    }
  }),

  // [minRating, maxRating]
  // 0 to 4000 is a good default range for Codeforces
  ratingRange: [0, 4000],
  setRatingRange: (range) => set({ ratingRange: range }),

  sortBy: 'rating', // could be 'rating', 'solvedCount', 'name'
  setSortBy: (field) => set({ sortBy: field }),

  sortOrder: 'asc', // 'asc' or 'desc'
  setSortOrder: (order) => set({ sortOrder: order }),

  // Utility to reset all filters
  resetFilters: () => set({
    searchQuery: '',
    selectedTags: [],
    ratingRange: [0, 4000],
    sortBy: 'rating',
    sortOrder: 'asc',
  })
}));
