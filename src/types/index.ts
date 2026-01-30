// ============================================================
// TYPE DEFINITIONS - Based on Restaurant API
// ============================================================

// Category Types
export interface Category {
  id: number;
  name: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Menu Item Types
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: number;
  category?: Category;
  rating?: number;
  distance?: string;
  location?: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Extended properties for restaurant detail view
  gallery?: string[];
  logo?: string;
  totalReviews?: number;
  restaurantName?: string; // Added for cart display
  restaurantId?: number; // Added for navigation to restaurant detail
}

// Cart Types
export interface CartItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// Order Types
export interface OrderItem {
  id: number;
  menuId: number;
  menuName: string;
  menuImage?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  transactionId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  restaurantName?: string;
  restaurantId?: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  review?: {
    star: number;
    comment: string;
  };
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'completed'
  | 'cancelled';

// Create Order Payload
export interface CreateOrderPayload {
  deliveryAddress: string;
  restaurants: {
    restaurantId: number;
    items: {
      menuId: number;
      quantity: number;
    }[];
  }[];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface APIError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Filter Types
export interface FiltersState {
  category: number | null;
  searchQuery: string;
  sortBy: SortOption;
  priceRange: {
    min: number;
    max: number;
  } | null;
  rating: number | null;
}

export type SortOption =
  | 'recommended'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'newest';

// UI State Types
export interface UIState {
  isCartOpen: boolean;
  isFilterOpen: boolean;
  isSearchOpen: boolean;
  selectedMenuItem: MenuItem | null;
  isDetailModalOpen: boolean;
  toast: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
}
