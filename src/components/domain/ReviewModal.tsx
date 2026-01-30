'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// REVIEW MODAL COMPONENT - From Figma Design (37418:9716)
// ============================================================

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isLoading?: boolean;
  orderId?: number;
  restaurantName?: string;
}

// Star icon component
function StarIcon({ filled, color }: { filled: boolean; color: 'yellow' | 'gray' }) {
  return (
    <svg
      width="35"
      height="33"
      viewBox="0 0 35 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.5 24.4728L11.621 28.0145C11.3612 28.1798 11.0896 28.2506 10.8063 28.227C10.523 28.2034 10.2751 28.109 10.0626 27.9437C9.85006 27.7784 9.68478 27.572 9.56673 27.3246C9.44867 27.0772 9.42506 26.7995 9.49589 26.4916L11.0542 19.7978L5.84798 15.2999C5.61187 15.0874 5.46453 14.8452 5.40598 14.5732C5.34742 14.3012 5.36489 14.0358 5.45839 13.777C5.55189 13.5182 5.69356 13.3057 5.88339 13.1395C6.07323 12.9733 6.33295 12.867 6.66256 12.8208L13.5334 12.2187L16.1896 5.91451C16.3077 5.63118 16.4909 5.41868 16.7393 5.27701C16.9877 5.13535 17.2413 5.06451 17.5 5.06451C17.7588 5.06451 18.0124 5.13535 18.2608 5.27701C18.5092 5.41868 18.6924 5.63118 18.8105 5.91451L21.4667 12.2187L28.3375 12.8208C28.6682 12.868 28.9279 12.9742 29.1167 13.1395C29.3056 13.3048 29.4473 13.5173 29.5417 13.777C29.6362 14.0367 29.6541 14.3026 29.5955 14.5746C29.537 14.8466 29.3892 15.0884 29.1521 15.2999L23.9459 19.7978L25.5042 26.4916C25.575 26.7985 25.5514 27.0762 25.4334 27.3246C25.3153 27.573 25.15 27.7793 24.9375 27.9437C24.725 28.108 24.4771 28.2025 24.1938 28.227C23.9105 28.2516 23.6389 28.1807 23.3792 28.0145L17.5 24.4728Z"
        fill={color === 'yellow' ? '#FDB022' : '#A4A7AE'}
      />
    </svg>
  );
}

// Close icon component
function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 1L1 11M1 1L11 11"
        stroke="#0A0D12"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ReviewModalProps) {
  const [rating, setRating] = useState(4);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  // Handle submit
  const handleSubmit = () => {
    onSubmit(rating, comment.trim());
  };

  // Reset state when modal closes
  const handleClose = () => {
    setRating(4);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop/Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 13, 18, 0.5)' }}
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        className="absolute left-1/2 bg-white rounded-[16px] flex flex-col items-center"
        style={{
          width: '439px',
          padding: '24px',
          gap: '24px',
          top: '226px',
          transform: 'translateX(-50%)',
        }}
      >
        {/* Header Row */}
        <div
          className="flex items-center justify-between"
          style={{ width: '387px' }}
        >
          <h2 className="font-extrabold text-[24px] leading-[36px] text-[#0a0d12]">
            Give Review
          </h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-[24px] h-[24px] hover:opacity-70 transition-opacity"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Rating Section */}
        <div className="flex flex-col items-center justify-center w-full">
          <p className="font-extrabold text-[16px] leading-[30px] text-[#0a0d12] text-center w-full">
            Give Rating
          </p>
          <div
            className="flex items-center justify-center w-full"
            style={{ gap: '4.083px' }}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const activeRating = hoveredRating || rating;
              const isFilled = star <= activeRating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="flex items-center justify-center transition-transform hover:scale-110"
                  style={{ width: '49px', height: '49px' }}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <StarIcon filled={isFilled} color={isFilled ? 'yellow' : 'gray'} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Textarea Input */}
        <div
          className="border border-[#d5d7da] rounded-[12px] w-full flex items-start justify-center"
          style={{ height: '235px', padding: '8px 12px' }}
        >
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please share your thoughts about our service!"
            className={cn(
              'w-full h-full resize-none bg-transparent',
              'font-normal text-[16px] leading-[30px] tracking-[-0.32px]',
              'text-[#0a0d12] placeholder:text-[#717680]',
              'focus:outline-none'
            )}
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center w-full bg-[#c12116] rounded-[200px] font-bold text-[16px] leading-[30px] tracking-[-0.32px] text-[#fdfdfd]',
            'hover:bg-[#a91c13] transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ height: '48px', padding: '8px' }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ReviewModal;
