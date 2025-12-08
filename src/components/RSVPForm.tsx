import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { CheckCircle, XCircle, Mail, User, Phone } from 'lucide-react'

interface RSVPFormProps {
  onSubmit?: (data: RSVPData) => void
}

interface RSVPData {
  name: string
  email: string
  phone?: string
  status: 'confirmed' | 'declined'
  dietary_restrictions?: string
  plus_one: boolean
  plus_one_name?: string
}

export function RSVPForm({ onSubmit }: RSVPFormProps) {
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    email: '',
    phone: '',
    status: 'confirmed',
    dietary_restrictions: '',
    plus_one: false,
    plus_one_name: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
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
              className="pl-10"
              placeholder="John Doe"
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
              className="pl-10"
              placeholder="john@example.com"
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
              className="pl-10"
              placeholder="(555) 123-4567"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            RSVP Response *
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: 'confirmed' }))}
              className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                formData.status === 'confirmed'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept with Pleasure
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: 'declined' }))}
              className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                formData.status === 'declined'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline with Regret
            </button>
          </div>
        </div>

        {formData.status === 'confirmed' && (
          <>
            <div>
              <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restrictions or Allergies
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
                I will bring a guest
              </label>
            </div>

            {formData.plus_one && (
              <div>
                <label htmlFor="plus_one_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Guest's Name
                </label>
                <Input
                  id="plus_one_name"
                  name="plus_one_name"
                  type="text"
                  value={formData.plus_one_name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                />
              </div>
            )}
          </>
        )}
      </div>

      <Button type="submit" className="w-full">
        {formData.status === 'confirmed' ? 'Confirm Attendance' : 'Send Regrets'}
      </Button>
    </form>
  )
}