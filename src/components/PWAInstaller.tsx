import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Download, RefreshCw, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setRegistration(registration)
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
                toast.success('App update available! Click to refresh.', {
                  action: {
                    label: 'Update',
                    onClick: () => window.location.reload()
                  }
                })
              }
            })
          }
        })
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      toast.success('App installed successfully!')
    } else {
      toast.info('App installation cancelled')
    }

    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  const handleUpdateClick = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  if (!showInstallButton && !updateAvailable) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Install Button */}
      {showInstallButton && (
        <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Install Wedding App</h3>
              <p className="text-sm text-gray-600">Add this app to your home screen for easy access</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleInstallClick} size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowInstallButton(false)}
            >
              Later
            </Button>
          </div>
        </div>
      )}

      {/* Update Button */}
      {updateAvailable && (
        <div className="bg-white rounded-lg shadow-lg border p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Update Available</h3>
              <p className="text-sm text-gray-600">A new version of the app is available</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={handleUpdateClick} size="sm" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className={`bg-white rounded-lg shadow-lg border p-3 flex items-center space-x-2 ${
        isOnline ? 'border-green-200' : 'border-red-200'
      }`}>
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <span className={`text-sm font-medium ${
          isOnline ? 'text-green-700' : 'text-red-700'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  )
}