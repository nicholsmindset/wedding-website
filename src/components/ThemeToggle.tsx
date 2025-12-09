import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/Button'

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${theme} mode`}
      className="p-2"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </Button>
  )
}
