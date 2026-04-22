'use client';

import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(18, 21, 31, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: '#EAEAF0',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}
