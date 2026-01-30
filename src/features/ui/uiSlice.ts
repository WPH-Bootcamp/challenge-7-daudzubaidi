import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, UIState } from '@/types';

// ============================================================
// INITIAL STATE
// ============================================================
const initialState: UIState = {
  isCartOpen: false,
  isFilterOpen: false,
  isSearchOpen: false,
  selectedMenuItem: null,
  isDetailModalOpen: false,
  toast: null,
};

// ============================================================
// UI SLICE
// ============================================================
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Cart Sidebar
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },

    // Filter Modal/Sidebar
    openFilter: (state) => {
      state.isFilterOpen = true;
    },
    closeFilter: (state) => {
      state.isFilterOpen = false;
    },
    toggleFilter: (state) => {
      state.isFilterOpen = !state.isFilterOpen;
    },

    // Search Modal
    openSearch: (state) => {
      state.isSearchOpen = true;
    },
    closeSearch: (state) => {
      state.isSearchOpen = false;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },

    // Detail Modal
    openDetailModal: (state, action: PayloadAction<MenuItem>) => {
      state.selectedMenuItem = action.payload;
      state.isDetailModalOpen = true;
    },
    closeDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.selectedMenuItem = null;
    },

    // Set selected menu item (without opening modal)
    setSelectedMenuItem: (state, action: PayloadAction<MenuItem | null>) => {
      state.selectedMenuItem = action.payload;
    },

    // Toast Notifications
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toast = {
        isVisible: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideToast: (state) => {
      state.toast = null;
    },

    // Close all modals/sidebars
    closeAll: (state) => {
      state.isCartOpen = false;
      state.isFilterOpen = false;
      state.isSearchOpen = false;
      state.isDetailModalOpen = false;
    },
  },
});

// ============================================================
// ACTIONS & REDUCER EXPORTS
// ============================================================
export const {
  openCart,
  closeCart,
  toggleCart,
  openFilter,
  closeFilter,
  toggleFilter,
  openSearch,
  closeSearch,
  toggleSearch,
  openDetailModal,
  closeDetailModal,
  setSelectedMenuItem,
  showToast,
  hideToast,
  closeAll,
} = uiSlice.actions;

export default uiSlice.reducer;

// ============================================================
// SELECTORS
// ============================================================
export const selectIsCartOpen = (state: { ui: UIState }) => state.ui.isCartOpen;
export const selectIsFilterOpen = (state: { ui: UIState }) => state.ui.isFilterOpen;
export const selectIsSearchOpen = (state: { ui: UIState }) => state.ui.isSearchOpen;
export const selectSelectedMenuItem = (state: { ui: UIState }) => state.ui.selectedMenuItem;
export const selectIsDetailModalOpen = (state: { ui: UIState }) => state.ui.isDetailModalOpen;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;
