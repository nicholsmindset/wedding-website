import { useState } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { Wedding } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Calendar } from 'lucide-react'

interface WeddingFormProps {
  wedding?: Wedding
  onSuccess?: () => void
  onCancel?: () => void
}

export function WeddingForm({ wedding, onSuccess, onCancel }: WeddingFormProps) {
  const { createWedding, updateWedding, loading } = useWeddingStore()
  const isEditing = !!wedding

  const [formData, setFormData] = useState({
    title: wedding?.title || '',
    description: wedding?.description || '',
    date: wedding?.date || '',
    venue_name: wedding?.venue_name || '',
    venue_address: wedding?.venue_address || '',
    budget: wedding?.budget?.toString() || ''
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const weddingData = {
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        venue_name: formData.venue_name || null,
        venue_address: formData.venue_address || null,
        budget: formData.budget ? parseFloat(formData.budget) : null
      }

      if (isEditing && wedding) {
        await updateWedding(wedding.id, weddingData)
      } else {
        await createWedding({
          ...weddingData,
          created_by: '' // This will be set in the store
        })
      }
      onSuccess?.()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Wedding Title *
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="Sarah & John's Wedding"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A beautiful summer wedding celebration"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Wedding Date *
          </label>
          <div className="relative">
            <Input
              id="date"
              name="date"
              type="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name
            </label>
            <Input
              id="venue_name"
              name="venue_name"
              type="text"
              value={formData.venue_name}
              onChange={handleChange}
              placeholder="Garden Paradise Venue"
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget
            </label>
            <Input
              id="budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              placeholder="25000"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label htmlFor="venue_address" className="block text-sm font-medium text-gray-700 mb-1">
            Venue Address
          </label>
          <Input
            id="venue_address"
            name="venue_address"
            type="text"
            value={formData.venue_address}
            onChange={handleChange}
            placeholder="123 Wedding Lane, Celebration City"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading
            ? (isEditing ? 'Updating...' : 'Creating...')
            : (isEditing ? 'Update Wedding' : 'Create Wedding')
          }
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}