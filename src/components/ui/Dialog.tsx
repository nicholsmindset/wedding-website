import { ReactNode, useState } from 'react'

interface DialogProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: ReactNode
}

interface DialogTitleProps {
  children: ReactNode
}

interface DialogTriggerProps {
  children: ReactNode
  asChild?: boolean
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
  const [isOpen, setIsOpen] = useState(open || false)
  
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => handleOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

export function DialogTitle({ children }: DialogTitleProps) {
  return (
    <h3 className="text-lg font-semibold text-gray-900">
      {children}
    </h3>
  )
}

export function DialogTrigger({ children, asChild = false }: DialogTriggerProps) {
  if (asChild) {
    return <>{children}</>
  }
  return <div>{children}</div>
}