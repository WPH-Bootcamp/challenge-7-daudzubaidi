'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/features/hooks';
import {
  selectCartItems,
  selectCartSubtotal,
  clearCart,
  incrementQuantity,
  decrementQuantity,
  selectSelectedRestaurantForCheckout,
  setSelectedRestaurantForCheckout,
  removeItemsByRestaurant,
} from '@/features/cart/cartSlice';
import { showToast } from '@/features/ui/uiSlice';
import { useCreateOrderMutation } from '@/services/queries';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/domain/EmptyState';
import { Toast } from '@/components/domain/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { MinusIcon, PlusIcon } from '@/components/ui/Icons';
import { formatPrice, cn, getImageUrl, isValidPhone } from '@/lib/utils';
import { ROUTES } from '@/config/constants';
import { CreateOrderPayload } from '@/types';

// ============================================================
// CHECKOUT PAGE - From Figma Design
// ============================================================

const DELIVERY_FEE = 10000;
const SERVICE_FEE = 1000;

const ASSETS = {
  avatar: '/images/avatars/john-doe.png',
  itemPlaceholder: '/images/placeholder-food.svg',
};

// Inline SVG Components for Icons
function DeliveryIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C10.477 2 6 6.477 6 12C6 19.5 16 30 16 30C16 30 26 19.5 26 12C26 6.477 21.523 2 16 2Z" fill="#C12116"/>
      <circle cx="16" cy="12" r="4" fill="white"/>
    </svg>
  );
}

function RestaurantIcon() {
  return (
    <div className="w-[32px] h-[32px] rounded-[8px] bg-[#FEF3C7] flex items-center justify-center overflow-hidden">
      <span className="text-[16px]">🍔</span>
    </div>
  );
}

type PaymentMethodId = 'bni' | 'bri' | 'bca' | 'mandiri';

type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'bni', label: 'Bank Negara Indonesia' },
  { id: 'bri', label: 'Bank Rakyat Indonesia' },
  { id: 'bca', label: 'Bank Central Asia' },
  { id: 'mandiri', label: 'Mandiri' },
];

interface FormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

// Bank Logo Components with inline SVGs matching Figma design
function BankLogo({ id }: { id: PaymentMethodId }) {
  return (
    <div className="h-[40px] w-[40px] rounded-[3px] bg-white flex items-center justify-center">
      {id === 'bni' && (
        <div className="flex items-center gap-[1px]">
          <div className="w-[8px] h-[8px] bg-[#F15A22]" />
          <div className="w-[8px] h-[8px] bg-[#F15A22]" />
          <div className="w-[8px] h-[8px] bg-[#005F3B]" />
        </div>
      )}
      {id === 'bri' && (
        <span className="font-bold text-[10px] text-[#00529C] tracking-tight">BRI</span>
      )}
      {id === 'bca' && (
        <span className="font-bold text-[9px] text-[#00539F] tracking-tight">BCA</span>
      )}
      {id === 'mandiri' && (
        <span className="font-bold text-[7px] text-[#003D79] tracking-tight lowercase">mandiri</span>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const allCartItems = useAppSelector(selectCartItems);
  const selectedRestaurant = useAppSelector(selectSelectedRestaurantForCheckout);
  
  // Filter items berdasarkan restaurant yang dipilih
  const cartItems = selectedRestaurant 
    ? allCartItems.filter(item => item.menuItem.restaurantName === selectedRestaurant)
    : allCartItems;
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const isEmpty = cartItems.length === 0;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const summaryTotal = subtotal + DELIVERY_FEE + SERVICE_FEE;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('bri');
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedPaymentLabel = PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label ?? 'Bank Rakyat Indonesia';

  const createOrderMutation = useCreateOrderMutation({
    onSuccess: () => {
      // Remove only checked out items from cart
      if (selectedRestaurant) {
        dispatch(removeItemsByRestaurant(selectedRestaurant));
        // Clear selection after successful checkout
        dispatch(setSelectedRestaurantForCheckout(null));
      } else {
        // If no specific restaurant selected, clear all (fallback)
        dispatch(clearCart());
      }
      
      dispatch(
        showToast({
          message: 'Order placed successfully!',
          type: 'success',
        })
      );

      const params = new URLSearchParams({
        items: itemCount.toString(),
        subtotal: subtotal.toString(),
        delivery: DELIVERY_FEE.toString(),
        service: SERVICE_FEE.toString(),
        total: summaryTotal.toString(),
        method: selectedPaymentLabel,
      });
      router.push(`${ROUTES.CHECKOUT_SUCCESS}?${params.toString()}`);
    },
    onError: (error) => {
      dispatch(
        showToast({
          message: error.message || 'Failed to place order. Please try again.',
          type: 'error',
        })
      );
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    } else if (formData.customerName.trim().length < 3) {
      newErrors.customerName = 'Name must be at least 3 characters';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!isValidPhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Address is required';
    } else if (formData.customerAddress.trim().length < 10) {
      newErrors.customerAddress = 'Please enter a complete address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsAddressDialogOpen(false);
  };

  const handlePlaceOrder = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setIsAddressDialogOpen(true);
      return;
    }

    // Safety check: ensure cartItems exists and is not empty
    if (!cartItems || cartItems.length === 0) {
      dispatch(
        showToast({
          message: 'Your cart is empty',
          type: 'error',
        })
      );
      return;
    }

    // Group items by restaurant
    const restaurantGroups = cartItems.reduce((acc, item) => {
      const restaurantId = item?.menuItem?.restaurantId || 0;
      if (!acc[restaurantId]) {
        acc[restaurantId] = [];
      }
      acc[restaurantId].push({
        menuId: item.menuItem.id,
        quantity: item.quantity,
      });
      return acc;
    }, {} as Record<number, { menuId: number; quantity: number }[]>);

    // Safety check: ensure restaurantGroups has data
    if (!restaurantGroups || Object.keys(restaurantGroups).length === 0) {
      dispatch(
        showToast({
          message: 'Unable to process order. Please try again.',
          type: 'error',
        })
      );
      return;
    }

    const payload: CreateOrderPayload = {
      deliveryAddress: formData.customerAddress.trim(),
      restaurants: Object.entries(restaurantGroups)
        .filter(([_, items]) => items && items.length > 0)
        .map(([restaurantId, items]) => ({
          restaurantId: parseInt(restaurantId),
          items: items || [],
        })),
    };

    // Final safety check: ensure we have restaurants in payload
    if (!payload.restaurants || payload.restaurants.length === 0) {
      dispatch(
        showToast({
          message: 'No valid items to checkout',
          type: 'error',
        })
      );
      return;
    }

    createOrderMutation.mutate(payload);
  };

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-[#fafafa]">
        <Toast />
        <Header
          variant="default"
          className="shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)]"
          containerClassName="px-4 lg:px-[120px]"
        />
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-4 lg:gap-[24px] items-start w-full max-w-[1000px] px-4 lg:px-0 pt-6 lg:pt-[48px] pb-12 lg:pb-[80px]">
            <h1 className="font-sans font-extrabold text-2xl lg:text-[32px] leading-tight lg:leading-[42px] text-[#0a0d12] w-full">
              Checkout
            </h1>
            <div className="w-full">
              <EmptyState
                title="Your cart is empty"
                description="Add some items to your cart before checkout."
                icon="cart"
                action={{
                  label: 'Browse Menu',
                  onClick: () => router.push(ROUTES.HOME),
                }}
              />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Toast />
      {/* Header - Figma: h-[80px] shadow */}
      <Header
        variant="default"
        className="shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)]"
        containerClassName="px-4 lg:px-[120px]"
      />

      {/* Main Content Wrapper - Full width with centered content */}
      <div className="w-full flex justify-center">
        {/* Main Content - Figma: centered, w-[1000px], gap-[24px] from header */}
        <div className="flex flex-col gap-4 lg:gap-[24px] items-start w-full max-w-[1000px] px-4 lg:px-0 pt-6 lg:pt-[48px] pb-12 lg:pb-[80px]">
          {/* Page Title - Figma: text-[32px] leading-[42px] extrabold */}
          <h1 className="font-sans font-extrabold text-2xl lg:text-[32px] leading-tight lg:leading-[42px] text-[#0a0d12] w-full">
            Checkout
          </h1>

          {/* Two Column Layout - Figma: gap-[20px] items-start */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[20px] items-start w-full">
            {/* Left Column - Figma: flex-1, gap-[20px] */}
            <div className="flex flex-1 flex-col gap-4 lg:gap-[20px] items-start min-w-0 w-full">
              {/* Delivery Address Card - Figma: p-[20px] gap-[21px] rounded-[16px] shadow */}
              <div className="bg-white flex flex-col gap-4 lg:gap-[21px] items-start p-4 lg:p-[20px] rounded-[16px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] w-full">
                {/* Address Content - Figma: gap-[4px] */}
                <div className="flex flex-col gap-[4px] items-start w-full">
                  {/* Header Row - Figma: gap-[8px] */}
                  <div className="flex gap-[8px] items-center">
                    <div className="shrink-0">
                      <DeliveryIcon />
                    </div>
                    <p className="font-sans font-extrabold text-base lg:text-[18px] leading-relaxed lg:leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
                      Delivery Address
                    </p>
                  </div>
                  <p className="font-sans font-medium text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] tracking-[-0.48px] text-[#0a0d12]">
                    {formData.customerAddress}
                  </p>
                  <p className="font-sans font-medium text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] tracking-[-0.48px] text-[#0a0d12]">
                    {formData.customerPhone}
                  </p>
                </div>

              {/* Change Button - Figma: h-[40px] w-[120px] rounded-[100px] border */}
              <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="h-9 lg:h-[40px] w-28 lg:w-[120px] flex items-center justify-center p-2 lg:p-[8px] border border-[#d5d7da] rounded-[100px] font-sans font-bold text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] tracking-[-0.32px] text-[#0a0d12] hover:bg-neutral-50 transition-colors"
                  >
                    Change
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0">
                  <form onSubmit={handleSaveAddress}>
                    <DialogHeader>
                      <DialogTitle>Edit Delivery Information</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 pt-4 space-y-4">
                      <Input
                        label="Full Name"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        error={errors.customerName}
                        required
                      />
                      <Input
                        label="Phone Number"
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        error={errors.customerPhone}
                        required
                      />
                      <div className="w-full">
                        <label className="block mb-1.5 font-sans font-semibold text-[14px] leading-[28px] tracking-[-0.28px] text-neutral-950">
                          Delivery Address
                        </label>
                        <textarea
                          name="customerAddress"
                          value={formData.customerAddress}
                          onChange={handleInputChange}
                          placeholder="Enter your full delivery address"
                          rows={4}
                          className={cn(
                            'w-full px-3 py-3 rounded-xl',
                            'border border-neutral-300',
                            'font-sans font-normal text-[16px] leading-[30px] tracking-[-0.32px]',
                            'text-neutral-950 placeholder:text-neutral-500',
                            'focus:outline-none focus:border-brand focus:ring-2 focus:ring-focus-ring focus:ring-opacity-20',
                            'transition-all duration-200',
                            'resize-none',
                            errors.customerAddress && 'border-brand-error focus:border-brand-error focus:ring-brand-error'
                          )}
                          required
                        />
                        {errors.customerAddress && (
                          <p className="mt-1 font-sans font-semibold text-[14px] leading-[28px] tracking-[-0.28px] text-brand-error">
                            {errors.customerAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsAddressDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Cart List Card - Figma: p-[20px] gap-[20px] rounded-[16px] shadow */}
            <div className="bg-white flex flex-col gap-4 lg:gap-[20px] items-start p-4 lg:p-[20px] rounded-[16px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] w-full">
              {/* Header Row */}
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-[8px] items-center">
                  {/* Restaurant Logo/Icon */}
                  <div className="relative w-[32px] h-[32px] rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                    {cartItems[0]?.menuItem?.logo ? (
                      <Image
                        src={getImageUrl(cartItems[0].menuItem.logo)}
                        alt={cartItems[0]?.menuItem?.restaurantName || 'Restaurant'}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#c12116] text-white font-bold text-sm">
                        {(cartItems[0]?.menuItem?.restaurantName || 'R').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="font-sans font-bold text-[18px] leading-[32px] tracking-[-0.54px] text-[#0a0d12]">
                    {cartItems[0]?.menuItem?.restaurantName || 'Restaurant'}
                  </p>
                </div>
                {/* Add item Button - Figma: h-[40px] w-[120px] rounded-[100px] border */}
                <button
                  type="button"
                  onClick={() => {
                    const restaurantId = cartItems[0]?.menuItem?.restaurantId;
                    if (restaurantId) {
                      router.push(`/menu/${restaurantId}`);
                    } else {
                      router.push(ROUTES.HOME);
                    }
                  }}
                  className="h-[40px] w-[120px] flex items-center justify-center p-[8px] border border-[#d5d7da] rounded-[100px] font-sans font-bold text-[16px] leading-[30px] tracking-[-0.32px] text-[#0a0d12] hover:bg-neutral-50 transition-colors"
                >
                  Add item
                </button>
              </div>

              {/* Cart Items */}
              {cartItems && cartItems.length > 0 ? (
                cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between w-full">
                  {/* Item Info - Figma: gap-[17px] */}
                  <div className="flex gap-[17px] items-center">
                    {/* Item Image - Figma: 80x80 rounded-[12px] */}
                    <div className="relative h-[80px] w-[80px] rounded-[12px] shrink-0 overflow-hidden">
                      <Image
                        src={getImageUrl(item.menuItem.image, ASSETS.itemPlaceholder)}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    {/* Item Text - Figma: w-[91px] */}
                    <div className="flex flex-col items-start text-[#0a0d12] w-[91px]">
                      <p className="font-sans font-medium text-[16px] leading-[30px] tracking-[-0.48px] w-full">
                        {item.menuItem.name}
                      </p>
                      <p className="font-sans font-extrabold text-[18px] leading-[32px] tracking-[-0.36px] w-full">
                        {formatPrice(item.menuItem.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls - Figma: py-[24px] w-[273.5px] justify-end, controls gap-[16px] */}
                  <div className="flex items-center justify-end py-[24px] w-[273.5px]">
                    <div className="flex gap-[16px] items-center">
                      {/* Minus Button - Figma: p-[8px] rounded-[1000px] border */}
                      <button
                        type="button"
                        onClick={() => dispatch(decrementQuantity(item.menuItem.id))}
                        className="flex items-center p-[8px] rounded-[1000px] border border-[#d5d7da] text-[#0a0d12] hover:bg-neutral-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon size={24} />
                      </button>
                      {/* Quantity - Figma: semibold text-[18px] */}
                      <span className="font-sans font-semibold text-[18px] leading-[32px] tracking-[-0.36px] text-[#0a0d12]">
                        {item.quantity}
                      </span>
                      {/* Plus Button - Figma: p-[8px] rounded-[1000px] bg-[#c12116] */}
                      <button
                        type="button"
                        onClick={() => dispatch(incrementQuantity(item.menuItem.id))}
                        className="flex items-center p-[8px] rounded-[1000px] bg-[#c12116] text-white hover:bg-opacity-90 transition-all"
                        aria-label="Increase quantity"
                      >
                        <PlusIcon size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-500">No items in cart</p>
                </div>
              )}
            </div>
          </div>

            {/* Right Column - Payment Card - Figma: p-[20px] rounded-[16px] shadow */}
            <div className="bg-white w-full lg:w-[390px] flex flex-col p-4 lg:p-[20px] rounded-[16px] shadow-[0px_0px_20px_0px_rgba(203,202,202,0.25)] lg:shrink-0 relative overflow-hidden">
              {/* Payment Method Container - Figma: w-full gap-[16px] */}
              <div className="flex flex-col gap-3 lg:gap-[16px] items-start w-full">
                {/* Title */}
                <p className="font-sans font-extrabold text-base lg:text-[18px] leading-relaxed lg:leading-[32px] tracking-[-0.36px] text-[#0a0d12] w-full">
                  Payment Method
                </p>

                {/* Payment Options - each option has own padding, dividers are full width */}
                {PAYMENT_METHODS.flatMap((method, index) => {
                  const isSelected = paymentMethod === method.id;
                  const elements = [
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className="flex gap-[8px] items-center w-full"
                      role="radio"
                      aria-checked={isSelected}
                    >
                      {/* Bank Logo - Figma: 40x40 rounded-[8px] border */}
                      <div className="border border-[#d5d7da] overflow-hidden rounded-[8px] shrink-0 h-9 w-9 lg:h-[40px] lg:w-[40px]">
                        <BankLogo id={method.id} />
                      </div>
                      {/* Bank Name - Figma: flex-1 font-normal text-[16px] */}
                      <span className="flex-1 font-sans font-normal text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] tracking-[-0.32px] text-[#0a0d12] text-left">
                        {method.label}
                      </span>
                      {/* Radio Button - Figma: 24x24 */}
                      {isSelected ? (
                        <div className="bg-[#c12116] rounded-full h-[24px] w-[24px] flex items-center justify-center shrink-0">
                          <div className="bg-white rounded-full h-[10px] w-[10px]" />
                        </div>
                      ) : (
                        <div className="border-[1.6px] border-[#a4a7ae] rounded-full h-[24px] w-[24px] shrink-0" />
                      )}
                    </button>
                  ];
                  // Add divider between options - FULL WIDTH with negative margin to extend beyond card padding
                  if (index < PAYMENT_METHODS.length - 1) {
                    elements.push(
                      <div key={`divider-${method.id}`} className="h-px bg-[#e9eaeb] w-full -mx-4 lg:-mx-[20px]" />
                    );
                  }
                  return elements;
                })}
              </div>

              {/* Dashed Divider with Cutouts - Figma: dashed line with circles on sides */}
              <div className="relative w-full h-[20px] flex items-center mt-3 lg:mt-[16px]">
                {/* Left Cutout Circle */}
                <div className="absolute left-[-10px] h-[20px] w-[20px] bg-[#fafafa] rounded-full" />
                {/* Dashed Line */}
                <div className="flex-1 mx-[10px] border-t border-dashed border-[#d5d7da]" />
                {/* Right Cutout Circle */}
                <div className="absolute right-[-10px] h-[20px] w-[20px] bg-[#fafafa] rounded-full" />
              </div>

              {/* Payment Summary Section - Figma: gap-[16px] */}
              <div className="flex flex-col gap-3 lg:gap-[16px] items-start mt-3 lg:mt-[16px]">
                <p className="font-sans font-extrabold text-base lg:text-[18px] leading-relaxed lg:leading-[32px] tracking-[-0.36px] text-[#0a0d12] w-full">
                  Payment Summary
                </p>

                {/* Price Row - Figma: text-[16px] leading-[30px] */}
                <div className="flex items-center justify-between w-full text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] text-[#0a0d12]">
                  <span className="font-sans font-medium tracking-[-0.48px]">Price ( {itemCount} items)</span>
                  <span className="font-sans font-bold tracking-[-0.32px]">{formatPrice(subtotal)}</span>
                </div>

                {/* Delivery Fee Row */}
                <div className="flex items-center justify-between w-full text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] text-[#0a0d12]">
                  <span className="font-sans font-medium tracking-[-0.48px]">Delivery Fee</span>
                  <span className="font-sans font-bold tracking-[-0.32px]">{formatPrice(DELIVERY_FEE)}</span>
                </div>

                {/* Service Fee Row */}
                <div className="flex items-center justify-between w-full text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] text-[#0a0d12]">
                  <span className="font-sans font-medium tracking-[-0.48px]">Service Fee</span>
                  <span className="font-sans font-bold tracking-[-0.32px]">{formatPrice(SERVICE_FEE)}</span>
                </div>

                {/* Total Row - Figma: text-[18px] leading-[32px] */}
                <div className="flex items-center justify-between w-full text-base lg:text-[18px] leading-relaxed lg:leading-[32px] text-[#0a0d12]">
                  <span className="font-sans font-normal">Total</span>
                  <span className="font-sans font-extrabold tracking-[-0.36px]">{formatPrice(summaryTotal)}</span>
                </div>

                {/* Buy Button - Figma: h-[48px] rounded-[100px] bg-[#c12116] */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending}
                  className="h-11 lg:h-[48px] w-full flex items-center justify-center p-2 lg:p-[8px] bg-[#c12116] rounded-[100px] font-sans font-bold text-sm lg:text-[16px] leading-relaxed lg:leading-[30px] tracking-[-0.32px] text-[#fdfdfd] hover:bg-opacity-90 transition-colors disabled:opacity-70"
                >
                  {createOrderMutation.isPending ? 'Processing...' : 'Buy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
