'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================
// CATEGORY CARD COMPONENT - From Figma Design System
// ============================================================

interface CategoryCardProps {
  id: number;
  name: string;
  icon?: string;
  isActive?: boolean;
  variant?: 'desktop' | 'mobile';
  onClick?: () => void;
  className?: string;
}

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  'all-food': '/images/categories/all-food.png',
  location: '/images/categories/location.png',
  discount: '/images/categories/discount.png',
  'best-seller': '/images/categories/best-seller.png',
  delivery: '/images/categories/delivery.png',
  lunch: '/images/categories/lunch.png',
};

export function CategoryCard({
  name,
  icon,
  isActive = false,
  variant = 'desktop',
  onClick,
  className,
}: CategoryCardProps) {
  const isMobile = variant === 'mobile';

  // Container styles - from Figma
  const containerStyles = cn(
    'flex flex-col items-center justify-center gap-[6px]', // gap-[6px]
    'cursor-pointer transition-all duration-200',
    'shrink-0', // Prevent shrinking in flex container
    isMobile ? 'w-[106px]' : 'w-[100px] sm:w-[140px] lg:w-[161px]',
    className
  );

  // Icon container styles
  const iconContainerStyles = cn(
    'bg-white rounded-[16px]', // rounded-[16px]
    'shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)]',
    'flex items-center justify-center',
    'transition-all duration-200',
    'shrink-0',
    isMobile 
      ? 'w-full h-[80px] p-[8px]' 
      : 'w-full h-[70px] sm:h-[90px] lg:h-[100px] p-[8px]'
  );

  // Icon size
  const iconSize = isMobile ? 50 : 50;

  // Get icon path
  const iconPath = icon ? CATEGORY_ICONS[icon] || CATEGORY_ICONS['all-food'] : CATEGORY_ICONS['all-food'];

  return (
    <button onClick={onClick} className={containerStyles} aria-pressed={isActive}>
      {/* Icon Container */}
      <div className={iconContainerStyles}>
        <div className="relative" style={{ width: iconSize, height: iconSize }}>
          <Image
            src={iconPath}
            alt={name}
            fill
            className="object-contain"
            sizes={`${iconSize}px`}
          />
        </div>
      </div>

      {/* Label */}
      <span
        className={cn(
          'font-sans font-bold text-neutral-950 text-center whitespace-nowrap',
          isMobile
            ? 'text-[14px] leading-[20px] tracking-[-0.42px]'
            : 'text-[18px] leading-[32px] tracking-[-0.54px]'
        )}
      >
        {name}
      </span>
    </button>
  );
}
