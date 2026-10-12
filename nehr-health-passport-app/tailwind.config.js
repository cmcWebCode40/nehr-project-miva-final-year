/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Verbatim from nehr-web-portal/src/app/globals.css `@theme` block —
      // the same brand palette, ported so the patient app matches the
      // reference implementation's design system rather than inventing
      // its own. Only the families the patient module actually uses.
      colors: {
        brand: {
          gray: {
            100: "#F9FBFC",
            200: "#F3F5F6",
            250: "#E2E8F0",
            300: "#E1E6ED",
            400: "#C8D2DF",
            500: "#AAB7C6",
            600: "#848F9F",
            650: "#64748B",
            675: "#6B7280",
            700: "#5F738C",
            800: "#4E5A6C",
            820: "#4B5563",
            850: "#45556C",
            900: "#353F50",
            950: "#1F2126",
          },
          primary: {
            DEFAULT: "#0275D8",
            25: "#F7FAFC",
            50: "#EBF8FE",
            70: "#DBEAFE",
            100: "#B0E9F5",
            200: "#94C2E9",
            500: "#0275D8",
            550: "#096DD9",
            600: "#025EAD",
            650: "#0056A6",
            700: "#0F172A",
            800: "#002B4B",
          },
          green: {
            25: "#FBFFFB",
            50: "#F0FDF4",
            100: "#F1FEF1",
            200: "#BEF2B9",
            300: "#D0FAE5",
            500: "#00A63E",
            520: "#00C950",
            550: "#009966",
            600: "#163C29",
            700: "#36743D",
          },
          amber: {
            DEFAULT: "#AF5F26",
            25: "#FFFBEB",
            50: "#FFF7ED",
            75: "#FFE9A8",
            100: "#FEF6CF",
            200: "#FFB900",
            500: "#AF5F26",
            600: "#F54900",
            700: "#973C00",
          },
          red: {
            50: "#FBE9E9",
            100: "#F8D7DA",
            200: "#F5C2C7",
            300: "#F4B7B5",
            500: "#EE312A",
            510: "#FB2C36",
            550: "#DC4437",
            600: "#8B1A1A",
            700: "#A4251A",
          },
        },
        // Semantic tokens, mapped to the brand palette above (light theme
        // only — no dark mode in this pass, matching the rest of the
        // patient-app scope).
        background: "#FFFFFF",
        foreground: "#1F2126",
        card: "#FFFFFF",
        "card-foreground": "#1F2126",
        primary: "#0275D8",
        "primary-foreground": "#FFFFFF",
        secondary: "#F3F5F6",
        "secondary-foreground": "#353F50",
        muted: "#F3F5F6",
        "muted-foreground": "#5F738C",
        accent: "#EBF8FE",
        "accent-foreground": "#002B4B",
        destructive: "#EE312A",
        border: "#E1E6ED",
        input: "#E1E6ED",
        ring: "#0275D8",
      },
      borderRadius: {
        // Uniform 4px, matching the web portal's `--radius: 0.25rem` brief.
        DEFAULT: 4,
        sm: 3,
        md: 4,
        lg: 4,
        xl: 6,
      },
      fontFamily: {
        // Each Averta weight loads as its own distinct font family name
        // (see src/theme/fonts.ts) — React Native ignores `font-weight`
        // for custom fonts, so bolding text means switching the family,
        // not applying a weight utility. Use `font-sans-bold` etc.,
        // never `font-bold` with these.
        sans: ["Averta-Regular"],
        "sans-thin": ["Averta-Thin"],
        "sans-extrathin": ["Averta-Extrathin"],
        "sans-light": ["Averta-Light"],
        "sans-semibold": ["Averta-Semibold"],
        "sans-bold": ["Averta-Bold"],
        "sans-extrabold": ["Averta-ExtraBold"],
        "sans-black": ["Averta-Black"],
      },
    },
  },
  plugins: [],
};
