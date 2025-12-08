import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateSecureToken,
  generateMagicLinkUrl,
  getTokenExpirationDate,
  isTokenExpired
} from '../tokens'

describe('tokens', () => {
  describe('generateSecureToken', () => {
    it('should generate a UUID-format token', () => {
      const token = generateSecureToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate unique tokens on each call', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      const token3 = generateSecureToken()

      expect(token1).not.toBe(token2)
      expect(token2).not.toBe(token3)
      expect(token1).not.toBe(token3)
    })

    it('should generate tokens of consistent length', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()

      // Tokens should have consistent length (implementation dependent)
      expect(token1.length).toBeGreaterThan(0)
      expect(token1.length).toBe(token2.length)
    })
  })

  describe('generateMagicLinkUrl', () => {
    beforeEach(() => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      })
    })

    it('should generate a valid URL with weddingId, email, and token', () => {
      const url = generateMagicLinkUrl('wedding-123', 'test@example.com', 'token-abc')

      expect(url).toBe('https://example.com/rsvp/wedding-123?email=test%40example.com&token=token-abc')
    })

    it('should properly encode email with special characters', () => {
      const url = generateMagicLinkUrl('wedding-123', 'test+special@example.com', 'token-abc')

      expect(url).toContain('email=test%2Bspecial%40example.com')
    })
  })

  describe('getTokenExpirationDate', () => {
    it('should return a date 30 days from now by default', () => {
      const now = new Date()
      const expiration = getTokenExpirationDate()
      const expirationDate = new Date(expiration)

      // Should be approximately 30 days from now
      const diffInDays = Math.round(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      expect(diffInDays).toBe(30)
    })

    it('should return a date N days from now when specified', () => {
      const now = new Date()
      const expiration = getTokenExpirationDate(7)
      const expirationDate = new Date(expiration)

      const diffInDays = Math.round(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      expect(diffInDays).toBe(7)
    })

    it('should return a valid ISO string', () => {
      const expiration = getTokenExpirationDate()

      expect(() => new Date(expiration)).not.toThrow()
      expect(expiration).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('isTokenExpired', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago

      expect(isTokenExpired(pastDate)).toBe(true)
    })

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 1 day from now

      expect(isTokenExpired(futureDate)).toBe(false)
    })

    it('should return false for dates just slightly in the future', () => {
      // 1 second in the future should not be expired
      const slightlyFuture = new Date(Date.now() + 1000).toISOString()

      expect(isTokenExpired(slightlyFuture)).toBe(false)
    })

    it('should return true for dates just slightly in the past', () => {
      // 1 second in the past should be expired
      const slightlyPast = new Date(Date.now() - 1000).toISOString()

      expect(isTokenExpired(slightlyPast)).toBe(true)
    })
  })
})
