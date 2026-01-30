'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'cart' | 'search' | 'orders' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = 'cart',
  action,
  className,
}: EmptyStateProps) {
  // Icon mapping
  const iconPaths: Record<string, string> = {
    cart: '/images/empty-cart.svg',
    search: '/images/empty-search.svg',
    orders: '/images/empty-orders.svg',
    error: '/images/error.svg',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-16 px-4 text-center',
        className
      )}
    >
      {/* Icon/Illustration */}
      <div className="relative w-[200px] h-[200px] mb-6">
        <Image
          src={iconPaths[icon] || iconPaths.cart}
          alt=""
          fill
          className="object-contain opacity-60"
        />
      </div>

      {/* Title */}
      <h3 className="font-sans font-bold text-[24px] leading-[36px] text-neutral-950 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px] text-neutral-500 max-w-[400px] mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
