// ============================================================
// APPLICATION CONSTANTS
// ============================================================

// API Configuration
// Use empty string for same-origin requests (goes through Next.js API proxy)
// This avoids CORS issues by routing through our own server
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// API Endpoints
export const API_ENDPOINTS = {
  // Menus
  MENUS: '/api/menus',
  MENU_DETAIL: (id: number) => `/api/menus/${id}`,

  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_DETAIL: (id: number) => `/api/categories/${id}`,

  // Orders
  ORDERS: '/api/orders',
  ORDER_DETAIL: (id: number) => `/api/orders/${id}`,

  // Reviews
  MY_REVIEWS: '/api/reviews/my-reviews',

  // Auth (if needed)
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',
  ORDERS: '/orders',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CATEGORY: '/category',
  MENU_DETAIL: (id: number) => `/menu/${id}`,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  ITEMS_PER_PAGE_OPTIONS: [12, 24, 48],
} as const;

// Tax Rate
export const TAX_RATE = 0.11; // 11% PPN

// Currency
export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  LOCALE: 'id-ID',
} as const;

// Categories for quick filter (from Figma design)
export const QUICK_CATEGORIES = [
  { id: 0, name: 'All Restaurant', icon: 'all-food' },
  { id: 1, name: 'Nearby', icon: 'location' },
  { id: 2, name: 'Discount', icon: 'discount' },
  { id: 3, name: 'Best Seller', icon: 'best-seller' },
  { id: 4, name: 'Delivery', icon: 'delivery' },
  { id: 5, name: 'Lunch', icon: 'lunch' },
] as const;

// Sort Options
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'newest', label: 'Newest' },
] as const;

// Breakpoints (matching tailwind.config.js)
export const BREAKPOINTS = {
  mobile: 320,
  sm: 393,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 150,
  base: 200,
  slow: 300,
} as const;
