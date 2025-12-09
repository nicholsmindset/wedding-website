import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Wedding, Event, Guest, RSVP, Photo } from '@/lib/supabase'

// Granular loading states for better UX
interface LoadingStates {
  weddings: boolean
  weddingDetails: boolean
  createWedding: boolean
  createEvent: boolean
  createGuest: boolean
  uploadPhoto: boolean
}

// Granular error states to identify which operation failed
interface ErrorStates {
  weddings: string | null
  weddingDetails: string | null
  createWedding: string | null
  createEvent: string | null
  createGuest: string | null
  uploadPhoto: string | null
}

interface WeddingStore {
  weddings: Wedding[]
  currentWedding: Wedding | null
  events: Event[]
  guests: Guest[]
  rsvps: RSVP[]
  photos: Photo[]

  // Granular loading and error states
  loadingStates: LoadingStates
  errors: ErrorStates

  // Legacy single loading/error for backward compatibility
  loading: boolean
  error: string | null

  // Actions
  fetchWeddings: () => Promise<void>
  setCurrentWedding: (wedding: Wedding | null) => void
  createWedding: (wedding: Omit<Wedding, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  fetchWeddingDetails: (weddingId: string) => Promise<void>
  createEvent: (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  createGuest: (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  uploadPhoto: (file: File, weddingId: string) => Promise<void>
  subscribeToWedding: (weddingId: string) => () => void
  clearError: (key: keyof ErrorStates) => void
}

const initialLoadingStates: LoadingStates = {
  weddings: false,
  weddingDetails: false,
  createWedding: false,
  createEvent: false,
  createGuest: false,
  uploadPhoto: false,
}

const initialErrorStates: ErrorStates = {
  weddings: null,
  weddingDetails: null,
  createWedding: null,
  createEvent: null,
  createGuest: null,
  uploadPhoto: null,
}

export const useWeddingStore = create<WeddingStore>((set) => ({
  weddings: [],
  currentWedding: null,
  events: [],
  guests: [],
  rsvps: [],
  photos: [],
  loadingStates: initialLoadingStates,
  errors: initialErrorStates,
  loading: false,
  error: null,

  clearError: (key: keyof ErrorStates) => {
    set(state => ({
      errors: { ...state.errors, [key]: null },
      error: null, // Also clear legacy error
    }))
  },

  fetchWeddings: async () => {
    set(state => ({
      loadingStates: { ...state.loadingStates, weddings: true },
      errors: { ...state.errors, weddings: null },
      loading: true,
      error: null,
    }))
    try {
      const { data, error } = await supabase
        .from('weddings')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      set(state => ({
        weddings: data || [],
        loadingStates: { ...state.loadingStates, weddings: false },
        loading: false,
      }))
    } catch (error) {
      const errorMessage = (error as Error).message
      set(state => ({
        errors: { ...state.errors, weddings: errorMessage },
        loadingStates: { ...state.loadingStates, weddings: false },
        error: errorMessage,
        loading: false,
      }))
    }
  },

  setCurrentWedding: (wedding) => {
    set({ currentWedding: wedding })
  },

  createWedding: async (weddingData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createWedding: true },
      errors: { ...state.errors, createWedding: null },
      loading: true,
      error: null,
    }))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('weddings')
        .insert([{
          ...weddingData,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) throw error

      // Add planner role for the creator
      await supabase
        .from('wedding_roles')
        .insert([{
          wedding_id: data.id,
          user_id: user.id,
          role: 'planner'
        }])

      set(state => ({
        weddings: [...state.weddings, data],
        currentWedding: data,
        loadingStates: { ...state.loadingStates, createWedding: false },
        loading: false,
      }))
    } catch (error) {
      const errorMessage = (error as Error).message
      set(state => ({
        errors: { ...state.errors, createWedding: errorMessage },
        loadingStates: { ...state.loadingStates, createWedding: false },
        error: errorMessage,
        loading: false,
      }))
      throw error
    }
  },

  fetchWeddingDetails: async (weddingId) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, weddingDetails: true },
      errors: { ...state.errors, weddingDetails: null },
      loading: true,
      error: null,
    }))
    try {
      // Fetch wedding details
      const { data: wedding, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .eq('id', weddingId)
        .single()

      if (weddingError) throw weddingError

      // Fetch related data in parallel
      const [events, guests, rsvps, photos] = await Promise.all([
        supabase.from('events').select('*').eq('wedding_id', weddingId),
        supabase.from('guests').select('*').eq('wedding_id', weddingId),
        supabase.from('rsvps').select('*').eq('wedding_id', weddingId),
        supabase.from('photos').select('*').eq('wedding_id', weddingId)
      ])

      set(state => ({
        currentWedding: wedding,
        events: events.data || [],
        guests: guests.data || [],
        rsvps: rsvps.data || [],
        photos: photos.data || [],
        loadingStates: { ...state.loadingStates, weddingDetails: false },
        loading: false,
      }))
    } catch (error) {
      const errorMessage = (error as Error).message
      set(state => ({
        errors: { ...state.errors, weddingDetails: errorMessage },
        loadingStates: { ...state.loadingStates, weddingDetails: false },
        error: errorMessage,
        loading: false,
      }))
    }
  },

  createEvent: async (eventData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createEvent: true },
      errors: { ...state.errors, createEvent: null },
      loading: true,
      error: null,
    }))
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) throw error

      set(state => ({
        events: [...state.events, data],
        loadingStates: { ...state.loadingStates, createEvent: false },
        loading: false,
      }))
    } catch (error) {
      const errorMessage = (error as Error).message
      set(state => ({
        errors: { ...state.errors, createEvent: errorMessage },
        loadingStates: { ...state.loadingStates, createEvent: false },
        error: errorMessage,
        loading: false,
      }))
      throw error
    }
  },

  createGuest: async (guestData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createGuest: true },
      errors: { ...state.errors, createGuest: null },
      loading: true,
      error: null,
    }))
    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([guestData])
        .select()
        .single()

      if (error) throw error

      set(state => ({
        guests: [...state.guests, data],
        loadingStates: { ...state.loadingStates, createGuest: false },
        loading: false,
      }))
    } catch (error) {
      const errorMessage = (error as Error).message
      set(state => ({
        errors: { ...state.errors, createGuest: errorMessage },
        loadingStates: { ...state.loadingStates, createGuest: false },
        error: errorMessage,
        loading: false,
      }))
      throw error
    }
  },

  uploadPhoto: async (file: File, weddingId: string) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, uploadPhoto: true },
      errors: { ...state.errors, uploadPhoto: null },
      loading: true,
      error: null,
    }))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileName = `${weddingId}/${Date.now()}-${file.name}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create photo record
      const { data: photo, error: photoError } = await supabase
        .from('photos')
        .insert([{
          wedding_id: weddingId,
          storage_path: fileName,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          width: 0, // Will be updated with actual dimensions
          height: 0,
          uploaded_by: user.id
        }])
        .select()
        .single()

      if (photoError) throw photoError

      set(state => ({
        photos: [...state.photos, photo],
        loadingStates: { ...state.loadingStates, uploadPhoto: false },
        loading: false,
      }))
    } catch (error) {
      const errorMessage = (error as Error).message
      set(state => ({
        errors: { ...state.errors, uploadPhoto: errorMessage },
        loadingStates: { ...state.loadingStates, uploadPhoto: false },
        error: errorMessage,
        loading: false,
      }))
      throw error
    }
  },

  subscribeToWedding: (weddingId: string) => {
    // Subscribe to photos changes
    const photosSubscription = supabase
      .channel(`photos:${weddingId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos', filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set(state => ({
              photos: [...state.photos, payload.new as Photo]
            }))
          } else if (payload.eventType === 'DELETE') {
            set(state => ({
              photos: state.photos.filter(p => p.id !== payload.old.id)
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to guests changes
    const guestsSubscription = supabase
      .channel(`guests:${weddingId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'guests', filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set(state => ({
              guests: [...state.guests, payload.new as Guest]
            }))
          } else if (payload.eventType === 'DELETE') {
            set(state => ({
              guests: state.guests.filter(g => g.id !== payload.old.id)
            }))
          } else if (payload.eventType === 'UPDATE') {
            set(state => ({
              guests: state.guests.map(g => g.id === payload.new.id ? payload.new as Guest : g)
            }))
          }
        }
      )
      .subscribe()

    // Subscribe to RSVPs changes
    const rsvpsSubscription = supabase
      .channel(`rsvps:${weddingId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rsvps', filter: `wedding_id=eq.${weddingId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            set(state => ({
              rsvps: [...state.rsvps, payload.new as RSVP]
            }))
          } else if (payload.eventType === 'UPDATE') {
            set(state => ({
              rsvps: state.rsvps.map(r => r.id === payload.new.id ? payload.new as RSVP : r)
            }))
          }
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      photosSubscription.unsubscribe()
      guestsSubscription.unsubscribe()
      rsvpsSubscription.unsubscribe()
    }
  }
}))