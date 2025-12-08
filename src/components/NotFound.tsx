import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Heart, Home, ArrowLeft } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Heart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600">
            Oops! The page you're looking for doesn't exist.
            It might have been moved or deleted.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  )
}
