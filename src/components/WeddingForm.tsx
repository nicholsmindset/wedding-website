import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWeddingStore } from '@/stores/weddingStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Calendar } from 'lucide-react'

// Zod schema for form validation (input type - what the form fields use)
const weddingSchema = z.object({
  title: z.string().min(1, 'Wedding title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  date: z.string().min(1, 'Wedding date is required'),
  venue_name: z.string().max(100, 'Venue name must be less than 100 characters').optional(),
  venue_address: z.string().max(200, 'Venue address must be less than 200 characters').optional(),
  budget: z.string().optional()
    .refine(
      val => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Budget must be a positive number'
    ),
})

type WeddingFormData = z.infer<typeof weddingSchema>

interface WeddingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function WeddingForm({ onSuccess, onCancel }: WeddingFormProps) {
  const { createWedding, loadingStates, errors: storeErrors } = useWeddingStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WeddingFormData>({
    resolver: zodResolver(weddingSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      venue_name: '',
      venue_address: '',
      budget: '',
    },
  })

  const onSubmit = async (data: WeddingFormData) => {
    try {
      await createWedding({
        title: data.title,
        description: data.description || null,
        date: data.date,
        venue_name: data.venue_name || null,
        venue_address: data.venue_address || null,
        budget: data.budget ? parseFloat(data.budget) : null,
        created_by: '' // This will be set in the store
      })
      onSuccess?.()
    } catch {
      // Error is handled by the store
    }
  }

  const isLoading = loadingStates.createWedding || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Wedding Title *
          </label>
          <Input
            id="title"
            type="text"
            placeholder="Sarah & John's Wedding"
            {...register('title')}
            aria-invalid={errors.title ? 'true' : 'false'}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            placeholder="A beautiful summer wedding celebration"
            rows={3}
            {...register('description')}
            aria-invalid={errors.description ? 'true' : 'false'}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Wedding Date *
          </label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              className="pl-10"
              {...register('date')}
              aria-invalid={errors.date ? 'true' : 'false'}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name
            </label>
            <Input
              id="venue_name"
              type="text"
              placeholder="Garden Paradise Venue"
              {...register('venue_name')}
              aria-invalid={errors.venue_name ? 'true' : 'false'}
            />
            {errors.venue_name && (
              <p className="mt-1 text-sm text-red-600">{errors.venue_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget
            </label>
            <Input
              id="budget"
              type="number"
              placeholder="25000"
              min="0"
              step="0.01"
              {...register('budget')}
              aria-invalid={errors.budget ? 'true' : 'false'}
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="venue_address" className="block text-sm font-medium text-gray-700 mb-1">
            Venue Address
          </label>
          <Input
            id="venue_address"
            type="text"
            placeholder="123 Wedding Lane, Celebration City"
            {...register('venue_address')}
            aria-invalid={errors.venue_address ? 'true' : 'false'}
          />
          {errors.venue_address && (
            <p className="mt-1 text-sm text-red-600">{errors.venue_address.message}</p>
          )}
        </div>
      </div>

      {storeErrors.createWedding && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {storeErrors.createWedding}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Creating...' : 'Create Wedding'}
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
