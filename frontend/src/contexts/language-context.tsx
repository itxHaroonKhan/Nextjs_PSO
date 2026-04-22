"use client"

import * as React from "react"
import { translations, TranslationKeys } from "@/lib/translations"

type Language = 'en' | 'ur'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof TranslationKeys) => string
  isRTL: boolean
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>('en')

  const t = React.useCallback(
    (key: keyof TranslationKeys) => {
      return translations[language][key] || key
    },
    [language]
  )

  const isRTL = language === 'ur'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
