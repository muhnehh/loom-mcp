"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: "light" | "dark"
}>({ theme: "light", setTheme: () => {}, resolvedTheme: "light" })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = (localStorage.getItem("loom-theme") as Theme) || "light"
    setThemeState(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (t: "light" | "dark") => {
      if (t === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
      setResolvedTheme(t)
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      applyTheme(mq.matches ? "dark" : "light")
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? "dark" : "light")
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  const setTheme = (t: Theme) => {
    localStorage.setItem("loom-theme", t)
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
