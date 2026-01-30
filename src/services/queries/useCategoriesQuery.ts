import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/services/api/axios';
import { API_ENDPOINTS } from '@/config/constants';
import { Category, APIResponse } from '@/types';

// ============================================================
// QUERY KEYS
// ============================================================
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

// ============================================================
// FETCH FUNCTIONS
// ============================================================

// Fetch all categories
async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<APIResponse<Category[]> | Category[]>(API_ENDPOINTS.CATEGORIES);

  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  if ('data' in data) {
    return data.data;
  }
  return [];
}

// Fetch single category
async function fetchCategoryDetail(id: number): Promise<Category> {
  const response = await apiClient.get<APIResponse<Category> | Category>(API_ENDPOINTS.CATEGORY_DETAIL(id));

  const data = response.data;
  if ('data' in data) {
    return data.data;
  }
  return data as Category;
}

// ============================================================
// REACT QUERY HOOKS
// ============================================================

// Hook to fetch all categories
export function useCategoriesQuery(
  options?: Omit<UseQueryOptions<Category[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    ...options,
  });
}

// Hook to fetch single category
export function useCategoryDetailQuery(
  id: number,
  options?: Omit<UseQueryOptions<Category, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => fetchCategoryDetail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Prefetch function for SSR/SSG
export async function prefetchCategories(): Promise<Category[]> {
  return fetchCategories();
}
