/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Apple-inspired dark-first palette. Every screen references these
        // tokens rather than hardcoded hex values.
        background: {
          DEFAULT: "#0A0A0B",
          elevated: "#151517",
          card: "#1C1C1F",
        },
        border: {
          DEFAULT: "#2A2A2E",
          subtle: "#1F1F22",
        },
        primary: {
          DEFAULT: "#0A84FF", // Apple system blue (dark mode)
          muted: "#0A84FF33",
        },
        accent: {
          DEFAULT: "#30D158", // system green — used for PBs, success states
        },
        warning: "#FF9F0A",
        danger: "#FF453A",
        text: {
          primary: "#FFFFFF",
          secondary: "#98989F",
          tertiary: "#636366",
        },
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
