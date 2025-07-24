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
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: "640px",
        md: "768px", 
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      // COMPREHENSIVE BREAKPOINTS - Works on ALL existing pixels
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px', 
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        
        // CRITICAL: Fix for your 1920×1080 @ 150% scaling (shows ~1280px CSS width)
        'scaled': '1200px',
        
        // All common resolutions support
        'small-laptop': {'min': '768px', 'max': '1023px'},
        'tiny-laptop': {'min': '768px', 'max': '900px'},
        'laptop-13': '1280px',    // 13" laptops
        'laptop-15': '1366px',    // 15" laptops  
        'laptop-17': '1600px',    // 17" laptops
        'desktop-hd': '1920px',   // 1920×1080
        'desktop-2k': '2560px',   // 2560×1440
        'desktop-4k': '3840px',   // 4K displays
        '3xl': '1920px',
        '4xl': '2560px',
        '5xl': '3840px',
        
        // Height breakpoints for different orientations
        'h-sm': {'raw': '(min-height: 640px)'},
        'h-md': {'raw': '(min-height: 768px)'},
        'h-lg': {'raw': '(min-height: 1024px)'},
        'h-xl': {'raw': '(min-height: 1280px)'},
        
        // Pixel density breakpoints
        'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
        'high-dpi': {'raw': '(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi)'},
      },
      
      // RESPONSIVE SPACING - Works on ALL screen sizes
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        
        // Fluid spacing that adapts to ANY screen size
        'fluid-1': 'clamp(0.25rem, 0.5vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 1vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 1.5vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 2vw, 2rem)',
        'fluid-5': 'clamp(1.25rem, 2.5vw, 2.5rem)',
        'fluid-6': 'clamp(1.5rem, 3vw, 3rem)',
        'fluid-8': 'clamp(2rem, 4vw, 4rem)',
        'fluid-10': 'clamp(2.5rem, 5vw, 5rem)',
        'fluid-12': 'clamp(3rem, 6vw, 6rem)',
        
        // Percentage-based spacing
        '5vw': '5vw',
        '10vw': '10vw',
        '15vw': '15vw',
        '20vw': '20vw',
      },
      
      // RESPONSIVE FONT SIZES - Perfect on ALL pixels including yours
      fontSize: {
        // Standard sizes (unchanged)
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        
        // Fluid typography - Scales perfectly on YOUR 1920×1080 @ 150% AND all other pixels
        'fluid-xs': 'clamp(0.7rem, 0.65rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.8rem, 0.75rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(0.9rem, 0.85rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1rem, 0.95rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.1rem, 1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.3rem, 1.2rem + 1vw, 2rem)',
        'fluid-3xl': 'clamp(1.6rem, 1.4rem + 1.5vw, 2.5rem)',
        'fluid-4xl': 'clamp(2rem, 1.6rem + 2vw, 3rem)',
        'fluid-5xl': 'clamp(2.5rem, 2rem + 2.5vw, 4rem)',
      },
      
      // CONTAINER SIZES - Responsive to ALL screen sizes
      maxWidth: {
        'container-xs': '18rem',   // 288px
        'container-sm': '22rem',   // 352px
        'container-md': '26rem',   // 416px
        'container-lg': '30rem',   // 480px
        'container-xl': '34rem',   // 544px
        'container-2xl': '38rem',  // 608px
        
        // Viewport-based containers
        '90vw': '90vw',
        '95vw': '95vw',
        'screen-sm': 'min(90vw, 28rem)',
        'screen-md': 'min(85vw, 32rem)', 
        'screen-lg': 'min(80vw, 36rem)',
      },
      
      // BORDER RADIUS - Responsive
      borderRadius: {
        'fluid': 'clamp(0.375rem, 0.5vw, 0.75rem)',
      },
    },
  },
  plugins: [
    function({ addBase, addComponents, addUtilities, theme }) {
      
      // BASE STYLES - Optimized for ALL screen sizes and pixel densities
      addBase({
        '*': {
          boxSizing: 'border-box',
        },
        'html': {
          fontSize: '16px', // Base for most screens
          // Responsive base font size
          '@media (max-width: 475px)': {
            fontSize: '14px', // Smaller phones
          },
          '@media (max-width: 320px)': {
            fontSize: '13px', // Very small phones
          },
          '@media (min-width: 1920px)': {
            fontSize: '18px', // Large desktops
          },
          '@media (min-width: 2560px)': {
            fontSize: '20px', // 2K+ displays
          },
          '@media (min-width: 3840px)': {
            fontSize: '22px', // 4K+ displays
          },
        },
        'body': {
          margin: '0',
          padding: '0',
          minHeight: '100vh',
          width: '100%',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          overscrollBehavior: 'none',
          // Support for safe areas (mobile devices with notches)
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
        
        // Hide scrollbars but maintain functionality
        '*::-webkit-scrollbar': {
          display: 'none',
        },
        '*': {
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        },
        
        // Better autofill styling - works on all displays
        'input:-webkit-autofill, input:-webkit-autofill:focus, input:-webkit-autofill:hover, input:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 1000px rgba(30,41,59,0.2) inset !important',
          WebkitTextFillColor: '#fff !important',
          transition: 'background-color 5000s ease-in-out 0s',
        },
        
        // High-DPI display optimizations
        '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)': {
          'body': {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }
        },
      });

      // COMPONENTS - Work perfectly on ALL screen sizes including your 1920×1080 @ 150%
      addComponents({
        // Universal responsive form container
        '.responsive-form': {
          width: '100%',
          maxWidth: theme('maxWidth.container-sm'),
          margin: '0 auto',
          padding: theme('spacing.fluid-4'),
          
          // Phone
          '@media (max-width: 475px)': {
            maxWidth: theme('maxWidth.container-xs'),
            padding: theme('spacing.fluid-3'),
          },
          
          // Tablet
          '@media (min-width: 640px)': {
            maxWidth: theme('maxWidth.container-md'),
            padding: theme('spacing.fluid-5'),
          },
          
          // Small laptop
          '@media (min-width: 768px) and (max-width: 1023px)': {
            maxWidth: theme('maxWidth.container-md'),
            padding: theme('spacing.fluid-4'),
          },
          
          // Laptop
          '@media (min-width: 1024px)': {
            maxWidth: theme('maxWidth.container-lg'),
            padding: theme('spacing.fluid-6'),
          },
          
          // CRITICAL: Your 1920×1080 @ 150% display (~1280px CSS width)
          '@media (min-width: 1200px)': {
            maxWidth: theme('maxWidth.container-xl'),
            padding: theme('spacing.fluid-8'),
          },
          
          // Large desktop
          '@media (min-width: 1920px)': {
            maxWidth: theme('maxWidth.container-2xl'),
            padding: theme('spacing.fluid-10'),
          },
          
          // Ultra-wide and 4K
          '@media (min-width: 2560px)': {
            maxWidth: '42rem',
            padding: theme('spacing.fluid-12'),
          },
        },
        
        // Universal responsive input
        '.responsive-input': {
          width: '100%',
          padding: `${theme('spacing.fluid-3')} ${theme('spacing.fluid-4')}`,
          fontSize: theme('fontSize.fluid-base'),
          lineHeight: '1.5',
          borderRadius: theme('borderRadius.fluid'),
          transition: 'all 0.3s ease',
          
          // Phone optimizations
          '@media (max-width: 475px)': {
            padding: `${theme('spacing.fluid-2')} ${theme('spacing.fluid-3')}`,
            fontSize: theme('fontSize.fluid-sm'),
          },
          
          // Small laptop optimization
          '@media (min-width: 768px) and (max-width: 1023px)': {
            padding: `${theme('spacing.fluid-3')} ${theme('spacing.fluid-4')}`,
            fontSize: theme('fontSize.fluid-base'),
          },
          
          // Regular laptop
          '@media (min-width: 1024px)': {
            padding: `${theme('spacing.fluid-4')} ${theme('spacing.fluid-5')}`,
            fontSize: theme('fontSize.fluid-lg'),
          },
          
          // CRITICAL: Your 1920×1080 @ 150% display
          '@media (min-width: 1200px)': {
            padding: `${theme('spacing.fluid-4')} ${theme('spacing.fluid-6')}`,
            fontSize: theme('fontSize.fluid-lg'),
          },
          
          // Large desktop
          '@media (min-width: 1920px)': {
            padding: `${theme('spacing.fluid-5')} ${theme('spacing.fluid-8')}`,
            fontSize: theme('fontSize.fluid-xl'),
          },
          
          // Ultra-wide and 4K
          '@media (min-width: 2560px)': {
            padding: `1.5rem 2rem`,
            fontSize: theme('fontSize.fluid-2xl'),
          },
        },
        
        // Universal responsive button
        '.responsive-button': {
          width: '100%',
          padding: `${theme('spacing.fluid-3')} ${theme('spacing.fluid-4')}`,
          fontSize: theme('fontSize.fluid-base'),
          fontWeight: '500',
          lineHeight: '1.5',
          borderRadius: theme('borderRadius.fluid'),
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          
          '&:active': {
            transform: 'translateY(0)',
          },
          
          // Phone optimizations
          '@media (max-width: 475px)': {
            padding: `${theme('spacing.fluid-2')} ${theme('spacing.fluid-3')}`,
            fontSize: theme('fontSize.fluid-sm'),
          },
          
          // Small laptop optimization
          '@media (min-width: 768px) and (max-width: 1023px)': {
            padding: `${theme('spacing.fluid-3')} ${theme('spacing.fluid-4')}`,
            fontSize: theme('fontSize.fluid-base'),
          },
          
          // Regular laptop
          '@media (min-width: 1024px)': {
            padding: `${theme('spacing.fluid-4')} ${theme('spacing.fluid-5')}`,
            fontSize: theme('fontSize.fluid-lg'),
          },
          
          // CRITICAL: Your 1920×1080 @ 150% display
          '@media (min-width: 1200px)': {
            padding: `${theme('spacing.fluid-4')} ${theme('spacing.fluid-6')}`,
            fontSize: theme('fontSize.fluid-lg'),
          },
          
          // Large desktop
          '@media (min-width: 1920px)': {
            padding: `${theme('spacing.fluid-5')} ${theme('spacing.fluid-8')}`,
            fontSize: theme('fontSize.fluid-xl'),
          },
          
          // Ultra-wide and 4K
          '@media (min-width: 2560px)': {
            padding: `1.5rem 2rem`,
            fontSize: theme('fontSize.fluid-2xl'),
          },
        },
      });

      // UTILITIES - Helpful classes for all screen sizes
      addUtilities({
        // Responsive text utilities
        '.text-fluid-xs': { fontSize: theme('fontSize.fluid-xs') },
        '.text-fluid-sm': { fontSize: theme('fontSize.fluid-sm') },
        '.text-fluid-base': { fontSize: theme('fontSize.fluid-base') },
        '.text-fluid-lg': { fontSize: theme('fontSize.fluid-lg') },
        '.text-fluid-xl': { fontSize: theme('fontSize.fluid-xl') },
        '.text-fluid-2xl': { fontSize: theme('fontSize.fluid-2xl') },
        '.text-fluid-3xl': { fontSize: theme('fontSize.fluid-3xl') },
        '.text-fluid-4xl': { fontSize: theme('fontSize.fluid-4xl') },
        '.text-fluid-5xl': { fontSize: theme('fontSize.fluid-5xl') },
        
        // Responsive spacing utilities
        '.space-fluid-y > * + *': {
          marginTop: theme('spacing.fluid-4'),
        },
        '.space-fluid-y-sm > * + *': {
          marginTop: theme('spacing.fluid-2'),
        },
        '.space-fluid-y-lg > * + *': {
          marginTop: theme('spacing.fluid-6'),
        },
        '.gap-fluid': {
          gap: theme('spacing.fluid-4'),
        },
        '.gap-fluid-sm': {
          gap: theme('spacing.fluid-2'),
        },
        '.gap-fluid-lg': {
          gap: theme('spacing.fluid-6'),
        },
        
        // Padding utilities
        '.p-fluid': { padding: theme('spacing.fluid-4') },
        '.px-fluid': { 
          paddingLeft: theme('spacing.fluid-4'),
          paddingRight: theme('spacing.fluid-4'),
        },
        '.py-fluid': {
          paddingTop: theme('spacing.fluid-4'),
          paddingBottom: theme('spacing.fluid-4'),
        },
        '.p-fluid-sm': { padding: theme('spacing.fluid-2') },
        '.p-fluid-lg': { padding: theme('spacing.fluid-6') },
        
        // Safe area support
        '.min-h-screen-safe': {
          minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        '.w-screen-safe': {
          width: 'calc(100vw - env(safe-area-inset-left) - env(safe-area-inset-right))',
        },
        
        // Responsive containers
        '.container-fluid': {
          width: '100%',
          maxWidth: 'none',
          paddingLeft: theme('spacing.fluid-4'),
          paddingRight: theme('spacing.fluid-4'),
        },
      });
    }
  ],
}