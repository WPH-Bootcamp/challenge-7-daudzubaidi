import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// ============================================================
// FONTS - Nunito from Figma Design System
// ============================================================
const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

// ============================================================
// METADATA
// ============================================================
export const metadata: Metadata = {
  title: 'Foody - Explore Culinary Experiences',
  description: 'Search and refine your choice to discover the perfect restaurant. Order your favorite food online.',
  keywords: ['restaurant', 'food', 'delivery', 'order', 'menu'],
  authors: [{ name: 'Foody Team' }],
  openGraph: {
    title: 'Foody - Explore Culinary Experiences',
    description: 'Search and refine your choice to discover the perfect restaurant.',
    type: 'website',
  },
};

// ============================================================
// ROOT LAYOUT
// ============================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
