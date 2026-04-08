import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stadium Pulse component library design tokens (dark mode base)
        primary: "var(--color-primary)",
        "primary-dim": "var(--color-primary-dim)",
        "primary-fixed": "#ffd709",
        "primary-container": "#ffd709",
        "on-primary": "var(--color-on-primary)",
        "on-primary-fixed": "#453900",
        "on-primary-container": "#5b4b00",

        secondary: "var(--color-secondary)",
        "secondary-dim": "#6d9df7",
        "secondary-container": "#004ba0",
        "on-secondary": "#002453",
        "on-secondary-container": "#cddbff",

        tertiary: "var(--color-tertiary)",
        "tertiary-container": "#f82a39",
        "on-tertiary": "#490006",
        "on-tertiary-container": "#000000",

        error: "#ff7351",
        "error-container": "#b92902",

        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-dim": "var(--color-surface-dim)",
        "surface-bright": "var(--color-surface-bright)",
        "surface-variant": "var(--color-surface-variant)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container": "var(--color-surface-container)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "surface-tint": "var(--color-surface-tint)",
        "inverse-surface": "var(--color-inverse-surface)",

        outline: "var(--color-outline)",
        "outline-variant": "var(--color-outline-variant)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "inverse-primary": "#705e00",

        // Brand tokens (with light/dark variants)
        brand: {
          primary: "#FFD700",
          dark: "#0e0e13",
          surface: "#131318",
          border: "#19191f",
          muted: "#48474d",
          text: "#FFFFFF",
          light: "#F8F9FA",
          "surface-light": "#FFFFFF",
          "border-light": "#E5E7EB",
          "text-light": "#1A1A1A",
          "muted-light": "#6B7280",
        },

        // Legacy CSS-variable tokens (kept for backward compat with theme.css)
        bg: "var(--bg)",
        text: "var(--text)",

        // IPL team palettes
        mi: { primary: "#004B8D", secondary: "#D1AB3E", accent: "#FFFFFF" },
        csk: { primary: "#FFFF00", secondary: "#0081E9", accent: "#FDB913" },
        rcb: { primary: "#2B2A29", secondary: "#E03546", accent: "#CBA35C" },
        kkr: { primary: "#3A225D", secondary: "#B38235", accent: "#FFFFFF" },
        dc: { primary: "#00008B", secondary: "#EF1B23", accent: "#FFFFFF" },
        pbks: { primary: "#DA1735", secondary: "#D7D8DA", accent: "#FFFFFF" },
        rr: { primary: "#254AA5", secondary: "#EA1B85", accent: "#FFFFFF" },
        srh: { primary: "#F26522", secondary: "#000000", accent: "#FFD200" },
        gt: { primary: "#1B2133", secondary: "#BC9412", accent: "#FFFFFF" },
        lsg: { primary: "#0057E7", secondary: "#D1AB3E", accent: "#80C5FF" },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: {
        stadium: "2rem",
      },
      backgroundImage: {
        "stadium-gradient":
          "linear-gradient(180deg, rgba(14,14,19,0.8) 0%, rgba(14,14,19,1) 100%)",
        "gold-glow": "radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)",
        "stadium-mesh":
          "radial-gradient(circle at 2px 2px, rgba(255, 231, 146, 0.05) 1px, transparent 0)",
        "hero-glow":
          "radial-gradient(circle at 50% -20%, rgba(255, 215, 9, 0.15) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [forms, typography],
};
export default config;
