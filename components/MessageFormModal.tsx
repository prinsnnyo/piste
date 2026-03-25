import { X } from 'lucide-react'
import { useRef, useEffect } from 'react'

const MAX_LENGTH = 500
const MAX_TEXTAREA_HEIGHT = 160

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
// Auto-expand textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const nextHeight = Math.min(textareaRef.current.scrollHeight, MAX_TEXTAREA_HEIGHT)
      textareaRef.current.style.height = `${nextHeight}px`
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden'
    }
  }, [message])

  if (!show) return null

  return (
    <>
      {/* Darker backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
        <div className="modal-surface rounded-2xl p-6 shadow-2xl max-w-[340px] w-full pointer-events-auto border border-white/5 relative">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Minimalist Header */}
          <div className="flex items-center justify-center mb-6 mt-2">
            <h2 className="text-[11px] text-gray-400 font-bold tracking-[0.2em] uppercase">
              Post Anonymously
            </h2>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Auto-expanding Input Area */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full modal-input-surface text-gray-200 rounded-xl px-4 pt-4 pb-8 outline-none placeholder-gray-500/40 border border-transparent focus:border-gray-600 transition-colors resize-none font-serif text-base leading-relaxed text-center custom-scrollbar overflow-y-hidden min-h-[56px] max-h-[160px]"
                rows={1}
                maxLength={MAX_LENGTH}
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                required
              />

              {/* Character Count */}
              <div className="absolute bottom-2 right-3 pointer-events-none">
                <span
                  className={`text-[10px] tracking-wider ${
                    message.length >= MAX_LENGTH
                      ? 'text-red-300'
                      : message.length >= MAX_LENGTH * 0.9
                      ? 'text-amber-300'
                      : 'text-gray-400'
                  }`}
                >
                  {message.length}/{MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || message.trim().length === 0}
              className="w-full modal-submit-button text-white text-[11px] font-bold py-4 rounded-xl tracking-[0.2em] uppercase shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? '...' : 'POST MESSAGE'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}