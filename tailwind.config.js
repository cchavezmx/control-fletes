/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './Components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './utils/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif']
      },
      colors: {
        intecsa: {
          primary: '#3f51b5',
          dark: '#461e59',
          orange: '#FF8C00'
        },
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#94a3b8',
        background: '#ffffff',
        foreground: '#020617',
        primary: {
          DEFAULT: '#3f51b5',
          foreground: '#f8fafc'
        },
        secondary: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#f8fafc'
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b'
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a'
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#020617'
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#020617'
        }
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
