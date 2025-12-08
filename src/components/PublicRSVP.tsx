import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { RSVPForm } from '@/components/RSVPForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, MapPin, Heart, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface WeddingEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time?: string
  location: string
}

interface Wedding {
  id: string
  title: string
  description: string
  date: string
  venue_name: string
  venue_address: string
}

export function PublicRSVP() {
  const { weddingId } = useParams<{ weddingId: string }>()
  const [searchParams] = useSearchParams()
  const guestEmail = searchParams.get('email')
  const guestName = searchParams.get('name')
  const token = searchParams.get('token')
  
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<any>(null)

  useEffect(() => {
    if (!weddingId || !guestEmail || !token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    // Verify the invitation token
    verifyInvitation()
    fetchWeddingData()
  }, [weddingId, guestEmail, token])

  const verifyInvitation = async () => {
    try {
      // In a real implementation, you'd verify the token against your database
      // For now, we'll proceed with the assumption that the token is valid
      console.log('Verifying invitation token:', token)
    } catch (error) {
      setError('Invalid or expired invitation link')
    }
  }

  const fetchWeddingData = async () => {
    if (!weddingId) return

    try {
      // Fetch wedding details
      const { data: weddingData, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', weddingId)
        .single()

      if (weddingError) throw weddingError
      setWedding(weddingData)

      // Fetch events for this wedding
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('start_time', { ascending: true })

      if (eventsError) throw eventsError
      setEvents(eventsData || [])

    } catch (error) {
      setError('Unable to load wedding details')
      console.error('Error fetching wedding data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRSVPSubmit = async (rsvpData: any) => {
    if (!weddingId || !guestEmail) return

    try {
      // Check if guest already exists
      const { data: existingGuest } = await supabase
        .from('guests')
        .select('id')
        .eq('wedding_id', weddingId)
        .eq('email', guestEmail)
        .single()

      let guestId = existingGuest?.id

      // Create guest if doesn't exist
      if (!guestId) {
        const { data: newGuest, error: guestError } = await supabase
          .from('guests')
          .insert([{
            wedding_id: weddingId,
            name: rsvpData.name,
            email: guestEmail,
            phone: rsvpData.phone,
            dietary_restrictions: rsvpData.dietary_restrictions,
            plus_one: rsvpData.plus_one
          }])
          .select()
          .single()

        if (guestError) throw guestError
        guestId = newGuest.id
      }

      // Create RSVPs for all events
      const rsvpPromises = events.map(event => 
        supabase.from('rsvps').insert([{
          wedding_id: weddingId,
          guest_id: guestId,
          event_id: event.id,
          status: rsvpData.status,
          dietary_restrictions: rsvpData.dietary_restrictions,
          plus_one_name: rsvpData.plus_one_name
        }])
      )

      await Promise.all(rsvpPromises)

      // Show success message
      setSubmittedData(rsvpData)
      setRsvpSubmitted(true)
      
      toast.success('RSVP submitted successfully!')

    } catch (error) {
      console.error('Error submitting RSVP:', error)
      toast.error('Failed to submit RSVP. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please contact the couple if you believe this is an error.
          </p>
        </Card>
      </div>
    )
  }

  if (rsvpSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-4">
            Your RSVP has been received. We're so excited to {submittedData?.status === 'confirmed' ? 'celebrate with you!' : 'have shared this special moment with you.'}
          </p>
          {submittedData?.status === 'confirmed' && (
            <div className="bg-green-50 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-green-800 mb-2">Your Response:</h3>
              <p className="text-green-700 text-sm mb-1"><strong>Name:</strong> {submittedData.name}</p>
              {submittedData.plus_one && submittedData.plus_one_name && (
                <p className="text-green-700 text-sm mb-1"><strong>Guest:</strong> {submittedData.plus_one_name}</p>
              )}
              {submittedData.dietary_restrictions && (
                <p className="text-green-700 text-sm"><strong>Dietary Notes:</strong> {submittedData.dietary_restrictions}</p>
              )}
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{wedding?.title}</h1>
          <p className="text-lg text-gray-600">You're Invited!</p>
        </div>

        {/* Wedding Details */}
        <Card className="mb-8 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Date</h3>
                <p className="text-gray-600">
                  {wedding?.date && new Date(wedding.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-pink-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Venue</h3>
                <p className="text-gray-600">{wedding?.venue_name}</p>
                <p className="text-gray-500 text-sm">{wedding?.venue_address}</p>
              </div>
            </div>
          </div>
          
          {wedding?.description && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">About Our Wedding</h3>
              <p className="text-gray-600">{wedding.description}</p>
            </div>
          )}
        </Card>

        {/* Events */}
        {events.length > 0 && (
          <Card className="mb-8 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border-l-4 border-pink-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-1">
                    {new Date(event.start_time).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                    {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}`}
                  </p>
                  {event.description && (
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* RSVP Form */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">RSVP</h2>
          <RSVPForm 
            weddingId={weddingId!}
            eventId={events[0]?.id || ''}
            onSubmit={handleRSVPSubmit}
          />
        </Card>
      </div>
    </div>
  )
}