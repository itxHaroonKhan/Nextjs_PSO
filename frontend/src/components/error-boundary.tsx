"use client"

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // If it's a ChunkLoadError, we want to handle it
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return { hasError: true };
    }
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Auto-reload on ChunkLoadError
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.log("ChunkLoadError detected, reloading page...");
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">The application encountered an error. We're attempting to fix it...</p>
          <button
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
