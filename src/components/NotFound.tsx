import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            404
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>

        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>

          <Link to="/">
            <Button className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
