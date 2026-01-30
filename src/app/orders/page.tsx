'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOrdersQuery } from '@/services/queries';
import { useCreateReviewMutation, useMyReviewsQuery } from '@/services/queries/useReviewQuery';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/domain/EmptyState';
import { Toast } from '@/components/domain/Toast';
import { ReviewModal } from '@/components/domain/ReviewModal';
import { formatPrice, cn, getImageUrl } from '@/lib/utils';
import { ROUTES } from '@/config/constants';
import { Order, OrderStatus } from '@/types';
import { LocationIcon, FileIcon, LogoutIcon } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { useAppSelector, useAppDispatch } from '@/features/hooks';
import { selectUser } from '@/features/auth/authSlice';
import { logout as logoutAction } from '@/features/auth/authSlice';
import { showToast } from '@/features/ui/uiSlice';

// ============================================================
// ORDERS/HISTORY PAGE - From Figma Design
// ============================================================

const STATUS_FILTERS: { id: string; label: string; matches: OrderStatus[] }[] = [
  { id: 'all', label: 'All Orders', matches: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'] },
  { id: 'preparing', label: 'Preparing', matches: ['pending', 'confirmed', 'preparing'] },
  { id: 'on-the-way', label: 'On the Way', matches: ['ready'] },
  { id: 'delivered', label: 'Delivered', matches: ['delivered'] },
  { id: 'done', label: 'Done', matches: ['completed'] },
  { id: 'canceled', label: 'Canceled', matches: ['cancelled'] },
];

// Shadow style from Figma
const cardShadow = { boxShadow: '0px 0px 20px 0px rgba(203, 202, 202, 0.25)' };

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { data: apiOrders, isLoading } = useOrdersQuery();
  const { data: myReviews } = useMyReviewsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<Record<string, { star: number; comment: string }>>(() => {
    // Load reviewed orders from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reviewed_orders');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const createReviewMutation = useCreateReviewMutation({
    onSuccess: (_data, variables) => {
      // Mark order as reviewed with rating and comment
      if (selectedOrderId) {
        const order = orders.find(o => o.id === selectedOrderId);
        if (order?.transactionId) {
          const newReviewedOrders = {
            ...reviewedOrders,
            [order.transactionId]: {
              star: variables.star,
              comment: variables.comment,
            },
          };
          setReviewedOrders(newReviewedOrders);
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('reviewed_orders', JSON.stringify(newReviewedOrders));
          }
        }
      }

      dispatch(
        showToast({
          message: 'Review submitted successfully!',
          type: 'success',
        })
      );
      setReviewModalOpen(false);
      setSelectedOrderId(null);
    },
    onError: (error) => {
      dispatch(
        showToast({
          message: error.message || 'Failed to submit review. Please try again.',
          type: 'error',
        })
      );
    },
  });

  // Handle opening review modal
  const handleOpenReview = (orderId: number) => {
    setSelectedOrderId(orderId);
    setReviewModalOpen(true);
  };

  // Handle submitting review
  const handleSubmitReview = (rating: number, comment: string) => {
    if (!selectedOrderId) return;
    
    // Find the order to get transactionId and restaurantId
    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) return;

    // Get transactionId and restaurantId from order
    const transactionId = order.transactionId || `TXN${order.id}`;
    const restaurantId = order.restaurantId || 0;

    if (!restaurantId) {
      dispatch(
        showToast({
          message: 'Unable to submit review. Restaurant information missing.',
          type: 'error',
        })
      );
      return;
    }

    createReviewMutation.mutate({
      transactionId,
      restaurantId,
      star: rating, // API expects 'star' field
      comment,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    dispatch(logoutAction());
    router.push(ROUTES.LOGIN);
  };

  const orders = apiOrders || [];

  // Create a map of transactionId to review data from API
  const reviewsMap = useMemo(() => {
    const map: Record<string, { star: number; comment: string }> = {};
    myReviews?.forEach((review) => {
      if (review.transactionId) {
        map[review.transactionId] = {
          star: review.star,
          comment: review.comment,
        };
      }
    });
    return map;
  }, [myReviews]);

  const activeStatus = STATUS_FILTERS.find((filter) => filter.id === activeFilter);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = activeStatus ? activeStatus.matches.includes(order.status) : true;
      if (!matchesStatus) return false;

      if (!normalizedQuery) return true;
      const restaurant = order.restaurantName ?? order.items?.[0]?.menuName ?? '';
      const itemNames = order.items?.map((item) => item.menuName).join(' ') ?? '';
      return `${restaurant} ${itemNames}`.toLowerCase().includes(normalizedQuery);
    });
  }, [orders, searchQuery, activeStatus]);

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Toast />
      <Header
        variant="default"
        className="shadow-shadow-card border-b-0"
        containerClassName="px-4 lg:px-[120px]"
      />

      {/* Main Content Container - Responsive */}
      <div className="flex justify-center px-4 lg:px-[120px] py-6 lg:py-[48px] pb-12 lg:pb-[80px]">
        <div className="flex flex-col lg:flex-row items-start w-full max-w-[1200px] gap-4 lg:gap-[32px]">
          {/* Sidebar Profile - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:flex bg-white rounded-[16px] flex-col shrink-0 w-full lg:w-[240px] p-5 gap-6 shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)]">
            {/* Profile Header */}
            <div className="flex items-center gap-2">
              <Avatar
                src={user?.avatarSrc}
                name={user?.name || 'User'}
                size={48}
              />
              <span className="font-bold text-[18px] leading-[32px] tracking-[-0.54px] text-[#0a0d12]">
                {user?.name || 'User'}
              </span>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-[#e9eaeb]" />

            {/* Navigation Menu */}
            <Link
              href={ROUTES.PROFILE}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <LocationIcon size={24} className="shrink-0 text-[#0a0d12]" />
              <span className="font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-[#0a0d12]">
                Delivery Address
              </span>
            </Link>

            <Link
              href={ROUTES.ORDERS}
              className="flex items-center gap-2"
            >
              <FileIcon size={24} className="shrink-0 text-[#c12116]" />
              <span className="font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-[#c12116]">
                My Orders
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <LogoutIcon size={24} className="shrink-0 text-[#0a0d12]" />
              <span className="font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-[#0a0d12]">
                Logout
              </span>
            </button>
          </aside>

          {/* Orders Content */}
          <section className="flex-1 flex flex-col min-w-0 gap-4 lg:gap-6">
            <h1 className="font-extrabold text-2xl lg:text-[32px] leading-tight lg:leading-[42px] text-[#0a0d12]">
              My Orders
            </h1>

            {/* White Content Panel */}
            <div className="bg-white rounded-[16px] flex flex-col p-4 lg:p-6 gap-4 lg:gap-5 shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)]">
              {/* Search Bar - Responsive */}
              <div className="flex items-center bg-white border border-[#d5d7da] rounded-full w-full max-w-[598px] h-10 lg:h-[44px] px-3 lg:px-4 py-2 gap-[6px]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                  <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18.5 18.5l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search "
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="flex-1 bg-transparent font-normal text-[14px] leading-[28px] tracking-[-0.28px] text-[#0a0d12] placeholder:text-[#535862] focus:outline-none"
                />
              </div>

              {/* Status Filters - Responsive wrap */}
              <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                <span className="font-bold text-sm lg:text-[18px] leading-tight lg:leading-[32px] tracking-[-0.48px] lg:tracking-[-0.54px] text-[#0a0d12]">
                  Status
                </span>
                {STATUS_FILTERS.map((filter) => {
                  const isActive = filter.id === activeFilter;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        'flex items-center justify-center rounded-full border text-xs lg:text-[16px] leading-tight lg:leading-[30px] tracking-[-0.28px] lg:tracking-[-0.32px] px-2.5 lg:px-4 py-1 lg:py-1.5 whitespace-nowrap',
                        isActive
                          ? 'bg-[#ffecec] border-[#c12116] text-[#c12116] font-bold'
                          : 'border-[#d5d7da] text-[#0a0d12] font-semibold'
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col gap-4">
                  {[...Array(2)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-neutral-100 animate-pulse rounded-[16px] h-[150px] lg:h-[200px]"
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredOrders.length === 0 && (
                <EmptyState
                  title="No orders yet"
                  description="You haven't placed any orders yet. Start exploring our menu and place your first order!"
                  icon="orders"
                  action={{
                    label: 'Browse Menu',
                    onClick: () => router.push(ROUTES.HOME),
                  }}
                />
              )}

              {/* Order Cards */}
              {!isLoading && filteredOrders.length > 0 && (
                <div className="flex flex-col gap-4">
                  {filteredOrders.map((order) => {
                    const reviewData = order.transactionId 
                      ? (reviewsMap[order.transactionId] || order.review || reviewedOrders[order.transactionId])
                      : undefined;
                    
                    return (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onReview={() => handleOpenReview(order.id)}
                        reviewData={reviewData}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Footer />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedOrderId(null);
        }}
        onSubmit={handleSubmitReview}
        isLoading={createReviewMutation.isPending}
        orderId={selectedOrderId ?? undefined}
      />
    </main>
  );
}

function OrderCard({ order, onReview, reviewData }: { order: Order; onReview: () => void; reviewData?: { star: number; comment: string } }) {
  const restaurantName = order.restaurantName ?? order.items?.[0]?.menuName ?? 'Restaurant';
  const item = order.items?.[0];
  const quantity = item?.quantity ?? 1;
  const price = item?.price ?? 0;
  const total = order.total || order.subtotal || 0;
  const itemImage = item?.menuImage;

  const formatPriceTight = (value: number) => formatPrice(value).replace('Rp ', 'Rp');

  return (
    <div
      className="bg-white flex flex-col w-full"
      style={{ borderRadius: '16px', padding: 'clamp(16px, 4vw, 20px)', gap: '16px', ...cardShadow }}
    >
      <div className="flex items-center" style={{ gap: '8px' }}>
        <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs lg:text-sm">
          {restaurantName.charAt(0)}
        </div>
        <span className="font-bold text-base lg:text-lg text-gray-900">
          {restaurantName}
        </span>
      </div>

      <div className="flex items-center justify-between w-full" style={{ gap: 'clamp(12px, 3vw, 17px)' }}>
        <div className="flex items-center flex-1" style={{ gap: 'clamp(12px, 3vw, 17px)' }}>
          <div
            className="relative overflow-hidden shrink-0 bg-neutral-100"
            style={{ borderRadius: '12px', width: 'clamp(64px, 15vw, 80px)', height: 'clamp(64px, 15vw, 80px)' }}
          >
            {itemImage ? (
              <Image
                src={getImageUrl(itemImage)}
                alt={item?.menuName ?? 'Food'}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-2xl font-bold">
                {(item?.menuName ?? 'F').charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-medium text-sm lg:text-base text-gray-900">
              {item?.menuName ?? 'Food Name'}
            </span>
            <span className="font-extrabold text-sm lg:text-base text-gray-900">
              {quantity} x {formatPriceTight(price)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: '0px', width: '100%', borderTop: '1px solid #d5d7da' }} />

      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col" style={{ paddingBottom: '4px' }}>
          <span className="font-medium text-sm lg:text-base text-gray-900">
            Total
          </span>
          <span className="font-extrabold text-lg lg:text-xl text-gray-900">
            {formatPriceTight(total)}
          </span>
        </div>
        {!reviewData ? (
          <button
            type="button"
            onClick={onReview}
            className="flex items-center justify-center bg-red-600 font-bold text-sm lg:text-base text-white hover:bg-red-700 transition-colors"
            style={{ borderRadius: '200px', width: 'clamp(160px, 40vw, 240px)', height: 'clamp(40px, 10vw, 48px)', padding: '8px' }}
          >
            Give Review
          </button>
        ) : (
          <div className="flex flex-col" style={{ width: 'clamp(160px, 40vw, 240px)', gap: '4px' }}>
            <div className="flex items-center" style={{ gap: '4px' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: i < reviewData.star ? '#fbbf24' : '#d5d7da', fontSize: '20px' }}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">
              {reviewData.comment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
