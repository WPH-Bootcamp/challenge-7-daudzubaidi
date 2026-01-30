import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, MenuItem } from '@/types';
import { calculateSubtotal, calculateTax, calculateTotal, getFromStorage, setToStorage } from '@/lib/utils';

// ============================================================
// CART SLICE - OPTIMISTIC UI IMPLEMENTATION
// ============================================================
// This slice implements Optimistic UI pattern:
// - All cart updates happen IMMEDIATELY in the UI (no loading states)
// - Redux state updates are synchronous, giving instant feedback
// - Data is persisted to localStorage for offline support
// - No server sync needed for cart (client-side only)
// ============================================================

// ============================================================
// CART STATE TYPE
// ============================================================
interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  selectedRestaurantForCheckout: string | null; // Restaurant name untuk checkout selektif
}

// ============================================================
// INITIAL STATE
// ============================================================
const initialState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  selectedRestaurantForCheckout: null,
};

// Storage key for cart persistence
const CART_STORAGE_KEY = 'restaurant_cart';

// Helper to recalculate totals
const recalculateTotals = (items: CartItem[]): Pick<CartState, 'subtotal' | 'tax' | 'total'> => {
  const cartItems = items.map(item => ({
    price: item.menuItem.price,
    quantity: item.quantity,
  }));
  const subtotal = calculateSubtotal(cartItems);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);
  return { subtotal, tax, total };
};

// Helper to save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  setToStorage(CART_STORAGE_KEY, items);
};

// ============================================================
// CART SLICE
// ============================================================
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Initialize cart from localStorage
    initializeCart: (state) => {
      const savedItems = getFromStorage<CartItem[]>(CART_STORAGE_KEY, []);
      state.items = savedItems;
      const totals = recalculateTotals(savedItems);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total;
    },

    // Add item to cart
    addItem: (state, action: PayloadAction<{ menuItem: MenuItem; quantity?: number; notes?: string }>) => {
      const { menuItem, quantity = 1, notes } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.menuItem.id === menuItem.id);

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        state.items[existingItemIndex].quantity += quantity;
        if (notes) {
          state.items[existingItemIndex].notes = notes;
        }
      } else {
        // New item, add to cart
        const newItem: CartItem = {
          id: Date.now(), // Simple unique ID
          menuItem,
          quantity,
          notes,
        };
        state.items.push(newItem);
      }

      // Recalculate totals
      const totals = recalculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total;

      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Remove item from cart
    removeItem: (state, action: PayloadAction<number>) => {
      const menuItemId = action.payload;
      state.items = state.items.filter(item => item.menuItem.id !== menuItemId);

      // Recalculate totals
      const totals = recalculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total;

      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Set quantity for an item
    setQuantity: (state, action: PayloadAction<{ menuItemId: number; quantity: number }>) => {
      const { menuItemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.menuItem.id === menuItemId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(item => item.menuItem.id !== menuItemId);
        } else {
          state.items[itemIndex].quantity = quantity;
        }

        // Recalculate totals
        const totals = recalculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total;

        // Save to localStorage
        saveCartToStorage(state.items);
      }
    },

    // Increment quantity
    incrementQuantity: (state, action: PayloadAction<number>) => {
      const menuItemId = action.payload;
      const itemIndex = state.items.findIndex(item => item.menuItem.id === menuItemId);

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity += 1;

        // Recalculate totals
        const totals = recalculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total;

        // Save to localStorage
        saveCartToStorage(state.items);
      }
    },

    // Decrement quantity
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const menuItemId = action.payload;
      const itemIndex = state.items.findIndex(item => item.menuItem.id === menuItemId);

      if (itemIndex >= 0) {
        if (state.items[itemIndex].quantity > 1) {
          state.items[itemIndex].quantity -= 1;
        } else {
          // Remove item if quantity becomes 0
          state.items = state.items.filter(item => item.menuItem.id !== menuItemId);
        }

        // Recalculate totals
        const totals = recalculateTotals(state.items);
        state.subtotal = totals.subtotal;
        state.tax = totals.tax;
        state.total = totals.total;

        // Save to localStorage
        saveCartToStorage(state.items);
      }
    },

    // Update item notes
    updateNotes: (state, action: PayloadAction<{ menuItemId: number; notes: string }>) => {
      const { menuItemId, notes } = action.payload;
      const itemIndex = state.items.findIndex(item => item.menuItem.id === menuItemId);

      if (itemIndex >= 0) {
        state.items[itemIndex].notes = notes;
        saveCartToStorage(state.items);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.total = 0;
      state.selectedRestaurantForCheckout = null;
      saveCartToStorage([]);
    },

    // Remove items by restaurant name
    removeItemsByRestaurant: (state, action: PayloadAction<string>) => {
      const restaurantName = action.payload;
      state.items = state.items.filter(item => item.menuItem.restaurantName !== restaurantName);
      
      // Recalculate totals
      const totals = recalculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.tax = totals.tax;
      state.total = totals.total;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },

    // Set selected restaurant for checkout
    setSelectedRestaurantForCheckout: (state, action: PayloadAction<string | null>) => {
      state.selectedRestaurantForCheckout = action.payload;
    },
  },
});

// ============================================================
// ACTIONS & REDUCER EXPORTS
// ============================================================
export const {
  initializeCart,
  addItem,
  removeItem,
  setQuantity,
  incrementQuantity,
  decrementQuantity,
  updateNotes,
  clearCart,
  removeItemsByRestaurant,
  setSelectedRestaurantForCheckout,
} = cartSlice.actions;

export default cartSlice.reducer;

// ============================================================
// SELECTORS
// ============================================================
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartSubtotal = (state: { cart: CartState }) => state.cart.subtotal;
export const selectCartTax = (state: { cart: CartState }) => state.cart.tax;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectIsItemInCart = (menuItemId: number) => (state: { cart: CartState }) =>
  state.cart.items.some(item => item.menuItem.id === menuItemId);
export const selectCartItemQuantity = (menuItemId: number) => (state: { cart: CartState }) => {
  const item = state.cart.items.find(item => item.menuItem.id === menuItemId);
  return item ? item.quantity : 0;
};
export const selectSelectedRestaurantForCheckout = (state: { cart: CartState }) => 
  state.cart.selectedRestaurantForCheckout;
