"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Detect theme on client-side mount
    const savedTheme = localStorage.getItem("theme") as Theme | null
    let initialTheme: Theme = "light"
    
    if (savedTheme) {
      initialTheme = savedTheme
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      initialTheme = "dark"
    }
    
    setThemeState(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
    setIsInitialized(true)

    // Listen to system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "light"
        setThemeState(newTheme)
        document.documentElement.classList.toggle("dark", e.matches)
      }
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    return { theme: "light" as Theme, toggleTheme: () => {}, setTheme: () => {} }
  }
  return context
}
