/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-switzer)'],
        serif: ['var(--font-sentient)'],
      },
      colors: {
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pop-in": {
          "0%": { 
            transform: "scale(0.95)", 
            opacity: 0 
          },
          "50%": { 
            transform: "scale(1.02)", 
            opacity: 0.5 
          },
          "100%": { 
            transform: "scale(1)", 
            opacity: 1 
          }
        },
        "slide-in-from-top": {
          "0%": {
            transform: "translateY(-10px)",
            opacity: 0
          },
          "100%": {
            transform: "translateY(0)",
            opacity: 1
          }
        },
        "slide-in-from-bottom": {
          "0%": {
            transform: "translateY(10px)",
            opacity: 0
          },
          "100%": {
            transform: "translateY(0)",
            opacity: 1
          }
        },
        "float-away": {
          "0%": {
            transform: "translateY(0) scale(1)",
            opacity: 1
          },
          "50%": {
            transform: "translateY(-20px) scale(1.02)",
            opacity: 0.7
          },
          "100%": {
            transform: "translateY(-40px) scale(1.05)",
            opacity: 0
          }
        },
        "slide-up-and-fade": {
          "0%": {
            transform: "translateY(0)",
            opacity: 1
          },
          "100%": {
            transform: "translateY(-30px)",
            opacity: 0
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pop-in": "pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pop-in-delay-1": "pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards",
        "pop-in-delay-2": "pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
        "pop-in-delay-3": "pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards",
        "in": "fade-in 0.2s ease-in-out",
        "out": "fade-out 0.2s ease-in-out",
        "slide-in-from-top": "slide-in-from-top 0.15s ease-in-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.15s ease-in-out"
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addUtilities }) {
      addUtilities({
        ".animate-in": {
          animationDuration: "0.2s",
          animationFillMode: "forwards",
          animationTimingFunction: "ease-in-out"
        },
        ".slide-in-from-top-2": {
          animationName: "slide-in-from-top"
        }
      });
    }
  ],
}

