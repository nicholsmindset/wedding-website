import { useState } from 'react'
import { Photo } from '@/lib/supabase'
import { useWeddingStore } from '@/stores/weddingStore'
import { AIAnalysis } from '@/components/AIAnalysis'
import { X, Download, Trash2, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

interface PhotoGalleryProps {
  photos: Photo[]
  weddingId: string
  onPhotoClick?: (photo: Photo) => void
}

export function PhotoGallery({ photos, weddingId, onPhotoClick }: PhotoGalleryProps) {
  const { deletePhoto } = useWeddingStore()
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const getPhotoUrl = (photo: Photo) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/wedding-photos/${photo.storage_path}`
  }

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(getPhotoUrl(photo))
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = photo.original_filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Photo downloaded!')
    } catch {
      toast.error('Failed to download photo')
    }
  }

  const handleDelete = async () => {
    if (!selectedPhoto) return
    setDeleting(true)
    try {
      await deletePhoto(selectedPhoto.id, selectedPhoto.storage_path)
      setSelectedPhoto(null)
      setShowDeleteConfirm(false)
      toast.success('Photo deleted!')
    } catch {
      toast.error('Failed to delete photo')
    } finally {
      setDeleting(false)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📸</span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
        <p className="text-gray-600">Start capturing memories by uploading your first photo!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            role="button"
            tabIndex={0}
            aria-label={`View photo: ${photo.original_filename}`}
            className="relative group cursor-pointer aspect-square rounded-lg overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              setSelectedPhoto(photo)
              onPhotoClick?.(photo)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSelectedPhoto(photo)
                onPhotoClick?.(photo)
              }
            }}
          >
            <img
              src={getPhotoUrl(photo)}
              alt={photo.original_filename}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 rounded-full p-2" aria-label="View photo details">
                  <ZoomIn className="h-5 w-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-white text-xs truncate">{photo.original_filename}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo: ${selectedPhoto.original_filename}`}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPhoto(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSelectedPhoto(null)
          }}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo viewer"
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
            >
              <X className="h-8 w-8" />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={getPhotoUrl(selectedPhoto)}
                alt={selectedPhoto.original_filename}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedPhoto.original_filename}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedPhoto.created_at).toLocaleDateString()} • 
                      {(selectedPhoto.file_size / (1024 * 1024)).toFixed(1)} MB • 
                      {selectedPhoto.width} × {selectedPhoto.height}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedPhoto)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* AI Analysis Section */}
              <div className="p-4 bg-gray-50 border-t">
                <AIAnalysis
                  photo={selectedPhoto}
                  weddingId={weddingId}
                />
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Photo</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this photo? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}