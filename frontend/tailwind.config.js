/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#1f2937',
        background: '#ffffff',
        foreground: '#0f172a',
        primary: { DEFAULT: '#0f172a', foreground: '#ffffff' },
        secondary: { DEFAULT: '#f1f5f9', foreground: '#0f172a' },
        muted: { DEFAULT: '#f8fafc', foreground: '#64748b' },
        accent: { DEFAULT: '#f1f5f9', foreground: '#0f172a' },
        destructive: { DEFAULT: '#ef4444', foreground: '#ffffff' },
        success: { DEFAULT: '#22c55e', foreground: '#ffffff' },
      }
    },
  },
  plugins: [],
}
