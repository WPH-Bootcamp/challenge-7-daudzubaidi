'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { decrementQuantity, incrementQuantity, selectCartItems, clearCart, setSelectedRestaurantForCheckout } from '@/features/cart/cartSlice';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/domain/EmptyState';
import { Toast } from '@/components/domain/Toast';
import { Button } from '@/components/ui/Button';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { ROUTES } from '@/config/constants';
import { PlusIcon, MinusIcon, ChevronRightIcon } from '@/components/ui/Icons';

// ============================================================
// CART PAGE - From Figma Design
// ============================================================

const formatCartPrice = (price: number) => formatPrice(price).replace('Rp ', 'Rp');

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector(selectCartItems);
  const isEmpty = cartItems.length === 0;

  // Clear cart if items don't have restaurantName or restaurantId (old format)
  useEffect(() => {
    if (cartItems.length > 0) {
      const hasOldFormat = cartItems.some(
        item => !item.menuItem.restaurantName || !item.menuItem.restaurantId
      );
      if (hasOldFormat) {
        console.warn('Cart has old format items without restaurantName or restaurantId. Clearing cart.');
        dispatch(clearCart());
      }
    }
  }, [cartItems, dispatch]);

  const handleCheckout = (restaurantName: string) => {
    dispatch(setSelectedRestaurantForCheckout(restaurantName));
    router.push(ROUTES.CHECKOUT);
  };

  // Group items by restaurant
  const groupedByRestaurant = cartItems.reduce((groups, item) => {
    const restaurantName = item.menuItem.restaurantName || 'Unknown Restaurant';
    if (!groups[restaurantName]) {
      groups[restaurantName] = [];
    }
    groups[restaurantName].push(item);
    return groups;
  }, {} as Record<string, typeof cartItems>);

  const restaurantGroups = Object.entries(groupedByRestaurant);

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Toast />

      <Header
        variant="default"
        className="shadow-shadow-card border-b-0"
        containerClassName="px-4 lg:px-[120px]"
      />

      {/* Main Content - Mobile: 16px padding, Desktop: 800px centered */}
      <div className="w-full flex justify-center">
        <div className="flex flex-col items-start w-full max-w-[800px] px-4 lg:px-0 pt-4 lg:pt-[48px] pb-10 lg:pb-[80px] gap-4 lg:gap-[24px]">
          <h1 className="font-sans font-extrabold text-[24px] lg:text-[32px] leading-[36px] lg:leading-[42px] text-[#0a0d12] w-full">
            My Cart
          </h1>

          {isEmpty ? (
            <EmptyState
              title="Your cart is empty"
              description="Looks like you haven't added any items to your cart yet. Start exploring our delicious menu!"
              icon="cart"
              action={{
                label: 'Browse Menu',
                onClick: () => router.push(ROUTES.HOME),
              }}
            />
          ) : (
            <div className="flex flex-col gap-5 w-full">
              {restaurantGroups.map(([restaurantName, items]) => {
                const groupTotal = items.reduce(
                  (sum, item) => sum + item.menuItem.price * item.quantity,
                  0
                );

                return (
                  <div
                    key={`restaurant-${restaurantName}`}
                    className="bg-white rounded-2xl shadow-shadow-card p-4 flex flex-col items-start gap-3"
                  >
                    {(() => {
                      const restaurantId = items[0]?.menuItem?.restaurantId;
                      const hasRestaurantLink = !!restaurantId;
                      
                      const content = (
                        <>
                          {/* Restaurant Logo/Icon */}
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                            {items[0]?.menuItem?.logo ? (
                              <Image
                                src={getImageUrl(items[0].menuItem.logo)}
                                alt={restaurantName}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#c12116] text-white font-bold text-sm">
                                {restaurantName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {/* Restaurant Name */}
                          <span className="font-sans font-bold text-[18px] leading-[32px] tracking-[-0.54px] text-neutral-950">
                            {restaurantName}
                          </span>
                          {/* Chevron Arrow */}
                          {hasRestaurantLink && (
                            <ChevronRightIcon size={20} className="text-neutral-400" />
                          )}
                        </>
                      );
                      
                      return hasRestaurantLink ? (
                        <button
                          onClick={() => router.push(`/menu/${restaurantId}`)}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          {content}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {content}
                        </div>
                      );
                    })()}

                    <div className="flex w-full flex-col gap-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
                        >
                          <div className="flex items-center gap-[17px]">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100">
                              {item.menuItem.image ? (
                                <Image
                                  src={getImageUrl(item.menuItem.image)}
                                  alt={item.menuItem.name}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-2xl font-bold">
                                  {item.menuItem.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col text-neutral-950">
                              <p className="font-sans font-medium text-[16px] leading-[30px] tracking-[-0.48px]">
                                {item.menuItem.name}
                              </p>
                              <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] w-full">
                                {formatCartPrice(item.menuItem.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex w-full items-center justify-start sm:w-[273.5px] sm:justify-end sm:py-[24px] sm:shrink-0">
                            <div className="flex items-center gap-8">
                              <button
                                onClick={() => dispatch(decrementQuantity(item.menuItem.id))}
                                disabled={item.quantity <= 1}
                                className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-950 disabled:opacity-50"
                                aria-label={`Decrease quantity for ${item.menuItem.name}`}
                              >
                                <MinusIcon size={14} />
                              </button>
                              <span className="font-sans font-semibold text-[18px] leading-[32px] tracking-[-0.36px] text-neutral-950">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => dispatch(incrementQuantity(item.menuItem.id))}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-brand-error)] text-[var(--color-neutral-25)]"
                                aria-label={`Increase quantity for ${item.menuItem.name}`}
                              >
                                <PlusIcon size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full border-t border-dashed border-neutral-300"></div>

                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                      <div className="flex w-[223px] shrink-0 flex-col text-neutral-950 pb-[4px]">
                        <span className="font-sans font-medium text-[16px] leading-[30px] tracking-[-0.48px]">
                          Total
                        </span>
                        <span className="font-sans font-extrabold text-[20px] leading-[34px]">
                          {formatCartPrice(groupTotal)}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        className="w-full sm:w-[240px] px-[8px] !bg-[var(--color-brand-error)] !text-[var(--color-neutral-25)]"
                        onClick={() => handleCheckout(restaurantName)}
                      >
                        Checkout
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
