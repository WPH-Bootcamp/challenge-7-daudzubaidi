'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/config/constants';
import { cn } from '@/lib/utils';

// ============================================================
// FOOTER COMPONENT - From Figma Design System (node 37412-4151)
// ============================================================

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const exploreLinks = [
    { label: 'All Food', href: `${ROUTES.CATEGORY}?filter=all` },
    { label: 'Nearby', href: `${ROUTES.CATEGORY}?filter=nearby` },
    { label: 'Discount', href: `${ROUTES.CATEGORY}?filter=discount` },
    { label: 'Best Seller', href: `${ROUTES.CATEGORY}?filter=best-seller` },
    { label: 'Delivery', href: `${ROUTES.CATEGORY}?filter=delivery` },
    { label: 'Lunch', href: `${ROUTES.CATEGORY}?filter=lunch` },
  ] as const;

  const helpLinks = [
    { label: 'How to Order', href: ROUTES.CHECKOUT },
    { label: 'Payment Methods', href: `${ROUTES.CHECKOUT}#payment` },
    { label: 'Track My Order', href: ROUTES.ORDERS },
    { label: 'FAQ', href: `${ROUTES.HOME}#faq` },
    { label: 'Contact Us', href: `${ROUTES.HOME}#contact` },
  ] as const;

  return (
    <footer
      className={cn(
        'w-full bg-neutral-950 border-t border-neutral-300',
        'flex flex-col lg:flex-row items-start justify-between',
        'px-4 sm:px-6 md:px-12 lg:px-[150px]',
        'py-12 md:py-16 lg:py-[80px]',
        'gap-12 lg:gap-8',
        className
      )}
    >
      {/* Left Section - Content Container */}
      <div className="flex flex-col gap-8 lg:gap-[40px] items-start w-full lg:w-[380px] lg:shrink-0">
        {/* Content */}
        <div className="flex flex-col gap-5 lg:gap-[22px] items-start w-full">
          {/* Logo */}
          <div className="flex gap-3 lg:gap-[15px] items-center">
            <div className="overflow-clip shrink-0 size-[42px]">
              <Image
                src="/images/logo-red.svg"
                alt="Foody Logo"
                width={42}
                height={42}
                className="object-contain"
              />
            </div>
            <p className="font-sans font-extrabold text-[28px] lg:text-[32px] leading-[38px] lg:leading-[42px] text-white m-0">
              Foody
            </p>
          </div>
          {/* Description */}
          <p className="font-sans font-normal text-[14px] lg:text-[16px] leading-[24px] lg:leading-[30px] tracking-[-0.28px] lg:tracking-[-0.32px] text-[#fdfdfd] m-0">
            {`Enjoy homemade flavors & chef's signature dishes, freshly prepared every day. Order online or visit our nearest branch.`}
          </p>
        </div>

        {/* Social Media Container */}
        <div className="flex flex-col gap-4 lg:gap-[20px] items-start w-full lg:w-[196px]">
          {/* Social Media Label */}
          <div className="flex items-center w-full">
            <p className="font-sans font-extrabold text-[14px] lg:text-[16px] leading-[24px] lg:leading-[30px] text-[#fdfdfd] m-0">
              Follow on Social Media
            </p>
          </div>
          {/* Social Media Icons */}
          <div className="flex gap-3 lg:gap-[12px] items-center">
            <SocialIcon href="https://facebook.com" label="Facebook" icon="facebook" />
            <SocialIcon href="https://instagram.com" label="Instagram" icon="instagram" />
            <SocialIcon href="https://linkedin.com" label="LinkedIn" icon="linkedin" />
            <SocialIcon href="https://tiktok.com" label="TikTok" icon="tiktok" />
          </div>
        </div>
      </div>

      {/* Middle & Right Sections Container - Stack on mobile, side by side on desktop */}
      <div className="flex flex-col sm:flex-row gap-12 sm:gap-8 lg:gap-0 w-full lg:w-auto justify-between lg:justify-start">
        {/* Middle Section - Explore Menu */}
        <div className="flex flex-col gap-4 lg:gap-[20px] items-start w-full sm:w-1/2 lg:w-[200px] lg:shrink-0">
          <p className="font-sans font-extrabold text-[14px] lg:text-[16px] leading-[24px] lg:leading-[30px] text-[#fdfdfd] m-0">
            Explore
          </p>
          {exploreLinks.map((link) => (
            <FooterLink key={link.label} href={link.href} label={link.label} />
          ))}
        </div>

        {/* Right Section - Help Menu */}
        <div className="flex flex-col gap-4 lg:gap-[20px] items-start w-full sm:w-1/2 lg:w-[200px] lg:shrink-0 lg:ml-8">
          <p className="font-sans font-extrabold text-[14px] lg:text-[16px] leading-[24px] lg:leading-[30px] text-[#fdfdfd] m-0">
            Help
          </p>
          {helpLinks.map((link) => (
            <FooterLink key={link.label} href={link.href} label={link.label} />
          ))}
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: 'facebook' | 'instagram' | 'linkedin' | 'tiktok';
}) {
  // SVG paths for social icons
  const icons = {
    facebook: (
      <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.82 20V10.87H9.56L9.97 7.32H6.82V5.05C6.82 4.03 7.1 3.33 8.54 3.33H10V0.14C9.24 0.06 8.47 0.01 7.71 0C5.11 0 3.34 1.66 3.34 4.7V7.32H0.5V10.87H3.34V20H6.82Z" fill="white"/>
      </svg>
    ),
    instagram: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 1.8C12.67 1.8 12.99 1.81 14.04 1.86C15.04 1.9 15.58 2.06 15.95 2.19C16.44 2.37 16.79 2.58 17.16 2.95C17.53 3.32 17.75 3.67 17.92 4.16C18.05 4.53 18.21 5.07 18.25 6.07C18.3 7.12 18.31 7.44 18.31 10.11C18.31 12.78 18.3 13.1 18.25 14.15C18.21 15.15 18.05 15.69 17.92 16.06C17.74 16.55 17.53 16.9 17.16 17.27C16.79 17.64 16.44 17.86 15.95 18.03C15.58 18.16 15.04 18.32 14.04 18.36C12.99 18.41 12.67 18.42 10 18.42C7.33 18.42 7.01 18.41 5.96 18.36C4.96 18.32 4.42 18.16 4.05 18.03C3.56 17.85 3.21 17.64 2.84 17.27C2.47 16.9 2.25 16.55 2.08 16.06C1.95 15.69 1.79 15.15 1.75 14.15C1.7 13.1 1.69 12.78 1.69 10.11C1.69 7.44 1.7 7.12 1.75 6.07C1.79 5.07 1.95 4.53 2.08 4.16C2.26 3.67 2.47 3.32 2.84 2.95C3.21 2.58 3.56 2.36 4.05 2.19C4.42 2.06 4.96 1.9 5.96 1.86C7.01 1.81 7.33 1.8 10 1.8ZM10 0C7.28 0 6.94 0.01 5.88 0.06C4.82 0.11 4.09 0.28 3.45 0.52C2.78 0.78 2.21 1.12 1.65 1.69C1.08 2.25 0.74 2.82 0.48 3.49C0.24 4.13 0.07 4.86 0.02 5.92C-0.03 6.98 -0.04 7.32 -0.04 10.04C-0.04 12.76 -0.03 13.1 0.02 14.16C0.07 15.22 0.24 15.95 0.48 16.59C0.74 17.26 1.08 17.83 1.65 18.39C2.21 18.96 2.78 19.3 3.45 19.56C4.09 19.8 4.82 19.97 5.88 20.02C6.94 20.07 7.28 20.08 10 20.08C12.72 20.08 13.06 20.07 14.12 20.02C15.18 19.97 15.91 19.8 16.55 19.56C17.22 19.3 17.79 18.96 18.35 18.39C18.92 17.83 19.26 17.26 19.52 16.59C19.76 15.95 19.93 15.22 19.98 14.16C20.03 13.1 20.04 12.76 20.04 10.04C20.04 7.32 20.03 6.98 19.98 5.92C19.93 4.86 19.76 4.13 19.52 3.49C19.26 2.82 18.92 2.25 18.35 1.69C17.79 1.12 17.22 0.78 16.55 0.52C15.91 0.28 15.18 0.11 14.12 0.06C13.06 0.01 12.72 0 10 0Z" fill="white"/>
        <path d="M10 4.87C7.15 4.87 4.84 7.18 4.84 10.03C4.84 12.88 7.15 15.19 10 15.19C12.85 15.19 15.16 12.88 15.16 10.03C15.16 7.18 12.85 4.87 10 4.87ZM10 13.39C8.14 13.39 6.64 11.89 6.64 10.03C6.64 8.17 8.14 6.67 10 6.67C11.86 6.67 13.36 8.17 13.36 10.03C13.36 11.89 11.86 13.39 10 13.39Z" fill="white"/>
        <path d="M16.54 4.67C16.54 5.33 16 5.87 15.34 5.87C14.68 5.87 14.14 5.33 14.14 4.67C14.14 4.01 14.68 3.47 15.34 3.47C16 3.47 16.54 4.01 16.54 4.67Z" fill="white"/>
      </svg>
    ),
    linkedin: (
      <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.81 16H0.28V5.32H3.81V16ZM2.04 3.86C0.91 3.86 0 2.93 0 1.8C0 0.81 0.81 0 1.8 0C2.79 0 3.6 0.81 3.6 1.8C3.6 2.93 3.17 3.86 2.04 3.86ZM16.5 16H12.97V10.82C12.97 9.49 12.95 7.79 11.13 7.79C9.29 7.79 9.01 9.23 9.01 10.73V16H5.48V5.32H8.87V6.89H8.92C9.4 5.99 10.56 5.04 12.28 5.04C15.84 5.04 16.5 7.37 16.5 10.37V16Z" fill="white"/>
      </svg>
    ),
    tiktok: (
      <svg width="17" height="20" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.08 0H9.22V13.67C9.22 15.09 8.08 16.26 6.65 16.26C5.22 16.26 4.08 15.09 4.08 13.67C4.08 12.27 5.19 11.12 6.56 11.08V8.17C3.57 8.21 1.17 10.65 1.17 13.67C1.17 16.72 3.62 19.18 6.68 19.18C9.74 19.18 12.19 16.69 12.19 13.67V6.63C13.28 7.44 14.61 7.91 16 7.94V5.03C13.76 4.94 12.08 2.71 12.08 0Z" fill="white"/>
      </svg>
    ),
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="border border-neutral-800 rounded-full w-[40px] h-[40px] flex items-center justify-center shrink-0 hover:border-neutral-600 transition-colors"
    >
      {icons[icon]}
    </a>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:');

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="font-sans font-normal text-[14px] lg:text-[16px] leading-[24px] lg:leading-[30px] tracking-[-0.28px] lg:tracking-[-0.32px] text-[#fdfdfd] opacity-80 hover:opacity-100 transition-opacity"
    >
      {label}
    </Link>
  );
}
