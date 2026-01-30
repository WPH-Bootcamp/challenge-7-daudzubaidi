'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================
// LABEL COMPONENT - shadcn/ui style
// ============================================================
const labelVariants = cva(
  'font-sans font-semibold text-[14px] leading-[28px] tracking-[-0.28px] text-neutral-950 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// ============================================================
// INPUT COMPONENT - shadcn/ui style with Figma Design System
// ============================================================

const inputVariants = cva(
  [
    // Base styles
    'flex w-full rounded-xl border bg-white',
    'font-sans font-normal text-neutral-950 placeholder:text-neutral-500',
    // Focus styles
    'focus:outline-none focus:border-brand focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20',
    // Transition
    'transition-all duration-200',
    // Disabled state
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100',
    // File input specific
    'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950',
  ],
  {
    variants: {
      inputSize: {
        sm: 'h-[47px] px-3 py-2 text-[14px] leading-[28px] tracking-[-0.28px]',
        md: 'h-[56px] px-3 py-2 text-[16px] leading-[30px] tracking-[-0.32px]',
        default: 'h-[48px] px-3 py-3 text-[16px] leading-[30px] tracking-[-0.32px]',
      },
      variant: {
        default: 'border-neutral-300',
        error: 'border-brand-error focus:border-brand-error focus:ring-brand-error',
      },
    },
    defaultVariants: {
      inputSize: 'default',
      variant: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      inputSize,
      variant,
      type = 'text',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;
    const inputId = id || generatedId;

    // If we have icons, use a wrapper
    const hasIcons = leftIcon || rightIcon || isPassword;

    if (hasIcons) {
      return (
        <div className="w-full">
          {label && (
            <Label htmlFor={inputId} className={cn('block mb-1.5', error && 'text-brand-error')}>
              {label}
            </Label>
          )}

          <div
            className={cn(
              'relative flex items-center gap-2',
              'border rounded-xl bg-white',
              'transition-all duration-200 ease-out',
              'focus-within:border-brand focus-within:ring-2 focus-within:ring-focus-ring focus-within:ring-opacity-20',
              error && 'border-brand-error focus-within:border-brand-error focus-within:ring-brand-error',
              !error && 'border-neutral-300',
              disabled && 'bg-neutral-100 cursor-not-allowed opacity-60',
              inputSize === 'sm' ? 'h-[47px] px-3 py-2' : inputSize === 'md' ? 'h-[56px] px-3 py-2' : 'h-[48px] px-3 py-3',
              className
            )}
          >
            {leftIcon && <span className="flex-shrink-0 text-neutral-500">{leftIcon}</span>}

            <input
              ref={ref}
              type={actualType}
              id={inputId}
              disabled={disabled}
              style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              className={cn(
                'flex-1 min-w-0 bg-transparent',
                'border-0 outline-0 ring-0 shadow-none',
                'font-sans font-normal text-neutral-950 placeholder:text-neutral-500',
                'focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none',
                'disabled:cursor-not-allowed',
                inputSize === 'sm'
                  ? 'text-[14px] leading-[28px] tracking-[-0.28px]'
                  : 'text-[16px] leading-[30px] tracking-[-0.32px]'
              )}
              aria-invalid={error ? 'true' : 'false'}
              {...props}
            />

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex-shrink-0 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            )}

            {rightIcon && !isPassword && (
              <span className="flex-shrink-0 text-neutral-500">{rightIcon}</span>
            )}
          </div>

          {error && (
            <p className="mt-1 font-sans font-semibold text-[14px] leading-[28px] tracking-[-0.28px]" style={{ color: '#c12116' }} role="alert">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="mt-1 font-sans font-normal text-[14px] leading-[20px] text-neutral-500">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    // Simple input without icons
    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={inputId} className={cn('block mb-1.5', error && 'text-brand-error')}>
            {label}
          </Label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          disabled={disabled}
          className={cn(
            inputVariants({ inputSize, variant: error ? 'error' : variant }),
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <p className="mt-1 font-sans font-semibold text-[14px] leading-[28px] tracking-[-0.28px]" style={{ color: '#c12116' }} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 font-sans font-normal text-[14px] leading-[20px] text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================
// TEXTAREA COMPONENT - shadcn/ui style
// ============================================================

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={textareaId} className={cn('block mb-1.5', error && 'text-brand-error')}>
            {label}
          </Label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded-xl border px-3 py-3',
            'font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px]',
            'text-neutral-950 placeholder:text-neutral-500',
            'bg-white border-neutral-300',
            'focus:outline-none focus:border-brand focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20',
            'transition-all duration-200',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100',
            'resize-none',
            error && 'border-brand-error focus:border-brand-error focus:ring-brand-error',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <p className="mt-1 font-sans font-semibold text-[14px] leading-[28px] tracking-[-0.28px] text-brand-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 font-sans font-normal text-[14px] leading-[20px] text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================================
// ICON COMPONENTS
// ============================================================

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.00039 10.3431 9.00039 12C9.00039 13.6569 10.3435 15 12.0004 15Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.7429 5.09232C11.1494 5.03223 11.5686 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C21.2506 13.2324 20.7931 13.894 20.2166 14.5871M6.72437 6.71529C4.56546 8.1817 3.09634 10.2194 2.42012 11.2868C2.28394 11.5025 2.21584 11.6103 2.17772 11.7766C2.14909 11.9015 2.14909 12.0985 2.17772 12.2234C2.21584 12.3897 2.28394 12.4975 2.42012 12.7132C3.54553 14.4952 6.8954 19 12.0004 19C13.9789 19 15.7302 18.2676 17.2671 17.2766M3.00039 3L21.0004 21M9.87868 9.87868C9.33745 10.4199 9.00039 11.1716 9.00039 12C9.00039 13.6569 10.3435 15 12.0004 15C12.8288 15 13.5805 14.6629 14.1218 14.1218"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export { Input, Textarea, Label, inputVariants };
