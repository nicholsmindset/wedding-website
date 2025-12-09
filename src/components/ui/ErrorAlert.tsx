import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ErrorAlertProps {
  message: string
  title?: string
  onRetry?: () => void
  className?: string
}

export function ErrorAlert({
  message,
  title = 'Error',
  onRetry,
  className
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'bg-red-50 border border-red-200 rounded-lg p-4',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-red-800 font-medium">{title}</h4>
          <p className="text-red-600 text-sm mt-1">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
