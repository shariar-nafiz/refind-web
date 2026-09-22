import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/useThemeStore'

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useThemeStore()

  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      className="rounded-full"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="size-5 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="size-5 text-slate-700 transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
