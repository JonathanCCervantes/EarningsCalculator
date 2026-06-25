/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Primary brand: deep violet-indigo
        brand: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#a3a3ff',
          400: '#7c7cfe',
          500: '#5b5bfc',
          600: '#4040ef',
          700: '#3030d4',
          800: '#2525a8',
          900: '#1e1e80',
        },
        // Dark surface tokens
        dark: {
          base: '#0f0f13',
          surface: '#18181f',
          card: '#1e1e28',
          border: '#2a2a38',
          muted: '#3a3a4a',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
