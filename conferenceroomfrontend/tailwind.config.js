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
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Perfect for your 1920×1080 @ 150% scaling
        'scaled': '1200px',
        '3xl': '1920px',
      },
      
      // YouTube-like font sizes - cleaner and more compact
      fontSize: {
        // Standard sizes
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        
        // YouTube-inspired fluid sizes
        'fluid-xs': 'clamp(0.75rem, 1.5vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 2vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2.2vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 2.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 2.8vw, 1.375rem)',
        'fluid-2xl': 'clamp(1.5rem, 3.2vw, 1.75rem)',
        'fluid-3xl': 'clamp(1.875rem, 4vw, 2.25rem)',
      },
      
      // Compact spacing for better proportions
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // Compact responsive spacing
        'compact-1': '0.25rem',
        'compact-2': '0.5rem', 
        'compact-3': '0.75rem',
        'compact-4': '1rem',
        'compact-5': '1.25rem',
        'compact-6': '1.5rem',
      },
      
      maxWidth: {
        'form-xs': '18rem',
        'form-sm': '20rem',
        'form-md': '24rem', 
        'form-lg': '28rem',
      },
      
      // YouTube-like heights
      height: {
        'input-sm': '2.75rem',   // ~44px - compact
        'input-md': '3rem',      // ~48px - standard  
        'input-lg': '3.25rem',   // ~52px - larger screens
        'btn-sm': '2.5rem',      // ~40px - compact buttons
        'btn-md': '2.75rem',     // ~44px - standard buttons
        'btn-lg': '3rem',        // ~48px - larger buttons
      },
    },
  },
  plugins: [
    function({ addComponents, addUtilities, theme }) {
      
      // YouTube-inspired form components
      addComponents({
        // Main form container - responsive and compact
        '.youtube-form': {
          width: '100%',
          maxWidth: theme('maxWidth.form-sm'),
          margin: '0 auto',
          padding: theme('spacing.4'),
          
          // Mobile (default) - compact
          '@media (max-width: 640px)': {
            maxWidth: theme('maxWidth.form-xs'),
            padding: theme('spacing.3'),
          },
          
          // Tablet (md: 768px+) - very compact for your needs
          '@media (min-width: 768px)': {
            maxWidth: '18rem', // Smaller form
            padding: theme('spacing.2'),
          },
          
          // Your scaled display (1200px+) - optimized for 1920×1080 @ 150%
          '@media (min-width: 1200px)': {
            maxWidth: theme('maxWidth.form-md'),
            padding: theme('spacing.6'),
          },
          
          // Large desktop
          '@media (min-width: 1920px)': {
            maxWidth: theme('maxWidth.form-lg'),
            padding: theme('spacing.8'),
          },
        },
        
        // YouTube-style input - perfect heights
        '.youtube-input': {
          width: '100%',
          height: theme('height.input-sm'), // Compact by default
          padding: '0 clamp(0.75rem, 2vw, 1rem)',
          fontSize: theme('fontSize.fluid-sm'),
          lineHeight: '1.5',
          borderRadius: 'clamp(0.375rem, 0.5vw, 0.5rem)',
          transition: 'all 0.2s ease',
          
          // Tablet - even more compact
          '@media (min-width: 768px)': {
            height: '2.25rem', // Very compact for tablets
            fontSize: theme('fontSize.sm[0]'),
          },
          
          // Your scaled display
          '@media (min-width: 1200px)': {
            height: theme('height.input-md'),
            fontSize: theme('fontSize.fluid-base'),
          },
          
          // Large screens
          '@media (min-width: 1920px)': {
            height: theme('height.input-lg'),
          },
        },
        
        // YouTube-style button - optimized heights
        '.youtube-button': {
          width: '100%',
          height: theme('height.btn-sm'), // Compact by default
          padding: '0 clamp(0.75rem, 2vw, 1rem)',
          fontSize: theme('fontSize.fluid-sm'),
          fontWeight: '500',
          lineHeight: '1',
          borderRadius: 'clamp(0.375rem, 0.5vw, 0.5rem)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          
          // Tablet - compact
          '@media (min-width: 768px)': {
            height: '2rem', // Very compact buttons for tablets
            fontSize: theme('fontSize.sm[0]'),
          },
          
          // Your scaled display
          '@media (min-width: 1200px)': {
            height: theme('height.btn-md'),
            fontSize: theme('fontSize.fluid-base'),
          },
          
          // Large screens
          '@media (min-width: 1920px)': {
            height: theme('height.btn-lg'),
          },
          
          '&:hover': {
            transform: 'translateY(-1px)',
            filter: 'brightness(1.05)',
          },
          
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        
        // Compact checkbox and small elements
        '.youtube-checkbox': {
          width: 'clamp(0.875rem, 1.5vw, 1rem)',
          height: 'clamp(0.875rem, 1.5vw, 1rem)',
          
          '@media (min-width: 768px)': {
            width: '0.75rem',
            height: '0.75rem',
          },
          
          '@media (min-width: 1200px)': {
            width: '1rem',
            height: '1rem',
          },
        },
        
        // Compact text elements
        '.youtube-text-sm': {
          fontSize: theme('fontSize.fluid-xs'),
          lineHeight: '1.4',
          
          '@media (min-width: 768px)': {
            fontSize: theme('fontSize.xs[0]'),
          },
          
          '@media (min-width: 1200px)': {
            fontSize: theme('fontSize.fluid-sm'),
          },
        },
      });

      // YouTube-style utilities
      addUtilities({
        // Fluid text utilities
        '.text-fluid-xs': { fontSize: theme('fontSize.fluid-xs') },
        '.text-fluid-sm': { fontSize: theme('fontSize.fluid-sm') },
        '.text-fluid-base': { fontSize: theme('fontSize.fluid-base') },
        '.text-fluid-lg': { fontSize: theme('fontSize.fluid-lg') },
        '.text-fluid-xl': { fontSize: theme('fontSize.fluid-xl') },
        '.text-fluid-2xl': { fontSize: theme('fontSize.fluid-2xl') },
        '.text-fluid-3xl': { fontSize: theme('fontSize.fluid-3xl') },
        
        // Compact spacing
        '.space-youtube-y > * + *': {
          marginTop: 'clamp(0.75rem, 2vw, 1rem)',
          
          '@media (min-width: 768px)': {
            marginTop: '0.5rem', // Very tight spacing on tablets
          },
          
          '@media (min-width: 1200px)': {
            marginTop: theme('spacing.4'),
          },
        },
        
        // YouTube-like gap
        '.gap-youtube': {
          gap: 'clamp(0.75rem, 2vw, 1rem)',
          
          '@media (min-width: 768px)': {
            gap: '0.5rem',
          },
          
          '@media (min-width: 1200px)': {
            gap: theme('spacing.4'),
          },
        },
        
        // Compact margins for your scaled display
        '.mb-youtube': {
          marginBottom: 'clamp(0.75rem, 2vw, 1rem)',
          
          '@media (min-width: 768px)': {
            marginBottom: '0.5rem',
          },
          
          '@media (min-width: 1200px)': {
            marginBottom: theme('spacing.4'),
          },
        },
      });
    }
  ],
}