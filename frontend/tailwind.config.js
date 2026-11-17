/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          lavender: '#E8DDF8',
          purple: '#A78BFA',
          'purple-dark': '#8B5CF6',
          pink: '#F8D7E8',
          'pink-dark': '#F472B6',
          mint: '#C8F0DE',
          'mint-dark': '#10B981',
          blue: '#D7E9FA',
          'blue-dark': '#60A5FA',
          peach: '#FFE0CB',
          'peach-dark': '#FB923C',
          cream: '#FFF9F4',
          surface: '#FFFFFF',
          dark: '#282044',
          muted: '#6B6280',
          border: '#EAE4F5'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 10px 30px -5px rgba(167, 139, 250, 0.08), 0 0 1px 1px rgba(255, 255, 255, 0.9) inset',
        'card': '0 12px 32px -4px rgba(40, 32, 68, 0.05), 0 4px 12px -2px rgba(40, 32, 68, 0.02)',
        'floating': '0 20px 40px -10px rgba(167, 139, 250, 0.25)',
        'glow-purple': '0 0 25px rgba(167, 139, 250, 0.35)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      }
    },
  },
  plugins: [],
}
