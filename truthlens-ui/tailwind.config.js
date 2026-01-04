/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                charcoal: '#121316',
                navy: '#071430',
                accentCyan: '#00E5FF',
                accentLime: '#CCFF00',
                accentMagenta: '#FF2D95',
                surface: 'rgba(255, 255, 255, 0.04)',
                mutedText: '#9AA3B2',
            },
            fontFamily: {
                sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            letterSpacing: {
                'smooch': '0.15em',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
