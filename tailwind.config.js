/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fiscal Forest — user palette
        forest: {
          1000: '#001400',
          950: '#002200',
          900: '#003300',
          800: '#004d00',
          700: '#006600',
          600: '#008000',
        },
        green: {
          500: '#009900',
        },
        mint: {
          400: '#66cc66',
          200: '#99e699',
          100: '#ccffcc',
        },
        ivory: {
          DEFAULT: '#FAF7EF',
          dim: '#F1EEE2',
        },
        ink: {
          DEFAULT: '#0B1A0B',
          soft: '#33473A',
        },
        fog: '#A8BFA9',
        // shadcn tokens (kept for ui/* components)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3.5rem, 8vw, 7.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-l': ['clamp(2.8rem, 5.6vw, 5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'h2': ['clamp(2rem, 3.6vw, 3.4rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'h3': ['clamp(1.3rem, 2vw, 1.8rem)', { lineHeight: '1.2' }],
        'lede': ['clamp(1.1rem, 1.5vw, 1.35rem)', { lineHeight: '1.65' }],
        'stat': ['clamp(2.2rem, 4vw, 4rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        eyebrow: '0.28em',
        nav: '0.22em',
        button: '0.14em',
        wordmark: '0.3em',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      maxWidth: {
        container: '1280px',
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        float: '0 24px 80px rgba(0,20,0,0.35)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        },
        'scroll-dot': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '80%': { transform: 'translateY(42px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'glow-breathe': {
          '0%, 100%': { opacity: '0.05' },
          '50%': { opacity: '0.09' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        'ken-burns': 'ken-burns 20s ease-in-out infinite alternate',
        'scroll-dot': 'scroll-dot 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        marquee: 'marquee 50s linear infinite',
        'glow-breathe': 'glow-breathe 6s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
