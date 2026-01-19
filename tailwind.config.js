/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ============================================================
      // TYPOGRAPHY - From Figma Design System
      // ============================================================
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      fontSize: {
        // Display Scales
        'display-3xl': ['56px', { lineHeight: '68px', letterSpacing: '-2px', fontWeight: '700' }],
        'display-2xl': ['48px', { lineHeight: '60px', letterSpacing: '-2px', fontWeight: '700' }],
        'display-xl': ['60px', { lineHeight: '72px', letterSpacing: '-2px', fontWeight: '700' }],
        'display-lg': ['36px', { lineHeight: '44px', letterSpacing: '-2px', fontWeight: '700' }],
        'display-md': ['32px', { lineHeight: '42px', letterSpacing: '-2px', fontWeight: '700' }],
        'display-sm': ['28px', { lineHeight: '38px', letterSpacing: '0px', fontWeight: '700' }],
        'display-xs': ['24px', { lineHeight: '36px', letterSpacing: '0px', fontWeight: '700' }],

        // Text Scales
        'text-xl': ['20px', { lineHeight: '34px', letterSpacing: '0px', fontWeight: '400' }],
        'text-lg': ['18px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '400' }],
        'text-md': ['16px', { lineHeight: '30px', letterSpacing: '-2px', fontWeight: '400' }],
        'text-sm': ['14px', { lineHeight: '20px', letterSpacing: '-2px', fontWeight: '400' }],
        'text-xs': ['12px', { lineHeight: '24px', letterSpacing: '-2px', fontWeight: '400' }],
      },

      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },

      lineHeight: {
        'display-3xl': '68px',
        'display-2xl': '60px',
        'display-xl': '72px',
        'display-lg': '44px',
        'display-md': '42px',
        'display-sm': '38px',
        'display-xs': '36px',
        'text-xl': '34px',
        'text-lg': '32px',
        'text-md': '30px',
        'text-sm': '20px',
        'text-xs': '24px',
      },

      letterSpacing: {
        tight: '-2px',
        tighter: '-3px',
        normal: '0px',
      },

      // ============================================================
      // COLORS - From Figma Design System
      // ============================================================
      colors: {
        // Neutral Grayscale (12-step)
        'neutral-950': '#0a0d12',
        'neutral-900': '#181d27',
        'neutral-800': '#252b37',
        'neutral-700': '#414651',
        'neutral-600': '#535862',
        'neutral-500': '#717680',
        'neutral-400': '#a4a7ae',
        'neutral-300': '#d5d7da',
        'neutral-200': '#e9eaeb',
        'neutral-100': '#f5f5f5',
        'neutral-50': '#fafafa',
        'neutral-25': '#fdfdfd',

        // Semantic Text Colors
        'text-primary': '#181d27',    // neutral-900
        'text-tertiary': '#535862',   // neutral-600
        'text-quaternary': '#717680', // neutral-500

        // Semantic Foreground Colors
        'fg-brand-primary': '#7f56d9',    // Brand Purple
        'fg-secondary': '#414651',        // neutral-700
        'fg-error-primary': '#d92d20',    // Error Red

        // Semantic Background Colors
        'bg-primary': '#ffffff',          // White
        'bg-secondary': '#fafafa',        // neutral-50
        'bg-primary-solid': '#0a0d12',    // Primary Dark

        // Semantic Border Colors
        'border-primary': '#d5d7da',      // neutral-300
        'border-secondary': '#e9eaeb',    // neutral-200

        // Accent Colors
        'brand': '#6941C6',               // Brand Purple (700)
        'brand-error': '#c12116',         // Primary Red (was #ff9500 in old config - FIXED)
        'accent-red': '#d9206e',          // Pink-red
        'accent-green': '#079455',        // Success Green
        'accent-yellow': '#fdb022',       // Warning Yellow

        // Utility Colors
        'utility-success-50': '#ecfdf3',
        'utility-success-200': '#abefc6',
        'utility-success-700': '#067647',

        // Base Colors
        'base-white': '#ffffff',
        'base-black': '#000000',

        // Focus Ring
        'focus-ring': '#9e77ed',
      },

      backgroundColor: {
        primary: '#ffffff',
        secondary: '#fafafa',
        'primary-solid': '#0a0d12',
      },

      textColor: {
        primary: '#181d27',
        tertiary: '#535862',
        quaternary: '#717680',
      },

      borderColor: {
        primary: '#d5d7da',
        secondary: '#e9eaeb',
        DEFAULT: '#d5d7da',
      },

      // ============================================================
      // SPACING - From Figma Design System (8-point base)
      // ============================================================
      spacing: {
        0: '0px',
        1: '2px',      // spacing-xxs
        2: '4px',      // spacing-xs
        3: '6px',      // spacing-sm (custom)
        4: '8px',      // spacing-md
        6: '12px',     // spacing-lg (custom)
        8: '16px',     // spacing-xl
        10: '20px',    // spacing-2xl (custom)
        12: '24px',    // spacing-3xl
        16: '32px',    // spacing-4xl
        20: '40px',    // spacing-5xl (custom)
        24: '48px',    // spacing-6xl
        32: '64px',    // spacing-7xl
        40: '80px',    // spacing-8xl (custom)
        48: '96px',    // spacing-9xl
        64: '128px',   // spacing-10xl
        80: '160px',   // spacing-11xl (custom)
      },

      gap: {
        0: '0px',
        1: '2px',
        2: '4px',
        3: '6px',
        4: '8px',
        6: '12px',
        8: '16px',
        10: '20px',
        12: '24px',
        16: '32px',
        20: '40px',
        24: '48px',
        32: '64px',
        40: '80px',
        48: '96px',
        64: '128px',
        80: '160px',
      },

      padding: {
        0: '0px',
        1: '2px',
        2: '4px',
        3: '6px',
        4: '8px',
        6: '12px',
        8: '16px',
        10: '20px',
        12: '24px',
        16: '32px',
        20: '40px',
        24: '48px',
        32: '64px',
        40: '80px',
        48: '96px',
        64: '128px',
        80: '160px',
      },

      margin: {
        0: '0px',
        1: '2px',
        2: '4px',
        3: '6px',
        4: '8px',
        6: '12px',
        8: '16px',
        10: '20px',
        12: '24px',
        16: '32px',
        20: '40px',
        24: '48px',
        32: '64px',
        40: '80px',
        48: '96px',
        64: '128px',
        80: '160px',
      },

      // ============================================================
      // BORDER RADIUS - From Figma Design System
      // ============================================================
      borderRadius: {
        none: '0px',
        'xxs': '2px',
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        full: '9999px',
      },

      // ============================================================
      // SHADOWS - From Figma Design System
      // ============================================================
      boxShadow: {
        'shadow-xs': '0 1px 2px rgba(10, 13, 18, 0.05)',
        'shadow-lg': `
          0 2px 2px rgba(10, 13, 18, 0.06),
          0 4px 6px rgba(10, 13, 18, 0.05),
          0 12px 16px rgba(10, 13, 18, 0.08)
        `,
        'shadow-card': '0 0px 20px rgba(203, 202, 202, 0.25)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        none: 'none',
      },

      // ============================================================
      // LAYOUT CONSTRAINTS
      // ============================================================
      maxWidth: {
        'paragraph': '720px',
        '2xl': '1024px',
        '3xl': '1440px',
      },

      // ============================================================
      // RESPONSIVE BREAKPOINTS (From pages)
      // ============================================================
      screens: {
        'mobile': '320px',
        'sm': '393px',    // Mobile width from design
        'md': '768px',    // Tablet
        'lg': '1024px',   // Desktop (width-2xl)
        'xl': '1440px',   // Large desktop (from pages)
      },

      // ============================================================
      // FOCUS RING
      // ============================================================
      ringColor: {
        focus: '#9e77ed',
      },

      // ============================================================
      // TRANSITIONS
      // ============================================================
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },

  plugins: [],
};
