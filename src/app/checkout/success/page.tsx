'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { LogoIcon, SuccessIcon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/domain/Toast';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/config/constants';

// ============================================================
// PAYMENT SUCCESS PAGE - From Figma Design
// ============================================================

interface OrderSummary {
  orderId: string;
  date: string;
  paymentMethod: string;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
}

const formatSuccessDateTime = (date: string) =>
  dayjs(date).locale('en').format('DD MMMM YYYY, HH:mm');

const formatSuccessPrice = (price: number) =>
  formatPrice(price).replace('Rp ', 'Rp');

// Inner component that uses searchParams
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get order details from URL params or use mock data
  const orderSummary: OrderSummary = {
    orderId: searchParams.get('orderId') || '123456',
    date: new Date().toISOString(),
    paymentMethod: searchParams.get('method') || 'Bank Rakyat Indonesia',
    itemCount: parseInt(searchParams.get('items') || '2'),
    subtotal: parseInt(searchParams.get('subtotal') || '100000'),
    deliveryFee: parseInt(searchParams.get('delivery') || '10000'),
    serviceFee: parseInt(searchParams.get('service') || '1000'),
    total: parseInt(searchParams.get('total') || '111000'),
  };

  return (
    <div className="w-full max-w-[428px] flex flex-col items-center gap-[28px]">
      {/* Logo */}
      <div className="flex items-center justify-center gap-[15px] w-full">
        <LogoIcon className="w-[42px] h-[42px]" />
        <span className="font-sans font-extrabold text-[32px] leading-[42px] text-neutral-950">
          Foody
        </span>
      </div>

      {/* Success Card - Ticket style with cutouts */}
      <div className="bg-white rounded-[16px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] p-[16px] relative flex flex-col items-center gap-[16px] w-full">
        {/* Success Header */}
        <div className="flex flex-col items-center justify-center gap-[2px] w-full">
          <SuccessIcon className="w-16 h-16" />
          <h1 className="font-sans font-extrabold text-[18px] leading-[32px] text-neutral-950 text-center">
            Payment Success
          </h1>
          <p className="font-sans font-normal text-[14px] leading-[28px] text-neutral-950 text-center">
            Your payment has been successfully processed.
          </p>
        </div>

        {/* Dashed Divider */}
        <div className="w-full border-t border-dashed border-neutral-300" />

        {/* Date */}
        <div className="flex items-center justify-between w-full text-[14px] leading-[28px] text-neutral-950">
          <span className="font-sans font-medium">Date</span>
          <span className="font-sans font-semibold">
            {formatSuccessDateTime(orderSummary.date)}
          </span>
        </div>

        {/* Payment Method */}
        <div className="flex items-center justify-between w-full text-[14px] leading-[28px] text-neutral-950">
          <span className="font-sans font-medium">Payment Method</span>
          <span className="font-sans font-semibold">
            {orderSummary.paymentMethod}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between w-full text-[14px] leading-[28px] text-neutral-950">
          <span className="font-sans font-medium">
            Price ({orderSummary.itemCount} items)
          </span>
          <span className="font-sans font-semibold">
            {formatSuccessPrice(orderSummary.subtotal)}
          </span>
        </div>

        {/* Delivery Fee */}
        <div className="flex items-center justify-between w-full text-[14px] leading-[28px] text-neutral-950">
          <span className="font-sans font-medium">Delivery Fee</span>
          <span className="font-sans font-semibold">
            {formatSuccessPrice(orderSummary.deliveryFee)}
          </span>
        </div>

        {/* Service Fee */}
        <div className="flex items-center justify-between w-full text-[14px] leading-[28px] text-neutral-950">
          <span className="font-sans font-medium">Service Fee</span>
          <span className="font-sans font-semibold">
            {formatSuccessPrice(orderSummary.serviceFee)}
          </span>
        </div>

        {/* Dashed Divider */}
        <div className="w-full border-t border-dashed border-neutral-300" />

        {/* Total */}
        <div className="flex items-center justify-between w-full text-[16px] leading-[30px] text-neutral-950">
          <span className="font-sans font-normal">Total</span>
          <span className="font-sans font-extrabold">
            {formatSuccessPrice(orderSummary.total)}
          </span>
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={() => router.push(ROUTES.ORDERS)}
          className="h-[44px] bg-[#c12116] text-white hover:bg-[#a11013]"
        >
          See My Orders
        </Button>

        {/* Ticket Cutouts - CSS circles instead of images */}
        <div className="absolute left-[-10px] top-[150px] w-[20px] h-[20px] rounded-full bg-[#fafafa]" />
        <div className="absolute right-[-10px] top-[150px] w-[20px] h-[20px] rounded-full bg-[#fafafa]" />
        <div className="absolute left-[-10px] top-[386px] w-[20px] h-[20px] rounded-full bg-[#fafafa]" />
        <div className="absolute right-[-10px] top-[386px] w-[20px] h-[20px] rounded-full bg-[#fafafa]" />
      </div>
    </div>
  );
}

// Loading fallback
function PaymentSuccessLoading() {
  return (
    <div className="w-full max-w-[393px] px-4 flex flex-col items-center gap-[28px]">
      {/* Logo */}
      <div className="flex items-center justify-center gap-[15px] w-full">
        <div className="w-[42px] h-[42px] bg-neutral-200 rounded-lg animate-pulse" />
        <div className="w-[100px] h-[42px] bg-neutral-200 rounded-lg animate-pulse" />
      </div>

      {/* Card skeleton */}
      <div className="bg-white rounded-[16px] shadow-shadow-card p-[16px] flex flex-col items-center gap-[16px] w-full">
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="w-16 h-16 bg-neutral-200 rounded-full animate-pulse" />
          <div className="w-[180px] h-7 bg-neutral-200 rounded animate-pulse" />
          <div className="w-[240px] h-6 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-px bg-neutral-200 rounded" />
        <div className="w-full space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="w-28 h-5 bg-neutral-200 rounded animate-pulse" />
              <div className="w-32 h-5 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="w-full h-px bg-neutral-200 rounded" />
        <div className="flex justify-between w-full">
          <div className="w-20 h-6 bg-neutral-200 rounded animate-pulse" />
          <div className="w-24 h-6 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="w-full h-[48px] bg-neutral-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col items-center pt-[132px]">
      <Toast />
      <Suspense fallback={<PaymentSuccessLoading />}>
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}
