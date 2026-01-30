'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMenuDetailQuery } from '@/services/queries';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { addItem } from '@/features/cart/cartSlice';
import { showToast } from '@/features/ui/uiSlice';
import { selectIsAuthenticated, selectUser } from '@/features/auth/authSlice';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toast } from '@/components/domain/Toast';
import { StarIcon, ArrowLeftIcon, PlusIcon, MinusIcon } from '@/components/ui/Icons';
import { formatPrice, formatRating, cn } from '@/lib/utils';
import { MenuItem } from '@/types';

// ============================================================
// MENU DETAIL PAGE - From Figma Design (node 37415-8665)
// ============================================================

// Fallback placeholder for missing images
const FIGMA_IMAGES = {
  heroMain: '/figma/5cb626ad3f75f3e738d497924c911c383efb88f9.png',
  heroSecondary: '/figma/fd96f024b18c3eb51334ede16627e5cdb23a1082.png',
  heroThumb1: '/figma/4d8e5050304db505be935b25daef69a5d291fcbb.png',
  heroThumb2: '/figma/ecf3f3b22793faf36c33126a333b9dcabf6a709d.png',
  logo: '/figma/ad8aa2f408491f7e464e378edf6f0040aafc31c0.png',
};

type MenuTab = 'all' | 'food' | 'drink';

interface MenuItemQuantity {
  [key: number]: number;
}

export default function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Restaurant & menu state
  const [activeTab, setActiveTab] = useState<MenuTab>('all');
  const [quantities, setQuantities] = useState<MenuItemQuantity>({});
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllMenus, setShowAllMenus] = useState(false);

  // Fetch restaurant data from API
  const { data: restaurantData, isLoading } = useMenuDetailQuery(parseInt(id));

  // Use API data directly
  const restaurant = restaurantData || {
    id: parseInt(id),
    name: 'Loading...',
    rating: 0,
    location: '',
    distance: '',
    image: FIGMA_IMAGES.heroMain,
    logo: FIGMA_IMAGES.logo,
    gallery: [FIGMA_IMAGES.heroMain, FIGMA_IMAGES.heroSecondary, FIGMA_IMAGES.heroThumb1, FIGMA_IMAGES.heroThumb2],
    totalReviews: 0,
    category: '',
    menus: [],
    reviews: [],
  };

  // Filter menu items by tab
  const restaurantMenus = 'menus' in restaurant ? restaurant.menus : [];
  const filteredMenuItems = (restaurantMenus || []).filter((item: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'food') return item.categoryId === 1;
    if (activeTab === 'drink') return item.categoryId === 5;
    return true;
  });

  // Limit to 8 items unless showAllMenus is true
  const displayedMenuItems = showAllMenus 
    ? filteredMenuItems 
    : filteredMenuItems.slice(0, 8);

  // Reviews to display
  const restaurantReviews = 'reviews' in restaurant ? restaurant.reviews : [];
  const displayedReviews = showAllReviews 
    ? (restaurantReviews || []) 
    : (restaurantReviews || []).slice(0, 6);

  // Handle quantity change
  const handleQuantityChange = (itemId: number, delta: number) => {
    const item = restaurantMenus?.find((i: any) => i.id === itemId);
    if (!item) return;

    const currentQuantity = quantities[itemId] || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);

    // Update local state
    setQuantities((prev) => {
      if (newQuantity === 0) {
        const rest = { ...prev };
        delete rest[itemId];
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });

    // Add to cart immediately
    if (delta > 0 && item) {
      const restaurantName = 'name' in restaurant ? restaurant.name : 'Unknown';
      const restaurantId = 'id' in restaurant ? restaurant.id : 0;
      const restaurantLogo = 'logo' in restaurant ? restaurant.logo : '';
      
      dispatch(addItem({ 
        menuItem: { 
          ...(item as any), 
          restaurantName,
          restaurantId,
          logo: restaurantLogo
        }, 
        quantity: delta 
      }));
      dispatch(showToast({ message: 'Item added to cart!', type: 'success' }));
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Toast />

      {/* Header - Figma: px-[120px], h-[80px], shadow */}
      <Header 
        variant={isAuthenticated ? 'default' : 'beforeLogin'} 
        containerClassName="px-4 sm:px-6 md:px-12 lg:px-[120px]"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-error"></div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && !restaurant.name && (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Restaurant Not Found</h2>
            <p className="text-gray-600 mb-4">The restaurant you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/category')}
              className="px-6 py-2 bg-brand-error text-white rounded-full hover:bg-red-600 transition"
            >
              Back to Restaurants
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container - Figma: gap-[48px] from header, px-[120px] */}
      {!isLoading && restaurant.name && (
      <div className="flex flex-col gap-6 md:gap-[48px] items-center px-4 sm:px-6 md:px-12 lg:px-[120px] pt-6 md:pt-[48px] pb-20 md:pb-[80px]">

        {/* Content Container - Figma: gap-[32px], w-[1200px] */}
        <div className="flex flex-col gap-6 md:gap-[32px] items-start w-full max-w-[1200px]">

          {/* Image Gallery - Figma: gap-[20px] */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-[20px] items-center w-full">
            {/* Main Image - Figma: h-[470px] w-[651px] rounded-[16px] */}
            <div className="relative h-[240px] md:h-[470px] w-full md:w-[651px] rounded-[16px] overflow-hidden md:shrink-0">
              <Image
                src={restaurant.gallery?.[0] || restaurant.image || '/images/placeholder.png'}
                alt={restaurant.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Secondary Images Container - Hidden on mobile */}
            <div className="hidden md:flex flex-1 flex-col gap-[20px] h-[470px]">
              {/* Top Secondary Image - Figma: h-[302px] rounded-[16px] */}
              <div className="relative h-[302px] w-full rounded-[16px] overflow-hidden">
                <Image
                  src={restaurant.gallery?.[1] || restaurant.image || '/images/placeholder.png'}
                  alt={`${restaurant.name} secondary`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Bottom Thumbnails - Figma: gap-[20px], flex-1 */}
              <div className="flex gap-[20px] flex-1">
                <div className="relative flex-1 rounded-[16px] overflow-hidden">
                  <Image
                    src={restaurant.gallery?.[2] || restaurant.image || '/images/placeholder.png'}
                    alt={`${restaurant.name} thumbnail 1`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative flex-1 rounded-[16px] overflow-hidden">
                  <Image
                    src={restaurant.gallery?.[3] || restaurant.image || '/images/placeholder.png'}
                    alt={`${restaurant.name} thumbnail 2`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Info - Figma: gap-[16px] */}
          <div className="flex gap-3 md:gap-[16px] items-start md:items-center w-full">
            {/* Restaurant Logo - Figma: size-[120px] rounded-[100px] */}
            <div className="relative w-16 h-16 md:w-[120px] md:h-[120px] rounded-full overflow-hidden shrink-0">
              <Image
                src={restaurant.logo || restaurant.image || '/images/placeholder.png'}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Restaurant Details - Figma: gap-[4px] */}
            <div className="flex flex-1 flex-col gap-1 md:gap-[4px] items-start">
              {/* Restaurant Name - Figma: text-[32px] leading-[42px] extrabold */}
              <h1 className="font-sans font-extrabold text-xl md:text-[32px] leading-tight md:leading-[42px] text-neutral-950 m-0">
                {restaurant.name}
              </h1>

              {/* Rating Row - Figma: gap-[4px] */}
              <div className="flex gap-1 md:gap-[4px] items-center">
                <StarIcon className="w-5 h-5 md:w-[24px] md:h-[24px]" />
                <span className="font-sans font-semibold text-base md:text-[18px] leading-relaxed md:leading-[32px] tracking-[-0.36px] text-neutral-950">
                  {formatRating(restaurant.rating)}
                </span>
              </div>

              {/* Location Row - Figma: gap-[8px] */}
              <div className="flex gap-2 md:gap-[8px] items-center flex-wrap">
                <span className="font-sans font-medium text-sm md:text-[18px] leading-relaxed md:leading-[32px] text-neutral-950">
                  {restaurant.location}
                </span>
                <span className="w-[2px] h-[2px] rounded-full bg-neutral-950" />
                <span className="font-sans font-medium text-sm md:text-[18px] leading-relaxed md:leading-[32px] text-neutral-950">
                  {restaurant.distance}
                </span>
              </div>
            </div>

            {/* Share Button - Figma: h-[44px] w-[140px] gap-[12px] rounded-[100px] */}
            <button className="flex gap-2 md:gap-[12px] items-center justify-center h-9 md:h-[44px] w-auto md:w-[140px] px-3 md:px-[16px] py-2 md:py-[12px] border border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.19071C7.54305 8.46298 6.6983 8 5.75 8C4.09315 8 2.75 9.34315 2.75 11C2.75 12.6569 4.09315 14 5.75 14C6.6983 14 7.54305 13.537 8.08261 12.8093L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.0517 14 16.207 14.463 15.6674 15.1907L8.72739 11.3706C8.74231 11.2492 8.75 11.1255 8.75 11C8.75 10.8745 8.74231 10.7508 8.72739 10.6294L15.6674 6.80929C16.207 7.53702 17.0517 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-sans font-bold text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px] text-neutral-950">
                Share
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-neutral-200" />

          {/* Menu Section - Figma: gap-[32px] */}
          <div className="flex flex-col gap-[32px] items-center w-full">
            {/* Menu Header */}
            <div className="flex flex-col gap-3 md:gap-[16px] items-start w-full">
              <h2 className="font-sans font-extrabold text-2xl md:text-[32px] leading-tight md:leading-[42px] text-neutral-950 m-0">
                Menu
              </h2>

              {/* Menu Tabs - Figma: px-[16px] py-[8px] rounded-[100px] */}
              <div className="flex gap-2 md:gap-[12px] flex-wrap">
                {(['all', 'food', 'drink'] as MenuTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-3 md:px-[16px] py-1.5 md:py-[8px] rounded-full',
                      'text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px]',
                      'transition-all duration-200',
                      activeTab === tab
                        ? 'border-2 border-[#c12116] bg-[#fef2f2] text-[#c12116] font-bold'
                        : 'border border-neutral-300 text-neutral-950 font-semibold bg-white hover:bg-neutral-50'
                    )}
                  >
                    {tab === 'all' ? 'All Menu' : tab === 'food' ? 'Food' : 'Drink'}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid - Figma: 2 cols mobile, 4 cols desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4 md:gap-x-[20px] md:gap-y-[32px] w-full">
              {displayedMenuItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white flex flex-col items-start rounded-[16px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] w-full"
                >
                  {/* Item Image - Figma: 240x240px rounded-tl-[16px] rounded-tr-[16px] */}
                  <div className="relative w-full aspect-square md:aspect-auto md:h-[240px] rounded-tl-[16px] rounded-tr-[16px] shrink-0 overflow-hidden">
                    <Image
                      src={item.image || '/images/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details - Figma: p-[16px] fixed height */}
                  <div className="flex items-center justify-between p-3 md:p-[16px] shrink-0 w-full min-h-[80px] md:h-[102px]">
                    <div className="flex flex-col items-start justify-center text-[#0a0d12] gap-1 md:gap-[4px]">
                      <p className="font-sans font-medium leading-relaxed text-sm md:text-[16px] tracking-[-0.48px] m-0 line-clamp-1">
                        {item.name}
                      </p>
                      <p className="font-sans font-extrabold leading-relaxed text-base md:text-[18px] tracking-[-0.36px] m-0">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls or Add Button */}
                    {quantities[item.id] && quantities[item.id] > 0 ? (
                      /* Figma: gap-[16px], minus border rounded-[1000px] p-[8px], plus bg-brand-error rounded-[1000px] p-[8px] */
                      <div className="flex items-center gap-2 md:gap-[16px]">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="flex items-center justify-center p-1.5 md:p-[8px] rounded-[100px] border border-neutral-300 text-neutral-950 hover:bg-neutral-50 transition-colors"
                        >
                          <MinusIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <span className="font-sans font-semibold text-base md:text-[18px] leading-relaxed md:leading-[32px] tracking-[-0.36px] text-neutral-950 min-w-[24px] text-center">
                          {quantities[item.id]}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="flex items-center justify-center p-1.5 md:p-[8px] rounded-[100px] bg-[#c12116] text-white hover:bg-opacity-90 transition-colors"
                        >
                          <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                      </div>
                    ) : (
                      /* Add Button - Figma: h-[40px] w-[79px] rounded-[100px] bg-[#c12116] */
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.push('/login');
                            return;
                          }
                          handleQuantityChange(item.id, 1);
                        }}
                        className="h-8 md:h-[40px] w-16 md:w-[79px] flex items-center justify-center p-2 md:p-[8px] bg-[#c12116] text-white rounded-[100px] shrink-0 hover:bg-opacity-90 transition-colors"
                      >
                        <span className="font-sans font-bold text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px]">
                          Add
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button - Only show if more than 8 items */}
            {filteredMenuItems.length > 8 && (
              <button 
                onClick={() => setShowAllMenus(!showAllMenus)}
                className="h-10 md:h-[48px] w-36 md:w-[160px] flex items-center justify-center p-2 md:p-[8px] border border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors"
              >
                <span className="font-sans font-bold text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px] text-neutral-950">
                  {showAllMenus ? 'Show Less' : 'Show More'}
                </span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-neutral-200" />

          {/* Review Section - Figma: gap-[32px] */}
          <div className="flex flex-col gap-[32px] items-center w-full">
            {/* Review Header */}
            <div className="flex flex-col gap-2 md:gap-[8px] items-start w-full">
              <h2 className="font-sans font-extrabold text-2xl md:text-[32px] leading-tight md:leading-[42px] text-neutral-950 m-0">
                Review
              </h2>

              {/* Rating Summary - Figma: gap-[4px] */}
              <div className="flex gap-1 md:gap-[4px] items-center">
                <StarIcon className="w-5 h-5 md:w-[24px] md:h-[24px]" />
                <span className="font-sans font-extrabold text-base md:text-[18px] leading-relaxed md:leading-[32px] tracking-[-0.36px] text-neutral-950">
                  {formatRating(restaurant.rating)}
                </span>
                <span className="font-sans font-extrabold text-sm md:text-[16px] leading-relaxed md:leading-[30px] text-neutral-950">
                  ({restaurant.totalReviews} Ulasan)
                </span>
              </div>
            </div>

            {/* Reviews Grid - Figma: 1 col mobile, 2 cols desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-[20px] w-full">
              {displayedReviews.map((review: any) => (
                <div
                  key={review.id}
                  className="bg-white rounded-[16px] p-3 md:p-[16px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] flex flex-col gap-3 md:gap-[16px]"
                >
                  {/* Reviewer Info - Figma: gap-[12px] */}
                  <div className="flex gap-2 md:gap-[12px] items-start">
                    {/* Avatar - Figma: size-[64px] */}
                    <div className="relative w-12 h-12 md:w-[64px] md:h-[64px] rounded-full overflow-hidden shrink-0 bg-neutral-200">
                      {review.avatar ? (
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-error to-orange-400 text-white font-bold text-2xl">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <h4 className="font-sans font-extrabold text-base md:text-[18px] leading-relaxed md:leading-[32px] tracking-[-0.36px] text-neutral-950 m-0">
                        {review.name}
                      </h4>
                      <p className="font-sans font-normal text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px] text-neutral-950 m-0">
                        {review.date}
                      </p>
                    </div>
                  </div>

                  {/* Rating & Comment - Figma: gap-[8px] */}
                  <div className="flex flex-col gap-2 md:gap-[8px] items-start w-full">
                    {/* Rating Stars - Figma: gap-[2px] */}
                    <div className="flex gap-0.5 md:gap-[2px]">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={cn(
                            'w-5 h-5 md:w-[24px] md:h-[24px]',
                            i < review.rating ? 'text-accent-yellow' : 'text-neutral-300'
                          )}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="font-sans font-normal text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px] text-neutral-950 m-0">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button - Only show if more than 6 reviews */}
            {(restaurantReviews || []).length > 6 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="h-10 md:h-[48px] w-36 md:w-[160px] flex items-center justify-center p-2 md:p-[8px] border border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors"
              >
                <span className="font-sans font-bold text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px] text-neutral-950">
                  {showAllReviews ? 'Show Less' : 'Show More'}
                </span>
              </button>
            )}
          </div>
        </div>
      

      {/* Floating Cart Bar - Figma: fixed bottom, px-[120px], shadow, h-[80px] */}
      {Object.keys(quantities).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white flex items-center justify-between px-4 sm:px-6 md:px-12 lg:px-[120px] py-3 md:py-[18px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] z-50">
          {/* Left Section - Figma: flex-col gap-[2px], w-[107px] */}
          <div className="flex flex-col gap-0.5 md:gap-[2px] items-start w-auto md:w-[107px]">
            {/* Items Row - Figma: gap-[8px] */}
            <div className="flex items-center gap-2 md:gap-[8px]">
              {/* Bag Icon - Figma: size-[24px] */}
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="#0a0d12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="#0a0d12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="#0a0d12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Items text - Figma: font-normal text-[16px] leading-[30px] tracking-[-0.32px] */}
              <span className="font-sans font-normal text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                {Object.values(quantities).reduce((a, b) => a + b, 0)} Items
              </span>
            </div>
            {/* Price - Figma: font-extrabold text-[20px] leading-[34px] */}
            <p className="font-sans font-extrabold text-base md:text-[20px] leading-relaxed md:leading-[34px] text-[#0a0d12] m-0">
              {formatPrice(
                Object.entries(quantities).reduce((total, [id, qty]) => {
                  const item = restaurantMenus?.find((i: any) => i.id === parseInt(id)) as any;
                  return total + (item?.price || 0) * qty;
                }, 0)
              )}
            </p>
          </div>
          {/* Checkout Button - Figma: h-[44px] w-[230px] rounded-[100px] bg-[#c12116] */}
          <button
            onClick={() => {
              // Items already added to cart, just navigate to checkout
              setQuantities({});
              router.push('/checkout');
            }}
            className="h-9 md:h-[44px] w-auto md:w-[230px] flex items-center justify-center px-4 md:px-[8px] py-2 md:py-[8px] bg-[#c12116] text-[#fdfdfd] rounded-[100px] shrink-0 hover:bg-opacity-90 transition-colors"
          >
            <span className="font-sans font-bold text-sm md:text-[16px] leading-relaxed md:leading-[30px] tracking-[-0.32px]">
              Checkout
            </span>
          </button>
        </div>
      )}
      </div>
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}
