import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3'
}

export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'animate-spin rounded-full border-b-transparent',
        sizeClasses[size],
        'border-blue-600',
        className
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface SpinnerContainerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullScreen?: boolean
}

export function SpinnerContainer({ size = 'md', label, fullScreen = false }: SpinnerContainerProps) {
  return (
    <div className={cn(
      'flex items-center justify-center',
      fullScreen ? 'min-h-screen' : 'py-12'
    )}>
      <Spinner size={size} label={label} />
    </div>
  )
}
