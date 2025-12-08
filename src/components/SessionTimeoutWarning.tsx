import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Clock, RefreshCw, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Session warning thresholds (in milliseconds)
const WARNING_THRESHOLD = 5 * 60 * 1000 // Show warning 5 minutes before expiry
const CHECK_INTERVAL = 60 * 1000 // Check every minute

export function SessionTimeoutWarning() {
  const { user, signOut } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const checkSession = useCallback(async () => {
    if (!user) return

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Session expired
        toast.error('Your session has expired. Please sign in again.')
        await signOut()
        return
      }

      const expiresAt = session.expires_at
      if (expiresAt) {
        const expiresAtMs = expiresAt * 1000 // Convert to milliseconds
        const now = Date.now()
        const remaining = expiresAtMs - now

        if (remaining <= 0) {
          // Session expired
          toast.error('Your session has expired. Please sign in again.')
          await signOut()
        } else if (remaining <= WARNING_THRESHOLD) {
          // Show warning
          setTimeRemaining(remaining)
          setShowWarning(true)
        } else {
          setShowWarning(false)
          setTimeRemaining(null)
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }, [user, signOut])

  useEffect(() => {
    if (!user) return

    // Initial check
    checkSession()

    // Set up interval for periodic checks
    const intervalId = setInterval(checkSession, CHECK_INTERVAL)

    // Clean up
    return () => clearInterval(intervalId)
  }, [user, checkSession])

  // Update countdown timer when warning is shown
  useEffect(() => {
    if (!showWarning || timeRemaining === null) return

    const timerId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null
        const newTime = prev - 1000
        if (newTime <= 0) {
          clearInterval(timerId)
          signOut()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [showWarning, signOut, timeRemaining])

  const handleRefreshSession = async () => {
    setRefreshing(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) throw error

      if (data.session) {
        toast.success('Session extended successfully')
        setShowWarning(false)
        setTimeRemaining(null)
      }
    } catch {
      toast.error('Failed to extend session. Please sign in again.')
      await signOut()
    } finally {
      setRefreshing(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setShowWarning(false)
  }

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!showWarning) return null

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Session Expiring Soon
        </h2>

        <p className="text-gray-600 text-center mb-4">
          Your session will expire in{' '}
          <span className="font-bold text-yellow-600">
            {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : '...'}
          </span>
        </p>

        <p className="text-sm text-gray-500 text-center mb-6">
          Would you like to stay signed in? Any unsaved changes may be lost if your session expires.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSignOut}
            disabled={refreshing}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            onClick={handleRefreshSession}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Stay Signed In
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
