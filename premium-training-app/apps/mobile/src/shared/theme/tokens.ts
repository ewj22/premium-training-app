/**
 * Design tokens — the single source of truth for spacing, typography and
 * motion. Colors live in tailwind.config.js (consumed via className), but
 * anything that needs a raw JS value (Reanimated configs, inline style
 * fallbacks, chart libraries that don't take className) reads from here.
 *
 * Rule of thumb: if it can be a Tailwind className, use NativeWind.
 * Only reach for these tokens when a library needs a raw number/string.
 */

export const colors = {
  background: "#0A0A0B",
  backgroundElevated: "#151517",
  backgroundCard: "#1C1C1F",
  border: "#2A2A2E",
  borderSubtle: "#1F1F22",
  primary: "#0A84FF",
  accent: "#30D158",
  warning: "#FF9F0A",
  danger: "#FF453A",
  textPrimary: "#FFFFFF",
  textSecondary: "#98989F",
  textTertiary: "#636366",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  card: 20,
  pill: 999,
} as const;

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: "700" as const, lineHeight: 41 },
  title1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 34 },
  title2: { fontSize: 22, fontWeight: "600" as const, lineHeight: 28 },
  title3: { fontSize: 20, fontWeight: "600" as const, lineHeight: 25 },
  headline: { fontSize: 17, fontWeight: "600" as const, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: "400" as const, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: "400" as const, lineHeight: 21 },
  subhead: { fontSize: 15, fontWeight: "400" as const, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
} as const;

// Shared spring config for Reanimated — gives every transition (card press,
// sheet open, tab switch) the same "premium" feel instead of ad-hoc easing.
export const motion = {
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 0.9,
  },
  pressScale: 0.97,
  durationFast: 150,
  durationBase: 250,
} as const;
