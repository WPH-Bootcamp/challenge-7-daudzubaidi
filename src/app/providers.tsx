'use client';

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { store } from '@/features/store';
import { initializeCart } from '@/features/cart/cartSlice';
import { initializeAuth } from '@/features/auth/authSlice';

// ============================================================
// APP PROVIDERS
// ============================================================
export function Providers({ children }: { children: React.ReactNode }) {
  // Create a single QueryClient instance that persists across renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time of 5 minutes
            staleTime: 5 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Don't refetch on window focus in development
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  // Initialize cart and auth from localStorage on mount
  useEffect(() => {
    store.dispatch(initializeCart());
    store.dispatch(initializeAuth());
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* React Query Devtools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Provider>
  );
}
