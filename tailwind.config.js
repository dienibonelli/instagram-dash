/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'white': '#FFFFFF',
      'black': '#000000',
      'gray': {
        '400': '#9ca3af',
        '500': '#6b7280',
      },
      'brand': {
        'bg': '#1B1B2F',
        'card': '#252540',
        'success': '#10B981',
        'alert': '#EF4444',
      },
      'purple': {
        '400': '#c084fc',
        '500': '#a855f7',
      },
      'pink': {
        '400': '#f472b6',
        '500': '#ec4899',
      },
      'green': {
        '500': '#10b981',
      },
      'yellow': {
        '400': '#facc15',
        '500': '#eab308',
      },
      'red': {
        '400': '#f87171',
        '500': '#ef4444',
      },
      'blue': {
        '400': '#60a5fa',
        '500': '#3b82f6',
      },
    },
    fontFamily: {
      sans: ["Inter", "Roboto", "Montserrat", "sans-serif"],
    }
  },
  plugins: [],
}
