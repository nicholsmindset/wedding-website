import { useState, useRef, useCallback } from 'react'
import { useWeddingStore } from '@/stores/weddingStore'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface PhotoUploadProps {
  weddingId: string
  onUploadComplete?: () => void
  maxSizeMB?: number
}

export function PhotoUpload({ weddingId, onUploadComplete, maxSizeMB = 10 }: PhotoUploadProps) {
  const { uploadPhoto, loading } = useWeddingStore()
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > maxSizeBytes) {
      toast.error(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [maxSizeBytes, maxSizeMB])

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      await uploadPhoto(selectedFile, weddingId)
      setSelectedFile(null)
      setPreview(null)
      toast.success('Photo uploaded successfully!')
      onUploadComplete?.()
    } catch {
      toast.error('Upload failed. Please try again.')
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const openFilePicker = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={0}
        aria-label={preview ? `Selected file: ${selectedFile?.name}. Press Enter to select a different file.` : 'Drop zone for photo upload. Press Enter to browse files.'}
        aria-describedby="upload-instructions"
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={openFilePicker}
      >
        <input
          ref={inputRef}
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="sr-only"
          disabled={loading}
          aria-label="Select photo file"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt={`Preview of ${selectedFile?.name}`}
                className="max-w-full max-h-64 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Remove selected photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your photo here, or click to browse
              </p>
              <p id="upload-instructions" className="text-sm text-gray-500 mt-1">
                Supports JPG, PNG, WebP up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1"
            aria-describedby={loading ? 'upload-status' : undefined}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2 border-white" />
                <span id="upload-status">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                Upload Photo
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleRemove}
            disabled={loading}
            aria-label="Remove selected photo"
          >
            <X className="h-4 w-4 mr-2" aria-hidden="true" />
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}
