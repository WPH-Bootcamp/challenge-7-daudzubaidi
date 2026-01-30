'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMenusQuery } from '@/services/queries';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { setCategory, selectCategory, selectSearchQuery, selectSortBy } from '@/features/filters/filtersSlice';
import { selectIsAuthenticated, selectUser } from '@/features/auth/authSlice';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RestaurantCard } from '@/components/domain/RestaurantCard';
import { CategoryCard } from '@/components/domain/CategoryCard';
import { SearchBar } from '@/components/domain/SearchBar';
import { EmptyState } from '@/components/domain/EmptyState';
import { Toast } from '@/components/domain/Toast';
import { Button } from '@/components/ui/Button';
import { QUICK_CATEGORIES, PAGINATION, ROUTES } from '@/config/constants';
import { MenuItem } from '@/types';

type HomeVariant = 'afterLogin' | 'beforeLogin' | 'scrolling';

interface HomeScreenProps {
  variant?: HomeVariant;
}

export function HomeScreen({ variant = 'afterLogin' }: HomeScreenProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeCategory = useAppSelector(selectCategory);
  const searchQuery = useAppSelector(selectSearchQuery);
  const sortBy = useAppSelector(selectSortBy);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const isBeforeLogin = !isAuthenticated; // Use auth state instead of variant prop
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(9); // Show 9 items initially (3 rows) to display Show More button

  const { data: apiMenus, isLoading } = useMenusQuery({
    category: activeCategory || undefined,
    search: searchQuery || undefined,
  });

  // Use API data directly (React Query for server state)
  const menus = apiMenus || [];

  const filteredMenus = useMemo(() => {
    let result = [...menus];

    if (activeCategory !== null) {
      result = result.filter((item) => item.categoryId === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    return result;
  }, [menus, activeCategory, searchQuery, sortBy]);

  const visibleMenus = filteredMenus.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMenus.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + PAGINATION.DEFAULT_LIMIT);
  };

  const handleCategoryClick = (categoryId: number | null) => {
    // Navigate to category page when "All Restaurant" is clicked
    if (categoryId === 0) {
      router.push(ROUTES.CATEGORY);
      return;
    }
    dispatch(setCategory(categoryId));
    setVisibleCount(PAGINATION.DEFAULT_LIMIT);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerVariant = isBeforeLogin 
    ? (isScrolled ? 'beforeLogin' : 'beforeLoginTransparent')
    : (isScrolled ? 'default' : 'transparent');
  const headerClassName = isScrolled
    ? 'fixed top-0 left-0 right-0 z-50'
    : 'absolute top-0 left-0 right-0 z-50';

  return (
    <>
      {/* FULL WIDTH HERO BACKGROUND - Responsive */}
      <div className="relative w-full h-[600px] md:h-[700px] lg:h-[827px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.png"
            alt="Restaurant background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[59.976%] from-[rgba(0,0,0,0)] to-[110.09%] to-[rgba(0,0,0,0.8)]" />
        </div>

        {/* Header - Full width */}
        <Header
          variant={headerVariant}
          isScrolled={isScrolled}
          className={headerClassName}
          containerClassName="px-4 sm:px-6 md:px-12 lg:px-[120px]"
          userLabelOverride={user?.name}
          userAvatarSrc={user?.avatarSrc}
        />

        {/* Hero Content - Responsive positioning */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:top-[326px] md:translate-y-0 w-[90%] sm:w-[85%] md:w-[712px]">
          <div className="flex flex-col gap-6 md:gap-[40px] items-center">
            <div className="flex flex-col gap-2 md:gap-[8px] items-center text-white w-full">
              <p className="font-sans font-extrabold text-[28px] sm:text-[36px] md:text-[48px] leading-[36px] sm:leading-[46px] md:leading-[60px] text-center w-full m-0">
                Explore Culinary Experiences
              </p>
              <p className="font-sans font-bold text-[16px] sm:text-[20px] md:text-[24px] leading-[24px] sm:leading-[30px] md:leading-[36px] text-center w-full m-0">
                Search and refine your choice to discover the perfect restaurant.
              </p>
            </div>
            <SearchBar variant="hero" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT - Centered */}
      <div className="bg-white relative w-full flex flex-col items-center overflow-hidden">
        <Toast />

        {/* Categories Section - Responsive with horizontal scroll on mobile */}
        <div className="w-full max-w-[1200px] relative mt-8 md:mt-[48px]">
          <div className="flex items-center gap-4 md:gap-5 overflow-x-auto pb-2 scrollbar-hide lg:justify-between lg:overflow-visible px-4 sm:px-6 lg:px-0">
            {QUICK_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                icon={category.icon}
                onClick={() => handleCategoryClick(category.id)}
                variant="desktop"
              />
            ))}
          </div>
        </div>

        {/* Recommended Section - Responsive */}
        <div className="mt-8 md:mt-[48px] w-full max-w-[1200px] px-4 sm:px-6 lg:px-0 pt-6 pb-12 md:pb-[100px] flex flex-col gap-4 md:gap-[32px] items-center justify-center">
          {/* Section Header */}
          <div className="flex font-extrabold items-center justify-between relative w-full">
            <p className="font-sans font-extrabold text-[24px] md:text-[32px] leading-[32px] md:leading-[42px] text-neutral-950 m-0">
              Recommended
            </p>
            <button
              onClick={() => router.push(ROUTES.CATEGORY)}
              className="font-sans font-extrabold text-[14px] md:text-[18px] leading-[24px] md:leading-[32px] text-[#c12116] text-right tracking-[-0.28px] md:tracking-[-0.36px] cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              See All
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-[20px] w-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-[114px] sm:h-[140px] md:h-[152px] bg-neutral-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredMenus.length === 0 && (
            <EmptyState
              title="No restaurants found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : 'No restaurants available in this category.'
              }
              icon="search"
              action={{
                label: 'Clear Filters',
                onClick: () => {
                  dispatch(setCategory(null));
                },
              }}
            />
          )}

          {/* Restaurant Cards - Mobile: vertical stack, Desktop: grid */}
          {!isLoading && filteredMenus.length > 0 && (
            <>
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-[20px] w-full">
                {visibleMenus.map((item) => (
                  <RestaurantCard
                    key={item.id}
                    item={item}
                    variant="desktop"
                    showPrice={false}
                    showActions={false}
                  />
                ))}
              </div>

            {/* Show More Button */}
              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={handleShowMore}
                    className="w-[160px] h-[48px] px-[8px]"
                  >
                    Show More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer - Full width, outside centered container */}
      <Footer />
    </>
  );
}
