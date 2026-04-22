import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(72px, 10vw, 180px)', { lineHeight: '0.9', fontWeight: '400' }],
        'display': ['clamp(48px, 6vw, 96px)', { lineHeight: '0.95', fontWeight: '400' }],
        'title': ['clamp(32px, 3.5vw, 56px)', { lineHeight: '1.05', fontWeight: '400' }],
        'heading': ['28px', { lineHeight: '1.15', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['15px', { lineHeight: '1.65', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.18em' }],
        'code': ['14px', { lineHeight: '1.55', fontWeight: '400' }],
      },
      colors: {
        aura: {
          void: '#000000',
          obsidian: '#05060A',
          carbon: '#0B0D13',
          graphite: '#12151F',
          smoke: '#1C2030',
          plasma: '#7C5CFF',
          'plasma-glow': '#A88BFF',
          aurora: '#4FE3C1',
          ember: '#FF6B4A',
          solar: '#FFB547',
          nebula: '#FF3DCB',
          'ink-pure': '#FFFFFF',
          'ink-primary': '#EAEAF0',
          'ink-secondary': '#9BA0B3',
          'ink-tertiary': '#5A5F75',
          'ink-ghost': '#2E3244',
        },
      },
      backgroundImage: {
        'grad-plasma': 'linear-gradient(135deg, #7C5CFF 0%, #FF3DCB 100%)',
        'grad-aurora': 'linear-gradient(135deg, #4FE3C1 0%, #7C5CFF 100%)',
        'grad-void': 'radial-gradient(ellipse at top, #12151F 0%, #000000 70%)',
      },
      borderRadius: {
        'glass': '20px',
      },
      animation: {
        'plasma-pulse': 'plasma-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scramble': 'scramble 0.3s steps(1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'plasma-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      transitionTimingFunction: {
        'aura': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
        '1600': '1600ms',
      },
      backdropBlur: {
        'glass': '24px',
      },
      boxShadow: {
        'glass': '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.04)',
        'plasma': '0 0 40px rgba(124, 92, 255, 0.4)',
        'aurora': '0 0 40px rgba(79, 227, 193, 0.4)',
        'ember': '0 0 40px rgba(255, 107, 74, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
