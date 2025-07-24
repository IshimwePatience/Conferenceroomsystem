/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem',
        '2xl': '5rem',
      },
    },
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Fine-grained breakpoints for better control
        'mobile-lg': '414px',
        'tablet-sm': '768px',
        'tablet-lg': '1024px',
        'laptop-sm': '1366px',
        'laptop-lg': '1440px',
        'desktop': '1920px',
        // Height-based breakpoints for different device orientations
        'h-sm': {'raw': '(min-height: 640px)'},
        'h-md': {'raw': '(min-height: 768px)'},
        'h-lg': {'raw': '(min-height: 1024px)'},
        // Pixel density breakpoints
        'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
      },
      fontSize: {
        // Fluid typography that scales with viewport
        'fluid-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'fluid-3xl': 'clamp(2rem, 6vw, 3rem)',
      },
      spacing: {
        // Fluid spacing that adapts to screen size
        'fluid-1': 'clamp(0.25rem, 1vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 2vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 3vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 4vw, 2rem)',
        'fluid-6': 'clamp(1.5rem, 6vw, 3rem)',
        'fluid-8': 'clamp(2rem, 8vw, 4rem)',
        // Percentage-based spacing
        '5vw': '5vw',
        '10vw': '10vw',
        '15vw': '15vw',
        '20vw': '20vw',
      },
      maxWidth: {
        // Responsive container sizes
        'container-xs': '20rem',
        'container-sm': '24rem',
        'container-md': '28rem',
        'container-lg': '32rem',
        'container-xl': '36rem',
        // Viewport-based max widths
        '90vw': '90vw',
        '95vw': '95vw',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        '50vh': '50vh',
        '75vh': '75vh',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    function({ addBase, addUtilities, addComponents, theme }) {
      // Base styles for better cross-device compatibility
      addBase({
        '*': {
          boxSizing: 'border-box',
        },
        'html': {
          fontSize: '16px', // Base font size
          '@media (max-width: 640px)': {
            fontSize: '14px', // Smaller base on mobile
          },
          '@media (min-width: 1920px)': {
            fontSize: '18px', // Larger base on large screens
          },
        },
        'body': {
          margin: '0',
          padding: '0',
          minHeight: '100vh',
          width: '100%',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          overscrollBehavior: 'none',
        },
        // Hide scrollbars across all browsers
        '*::-webkit-scrollbar': {
          display: 'none',
        },
        '*': {
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        },
        // Improved autofill styles
        'input:-webkit-autofill, input:-webkit-autofill:focus, input:-webkit-autofill:hover, input:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 1000px rgba(30,41,59,0.2) inset !important',
          WebkitTextFillColor: '#fff !important',
          transition: 'background-color 5000s ease-in-out 0s',
        },
      });

      // Component-level utilities
      addComponents({
        // Responsive form container
        '.form-container': {
          width: '100%',
          maxWidth: theme('maxWidth.container-xs'),
          margin: '0 auto',
          padding: theme('spacing.4'),
          '@media (min-width: 640px)': {
            maxWidth: theme('maxWidth.container-sm'),
            padding: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            maxWidth: theme('maxWidth.container-md'),
            padding: theme('spacing.8'),
          },
          '@media (min-width: 1280px)': {
            maxWidth: theme('maxWidth.container-lg'),
          },
        },
        
        // Responsive input styling
        '.input-adaptive': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.fluid-sm'),
          borderRadius: theme('borderRadius.lg'),
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          transition: 'all 0.3s ease',
          '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '&:focus': {
            outline: 'none',
            borderColor: 'rgba(6, 182, 212, 0.5)',
            boxShadow: '0 0 0 2px rgba(6, 182, 212, 0.2)',
          },
          '@media (min-width: 768px)': {
            padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
            fontSize: theme('fontSize.fluid-base'),
          },
          '@media (min-width: 1024px)': {
            padding: `${theme('spacing.4')} ${theme('spacing.5')}`,
          },
        },
        
        // Responsive button styling
        '.button-adaptive': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.fluid-sm'),
          fontWeight: '500',
          borderRadius: theme('borderRadius.lg'),
          background: 'linear-gradient(to right, #9333ea, #2563eb, #06b6d4)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 25px rgba(147, 51, 234, 0.25)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '@media (min-width: 768px)': {
            padding: `${theme('spacing.3')} ${theme('spacing.5')}`,
            fontSize: theme('fontSize.fluid-base'),
          },
          '@media (min-width: 1024px)': {
            padding: `${theme('spacing.4')} ${theme('spacing.6')}`,
          },
        },
        
        // Responsive text utilities
        '.text-adaptive-sm': {
          fontSize: theme('fontSize.fluid-xs'),
          lineHeight: '1.4',
        },
        '.text-adaptive-base': {
          fontSize: theme('fontSize.fluid-sm'),
          lineHeight: '1.5',
        },
        '.text-adaptive-lg': {
          fontSize: theme('fontSize.fluid-base'),
          lineHeight: '1.6',
        },
        '.text-adaptive-xl': {
          fontSize: theme('fontSize.fluid-lg'),
          lineHeight: '1.4',
        },
        '.text-adaptive-2xl': {
          fontSize: theme('fontSize.fluid-xl'),
          lineHeight: '1.3',
        },
        '.text-adaptive-3xl': {
          fontSize: theme('fontSize.fluid-2xl'),
          lineHeight: '1.2',
        },
        
        // Responsive spacing utilities
        '.space-adaptive-y > * + *': {
          marginTop: theme('spacing.fluid-3'),
        },
        '.space-adaptive-y-sm > * + *': {
          marginTop: theme('spacing.fluid-2'),
        },
        '.space-adaptive-y-lg > * + *': {
          marginTop: theme('spacing.fluid-4'),
        },
      });

      // Utility classes for specific responsive needs
      addUtilities({
        // Viewport-based utilities
        '.min-h-screen-safe': {
          minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        '.w-screen-safe': {
          width: 'calc(100vw - env(safe-area-inset-left) - env(safe-area-inset-right))',
        },
        
        // Responsive padding that adapts to screen size
        '.p-adaptive': {
          padding: 'clamp(1rem, 5vw, 3rem)',
        },
        '.px-adaptive': {
          paddingLeft: 'clamp(1rem, 5vw, 3rem)',
          paddingRight: 'clamp(1rem, 5vw, 3rem)',
        },
        '.py-adaptive': {
          paddingTop: 'clamp(1rem, 5vh, 3rem)',
          paddingBottom: 'clamp(1rem, 5vh, 3rem)',
        },
        
        // Gap utilities that scale
        '.gap-adaptive': {
          gap: 'clamp(0.5rem, 3vw, 2rem)',
        },
        '.gap-adaptive-sm': {
          gap: 'clamp(0.25rem, 2vw, 1rem)',
        },
        '.gap-adaptive-lg': {
          gap: 'clamp(1rem, 4vw, 3rem)',
        },
        
        // Responsive grid utilities
        '.grid-adaptive': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(1rem, 3vw, 2rem)',
        },
        
        // High DPI optimizations
        '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)': {
          '.retina-border': {
            borderWidth: '0.5px',
          },
          '.retina-text': {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      });
    }
  ],
}