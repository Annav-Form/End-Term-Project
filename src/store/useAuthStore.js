import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  cfHandle: null,
  bookmarks: [],
  isAuthLoading: true,
  
  setUser: (user) => set({ user }),
  setCfHandle: (handle) => set({ cfHandle: handle }),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),
  
  toggleLocalBookmark: (problemKey) => set((state) => {
    const isBookmarked = state.bookmarks.includes(problemKey);
    if (isBookmarked) {
      return { bookmarks: state.bookmarks.filter(b => b !== problemKey) };
    } else {
      return { bookmarks: [...state.bookmarks, problemKey] };
    }
  }),

  logout: () => set({ user: null, cfHandle: null, bookmarks: [] })
}));
