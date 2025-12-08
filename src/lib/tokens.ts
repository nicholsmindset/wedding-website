/**
 * Secure token generation utilities for invitation links
 */

/**
 * Generates a cryptographically secure token for invitation links
 * Uses crypto.randomUUID() which is available in modern browsers
 */
export function generateSecureToken(): string {
  // Use Web Crypto API for secure random token generation
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback using crypto.getRandomValues (also secure)
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates a magic link URL for RSVP invitations
 */
export function generateMagicLinkUrl(
  weddingId: string,
  email: string,
  token: string
): string {
  const baseUrl = window.location.origin
  const params = new URLSearchParams({
    email: email,
    token: token
  })
  return `${baseUrl}/rsvp/${weddingId}?${params.toString()}`
}

/**
 * Calculates expiration date for invitation tokens (30 days from now)
 */
export function getTokenExpirationDate(daysValid: number = 30): string {
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + daysValid)
  return expirationDate.toISOString()
}

/**
 * Checks if a token has expired
 */
export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}
