import { X } from 'lucide-react'

interface MessageFormModalProps {
  show: boolean
  message: string
  onMessageChange: (value: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
}

export function MessageFormModal({
  show,
  message,
  onMessageChange,
  onClose,
  onSubmit,
  isSubmitting
}: MessageFormModalProps) {
  if (!show) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
        <div className="card-bg border border-white/10 rounded-xl p-6 shadow-xl max-w-md w-full pointer-events-auto">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Post anonymously</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
              rows={4}
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="brand-button w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? 'Posting...' : 'Post Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
