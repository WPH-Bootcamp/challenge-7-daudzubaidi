'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================
// BUTTON COMPONENT - shadcn/ui style with Figma Design System
// ============================================================

const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans font-bold',
    'rounded-full', // rounded-[100px] from Figma
    'ring-offset-white',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // Primary - Red from Figma
        default: 'bg-brand-error text-neutral-25 hover:bg-opacity-90 active:bg-opacity-95',
        primary: 'bg-brand-error text-neutral-25 hover:bg-opacity-90 active:bg-opacity-95',
        // Secondary - Outlined
        secondary: 'bg-transparent text-neutral-950 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100',
        // Outline - Similar to secondary
        outline: 'bg-transparent text-neutral-950 border border-neutral-300 hover:bg-neutral-50',
        // Ghost - No border
        ghost: 'bg-transparent text-neutral-950 hover:bg-neutral-100',
        // Destructive - For delete actions
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        // Link style
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[48px] px-[20px] text-[16px] leading-[30px] tracking-[-0.32px]',
        sm: 'h-[40px] px-[16px] text-[14px] leading-[20px] tracking-[-0.28px]',
        md: 'h-[48px] px-[20px] text-[16px] leading-[30px] tracking-[-0.32px]',
        lg: 'h-[56px] px-[24px] text-[18px] leading-[32px] tracking-[-0.36px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, fullWidth = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && 'w-full',
          isLoading && 'relative cursor-wait',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="opacity-0">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
