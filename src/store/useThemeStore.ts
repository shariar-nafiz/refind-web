import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const applyThemeToDOM = (theme: Theme): 'light' | 'dark' => {
  const root = document.documentElement
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme

  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  return resolved
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('refind-theme') as Theme | null
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved
  }
  return 'system'
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialTheme = getInitialTheme()
  const initialResolved = typeof window !== 'undefined' ? applyThemeToDOM(initialTheme) : 'light'

  // Listen to system theme changes if set to system
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      set((state) => {
        if (state.theme === 'system') {
          const resolved = applyThemeToDOM('system')
          return { resolvedTheme: resolved }
        }
        return state
      })
    })
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,
    setTheme: (theme: Theme) => {
      localStorage.setItem('refind-theme', theme)
      const resolved = applyThemeToDOM(theme)
      set({ theme, resolvedTheme: resolved })
    },
  }
})
