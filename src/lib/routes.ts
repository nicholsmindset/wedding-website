/**
 * Route constants for the application
 * Use these instead of hardcoding route strings
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LANDING: '/',

  // Auth routes
  AUTH_CALLBACK: '/auth/callback',

  // Protected routes
  DASHBOARD: '/dashboard',
  WEDDING_DETAIL: (weddingId: string) => `/dashboard/weddings/${weddingId}`,

  // Public routes with params
  RSVP: (weddingId: string) => `/rsvp/${weddingId}`,
  RSVP_WITH_TOKEN: (weddingId: string, email: string, token: string) =>
    `/rsvp/${weddingId}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
} as const

/**
 * Route patterns for use in route definitions
 */
export const ROUTE_PATTERNS = {
  HOME: '/',
  AUTH_CALLBACK: '/auth/callback',
  DASHBOARD: '/dashboard',
  WEDDING_DETAIL: '/dashboard/weddings/:weddingId',
  RSVP: '/rsvp/:weddingId',
  NOT_FOUND: '*',
} as const

/**
 * Check if a path matches a route pattern
 */
export function matchesRoute(path: string, pattern: string): boolean {
  const regex = new RegExp(
    '^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$'
  )
  return regex.test(path)
}

/**
 * Extract route params from a path
 */
export function extractParams(path: string, pattern: string): Record<string, string> {
  const params: Record<string, string> = {}
  const patternParts = pattern.split('/')
  const pathParts = path.split('?')[0].split('/')

  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1)
      params[paramName] = pathParts[index] || ''
    }
  })

  return params
}
