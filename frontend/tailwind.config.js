/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        bengali: ['"Hind Siliguri"', 'sans-serif'],
      },
      colors: {
        college: {
          50:  '#f0f7ff',
          100: '#dbeeff',
          200: '#b5d8ff',
          300: '#7bb8ff',
          400: '#3d8fff',
          500: '#0f66e8',
          600: '#0050c8',
          700: '#003fa0',
          800: '#003080',
          900: '#001f55',
          950: '#001035',
        },
        gold: {
          400: '#f5c542',
          500: '#e8a900',
          600: '#c48800',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-right': 'slideRight 0.5s ease-out forwards',
        'ticker': 'ticker 20s linear infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        ticker: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(-100%)' } },
      }
    }
  },
  plugins: []
}
