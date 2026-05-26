/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: '#050505',
        elevation: {
          1: '#0F0F11',
          2: '#161619',
        },
        borderSubtle: '#1F1F24',
        accentSignal: '#E24A00',
      },
      borderRadius: {
        'sm': '2px',
        'md': '4px',
      },
      fontFamily: {
        editorial: ['Playfair Display', 'serif'],
        sans: ['Geist Sans', 'SF Pro', 'sans-serif'],
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
