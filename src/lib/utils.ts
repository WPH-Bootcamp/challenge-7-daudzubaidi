import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { CURRENCY, TAX_RATE } from '@/config/constants';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.locale('id');

// ============================================================
// CLASS NAME UTILITY (cn helper for Tailwind + shadcn/ui)
// ============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// CURRENCY FORMATTING
// ============================================================
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(price: number): string {
  return `${CURRENCY.SYMBOL} ${new Intl.NumberFormat(CURRENCY.LOCALE).format(price)}`;
}

// ============================================================
// DATE FORMATTING
// ============================================================
export function formatDate(date: string | Date, format: string = 'DD MMM YYYY'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD MMM YYYY, HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}

// ============================================================
// CART CALCULATIONS
// ============================================================
export function calculateSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}

export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

// ============================================================
// STRING UTILITIES
// ============================================================
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================
// VALIDATION UTILITIES
// ============================================================
export function isValidPhone(phone: string): boolean {
  // Indonesian phone number format
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================
// DEBOUNCE UTILITY
// ============================================================
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// ============================================================
// LOCAL STORAGE UTILITIES
// ============================================================
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// ============================================================
// IMAGE UTILITIES
// ============================================================
export function getImageUrl(path: string | null | undefined, fallback: string = '/images/placeholder-food.svg'): string {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return path;
}

// ============================================================
// RATING UTILITIES
// ============================================================
export function formatRating(rating: number | undefined): string {
  if (rating === undefined || rating === null) return '0.0';
  return rating.toFixed(1);
}

export function getRatingStars(rating: number): number {
  return Math.round(rating);
}
