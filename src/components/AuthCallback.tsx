import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params (Supabase may redirect with error)
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setErrorMessage(errorDescription || 'Authentication failed')
          return
        }

        // Get the session - Supabase will have set it from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session) {
          setStatus('success')
          // Redirect to dashboard after short delay to show success message
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 1500)
        } else {
          // No session yet, wait for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              setStatus('success')
              setTimeout(() => {
                navigate('/', { replace: true })
              }, 1500)
              subscription.unsubscribe()
            }
          })

          // Timeout after 10 seconds
          setTimeout(() => {
            subscription.unsubscribe()
            if (status === 'loading') {
              setStatus('error')
              setErrorMessage('Authentication timed out. Please try again.')
            }
          }, 10000)
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('error')
        setErrorMessage('An error occurred during authentication')
      }
    }

    handleCallback()
  }, [navigate, searchParams, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Completing sign in...
          </h1>
          <p className="text-gray-600">
            Please wait while we verify your authentication.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Return to home page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600">
          Authentication successful. Redirecting to your dashboard...
        </p>
      </div>
    </div>
  )
}
