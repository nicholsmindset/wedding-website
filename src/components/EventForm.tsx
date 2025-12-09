import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Calendar, MapPin, Clock } from 'lucide-react'

interface EventFormProps {
  weddingId: string
  onSubmit: (eventData: EventFormData) => Promise<void>
  onCancel: () => void
}

export interface EventFormData {
  wedding_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  location: string | null
}

export function EventForm({ weddingId, onSubmit, onCancel }: EventFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Event title is required')
      return
    }

    if (!startDate || !startTime) {
      setError('Start date and time are required')
      return
    }

    setLoading(true)

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString()
      const endDateTime = endDate && endTime
        ? new Date(`${endDate}T${endTime}`).toISOString()
        : null

      await onSubmit({
        wedding_id: weddingId,
        title: title.trim(),
        description: description.trim() || null,
        start_time: startDateTime,
        end_time: endDateTime,
        location: location.trim() || null,
      })
    } catch (err) {
      setError((err as Error).message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <Input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Ceremony, Reception, Rehearsal Dinner"
          required
        />
      </div>

      <div>
        <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this event..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="h-4 w-4 inline mr-1" />
            Start Date *
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="h-4 w-4 inline mr-1" />
            Start Time *
          </label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="h-4 w-4 inline mr-1" />
          Location
        </label>
        <Input
          id="event-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Church, Reception Hall, Garden"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Create Event'
          )}
        </Button>
      </div>
    </form>
  )
}
