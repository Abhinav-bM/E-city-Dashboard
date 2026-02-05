/** @type {import('tailwindcss').Config} */

const tailwindConfig = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2b8cee", // Electric Blue
        "primary-dark": "#1a6bb5",
        "background-light": "#f6f7f8",
        "background-dark": "#101922", // Deep dark blue-black
        "surface-dark": "#1c2732", // Slightly lighter for cards
        "surface-border": "#233648",
        "text-secondary": "#92adc9",
        "border-dark": "#2d3f50",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
