import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#101C2C",
          dark: "#0B1420",
          light: "#1A2B42",
        },
        teal: {
          DEFAULT: "#176B67",
          dark: "#11524F",
          light: "#218F8A",
        },
        mint: {
          DEFAULT: "#DDF2EC",
          light: "#EDFAF6",
          dark: "#BFE4D9",
        },
        canvas: {
          DEFAULT: "#F7F8F6",
          dark: "#EFEFEA",
        },
        slate: {
          DEFAULT: "#687586",
          light: "#9AA4B2",
          dark: "#4B5565",
        },
        rose: {
          DEFAULT: "#D6336C",
          dark: "#B02353",
          light: "#FCE8EF",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
