'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { selectToast, hideToast } from '@/features/ui/uiSlice';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, CloseIcon } from '@/components/ui/Icons';

// ============================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================

export function Toast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector(selectToast);

  useEffect(() => {
    if (toast?.isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast?.isVisible) return null;

  const typeStyles = {
    success: 'bg-utility-success-50 border-utility-success-200 text-utility-success-700',
    error: 'bg-red-50 border-red-200 text-brand-error',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconStyles = {
    success: 'text-accent-green',
    error: 'text-brand-error',
    info: 'text-blue-600',
  };

  return (
    <div
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-3',
        'px-4 py-3 rounded-xl border',
        'shadow-lg',
        'animate-slide-up',
        typeStyles[toast.type]
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <CheckCircleIcon size={20} className={iconStyles[toast.type]} />

      {/* Message */}
      <span className="font-sans font-medium text-[14px] leading-[20px]">
        {toast.message}
      </span>

      {/* Close Button */}
      <button
        onClick={() => dispatch(hideToast())}
        className={cn(
          'p-1 rounded-full',
          'hover:bg-black/5',
          'focus:outline-none focus:ring-2 focus:ring-focus-ring'
        )}
        aria-label="Dismiss notification"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
