// Delete reply API
async function deleteReply(messageId: string, replyId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/messages/${messageId}/replies/${replyId}`, { method: 'DELETE' });
    if (!res.ok) return false;
    return true;
  } catch {
    return false;
  }
}
import { Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { Fragment, useState, useEffect } from 'react'
import { Message } from '@/lib/types'
import { getMessagePosition } from '@/lib/helpers'
import { listenToMessage } from '@/lib/api'

// Different icon variants based on listen status
const createCustomIcon = (color: string) => {
  const iconHtml = renderToString(<MapPin color={color} size={32} />)
  return L.divIcon({
    className: 'custom-marker',
    html: iconHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })
}

const defaultIcon = createCustomIcon('#ffffff')
// Using green accent color for listened messages
const listenedIcon = createCustomIcon('#22c55e')

interface MessageMarkersProps {
  messages: Message[]
}

export function MessageMarkers({ messages: initialMessages }: MessageMarkersProps) {
    // For tracking which reply is being deleted
    const [deletingReply, setDeletingReply] = useState<{[key: string]: boolean}>({});
    // Delete reply handler
    const handleDeleteReply = async (messageId: string, replyId: string) => {
      setDeletingReply(prev => ({ ...prev, [replyId]: true }));
      try {
        const ok = await deleteReply(messageId, replyId);
        if (ok) {
          setMessages(prev => prev.map(m =>
            m.id === messageId
              ? { ...m, replies: (m.replies || []).filter(r => r.id !== replyId) }
              : m
          ));
        } else {
          alert('Failed to delete reply. Please check the network tab for errors.');
          console.error('Delete reply failed: API returned not ok');
        }
      } catch (err) {
        alert('An error occurred while deleting the reply.');
        console.error('Delete reply error:', err);
      }
      setDeletingReply(prev => ({ ...prev, [replyId]: false }));
    };
  // We manage local messages state to allow optimistic updates when a user listens
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set())

  // Load listened IDs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('listened_messages')
      if (stored) {
        try {
          const ids = JSON.parse(stored)
          if (Array.isArray(ids) && ids.every((i) => typeof i === 'string')) {
            setListenedIds(new Set(ids))
          } else {
            localStorage.removeItem('listened_messages')
          }
        } catch {
          localStorage.removeItem('listened_messages')
        }
      }
    }
  }, [])

  // Keep local messages in sync if props change (like when map moves and new messages load)
  // BUT preserve any replies we've already fetched so they don't disappear!
  useEffect(() => {
    setMessages(prev => {
      // Map over the new messages from the server
      return initialMessages.map(newMsg => {
        // Did we already have this message locally with replies?
        const existing = prev.find(p => p.id === newMsg.id);
        if (existing?.replies) {
          return { ...newMsg, replies: existing.replies };
        }
        return newMsg;
      });
    });
  }, [initialMessages])

  // --- Replies State ---
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({})
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({})

  // Fetch replies when a user clicks a marker to open the popup.
  // This is much more reliable than trying to sync everything on load.
  const handleMarkerClick = async (message: Message) => {
    if (message.replies) return; // already fetched

    const { fetchReplies } = await import('@/lib/api')
    const replies = await fetchReplies(message.id)

    setMessages(prev => prev.map(m =>
      m.id === message.id ? { ...m, replies } : m
    ))
  }

  const handleReplySubmit = async (e: React.FormEvent | React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()

    const text = replyInputs[id]?.trim()
    if (!text) return

    setIsReplying(prev => ({ ...prev, [id]: true }))

    const { postReply } = await import('@/lib/api')
    const added = await postReply(id, text)

    if (added) {
      // Clear input
      setReplyInputs(prev => ({ ...prev, [id]: '' }))
      // Optimistically add to local state
      setMessages(prev => prev.map(m =>
        m.id === id
          ? { ...m, replies: [...(m.replies || []), added] }
          : m
      ))
    }

    setIsReplying(prev => ({ ...prev, [id]: false }))
  }

  const handleListenClick = async (e: React.MouseEvent, id: string) => {
    e.preventDefault() // Prevent default action (which might interfere with map/popup)
    e.stopPropagation() // Don't let map swallow the click

    // If they already listened, do nothing (we only allow incrementing)
    if (listenedIds.has(id)) return

    // --- 1. Optimistic UI Update ---

    // Add to local set and localStorage
    const newSet = new Set(listenedIds).add(id)
    setListenedIds(newSet)
    localStorage.setItem('listened_messages', JSON.stringify(Array.from(newSet)))

    // Update local message list so it re-renders
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, listeners_count: (m.listeners_count || 0) + 1 } : m
    ))

    // --- 2. Backend Call ---
    await listenToMessage(id)
  }

  return (
    <>
      {messages.map((msg) => {
        const position = getMessagePosition(msg)

        // Determine if anyone is listening based on `listeners_count > 0` or if the user just listened locally.
        const isListened = (msg.listeners_count && msg.listeners_count > 0) || listenedIds.has(msg.id)

        // Active indicator for current user
        const userListened = listenedIds.has(msg.id)

        // Dynamic styling
        const markerColor = isListened ? '#22c55e' : '#ffffff'
        // Keep fill neutral/dark, glow is handled by CSS and stroke color
        const fillColor = isListened ? '#1c1d21' : '#919191'
        const icon = isListened ? listenedIcon : defaultIcon

        return (
          <Fragment key={msg.id}>
            {/* Glowing circle marker - changes color if listened */}
            <CircleMarker
              center={position}
              radius={isListened ? 25 : 20}
              pathOptions={{
                fillColor: fillColor,
                fillOpacity: isListened ? 0.9 : 0.8,
                color: markerColor,
                weight: isListened ? 4 : 3,
                opacity: 1
              }}
              className="message-glow"
            />

            {/* Pin marker with popup */}
            <Marker
              position={position}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(msg)
              }}
            >
              <Popup className="custom-dark-popup" closeButton={true}>
                <div className="bg-[var(--color-background)] text-[var(--color-foreground)] p-5 rounded-2xl w-[280px] shadow-2xl flex flex-col items-center relative z-50 max-h-[400px] border border-[var(--brand-mid)]">

                  {/* Close Button placed absolutely within the container */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Find the closest leaflet popup close button and click it to utilize Leaflet's built-in close mechanism.
                      const popupNode = (e.currentTarget as HTMLElement).closest('.leaflet-popup');
                      if (popupNode) {
                        const closeBtn = popupNode.querySelector('.leaflet-popup-close-button') as HTMLElement;
                        if (closeBtn) closeBtn.click();
                      }
                    }}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors cursor-pointer z-[60]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>

                  {/* Message Content */}
                  <div className="w-full pb-2">
                    <p className="text-center font-serif italic text-lg leading-relaxed mb-6 mt-2 text-white">
                      {msg.content}
                    </p>

                    {/* Replies Section */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="w-full mb-4 space-y-1.5 border-t border-gray-700 pt-3 flex flex-col items-start overflow-y-auto max-h-32">
                        {msg.replies.map(reply => (
                          <div
                            key={reply.id}
                            className="group bg-[var(--app-bg-mid)] px-3 py-1 rounded-lg w-fit max-w-full relative transition-all duration-200 hover:px-5 hover:py-2 focus-within:px-5 focus-within:py-2 border border-transparent hover:border-[var(--brand-mid)] shadow-sm hover:shadow-lg"
                          >
                            <p className="text-[13px] text-[var(--color-foreground)] leading-snug break-words pr-8 transition-colors duration-200 group-hover:text-[var(--brand-end)]">
                              {reply.content}
                            </p>
                            <button
                              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 text-red-400 hover:text-red-600 text-xs font-bold p-1 rounded-full bg-[var(--color-background)] shadow-md border border-[var(--brand-mid)]"
                              title="Delete reply"
                              onClick={() => handleDeleteReply(msg.id, reply.id)}
                              tabIndex={0}
                              disabled={!!deletingReply[reply.id]}
                            >
                              {deletingReply[reply.id] ? (
                                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6m-6 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" /></svg>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reply Input Field */}
                  <div className="relative w-full mb-4 mt-auto">
                    <input
                      type="text"
                      placeholder="Whisper a reply..."
                      value={replyInputs[msg.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [msg.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleReplySubmit(e, msg.id)
                      }}
                      className="w-full bg-[#2a2b30] text-gray-200 text-sm rounded-xl px-4 py-3 outline-none placeholder-gray-500 border border-transparent focus:border-gray-600 transition-colors pr-16"
                    />
                    <button
                      onClick={(e) => handleReplySubmit(e, msg.id)}
                      disabled={isReplying[msg.id]}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs font-bold tracking-wider transition-colors z-[60] cursor-pointer"
                    >
                      {isReplying[msg.id] ? '...' : 'REPLY'}
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleListenClick(e, msg.id)}
                    disabled={userListened}
                    className={`shrink-0 w-full text-white text-[11px] font-bold py-3 rounded-xl tracking-widest shadow-lg transition-all z-[60] cursor-pointer ${userListened
                        ? 'bg-[#3b3c40] text-[#22c55e] opacity-80 cursor-default'
                        : 'bg-[#494949] hover:bg-[#616161]'
                      }`}
                  >
                    {userListened ? 'I HEARD YOUR THOUGHT' : 'HEAR THIS THOUGHT'}
                  </button>

                  {/* Small listener count indicator if > 0 */}
                  {isListened && (
                    <div className="mt-3 text-[#22c55e] text-xs font-medium flex items-center justify-center w-full">
                      {Math.max((msg.listeners_count || 0), userListened ? 1 : 0)} heard this
                    </div>
                  )}

                </div>
              </Popup>
            </Marker>
          </Fragment>
        )
      })}
    </>
  )
}