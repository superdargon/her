import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { themes, defaultThemeId, type Theme } from './themes'

interface ThemeContextValue {
  theme: Theme
  setThemeId: (id: string) => void
}

const fallbackTheme = themes.find(t => t.id === defaultThemeId)!

const ThemeContext = createContext<ThemeContextValue>({
  theme: fallbackTheme,
  setThemeId: () => {},
})

function applyTheme(t: Theme) {
  const root = document.documentElement
  const c = t.colors
  root.style.setProperty('--color-primary', c.primary)
  root.style.setProperty('--color-primary-hover', c.primaryHover)
  root.style.setProperty('--color-primary-subtle', c.primarySubtle)
  root.style.setProperty('--color-bg', c.bg)
  root.style.setProperty('--color-surface', c.surface)
  root.style.setProperty('--color-surface-hover', c.surfaceHover)
  root.style.setProperty('--color-text', c.text)
  root.style.setProperty('--color-text-secondary', c.textSecondary)
  root.style.setProperty('--color-border', c.border)
  root.style.setProperty('--color-success', c.success)
  root.style.setProperty('--color-success-subtle', c.successSubtle)
  root.style.setProperty('--color-warning', c.warning)
  root.style.setProperty('--color-warning-subtle', c.warningSubtle)
  root.style.setProperty('--color-danger', c.danger)
  root.style.setProperty('--color-danger-hover', c.dangerHover)
  root.style.setProperty('--color-danger-subtle', c.dangerSubtle)
  root.style.setProperty('--color-link', c.link)
  root.style.setProperty('--shadow-card', c.shadow)
  root.style.setProperty('--color-nav-bg', c.navBg)
  root.style.setProperty('--color-nav-border', c.navBorder)
  root.style.setProperty('--color-skeleton', c.skeleton)
  root.style.setProperty('--color-bubble-out', c.bubbleOut)
  root.style.setProperty('--color-bubble-in', c.bubbleIn)
  root.style.setProperty('--radius-card', t.radii.card)
  root.style.setProperty('--radius-btn', t.radii.btn)
  root.style.setProperty('--radius-input', t.radii.input)
  root.style.setProperty('--radius-avatar', t.radii.avatar)
  root.style.setProperty('--font-family', t.fonts.family)
}

function getSavedThemeId(): string {
  try {
    const saved = localStorage.getItem('her-theme')
    if (saved && themes.find(t => t.id === saved)) return saved
    localStorage.setItem('her-theme', defaultThemeId)
  } catch {}
  return defaultThemeId
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(getSavedThemeId)
  const theme = themes.find(t => t.id === themeId)!

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const changeTheme = (id: string) => {
    setThemeId(id)
    try { localStorage.setItem('her-theme', id) } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeId: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
