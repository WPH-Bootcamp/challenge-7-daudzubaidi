import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { getFromStorage, setToStorage } from '@/lib/utils';

// ============================================================
// AUTH SLICE - User authentication state
// ============================================================

interface User {
  name: string;
  email: string;
  avatarSrc?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const AUTH_STORAGE_KEY = 'auth_user';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Initialize auth from localStorage
    initializeAuth: (state) => {
      const savedUser = getFromStorage<User | null>(AUTH_STORAGE_KEY, null);
      if (savedUser) {
        state.isAuthenticated = true;
        state.user = savedUser;
      }
    },
    login: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      // Save to localStorage
      setToStorage(AUTH_STORAGE_KEY, action.payload);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },
  },
});

// ============================================================
// ACTIONS
// ============================================================
export const { login, logout, initializeAuth } = authSlice.actions;

// ============================================================
// SELECTORS
// ============================================================
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;

// ============================================================
// REDUCER
// ============================================================
export default authSlice.reducer;
