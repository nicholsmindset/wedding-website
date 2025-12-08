import { supabase } from '@/lib/supabase'

export interface PhotoAnalysis {
  success: boolean
  analysis?: {
    moments: Array<{
      type: string
      confidence: number
      description: string
    }>
    sentiment: 'positive' | 'neutral' | 'negative'
    key_elements: string[]
    time_context: string
    group_composition: string
    special_notes: string
  }
  momentsDetected?: number
  error?: string
}

export async function analyzePhoto(photoUrl: string, weddingId: string, photoId: string): Promise<PhotoAnalysis> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-photo', {
      body: { photoUrl, weddingId, photoId }
    })

    if (error) {
      console.error('Edge function error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to analyze photo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function analyzeMultiplePhotos(photos: Array<{url: string, id: string}>, weddingId: string) {
  const results = []
  
  // Process photos in batches to avoid rate limiting
  const batchSize = 3
  for (let i = 0; i < photos.length; i += batchSize) {
    const batch = photos.slice(i, i + batchSize)
    const batchPromises = batch.map(photo => 
      analyzePhoto(photo.url, weddingId, photo.id)
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < photos.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}