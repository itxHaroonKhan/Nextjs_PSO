"use client"

import * as React from "react"
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthProvider } from '@/contexts/auth-context'
import { LanguageProvider } from '@/contexts/language-context'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const handleChunkError = (event: ErrorEvent) => {
      if (event.error?.name === 'ChunkLoadError' || event.message?.includes('Loading chunk')) {
        console.warn('ChunkLoadError detected in window listener, reloading...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          {children}
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
