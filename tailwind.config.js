/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette colori Legnosystem.bio - tema legno naturale
        primary: {
          50: '#f7f3f0',
          100: '#ede4dc',
          200: '#dbc8b8',
          300: '#c3a087',
          400: '#b08660',
          500: '#9d6b3e', // Marrone legno principale
          600: '#8a5a35',
          700: '#72492d',
          800: '#5e3e2a',
          900: '#4f3426',
        },
        accent: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bbe5cc',
          300: '#8dd2a8',
          400: '#5bb87d',
          500: '#369e5d', // Verde natura
          600: '#278048',
          700: '#21653b',
          800: '#1e5132',
          900: '#1a432a',
        },
        wood: {
          light: '#f5e6d3',
          medium: '#d4a574',
          dark: '#8b5a2b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 