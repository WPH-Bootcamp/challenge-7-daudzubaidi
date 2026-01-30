import { useMutation, useQueryClient, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/services/api/axios';
import { APIResponse } from '@/types';
import { API_ENDPOINTS } from '@/config/constants';

// ============================================================
// QUERY KEYS
// ============================================================
export const reviewKeys = {
  all: ['reviews'] as const,
  myReviews: () => [...reviewKeys.all, 'my-reviews'] as const,
};

// ============================================================
// REVIEW MUTATION
// ============================================================

interface CreateReviewPayload {
  transactionId: string;
  restaurantId: number;
  star: number; // API expects 'star' not 'rating'
  comment: string;
}

interface Review {
  id: number;
  transactionId: string;
  restaurantId: number;
  star: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

// Fetch user's reviews
async function fetchMyReviews(): Promise<Review[]> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.MY_REVIEWS);
    const data = response.data;
    
    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && 'data' in data) {
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (data.data && 'reviews' in data.data && Array.isArray(data.data.reviews)) {
        return data.data.reviews;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Fetch my reviews error:', error);
    return [];
  }
}

async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const response = await apiClient.post<APIResponse<Review> | Review>('/api/reviews', payload);
  
  const data = response.data;
  if ('data' in data) {
    return data.data;
  }
  return data as Review;
}

// ============================================================
// REACT QUERY HOOKS
// ============================================================

// Hook to fetch user's reviews
export function useMyReviewsQuery(
  options?: Omit<UseQueryOptions<Review[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: reviewKeys.myReviews(),
    queryFn: fetchMyReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCreateReviewMutation(
  options?: Omit<UseMutationOptions<Review, Error, CreateReviewPayload>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, CreateReviewPayload>({
    mutationFn: createReview,
    onSuccess: () => {
      // Invalidate orders query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate my reviews to refetch
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews() });
    },
    ...options,
  });
}

export type { CreateReviewPayload, Review };
