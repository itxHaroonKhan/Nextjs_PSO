"use client"

import * as React from "react"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { isLoading } = useAuth()

  // This page acts as a fallback/landing. 
  // All redirect logic is now moved to AuthProvider for consistency.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="flex flex-col items-center gap-4">
        {isLoading ? (
          <>
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Initializing...</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        )}
      </div>
    </div>
  )
}
