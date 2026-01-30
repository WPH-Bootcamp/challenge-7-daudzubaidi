import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cart/cartSlice';
import filtersReducer from './filters/filtersSlice';
import uiReducer from './ui/uiSlice';
import authReducer from './auth/authSlice';

// ============================================================
// REDUX STORE CONFIGURATION
// ============================================================
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    filters: filtersReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['cart/addItem'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.menuItem'],
        // Ignore these paths in the state
        ignoredPaths: ['cart.items'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// ============================================================
// TYPE EXPORTS
// ============================================================
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
