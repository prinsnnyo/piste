'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Message, LatLngTuple } from '@/lib/types'
import { fetchMessages, postMessage } from '@/lib/api'
import { PageHeader } from '@/components/PageHeader'
import { MessageFormModal } from '@/components/MessageFormModal'

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import('@/components/MapView').then((mod) => mod.MapView),
  { ssr: false }
)

export default function FreedomWall() {
  const [center, setCenter] = useState<LatLngTuple>([8.475, 124.646]) // Cagayan de Oro
  const [messages, setMessages] = useState<Message[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Leaflet setup - configure icons on client side only
  useEffect(() => {
    if (typeof window === 'undefined') return

    ;(async () => {
      try {
        const L = await import('leaflet')
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
      } catch {
        // Ignore Leaflet initialization errors
      }
    })()
  }, [])

  // Load initial messages
  useEffect(() => {
    fetchMessages(center[0], center[1], 10000).then(setMessages)
  }, [])


  // Map click: move center and open form
  const handleLocationClick = useCallback((position: LatLngTuple) => {
    setCenter(position)
    setShowForm(true)
  }, [])

  // Search: only move center
  const handleLocationSearch = useCallback((position: LatLngTuple) => {
    setCenter(position)
    // Do NOT open form
  }, [])

  const handleMapMove = useCallback((mapCenter: LatLngTuple, radius: number) => {
    // Use minimum radius of 10km to ensure markers stay visible when zoomed out
    const fetchRadius = Math.max(radius, 10000)
    fetchMessages(mapCenter[0], mapCenter[1], fetchRadius).then(setMessages)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSubmitting(true)
    const created = await postMessage(newMessage, center[0], center[1])

    if (created) {
      // Immediately add the created message to UI for instant feedback
      setMessages((prev) => [created, ...prev])
      setNewMessage('')
      setShowForm(false)
      // Refresh in background to sync server state with larger radius
      fetchMessages(center[0], center[1], 10000).then(setMessages)
    }

    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen app-bg">
      <PageHeader />
      
      {/* Debug info */}
      <div className="fixed top-25 left-4 z-[2000] bg-black/80 text-white p-2 rounded text-xs">
        Messages loaded: {messages.length}
      </div>
      

      <MapView
        center={center}
        messages={messages}
        onLocationClick={handleLocationClick}
        onLocationSearch={handleLocationSearch}
        onMapMove={handleMapMove}
      />

      <MessageFormModal
        show={showForm}
        message={newMessage}
        onMessageChange={setNewMessage}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </main>
  )
}
