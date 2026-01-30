'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem } from '@/types';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { addItem, selectCartItemQuantity } from '@/features/cart/cartSlice';
import { showToast } from '@/features/ui/uiSlice';
import { formatPrice, formatRating, cn, getImageUrl } from '@/lib/utils';
import { ROUTES } from '@/config/constants';
import { StarIcon, PlusIcon } from '@/components/ui/Icons';

// ============================================================
// RESTAURANT CARD COMPONENT - From Figma Design System
// ============================================================

interface RestaurantCardProps {
  item: MenuItem;
  variant?: 'desktop' | 'mobile';
  showPrice?: boolean;
  showActions?: boolean;
  className?: string;
}

export function RestaurantCard({
  item,
  variant = 'desktop',
  showPrice = true,
  showActions = true,
  className,
}: RestaurantCardProps) {
  const dispatch = useAppDispatch();
  const cartQuantity = useAppSelector(selectCartItemQuantity(item.id));
  const [imgSrc, setImgSrc] = useState(getImageUrl(item.image, '/images/placeholder-food.svg'));

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(addItem({ menuItem: item, quantity: 1 }));
    dispatch(
      showToast({
        message: `${item.name} added to cart`,
        type: 'success',
      })
    );
  };

  const isMobile = variant === 'mobile';

  // Card styles based on variant - from Figma
  const cardStyles = cn(
    'bg-white rounded-[16px]',
    'shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)]',
    'overflow-hidden',
    'cursor-pointer',
    'w-full',
    className
  );

  // Content container styles - Match Figma: p-[12px] and gap-[8px]
  const contentStyles = cn(
    'flex gap-[8px] p-[12px] items-center',
    'flex-row'
  );

  // Image styles
  const imageStyles = cn(
    'relative flex-shrink-0 rounded-xl overflow-hidden', // rounded-[12px]
    isMobile ? 'w-[90px] h-[90px]' : 'w-[120px] h-[120px]'
  );

  return (
    <Link href={ROUTES.MENU_DETAIL(item.id)} className={cardStyles}>
      <div className={contentStyles}>
        {/* Image */}
        <div className={imageStyles}>
          <Image
            src={imgSrc}
            alt={item.name}
            fill
            className="object-cover"
            sizes={isMobile ? '90px' : '120px'}
            onError={() => setImgSrc('/images/placeholder-food.svg')}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          {/* Name */}
          <h3
            className={cn(
              'mb-0 font-sans font-extrabold text-neutral-950 truncate',
              isMobile
                ? 'text-[16px] leading-[30px] tracking-[-0.32px]'
                : 'text-[18px] leading-[32px] tracking-[-0.36px]'
            )}
          >
            {item.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <StarIcon size={isMobile ? 20 : 24} />
            <span
              className={cn(
                'font-sans font-medium text-neutral-950',
                isMobile
                  ? 'text-[14px] leading-[28px] tracking-[-0.42px]'
                  : 'text-[16px] leading-[30px] tracking-[-0.48px]'
              )}
            >
              {formatRating(item.rating)}
            </span>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-sans font-normal text-neutral-950',
                isMobile
                  ? 'text-[14px] leading-[28px] tracking-[-0.28px]'
                  : 'text-[16px] leading-[30px] tracking-[-0.32px]'
              )}
            >
              {item.location || 'Jakarta Selatan'}
            </span>
            <span className="w-0.5 h-0.5 rounded-full bg-neutral-950" />
            <span
              className={cn(
                'font-sans font-normal text-neutral-950',
                isMobile
                  ? 'text-[14px] leading-[28px] tracking-[-0.28px]'
                  : 'text-[16px] leading-[30px] tracking-[-0.32px]'
              )}
            >
              {item.distance || '2.4 km'}
            </span>
          </div>

          {/* Price */}
          {showPrice && (
            <p
              className={cn(
                'mb-0 font-sans font-bold text-brand-error mt-1',
                isMobile
                  ? 'text-[14px] leading-[20px]'
                  : 'text-[16px] leading-[24px]'
              )}
            >
              {formatPrice(item.price)}
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        {showActions && (
          <div className="flex-shrink-0 flex items-end">
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-2">
                <span className="font-sans font-semibold text-[14px] text-neutral-950">
                  {cartQuantity}
                </span>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className={cn(
                  'w-8 h-8 rounded-full',
                  'bg-brand-error text-white',
                  'flex items-center justify-center',
                  'hover:bg-opacity-90 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2'
                )}
                aria-label={`Add ${item.name} to cart`}
              >
                <PlusIcon size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
