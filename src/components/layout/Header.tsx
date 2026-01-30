'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/features/hooks';
import { selectCartItemCount } from '@/features/cart/cartSlice';
import { selectUser, logout } from '@/features/auth/authSlice';
import { ROUTES } from '@/config/constants';
import { CartIcon, MenuIcon, UserIcon, LogoutIcon } from '@/components/ui/Icons';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

// ============================================================
// HEADER COMPONENT - From Figma Design System
// ============================================================

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'beforeLogin' | 'beforeLoginTransparent';
  className?: string;
  containerClassName?: string;
  cartCountOverride?: number;
  cartIconSrc?: string;
  userLabelOverride?: string;
  userAvatarSrc?: string;
  isScrolled?: boolean;
}

export function Header({
  variant = 'default',
  className,
  containerClassName,
  cartCountOverride,
  cartIconSrc,
  userLabelOverride,
  userAvatarSrc,
  isScrolled,
}: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItemCount = useAppSelector(selectCartItemCount);
  const user = useAppSelector(selectUser);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const baseIsTransparent = variant === 'transparent' || variant === 'beforeLoginTransparent';
  const isBeforeLogin = variant === 'beforeLogin' || variant === 'beforeLoginTransparent';
  const resolvedCartCount = cartCountOverride ?? cartItemCount;
  const userLabel = userLabelOverride ?? user?.name ?? 'User';
  const userAvatar = userAvatarSrc ?? user?.avatarSrc;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    dispatch(logout());
    setIsProfileMenuOpen(false);
    router.push(ROUTES.LOGIN);
  };

  const shouldForceSolid = Boolean(
    isScrolled && (variant === 'beforeLoginTransparent' || variant === 'transparent')
  );
  const isTransparent = shouldForceSolid ? false : baseIsTransparent;
  const headerLogoSrc = isTransparent ? '/images/logo-white.svg' : '/images/logo-red.svg';
  const showSolidAuthCta = !isTransparent;

  const headerStyles = cn('w-full', isTransparent ? 'bg-transparent' : 'bg-white', className);

  // Text color based on variant
  const textColor = isTransparent ? 'text-white' : 'text-neutral-950';
  const iconColor = isTransparent ? 'text-white' : 'text-neutral-950';

  const containerStyles = cn(
    'mx-auto flex h-[80px] w-full max-w-[1440px] items-center justify-between',
    containerClassName ?? 'px-4 md:px-8 lg:px-[120px]'
  );

  return (
    <header className={headerStyles}>
      <div className={containerStyles}>
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-[15px] flex-shrink-0">
          <div className="relative w-[42px] h-[42px] overflow-hidden">
            <Image
              src={headerLogoSrc}
              alt="Foody Logo"
              width={42}
              height={42}
              className="object-contain"
              priority
            />
          </div>
          <span
            className={cn(
              'font-sans font-extrabold text-[32px] leading-[42px]',
              textColor
            )}
          >
            Foody
          </span>
        </Link>

        {/* Right Side - Navigation */}
        <div className="flex items-center gap-[24px]">
        {/* Cart Button */}
          {!isBeforeLogin && (
            <Link
              href={ROUTES.CART}
              className={cn(
                'relative w-[32px] h-[32px] overflow-visible transition-colors flex-shrink-0',
                !isTransparent && 'hover:bg-black/5 rounded-full',
                'focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2'
              )}
              aria-label={`Shopping cart with ${resolvedCartCount} items`}
            >
              {cartIconSrc ? (
                <Image
                  src={cartIconSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="object-contain"
                />
              ) : (
                <CartIcon size={32} className={iconColor} />
              )}
              {resolvedCartCount > 0 && (
                <span className="absolute left-[18px] top-[7px] w-[20px] h-[20px] rounded-full flex items-center justify-center bg-[var(--color-brand-error)] text-[var(--color-neutral-25)] text-[12px] font-bold leading-[23.333px] tracking-[-0.24px]">
                  {resolvedCartCount > 99 ? '99+' : resolvedCartCount}
                </span>
              )}
            </Link>
          )}

        {/* User Profile / Auth */}
        {isBeforeLogin ? (
          <div className="flex items-center gap-[16px]">
            <Link
              href={ROUTES.LOGIN}
              className={cn(
                'w-[163px] h-[48px] px-[8px] py-[8px] rounded-full border-2 flex items-center justify-center',
                isTransparent ? 'border-white text-white' : 'border-neutral-900 text-neutral-900'
              )}
            >
              <span className="font-sans font-semibold text-[18px] leading-[32px] tracking-[-0.36px]">
                Login
              </span>
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className={cn(
                'w-[163px] h-[48px] px-[8px] py-[8px] rounded-full flex items-center justify-center',
                isTransparent ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
              )}
            >
              <span className="font-sans font-semibold text-[18px] leading-[32px] tracking-[-0.36px]">
                Sign Up
              </span>
            </Link>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            {/* Desktop: Link ke profile */}
            <Link
              href={ROUTES.PROFILE}
              className="hidden sm:flex items-center gap-[16px] hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={userAvatar}
                name={userLabel}
                size={64}
              />
              <span
                className={cn(
                  'font-sans font-semibold text-[18px] leading-[32px] tracking-[-0.36px]',
                  textColor
                )}
              >
                {userLabel}
              </span>
            </Link>

            {/* Mobile: Button with dropdown */}
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="sm:hidden flex items-center"
            >
              <Avatar
                src={userAvatar}
                name={userLabel}
                size={64}
              />
            </button>

            {/* Mobile Dropdown Menu - Figma: Sidebar Profile */}
            {isProfileMenuOpen && (
              <div 
                className="sm:hidden absolute right-0 top-[calc(100%+8px)] w-[240px] bg-white rounded-[12px] shadow-lg overflow-hidden z-50"
                style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                {/* User Info Header - Avatar + Name */}
                <div className="flex items-center gap-[12px] px-[16px] py-[16px] border-b border-gray-100">
                  <Avatar
                    src={userAvatar}
                    name={userLabel}
                    size={36}
                  />
                  <span className="font-sans font-semibold text-[16px] leading-[24px] text-gray-900">
                    {userLabel}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-[8px]">
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon size={20} className="text-gray-700" />
                    <span className="font-medium text-[14px] text-gray-900">Profile</span>
                  </Link>
                  <Link
                    href={ROUTES.ORDERS}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-gray-50 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
                    </svg>
                    <span className="font-medium text-[14px] text-gray-900">Orders</span>
                  </Link>
                  <div className="my-[4px] mx-[16px] border-t border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-red-50 transition-colors text-left"
                  >
                    <LogoutIcon size={20} className="text-red-600" />
                    <span className="font-medium text-[14px] text-red-600">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
