import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useWeddingStore } from '@/stores/weddingStore'
import { WeddingForm } from '@/components/WeddingForm'
import { PhotoUpload } from '@/components/PhotoUpload'
import { PhotoGallery } from '@/components/PhotoGallery'
import { RSVPManager } from '@/components/RSVPManager'
import { RealtimeNotifications } from '@/components/RealtimeNotifications'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Calendar, MapPin, Users, DollarSign, Plus, Upload, X, Camera, Bot } from 'lucide-react'
import { format } from 'date-fns'

export function WeddingDashboard() {
  const { user } = useAuth()
  const { 
    weddings, 
    currentWedding, 
    events, 
    guests, 
    photos,
    rsvps,
    loading, 
    fetchWeddings, 
    setCurrentWedding, 
    fetchWeddingDetails,
    subscribeToWedding 
  } = useWeddingStore()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWeddings()
    }
  }, [user, fetchWeddings])

  useEffect(() => {
    if (currentWedding) {
      fetchWeddingDetails(currentWedding.id)
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToWedding(currentWedding.id)
      
      return () => {
        unsubscribe()
      }
    }
  }, [currentWedding, fetchWeddingDetails, subscribeToWedding])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="md" label="Loading wedding data" />
      </div>
    )
  }

  if (!currentWedding && !showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Wedding Planner
          </h1>
          <p className="text-gray-600 mb-8">
            {weddings.length > 0 
              ? "Select a wedding to manage or create a new one"
              : "Get started by creating your first wedding event"
            }
          </p>
          
          {weddings.length > 0 && (
            <div className="grid gap-4 mb-8">
              {weddings.map((wedding) => (
                <div
                  key={wedding.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCurrentWedding(wedding)}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {wedding.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(wedding.date), 'MMMM d, yyyy')}
                    </div>
                    {wedding.venue_name && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {wedding.venue_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button onClick={() => setShowCreateForm(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create New Wedding
          </Button>
        </div>
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create Your Wedding
          </h2>
          <WeddingForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    )
  }

  // Guard clause - should not reach here without currentWedding
  if (!currentWedding) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Real-time notifications */}
      <RealtimeNotifications weddingId={currentWedding.id} />
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentWedding.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentWedding.description}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentWedding(null)}
          >
            Back to Weddings
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            {format(new Date(currentWedding.date), 'MMMM d, yyyy')}
          </div>
          {currentWedding.venue_name && (
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2" />
              {currentWedding.venue_name}
            </div>
          )}
          {currentWedding.budget && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-5 w-5 mr-2" />
              ${currentWedding.budget.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Events</p>
              <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Guests</p>
              <p className="text-2xl font-semibold text-gray-900">{guests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">RSVPs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rsvps.filter(r => r.status === 'confirmed').length}/{rsvps.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Camera className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Photos</p>
              <p className="text-2xl font-semibold text-gray-900">{photos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            Add Event
          </Button>
          <Button variant="outline" className="justify-start">
            <Users className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => setShowPhotoUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
          <Button variant="outline" className="justify-start">
            <Bot className="h-4 w-4 mr-2" />
            AI Analysis
          </Button>
        </div>
      </div>

      {/* RSVP Management */}
      <RSVPManager 
        wedding={currentWedding} 
        events={events} 
        onUpdate={() => fetchWeddingDetails(currentWedding.id)}
      />

      {/* Photo Gallery Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Photo Gallery ({photos.length})
          </h2>
          <Button onClick={() => setShowPhotoUpload(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Photos
          </Button>
        </div>
        <PhotoGallery photos={photos} weddingId={currentWedding.id} />
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Upload Photos</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowPhotoUpload(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <PhotoUpload
                weddingId={currentWedding.id}
                onUploadComplete={() => {
                  setShowPhotoUpload(false)
                  fetchWeddingDetails(currentWedding.id)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}