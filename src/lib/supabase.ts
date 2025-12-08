import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please copy .env.example to .env and configure your Supabase credentials.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Wedding = {
  id: string
  title: string
  description: string | null
  date: string
  venue_name: string | null
  venue_address: string | null
  budget: number | null
  created_at: string
  updated_at: string
  created_by: string
}

export type UserRole = 'planner' | 'vendor' | 'guest'

export type WeddingRole = {
  id: string
  wedding_id: string
  user_id: string
  role: UserRole
  created_at: string
}

export type Event = {
  id: string
  wedding_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export type Guest = {
  id: string
  wedding_id: string
  name: string
  email: string
  phone: string | null
  dietary_restrictions: string | null
  plus_one: boolean
  created_at: string
  updated_at: string
}

export type RSVP = {
  id: string
  wedding_id: string
  guest_id: string
  event_id: string
  status: 'pending' | 'confirmed' | 'declined'
  dietary_restrictions: string | null
  plus_one_name: string | null
  created_at: string
  updated_at: string
}

export type Photo = {
  id: string
  wedding_id: string
  storage_path: string
  original_filename: string
  file_size: number
  mime_type: string
  width: number
  height: number
  uploaded_by: string
  created_at: string
  exif_data: Record<string, unknown> | null
}

export type PhotoMoment = {
  id: string
  wedding_id: string
  photo_id: string
  moment_type: string
  confidence: number
  metadata: Record<string, unknown> | null
  created_at: string
}

export type Embedding = {
  id: string
  wedding_id: string
  photo_id: string
  embedding: number[]
  created_at: string
}

export type InvitationToken = {
  id: string
  wedding_id: string
  guest_id: string
  email: string
  token: string
  used: boolean
  expires_at: string
  created_at: string
}