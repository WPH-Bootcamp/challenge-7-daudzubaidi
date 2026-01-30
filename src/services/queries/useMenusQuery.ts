import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/services/api/axios';
import { API_ENDPOINTS } from '@/config/constants';
import { MenuItem, APIResponse } from '@/types';

// ============================================================
// QUERY KEYS
// ============================================================
export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...menuKeys.lists(), filters] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: number) => [...menuKeys.details(), id] as const,
};

// ============================================================
// FETCH FUNCTIONS
// ============================================================

// Fetch all menus
async function fetchMenus(params?: {
  page?: number;
  limit?: number;
  category?: number;
  search?: string;
  sortBy?: string;
}): Promise<MenuItem[]> {
  const response = await apiClient.get<APIResponse<MenuItem[]> | MenuItem[]>(API_ENDPOINTS.MENUS, {
    params,
  });

  // Handle different response structures
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  if ('data' in data) {
    return data.data;
  }
  return [];
}

// Fetch single menu item
async function fetchMenuDetail(id: number): Promise<MenuItem> {
  const response = await apiClient.get<APIResponse<MenuItem> | MenuItem>(API_ENDPOINTS.MENU_DETAIL(id));

  const data = response.data;
  if ('data' in data) {
    return data.data;
  }
  return data as MenuItem;
}

// ============================================================
// REACT QUERY HOOKS
// ============================================================

// Hook to fetch all menus
export function useMenusQuery(
  params?: {
    page?: number;
    limit?: number;
    category?: number;
    search?: string;
    sortBy?: string;
  },
  options?: Omit<UseQueryOptions<MenuItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: menuKeys.list(params || {}),
    queryFn: () => fetchMenus(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Hook to fetch single menu detail
export function useMenuDetailQuery(
  id: number,
  options?: Omit<UseQueryOptions<MenuItem, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: menuKeys.detail(id),
    queryFn: () => fetchMenuDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Prefetch function for SSR/SSG
export async function prefetchMenus(params?: {
  page?: number;
  limit?: number;
  category?: number;
}): Promise<MenuItem[]> {
  return fetchMenus(params);
}

export async function prefetchMenuDetail(id: number): Promise<MenuItem> {
  return fetchMenuDetail(id);
}
