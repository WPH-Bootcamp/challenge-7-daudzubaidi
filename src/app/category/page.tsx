'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RestaurantCard } from '@/components/domain/RestaurantCard';
import { StarIcon } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { MenuItem } from '@/types';
import { useAppSelector } from '@/features/hooks';
import { selectIsAuthenticated, selectUser } from '@/features/auth/authSlice';
import { useMenusQuery } from '@/services/queries';

// ============================================================
// CATEGORY PAGE - From Figma Design (node 37412-4224)
// ============================================================

const DISTANCE_OPTIONS = [
  { label: 'Nearby', checked: true },
  { label: 'Within 1 km', checked: false },
  { label: 'Within 3 km', checked: false },
  { label: 'Within 5 km', checked: false },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];

// Checkbox component matching Figma design
function FilterCheckbox({ checked = false }: { checked?: boolean }) {
  return (
    <div
      className={cn(
        'flex h-[20px] w-[20px] items-center justify-center rounded-[6px] shrink-0',
        checked ? 'bg-[#c12116]' : 'border border-[#a4a7ae]'
      )}
    >
      {checked && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.6667 3.5L5.25 9.91667L2.33333 7"
            stroke="#fdfdfd"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

// Mobile Filter Drawer Component
function MobileFilterDrawer({
  isOpen,
  onClose,
  selectedDistance,
  onDistanceChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  minRating,
  onRatingChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedDistance: string;
  onDistanceChange: (distance: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  minRating: number | null;
  onRatingChange: (rating: number) => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 overflow-y-auto lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#d5d7da]">
          <h2 className="font-sans font-extrabold text-[18px] leading-[32px] text-[#0a0d12]">
            FILTER
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#0a0d12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex flex-col gap-[24px] p-4">
          {/* Distance Filter */}
          <div className="flex flex-col gap-[10px]">
            <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
              Distance
            </p>
            {['Nearby', 'Within 1 km', 'Within 3 km', 'Within 5 km'].map((option) => (
              <button
                key={option}
                onClick={() => onDistanceChange(option)}
                className="flex gap-[8px] items-center w-full cursor-pointer hover:opacity-80 transition-opacity"
              >
                <FilterCheckbox checked={selectedDistance === option} />
                <p className="font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                  {option}
                </p>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-[#d5d7da]" />

          {/* Price Filter */}
          <div className="flex flex-col gap-[10px]">
            <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
              Price
            </p>
            <div className="flex gap-[8px] items-center p-[8px] rounded-[8px] border border-[#d5d7da] w-full">
              <div className="flex items-center justify-center p-[8px] rounded-[4px] bg-[#f5f5f5] h-[38px] w-[38px] shrink-0">
                <span className="font-sans font-bold text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                  Rp
                </span>
              </div>
              <input
                type="number"
                placeholder="Minimum Price"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="flex-1 bg-transparent font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12] placeholder:text-[#717680] focus:outline-none"
              />
            </div>
            <div className="flex gap-[8px] items-center p-[8px] rounded-[8px] border border-[#d5d7da] w-full">
              <div className="flex items-center justify-center p-[8px] rounded-[4px] bg-[#f5f5f5] h-[38px] w-[38px] shrink-0">
                <span className="font-sans font-bold text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                  Rp
                </span>
              </div>
              <input
                type="number"
                placeholder="Maximum Price"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="flex-1 bg-transparent font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12] placeholder:text-[#717680] focus:outline-none"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-[#d5d7da]" />

          {/* Rating Filter */}
          <div className="flex flex-col gap-[10px]">
            <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
              Rating
            </p>
            <div className="flex flex-col items-start w-full">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onRatingChange(rating)}
                  className="flex flex-col items-start p-[8px] w-full cursor-pointer hover:bg-neutral-50 rounded transition-colors"
                >
                  <div className="flex gap-[8px] items-center">
                    <FilterCheckbox checked={minRating === rating} />
                    <div className="flex gap-[2px] items-center">
                      <StarIcon size={24} />
                      <span className="font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                        {rating}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#c12116] text-white rounded-full font-sans font-extrabold text-[16px] hover:bg-[#a91013] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

export default function CategoryPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  
  // Mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter states
  const [selectedDistance, setSelectedDistance] = useState<string>('Nearby');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number | null>(null);

  // Fetch restaurants from API
  const { data: apiRestaurants, isLoading } = useMenusQuery();
  const restaurants = apiRestaurants || [];

  // Filter restaurants based on selected filters
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Filter by distance (client-side approximation)
    if (selectedDistance !== 'Nearby') {
      const maxKm = parseInt(selectedDistance.split(' ')[1]);
      result = result.filter(item => {
        const distanceValue = parseFloat(item.distance?.split(' ')[0] || '0');
        return distanceValue <= maxKm;
      });
    }

    // Filter by price range
    if (minPrice) {
      const min = parseInt(minPrice);
      result = result.filter(item => item.price >= min);
    }
    if (maxPrice) {
      const max = parseInt(maxPrice);
      result = result.filter(item => item.price <= max);
    }

    // Filter by rating
    if (minRating !== null) {
      result = result.filter(item => (item.rating || 0) >= minRating);
    }

    return result;
  }, [restaurants, selectedDistance, minPrice, maxPrice, minRating]);

  const handleDistanceChange = (distance: string) => {
    setSelectedDistance(distance);
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(minRating === rating ? null : rating);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        selectedDistance={selectedDistance}
        onDistanceChange={handleDistanceChange}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        minRating={minRating}
        onRatingChange={handleRatingChange}
      />

      {/* Header - Responsive padding: mobile 16px, desktop 120px */}
      <Header
        variant={isAuthenticated ? 'default' : 'beforeLogin'}
        className="shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)]"
        containerClassName="px-4 lg:px-[120px]"
        userLabelOverride={user?.name}
        userAvatarSrc={user?.avatarSrc}
      />

      {/* Main Content - Mobile: 16px horizontal, 16px top, 40px bottom; Desktop: 0 horizontal, 48px top, 80px bottom */}
      <div className="w-full flex justify-center">
        <div className="flex flex-col gap-4 lg:gap-[32px] items-start w-full max-w-[1200px] px-4 lg:px-0 pt-4 lg:pt-[48px] pb-10 lg:pb-[80px]">
          {/* Page Title - Mobile: 24px/36px, Desktop: 32px/42px */}
          <h1 className="font-sans font-extrabold text-[24px] lg:text-[32px] leading-[36px] lg:leading-[42px] text-[#0a0d12] w-full">
            All Restaurant
          </h1>

          {/* Mobile Filter Toggle Button - Frame 116 from Figma: 52px height, 12px padding */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex gap-[8px] items-center justify-between p-3 rounded-lg border border-[#d5d7da] bg-white w-full hover:bg-neutral-50 transition-colors h-[52px]"
          >
            <span className="font-sans font-extrabold text-[16px] leading-[28px] text-[#0a0d12]">
              FILTER
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5.83333H17.5" stroke="#0a0d12" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 10H15" stroke="#0a0d12" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7.5 14.1667H12.5" stroke="#0a0d12" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Two Column Layout - Desktop only shows sidebar, mobile hides it */}
          <div className="flex gap-[40px] items-start w-full">
            {/* Left Column - Filter Sidebar - Hidden on mobile */}
            <aside className="hidden lg:flex bg-white flex-col gap-[24px] items-start py-[16px] rounded-[12px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] shrink-0 w-[266px]">
              {/* Distance Filter Section - Figma: px-[16px] gap-[10px] */}
              <div className="flex flex-col gap-[10px] items-start px-[16px] w-full">
                <p className="font-sans font-extrabold text-[16px] leading-[30px] text-[#0a0d12]">
                  FILTER
                </p>
                <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
                  Distance
                </p>
                {['Nearby', 'Within 1 km', 'Within 3 km', 'Within 5 km'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleDistanceChange(option)}
                    className="flex gap-[8px] items-center w-full cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <FilterCheckbox checked={selectedDistance === option} />
                    <p className="font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                      {option}
                    </p>
                  </button>
                ))}
              </div>

              {/* Divider - Figma: 1px line */}
              <div className="h-px w-full bg-[#d5d7da]" />

              {/* Price Filter Section - Figma: px-[16px] gap-[10px] */}
              <div className="flex flex-col gap-[10px] items-start px-[16px] w-full">
                <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
                  Price
                </p>
                {/* Minimum Price Input - Figma: p-[8px] rounded-[8px] border gap-[8px] */}
                <div className="flex gap-[8px] items-center p-[8px] rounded-[8px] border border-[#d5d7da] w-full">
                  <div className="flex items-center justify-center p-[8px] rounded-[4px] bg-[#f5f5f5] h-[38px] w-[38px] shrink-0">
                    <span className="font-sans font-bold text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                      Rp
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="Minimum Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="flex-1 bg-transparent font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12] placeholder:text-[#717680] focus:outline-none"
                  />
                </div>
                {/* Maximum Price Input */}
                <div className="flex gap-[8px] items-center p-[8px] rounded-[8px] border border-[#d5d7da] w-full">
                  <div className="flex items-center justify-center p-[8px] rounded-[4px] bg-[#f5f5f5] h-[38px] w-[38px] shrink-0">
                    <span className="font-sans font-bold text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                      Rp
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="Maximum Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="flex-1 bg-transparent font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12] placeholder:text-[#717680] focus:outline-none"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-[#d5d7da]" />

              {/* Rating Filter Section - Figma: px-[16px] gap-[10px] */}
              <div className="flex flex-col gap-[10px] items-start px-[16px] w-full">
                <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
                  Rating
                </p>
                <div className="flex flex-col items-start w-full">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className="flex flex-col items-start p-[8px] w-full cursor-pointer hover:bg-neutral-50 rounded transition-colors"
                    >
                      <div className="flex gap-[8px] items-center">
                        <FilterCheckbox checked={minRating === rating} />
                        <div className="flex gap-[2px] items-center">
                          <StarIcon size={24} />
                          <span className="font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12]">
                            {rating}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Right Column - Restaurant Cards - Responsive layout */}
            <section className="flex flex-1 flex-col gap-4 lg:gap-[20px] items-start min-w-0">
              {/* Loading State - Responsive */}
              {isLoading && (
                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-[20px] w-full">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[114px] lg:h-[152px] bg-neutral-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredRestaurants.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full py-[80px] gap-[16px]">
                  <p className="font-sans font-bold text-[18px] text-neutral-500">
                    No restaurants found
                  </p>
                  <p className="font-sans text-[14px] text-neutral-400">
                    Try adjusting your filters
                  </p>
                </div>
              )}

              {/* Restaurant Cards - Mobile: vertical stack, Desktop: 2-column grid */}
              {!isLoading && filteredRestaurants.length > 0 && (
                <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-[20px] w-full">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      item={restaurant}
                      variant="desktop"
                      showPrice={false}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
