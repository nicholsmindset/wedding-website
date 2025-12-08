import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  disconnect = vi.fn()
  observe = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
  unobserve = vi.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock crypto.randomUUID with unique values
let uuidCounter = 0
Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: () => {
    uuidCounter++
    return `${uuidCounter.toString().padStart(8, '0')}-0000-0000-0000-000000000000`
  }
})
