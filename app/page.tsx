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
    fetchMessages(center[0], center[1], 5000).then(setMessages)
  }, [])

  const handleLocationClick = useCallback((position: LatLngTuple) => {
    setCenter(position)
    setShowForm(true)
  }, [])

  const handleMapMove = useCallback((mapCenter: LatLngTuple, radius: number) => {
    fetchMessages(mapCenter[0], mapCenter[1], radius).then(setMessages)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSubmitting(true)
    const success = await postMessage(newMessage, center[0], center[1])
    
    if (success) {
      setNewMessage('')
      setShowForm(false)
      const updatedMessages = await fetchMessages(center[0], center[1], 5000)
      setMessages(updatedMessages)
    }
    
    setIsSubmitting(false)
  }

  return (
    <main className="min-h-screen app-bg">
      <PageHeader />
      
      <MapView
        center={center}
        messages={messages}
        onLocationClick={handleLocationClick}
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
