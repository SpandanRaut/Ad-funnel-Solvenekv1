import type { Config } from "tailwindcss";
export default {
  content: ["./components/**/*.vue", "./pages/**/*.vue", "./app.vue"],
  theme: {
    extend: {
      colors: {
        navy: "rgb(var(--navy) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["Libre Caslon Text", "Georgia", "serif"],
      },
      borderRadius: { card: "14px" },
      boxShadow: { card: "0 4px 24px rgb(10 15 31 / .04)" },
      transitionTimingFunction: { premium: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
} satisfies Config;
