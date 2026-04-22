import type { Metadata, Viewport } from 'next';
import { serif, sans, mono } from './fonts';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CODEAURA — Watch Your Code Become Cinema',
  description: 'CODEAURA turns any code in any language into a narrated 3D cinematic execution. Paste. Watch. Understand.',
  keywords: ['code visualizer', 'code animation', '3D code', 'AI code explainer', 'execution visualizer'],
  openGraph: {
    title: 'CODEAURA — Watch Your Code Become Cinema',
    description: 'Your code is a film. CODEAURA is the cinema.',
    type: 'website',
    url: 'https://codeaurafinal.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CODEAURA',
    description: 'Your code is a film. CODEAURA is the cinema.',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-aura-void text-aura-ink-primary antialiased overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
