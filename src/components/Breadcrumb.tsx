import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
      <ol className="flex items-center space-x-1">
        {/* Home link is always first */}
        <li className="flex items-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              {isLast || !item.href ? (
                <span
                  className={`flex items-center ${
                    isLast ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Pre-configured breadcrumb for the wedding dashboard
 */
interface WeddingBreadcrumbProps {
  weddingTitle?: string
  currentPage?: string
}

export function WeddingBreadcrumb({ weddingTitle, currentPage }: WeddingBreadcrumbProps) {
  const items: BreadcrumbItem[] = []

  if (weddingTitle) {
    items.push({
      label: 'Weddings',
      href: '/',
    })
    items.push({
      label: weddingTitle,
      href: currentPage ? '/' : undefined, // Link if there's a deeper page
    })
  }

  if (currentPage) {
    items.push({
      label: currentPage,
    })
  }

  if (items.length === 0) {
    items.push({ label: 'Dashboard' })
  }

  return <Breadcrumb items={items} className="mb-4" />
}
