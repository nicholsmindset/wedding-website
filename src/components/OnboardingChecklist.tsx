import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckCircle, Circle, X, ChevronRight, Sparkles } from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
  action?: () => void
  actionLabel?: string
}

interface OnboardingChecklistProps {
  hasWedding: boolean
  hasEvents: boolean
  hasGuests: boolean
  hasPhotos: boolean
  onCreateWedding: () => void
  onAddEvent?: () => void
  onAddGuest?: () => void
  onUploadPhoto?: () => void
  onDismiss: () => void
}

const STORAGE_KEY = 'wedding_onboarding_dismissed'

export function OnboardingChecklist({
  hasWedding,
  hasEvents,
  hasGuests,
  hasPhotos,
  onCreateWedding,
  onAddEvent,
  onAddGuest,
  onUploadPhoto,
  onDismiss
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true'
    setDismissed(isDismissed)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
    onDismiss()
  }

  const items: ChecklistItem[] = [
    {
      id: 'wedding',
      title: 'Create your wedding',
      description: 'Set up your wedding with date, venue, and details',
      completed: hasWedding,
      action: hasWedding ? undefined : onCreateWedding,
      actionLabel: 'Create Wedding'
    },
    {
      id: 'events',
      title: 'Add your events',
      description: 'Add ceremony, reception, and other events',
      completed: hasEvents,
      action: hasWedding && !hasEvents ? onAddEvent : undefined,
      actionLabel: 'Add Event'
    },
    {
      id: 'guests',
      title: 'Invite your guests',
      description: 'Build your guest list and send invitations',
      completed: hasGuests,
      action: hasWedding && !hasGuests ? onAddGuest : undefined,
      actionLabel: 'Add Guests'
    },
    {
      id: 'photos',
      title: 'Upload photos',
      description: 'Share and organize your wedding photos',
      completed: hasPhotos,
      action: hasWedding && !hasPhotos ? onUploadPhoto : undefined,
      actionLabel: 'Upload Photos'
    }
  ]

  const completedCount = items.filter(item => item.completed).length
  const progressPercent = (completedCount / items.length) * 100

  // Don't show if dismissed or all items completed
  if (dismissed || completedCount === items.length) return null

  return (
    <Card className="mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Getting Started</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-pink-100">
              {completedCount} of {items.length} complete
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss()
              }}
              className="p-1 hover:bg-white/20 rounded"
              aria-label="Dismiss checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      {expanded && (
        <div className="p-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      item.completed ? 'text-green-800' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </p>
                    <p className={`text-sm ${
                      item.completed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.action && (
                  <Button
                    size="sm"
                    onClick={item.action}
                    className="ml-4 flex-shrink-0"
                  >
                    {item.actionLabel}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}

                {item.completed && (
                  <span className="text-green-600 text-sm font-medium ml-4">
                    Done!
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Complete these steps to get the most out of your wedding planner.
          </p>
        </div>
      )}
    </Card>
  )
}
