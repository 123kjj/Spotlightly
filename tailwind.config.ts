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
        lavender: {
          DEFAULT: '#c4b5fd',
          light: '#ede9fe',
          deep: '#7c3aed',
        },
        blush: {
          DEFAULT: '#fbcfe8',
          deep: '#ec4899',
        },
        'baby-blue': {
          DEFAULT: '#bae6fd',
          deep: '#0ea5e9',
        },
        cream: '#fefce8',
        'soft-gold': '#fbbf24',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'sparkle': 'sparkle-spin 4s linear infinite',
        'rise-in': 'rise-in 0.6s ease forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
