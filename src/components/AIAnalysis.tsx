import { useState } from 'react'
import { analyzePhoto, PhotoAnalysis } from '@/lib/ai'
import { Photo } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Sparkles, Loader2, Camera, Heart, Users, Clock, Star, AlertTriangle, Search, Lightbulb } from 'lucide-react'

interface AIAnalysisProps {
  photo: Photo
  weddingId: string
  onAnalysisComplete?: (analysis: PhotoAnalysis) => void
}

export function AIAnalysis({ photo, weddingId, onAnalysisComplete }: AIAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const photoUrl = `${supabaseUrl}/storage/v1/object/public/wedding-photos/${photo.storage_path}`
      const result = await analyzePhoto(photoUrl, weddingId, photo.id)
      
      if (result.success) {
        setAnalysis(result)
        onAnalysisComplete?.(result)
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch {
      setError('Failed to analyze photo')
    } finally {
      setAnalyzing(false)
    }
  }

  if (analyzing) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
          <span className="text-purple-700 font-medium">AI is analyzing your photo...</span>
        </div>
        <div className="mt-4 text-center text-sm text-purple-600">
          This usually takes 10-30 seconds
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 font-medium">Analysis Error</span>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <Button onClick={handleAnalyze} variant="outline" size="sm" className="mt-3">
          Try Again
        </Button>
      </div>
    )
  }

  if (!analysis || !analysis.analysis) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Photo Analysis</h3>
          <p className="text-gray-600 mb-4">
            Let our AI analyze this photo to identify moments, sentiment, and key elements
          </p>
          <Button onClick={handleAnalyze} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Photo
          </Button>
        </div>
      </div>
    )
  }

  const data = analysis.analysis

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis Results</h3>
        </div>
        <Button onClick={handleAnalyze} variant="outline" size="sm">
          Re-analyze
        </Button>
      </div>

      <div className="space-y-4">
        {/* Sentiment */}
        <div className="flex items-center space-x-3">
          <Heart className="h-5 w-5 text-green-600" />
          <div>
            <span className="font-medium text-gray-900">Sentiment: </span>
            <span className={`capitalize ${
              data.sentiment === 'positive' ? 'text-green-600' :
              data.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {data.sentiment}
            </span>
          </div>
        </div>

        {/* Key Moments */}
        {data.moments && data.moments.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Camera className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Detected Moments</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.moments.map((moment, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 capitalize">{moment.type}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">
                        {(moment.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{moment.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Elements */}
        {data.key_elements && data.key_elements.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Search className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Key Elements</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.key_elements.map((element, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  {element}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Group Composition */}
        {data.group_composition && (
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Group: </span>
              <span className="text-gray-700">{data.group_composition}</span>
            </div>
          </div>
        )}

        {/* Time Context */}
        {data.time_context && (
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-900">Time: </span>
              <span className="text-gray-700">{data.time_context}</span>
            </div>
          </div>
        )}

        {/* Special Notes */}
        {data.special_notes && (
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Special Notes</span>
            </div>
            <p className="text-sm text-gray-700">{data.special_notes}</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Analysis completed • {data.moments?.length || 0} moments detected
      </div>
    </div>
  )
}