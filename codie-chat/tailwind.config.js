/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
      colors: {
        'primary': '#1a1a2e',
        'secondary': '#16213e',
        'accent': '#00d4ff',
        'success': '#00e676',
        'warning': '#ffb800',
        'danger': '#ff3b6d',
        'light': '#f3f4f6',
        'dark': '#0f0f0f',
      },
      boxShadow: {
        'sm': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'md': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'lg': '0 12px 48px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}