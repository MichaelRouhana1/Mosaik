import { useState, useRef } from 'react'
import ImageCropModal from './ImageCropModal'
import { uploadImage } from '../api/adminApi'

interface ProductImageUploadProps {
  imageUrl: string
  onChange: (url: string) => void
  onError?: (err: Error) => void
  slotLabel?: string
}

export default function ProductImageUpload({
  imageUrl,
  onChange,
  onError,
  slotLabel,
}: ProductImageUploadProps) {
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingObjectUrl, setPendingObjectUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPendingFile(file)
    setPendingObjectUrl(url)
    setCropModalOpen(true)
    e.target.value = ''
  }

  const handleCropComplete = async (blob: Blob) => {
    if (!pendingObjectUrl) return
    URL.revokeObjectURL(pendingObjectUrl)
    setPendingObjectUrl(null)
    setPendingFile(null)
    setCropModalOpen(false)

    setUploading(true)
    try {
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
      const { url } = await uploadImage(file)
      onChange(url)
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    if (pendingObjectUrl) {
      URL.revokeObjectURL(pendingObjectUrl)
    }
    setPendingObjectUrl(null)
    setPendingFile(null)
    setCropModalOpen(false)
  }

  return (
    <div className="space-y-2">
      {slotLabel && (
        <p className="text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400">
          {slotLabel}
        </p>
      )}
      {/* Preview frame - shows how it will look on the website (2:3 aspect) */}
      <div className="flex gap-4 items-start">
        <div className="w-24 aspect-[2/3] overflow-hidden bg-mosaik-gray-soft dark:bg-mosaik-dark-bg border border-mosaik-gray/30 dark:border-mosaik-dark-border flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-mosaik-gray dark:text-gray-500 text-xs">
              —
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-xs text-mosaik-gray dark:text-gray-400">
            Preview: how it will look on product cards (2:3 ratio)
          </p>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="text-sm file:rounded-none file:border file:border-mosaik-gray/50 dark:file:border-mosaik-dark-border file:px-4 file:py-2 file:bg-white dark:file:bg-mosaik-dark-bg file:text-mosaik-black dark:file:text-white"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste image URL"
              className="flex-1 min-w-0 rounded-none py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-bg text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 text-sm"
            />
          </div>
          {uploading && (
            <span className="text-xs text-mosaik-gray dark:text-gray-400">
              Uploading…
            </span>
          )}
        </div>
      </div>

      {cropModalOpen && pendingObjectUrl && (
        <ImageCropModal
          imageSrc={pendingObjectUrl}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
