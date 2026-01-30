'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { setSearchQuery, selectSearchQuery } from '@/features/filters/filtersSlice';
import { cn } from '@/lib/utils';
import { SearchIcon, CloseIcon } from '@/components/ui/Icons';

// ============================================================
// SEARCH BAR COMPONENT - From Figma Design System
// ============================================================

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  variant = 'compact',
  placeholder = 'Search restaurants, food and drink',
  className,
}: SearchBarProps) {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);
  const [localValue, setLocalValue] = useState(searchQuery);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounced dispatch
    timeoutRef.current = setTimeout(() => {
      dispatch(setSearchQuery(value));
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    dispatch(setSearchQuery(''));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const isHero = variant === 'hero';

  // Container styles - from Figma
  const containerStyles = useMemo(
    () =>
      cn(
        'flex items-center',
        'bg-white rounded-full',
        'transition-all duration-200',
        'focus-within:ring-2 focus-within:ring-focus-ring',
        isHero
          ? 'w-full max-w-[604px] h-[48px] md:h-[56px] px-4 md:px-[24px] py-2 md:py-[8px] gap-2 md:gap-[6px]'
          : 'w-full max-w-[400px] h-[48px] px-4 py-2 border border-neutral-300 gap-2',
        className
      ),
    [isHero, className]
  );

  return (
    <div className={containerStyles}>
      {/* Search Icon */}
      <span
        className={cn(
          'flex h-[20px] w-[20px] items-center justify-center flex-shrink-0'
        )}
      >
        <SearchIcon
          size={20}
          className={cn(isHero ? 'text-neutral-500' : 'text-neutral-400')}
        />
      </span>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
        className={cn(
          'bg-transparent flex-1 min-w-0',
          'font-sans font-normal text-neutral-950',
          isHero ? 'placeholder:text-neutral-600' : 'placeholder:text-neutral-500',
          'focus:outline-none',
          isHero
            ? 'text-[16px] leading-[30px] tracking-[-0.32px]'
            : 'text-[14px] leading-[20px] tracking-[-0.28px]'
        )}
        aria-label="Search"
      />

      {/* Clear Button */}
      {!isHero && localValue && (
        <button
          onClick={handleClear}
          className={cn(
            'flex-shrink-0 p-1 rounded-full',
            'text-neutral-400 hover:text-neutral-600',
            'hover:bg-neutral-100',
            'focus:outline-none focus:ring-2 focus:ring-focus-ring',
            'transition-colors'
          )}
          aria-label="Clear search"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}
