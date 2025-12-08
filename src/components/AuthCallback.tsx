import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Heart, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type AuthState = 'loading' | 'success' | 'error'

export function AuthCallback() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase magic link)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setErrorMessage(error.message || 'Authentication failed')
          setAuthState('error')
          return
        }

        if (data.session) {
          setAuthState('success')
          // Redirect to dashboard after brief success message
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 1500)
        } else {
          // No session yet, wait for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === 'SIGNED_IN' && session) {
                setAuthState('success')
                setTimeout(() => {
                  navigate('/', { replace: true })
                }, 1500)
                subscription.unsubscribe()
              } else if (event === 'SIGNED_OUT') {
                setErrorMessage('Authentication session expired')
                setAuthState('error')
                subscription.unsubscribe()
              }
            }
          )

          // Timeout after 10 seconds
          setTimeout(() => {
            if (authState === 'loading') {
              setErrorMessage('Authentication timed out. Please try again.')
              setAuthState('error')
              subscription.unsubscribe()
            }
          }, 10000)
        }
      } catch (err) {
        console.error('Auth callback exception:', err)
        setErrorMessage('An unexpected error occurred')
        setAuthState('error')
      }
    }

    handleAuthCallback()
  }, [navigate, authState])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Heart className="h-12 w-12 text-pink-500 mx-auto mb-6" />

        {authState === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying your login...
            </h1>
            <p className="text-gray-600">
              Please wait while we authenticate your session.
            </p>
          </>
        )}

        {authState === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600">
              Authentication successful. Redirecting to your dashboard...
            </p>
          </>
        )}

        {authState === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'Unable to complete authentication.'}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/', { replace: true })}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
              >
                Try Again
              </Button>
              <p className="text-sm text-gray-500">
                Magic links expire after 1 hour. Request a new one if needed.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
