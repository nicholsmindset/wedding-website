import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Camera, User, Mail } from 'lucide-react'

interface RealtimeNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
  icon: 'camera' | 'user' | 'mail'
}

interface RealtimeNotificationsProps {
  weddingId: string
}

export function RealtimeNotifications({ weddingId }: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])

  useEffect(() => {
    if (!weddingId) return

    // Subscribe to photos
    const photosChannel = supabase
      .channel(`photos-notifications:${weddingId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos', filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          const notification: RealtimeNotification = {
            id: `photo-${payload.new.id}`,
            title: 'New Photo Uploaded',
            message: `A new photo "${payload.new.original_filename}" was uploaded`,
            type: 'info',
            icon: 'camera'
          }
          
          setNotifications(prev => [notification, ...prev])
          toast.success(notification.message, {
            icon: <Camera className="h-4 w-4" />
          })
        }
      )
      .subscribe()

    // Subscribe to guests
    const guestsChannel = supabase
      .channel(`guests-notifications:${weddingId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'guests', filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          const notification: RealtimeNotification = {
            id: `guest-${payload.new.id}`,
            title: 'New Guest Added',
            message: `${payload.new.name} was added to the guest list`,
            type: 'success',
            icon: 'user'
          }
          
          setNotifications(prev => [notification, ...prev])
          toast.success(notification.message, {
            icon: <User className="h-4 w-4" />
          })
        }
      )
      .subscribe()

    // Subscribe to RSVPs
    const rsvpsChannel = supabase
      .channel(`rsvps-notifications:${weddingId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rsvps', filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          const status = payload.new.status
          const isConfirmed = status === 'confirmed'
          
          const notification: RealtimeNotification = {
            id: `rsvp-${payload.new.id}`,
            title: 'RSVP Update',
            message: `A guest has ${isConfirmed ? 'confirmed' : 'declined'} their attendance`,
            type: isConfirmed ? 'success' : 'warning',
            icon: 'mail'
          }
          
          setNotifications(prev => [notification, ...prev])
          toast.success(notification.message, {
            icon: <Mail className="h-4 w-4" />
          })
        }
      )
      .subscribe()

    return () => {
      photosChannel.unsubscribe()
      guestsChannel.unsubscribe()
      rsvpsChannel.unsubscribe()
    }
  }, [weddingId])

  if (notifications.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          role="status"
          className={`bg-white rounded-lg shadow-lg border p-4 flex items-start space-x-3 ${
            notification.type === 'success' ? 'border-green-200' :
            notification.type === 'warning' ? 'border-yellow-200' :
            'border-blue-200'
          }`}
        >
          <div className={`p-2 rounded-full ${
            notification.type === 'success' ? 'bg-green-100 text-green-600' :
            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {notification.icon === 'camera' && <Camera className="h-4 w-4" />}
            {notification.icon === 'user' && <User className="h-4 w-4" />}
            {notification.icon === 'mail' && <Mail className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <p className="text-sm text-gray-600">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}