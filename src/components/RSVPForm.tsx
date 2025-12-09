import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { CheckCircle, XCircle, Mail, User, Phone } from 'lucide-react'

// Zod schema for RSVP form validation
const rsvpSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
  status: z.enum(['confirmed', 'declined']),
  dietary_restrictions: z.string().max(500, 'Dietary restrictions must be less than 500 characters').optional(),
  plus_one: z.boolean(),
  plus_one_name: z.string().max(100, 'Guest name must be less than 100 characters').optional(),
}).refine(
  (data) => !data.plus_one || (data.plus_one && data.plus_one_name && data.plus_one_name.length > 0),
  {
    message: "Please enter your guest's name",
    path: ['plus_one_name'],
  }
)

export type RSVPData = z.infer<typeof rsvpSchema>

interface RSVPFormProps {
  onSubmit?: (data: RSVPData) => void
}

export function RSVPForm({ onSubmit }: RSVPFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RSVPData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'confirmed',
      dietary_restrictions: '',
      plus_one: false,
      plus_one_name: '',
    },
  })

  const status = watch('status')
  const plusOne = watch('plus_one')

  const handleFormSubmit = (data: RSVPData) => {
    onSubmit?.(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              className="pl-10"
              placeholder="John Doe"
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              className="pl-10"
              placeholder="john@example.com"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              className="pl-10"
              placeholder="(555) 123-4567"
              {...register('phone')}
              aria-invalid={errors.phone ? 'true' : 'false'}
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            RSVP Response *
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange('confirmed')}
                  className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                    field.value === 'confirmed'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept with Pleasure
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('declined')}
                  className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                    field.value === 'declined'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline with Regret
                </button>
              </div>
            )}
          />
        </div>

        {status === 'confirmed' && (
          <>
            <div>
              <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restrictions or Allergies
              </label>
              <Textarea
                id="dietary_restrictions"
                placeholder="Vegetarian, gluten-free, nut allergy, etc."
                rows={2}
                {...register('dietary_restrictions')}
                aria-invalid={errors.dietary_restrictions ? 'true' : 'false'}
              />
              {errors.dietary_restrictions && (
                <p className="mt-1 text-sm text-red-600">{errors.dietary_restrictions.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <Controller
                name="plus_one"
                control={control}
                render={({ field }) => (
                  <input
                    id="plus_one"
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked)
                      // Clear plus_one_name when unchecked
                      if (!e.target.checked) {
                        setValue('plus_one_name', '')
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
              />
              <label htmlFor="plus_one" className="ml-2 block text-sm text-gray-700">
                I will bring a guest
              </label>
            </div>

            {plusOne && (
              <div>
                <label htmlFor="plus_one_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Guest's Name *
                </label>
                <Input
                  id="plus_one_name"
                  type="text"
                  placeholder="Jane Doe"
                  {...register('plus_one_name')}
                  aria-invalid={errors.plus_one_name ? 'true' : 'false'}
                />
                {errors.plus_one_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.plus_one_name.message}</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? 'Submitting...'
          : status === 'confirmed'
            ? 'Confirm Attendance'
            : 'Send Regrets'}
      </Button>
    </form>
  )
}
