import { Button } from '@/components/ui/Button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHomeLink?: boolean
  retrying?: boolean
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this content. Please try again.',
  onRetry,
  showHomeLink = false,
  retrying = false
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 text-center max-w-md mb-6">
        {message}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={retrying}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
          >
            {retrying ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {retrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}

        {showHomeLink && (
          <Link to="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
