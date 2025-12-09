import { ReactNode, useEffect, useRef, useId, createContext, useContext, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogContextType {
  titleId: string
  descriptionId: string
  onClose: () => void
}

const DialogContext = createContext<DialogContextType | null>(null)

function useDialogContext() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog')
  }
  return context
}

interface DialogProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DialogContentProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

interface DialogHeaderProps {
  children: ReactNode
  showCloseButton?: boolean
}

interface DialogTitleProps {
  children: ReactNode
}

interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

interface DialogTriggerProps {
  children: ReactNode
  asChild?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl'
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
  }, [onOpenChange])

  // Handle escape key
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose])

  // Focus management
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus the dialog or first focusable element
      requestAnimationFrame(() => {
        if (dialogRef.current) {
          const focusable = dialogRef.current.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusable) {
            focusable.focus()
          } else {
            dialogRef.current.focus()
          }
        }
      })

      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Focus trap
  useEffect(() => {
    if (!open || !dialogRef.current) return

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [open])

  if (!open) return null

  return (
    <DialogContext.Provider value={{ titleId, descriptionId, onClose: handleClose }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="presentation"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        />

        {/* Dialog */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className="relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto focus:outline-none"
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  )
}

export function DialogContent({ children, className, size = 'md' }: DialogContentProps) {
  return (
    <div className={cn('p-6 w-full', sizeClasses[size], className)}>
      {children}
    </div>
  )
}

export function DialogHeader({ children, showCloseButton = true }: DialogHeaderProps) {
  const { onClose } = useDialogContext()

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">{children}</div>
      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 p-1 text-gray-400 hover:text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export function DialogTitle({ children }: DialogTitleProps) {
  const { titleId } = useDialogContext()

  return (
    <h2 id={titleId} className="text-lg font-semibold text-gray-900">
      {children}
    </h2>
  )
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext()

  return (
    <p id={descriptionId} className={cn('text-sm text-gray-600 mt-1', className)}>
      {children}
    </p>
  )
}

export function DialogTrigger({ children, asChild = false }: DialogTriggerProps) {
  if (asChild) {
    return <>{children}</>
  }
  return <div>{children}</div>
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}
