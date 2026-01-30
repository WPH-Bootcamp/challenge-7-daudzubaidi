import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FiltersState, SortOption } from '@/types';

// ============================================================
// INITIAL STATE
// ============================================================
const initialState: FiltersState = {
  category: null, // null means "All"
  searchQuery: '',
  sortBy: 'recommended',
  priceRange: null,
  rating: null,
};

// ============================================================
// FILTERS SLICE
// ============================================================
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Set category filter
    setCategory: (state, action: PayloadAction<number | null>) => {
      state.category = action.payload;
    },

    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Set sort option
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
    },

    // Set price range filter
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number } | null>) => {
      state.priceRange = action.payload;
    },

    // Set minimum rating filter
    setRating: (state, action: PayloadAction<number | null>) => {
      state.rating = action.payload;
    },

    // Clear all filters
    clearFilters: (state) => {
      state.category = null;
      state.searchQuery = '';
      state.sortBy = 'recommended';
      state.priceRange = null;
      state.rating = null;
    },

    // Reset only search
    clearSearch: (state) => {
      state.searchQuery = '';
    },
  },
});

// ============================================================
// ACTIONS & REDUCER EXPORTS
// ============================================================
export const {
  setCategory,
  setSearchQuery,
  setSortBy,
  setPriceRange,
  setRating,
  clearFilters,
  clearSearch,
} = filtersSlice.actions;

export default filtersSlice.reducer;

// ============================================================
// SELECTORS
// ============================================================
export const selectCategory = (state: { filters: FiltersState }) => state.filters.category;
export const selectSearchQuery = (state: { filters: FiltersState }) => state.filters.searchQuery;
export const selectSortBy = (state: { filters: FiltersState }) => state.filters.sortBy;
export const selectPriceRange = (state: { filters: FiltersState }) => state.filters.priceRange;
export const selectRating = (state: { filters: FiltersState }) => state.filters.rating;
export const selectAllFilters = (state: { filters: FiltersState }) => state.filters;
export const selectHasActiveFilters = (state: { filters: FiltersState }) => {
  const { category, searchQuery, sortBy, priceRange, rating } = state.filters;
  return (
    category !== null ||
    searchQuery !== '' ||
    sortBy !== 'recommended' ||
    priceRange !== null ||
    rating !== null
  );
};
