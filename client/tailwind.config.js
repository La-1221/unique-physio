/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07120F',
        surface: '#0E1C17',
        surface2: '#122821',
        teal: {
          DEFAULT: '#14C792',
          deep: '#0B6E52',
          light: '#5EEFC3',
        },
        ink: '#F2F6F4',
        dim: '#9FB3AC',
        danger: '#E5484D',
        warn: '#E5A93D',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(20, 199, 146, 0.25)',
      },
      keyframes: {
        pulseLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseLine: 'pulseLine 2.4s ease-out forwards',
        floatUp: 'floatUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
