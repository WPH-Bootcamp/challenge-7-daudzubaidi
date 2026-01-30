import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiClient from '@/services/api/axios';
import { API_ENDPOINTS } from '@/config/constants';
import { Order, CreateOrderPayload, APIResponse } from '@/types';

// ============================================================
// QUERY KEYS
// ============================================================
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
};

// ============================================================
// FETCH FUNCTIONS
// ============================================================

// Transform API response to Order format
function transformApiOrderToOrder(apiOrder: any): Order {
  // Flatten all items from all restaurants
  const allItems: any[] = [];
  let itemIdCounter = 0;
  
  apiOrder.restaurants?.forEach((restaurantGroup: any) => {
    restaurantGroup.items?.forEach((item: any) => {
      allItems.push({
        id: itemIdCounter++,
        menuId: item.menuId,
        menuName: item.menuName,
        menuImage: item.image,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.itemTotal,
      });
    });
  });

  // Get first restaurant name and ID for display
  const firstRestaurant = apiOrder.restaurants?.[0]?.restaurant;
  const firstRestaurantName = firstRestaurant?.name || 'Restaurant';
  const firstRestaurantId = firstRestaurant?.id || 0;
  
  // Get review data if exists
  const review = apiOrder.review ? {
    star: apiOrder.review.star,
    comment: apiOrder.review.comment,
  } : undefined;
  
  return {
    id: apiOrder.id,
    transactionId: apiOrder.transactionId,
    customerName: '',
    customerPhone: '',
    customerAddress: apiOrder.deliveryAddress || '',
    restaurantName: firstRestaurantName,
    restaurantId: firstRestaurantId,
    items: allItems,
    subtotal: apiOrder.pricing?.subtotal || 0,
    tax: apiOrder.pricing?.serviceFee || 0,
    total: apiOrder.pricing?.totalPrice || 0,
    status: apiOrder.status === 'done' ? 'completed' : (apiOrder.status || 'pending'),
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
    review,
  };
}

// Fetch all orders
async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get<APIResponse<Order[]> | Order[]>(API_ENDPOINTS.ORDERS);

    const data = response.data;

    // Handle different response structures
    if (!data) {
      return [];
    }

    // Direct array response
    if (Array.isArray(data)) {
      return data.map(transformApiOrderToOrder);
    }

    // Nested structure with data field
    if ('data' in data) {
      const innerData = data.data;

      // Check if innerData has 'orders' field (API structure: { data: { orders: [...] } })
      if (innerData && typeof innerData === 'object' && 'orders' in innerData) {
        const orders = (innerData as any).orders;
        if (Array.isArray(orders)) {
          return orders.map(transformApiOrderToOrder);
        }
      }

      // Direct array in data field
      if (Array.isArray(innerData)) {
        return innerData.map(transformApiOrderToOrder);
      }

      return [];
    }

    return [];
  } catch {
    return [];
  }
}

// Fetch single order
async function fetchOrderDetail(id: number): Promise<Order> {
  const response = await apiClient.get<APIResponse<Order> | Order>(API_ENDPOINTS.ORDER_DETAIL(id));

  const data = response.data;
  if ('data' in data) {
    return data.data;
  }
  return data as Order;
}

// Create new order
async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await apiClient.post<APIResponse<Order> | Order>(API_ENDPOINTS.ORDERS, payload);

  const data = response.data;
  if ('data' in data) {
    return data.data;
  }
  return data as Order;
}

// ============================================================
// REACT QUERY HOOKS
// ============================================================

// Hook to fetch all orders
export function useOrdersQuery(
  options?: Omit<UseQueryOptions<Order[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: fetchOrders,
    staleTime: 1 * 60 * 1000, // 1 minute (orders change more frequently)
    ...options,
  });
}

// Hook to fetch single order
export function useOrderDetailQuery(
  id: number,
  options?: Omit<UseQueryOptions<Order, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => fetchOrderDetail(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// ============================================================
// CREATE ORDER MUTATION - With Optimistic UI
// ============================================================
// Implements optimistic update pattern:
// - Immediately shows success state while request is pending
// - Rolls back on error
// - Refetches to sync with server on success
// ============================================================

interface CreateOrderContext {
  previousOrders: Order[] | undefined;
}

export function useCreateOrderMutation(
  options?: Omit<UseMutationOptions<Order, Error, CreateOrderPayload, CreateOrderContext>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, CreateOrderPayload, CreateOrderContext>({
    mutationFn: createOrder,

    // Optimistic update: Add order to cache before server responds
    onMutate: async (newOrder): Promise<CreateOrderContext> => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData<Order[]>(orderKeys.lists());

      // Flatten items from all restaurants for optimistic order
      const allItems = newOrder.restaurants?.flatMap((restaurant) =>
        restaurant.items?.map((item, index) => ({
          id: index,
          menuId: item.menuId,
          menuName: `Item ${item.menuId}`,
          quantity: item.quantity,
          price: 0,
          subtotal: 0,
        })) || []
      ) || [];

      // Optimistically add the new order to the list
      const optimisticOrder: Order = {
        id: Date.now(), // Temporary ID
        customerName: '',
        customerPhone: '',
        customerAddress: newOrder.deliveryAddress,
        items: allItems,
        subtotal: 0,
        tax: 0,
        total: 0,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Order[]>(orderKeys.lists(), (old) => {
        return old ? [optimisticOrder, ...old] : [optimisticOrder];
      });

      // Return context with the snapshotted value
      return { previousOrders };
    },

    // If mutation fails, rollback to the previous value
    onError: (_err, _newOrder, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.lists(), context.previousOrders);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },

    onSuccess: (data) => {
      // Add the real order to cache
      queryClient.setQueryData(orderKeys.detail(data.id), data);
    },

    ...options,
  });
}
