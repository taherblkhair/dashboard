/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'Arial', 'sans-serif'],
      },

      colors: {
        // ربط ألوان المشروع بمتغيرات CSS
        text: "var(--color-text)",
        heading: "var(--color-heading)",
        bg: "var(--color-background)",
        "bg-soft": "var(--color-background-soft)",
        "bg-mute": "var(--color-background-mute)",
      },
    },
  },
  plugins: [],
}
