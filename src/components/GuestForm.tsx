import { useState } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { User, Mail, Phone } from 'lucide-react'

interface GuestFormProps {
  weddingId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function GuestForm({ weddingId, onSuccess, onCancel }: GuestFormProps) {
  const { createGuest, loading } = useWeddingStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dietary_restrictions: '',
    plus_one: false
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      await createGuest({
        wedding_id: weddingId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        dietary_restrictions: formData.dietary_restrictions || null,
        plus_one: formData.plus_one
      })

      onSuccess?.()
    } catch (err) {
      const errorMessage = (err as Error).message
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique')) {
        setError('A guest with this email already exists')
      } else {
        setError(errorMessage)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Smith"
              className="pl-10"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="pl-10"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              className="pl-10"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Restrictions
          </label>
          <Textarea
            id="dietary_restrictions"
            name="dietary_restrictions"
            value={formData.dietary_restrictions}
            onChange={handleChange}
            placeholder="Vegetarian, gluten-free, nut allergy, etc."
            rows={2}
          />
        </div>

        <div className="flex items-center">
          <input
            id="plus_one"
            name="plus_one"
            type="checkbox"
            checked={formData.plus_one}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="plus_one" className="ml-2 block text-sm text-gray-700">
            Guest is allowed a plus one
          </label>
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
          {loading ? 'Adding...' : 'Add Guest'}
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
