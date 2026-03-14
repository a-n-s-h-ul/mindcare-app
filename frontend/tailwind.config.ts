
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
                // Soft, calming palette
                background: "#F8FAFC", // slate-50
                surface: "#FFFFFF",
                primary: {
                    DEFAULT: "#6366F1", // Indigo-500 - Calmer than pure blue
                    hover: "#4F46E5",
                    soft: "#E0E7FF",
                },
                text: {
                    primary: "#1E293B", // slate-800
                    secondary: "#64748B", // slate-500
                    muted: "#94A3B8", // slate-400
                },
                // Semantic wellness colors
                wellness: {
                    green: "#10B981", // Emerald
                    yellow: "#F59E0B", // Amber
                    orange: "#F97316", // Orange
                    red: "#EF4444", // Red
                }
            },
            fontFamily: {
                sans: ['var(--font-outfit)', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
