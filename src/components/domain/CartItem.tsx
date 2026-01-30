'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/types';
import { useAppDispatch } from '@/features/hooks';
import {
  incrementQuantity,
  decrementQuantity,
  removeItem,
} from '@/features/cart/cartSlice';
import { showToast } from '@/features/ui/uiSlice';
import { formatPrice, cn, getImageUrl } from '@/lib/utils';
import { PlusIcon, MinusIcon, TrashIcon } from '@/components/ui/Icons';

// ============================================================
// CART ITEM COMPONENT - With Optimistic UI
// Uses Redux for instant state updates (Optimistic UI pattern)
// UI updates immediately without waiting for server response
// ============================================================

interface CartItemProps {
  item: CartItemType;
  variant?: 'desktop' | 'mobile' | 'sidebar';
  className?: string;
}

export function CartItemCard({
  item,
  variant = 'desktop',
  className,
}: CartItemProps) {
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();
  const [isRemoving, setIsRemoving] = useState(false);

  // Optimistic increment - updates immediately
  const handleIncrement = () => {
    startTransition(() => {
      dispatch(incrementQuantity(item.menuItem.id));
      dispatch(
        showToast({
          message: `Added 1x ${item.menuItem.name}`,
          type: 'success',
        })
      );
    });
  };

  // Optimistic decrement - updates immediately
  const handleDecrement = () => {
    if (item.quantity > 1) {
      startTransition(() => {
        dispatch(decrementQuantity(item.menuItem.id));
      });
    }
  };

  // Optimistic remove with animation
  const handleRemove = () => {
    setIsRemoving(true);
    // Small delay for exit animation
    setTimeout(() => {
      dispatch(removeItem(item.menuItem.id));
      dispatch(
        showToast({
          message: `${item.menuItem.name} removed from cart`,
          type: 'info',
        })
      );
    }, 200);
  };

  const isMobile = variant === 'mobile';
  const isSidebar = variant === 'sidebar';
  const itemTotal = item.menuItem.price * item.quantity;

  // Image size based on variant
  const imageSize = isMobile ? 80 : isSidebar ? 60 : 100;

  return (
    <div
      className={cn(
        'flex gap-3 transition-all duration-200',
        isSidebar ? 'p-3 border-b border-neutral-200' : 'p-4 bg-white rounded-2xl shadow-shadow-card',
        // Optimistic UI animations
        isRemoving && 'opacity-0 scale-95 -translate-x-4',
        isPending && 'opacity-75',
        className
      )}
    >
      {/* Image */}
      <div
        className="relative flex-shrink-0 rounded-xl overflow-hidden"
        style={{ width: imageSize, height: imageSize }}
      >
        <Image
          src={getImageUrl(item.menuItem.image, '/images/placeholder-food.jpg')}
          alt={item.menuItem.name}
          fill
          className="object-cover"
          sizes={`${imageSize}px`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Name */}
          <h3
            className={cn(
              'font-sans font-bold text-neutral-950 truncate',
              isSidebar
                ? 'text-[14px] leading-[20px]'
                : isMobile
                ? 'text-[16px] leading-[24px]'
                : 'text-[18px] leading-[28px]'
            )}
          >
            {item.menuItem.name}
          </h3>

          {/* Price per item */}
          <p
            className={cn(
              'font-sans font-normal text-neutral-500',
              isSidebar
                ? 'text-[12px] leading-[18px]'
                : 'text-[14px] leading-[20px]'
            )}
          >
            {formatPrice(item.menuItem.price)} each
          </p>
        </div>

        {/* Quantity & Total */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls - Optimistic UI */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isPending}
              className={cn(
                'w-8 h-8 rounded-full border border-neutral-300',
                'flex items-center justify-center',
                'text-neutral-700 hover:bg-neutral-50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-focus-ring',
                'transition-all duration-150 active:scale-95'
              )}
              aria-label="Decrease quantity"
            >
              <MinusIcon size={16} />
            </button>

            {/* Quantity with optimistic animation */}
            <span
              className={cn(
                'font-sans font-semibold text-[16px] text-neutral-950 w-8 text-center',
                'transition-transform duration-150',
                isPending && 'scale-110'
              )}
            >
              {item.quantity}
            </span>

            <button
              onClick={handleIncrement}
              disabled={isPending}
              className={cn(
                'w-8 h-8 rounded-full border border-neutral-300',
                'flex items-center justify-center',
                'text-neutral-700 hover:bg-neutral-50',
                'focus:outline-none focus:ring-2 focus:ring-focus-ring',
                'transition-all duration-150 active:scale-95',
                'disabled:opacity-50'
              )}
              aria-label="Increase quantity"
            >
              <PlusIcon size={16} />
            </button>
          </div>

          {/* Total & Delete */}
          <div className="flex items-center gap-3">
            {/* Total with optimistic animation */}
            <span
              className={cn(
                'font-sans font-bold text-brand-error',
                'transition-all duration-150',
                isSidebar
                  ? 'text-[14px] leading-[20px]'
                  : 'text-[16px] leading-[24px]',
                isPending && 'scale-105'
              )}
            >
              {formatPrice(itemTotal)}
            </span>

            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className={cn(
                'p-2 rounded-full text-neutral-500',
                'hover:bg-red-50 hover:text-brand-error',
                'focus:outline-none focus:ring-2 focus:ring-focus-ring',
                'transition-all duration-150 active:scale-95',
                'disabled:opacity-50'
              )}
              aria-label={`Remove ${item.menuItem.name} from cart`}
            >
              <TrashIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
