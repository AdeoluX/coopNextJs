import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lemon: {
          50: "var(--color-lemon-50)",
          100: "var(--color-lemon-100)",
          200: "var(--color-lemon-200)",
          300: "var(--color-lemon-300)",
          400: "var(--color-lemon-400)",
          500: "var(--color-lemon-500)",
          600: "var(--color-lemon-600)",
          700: "var(--color-lemon-700)",
          800: "var(--color-lemon-800)",
          900: "var(--color-lemon-900)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
