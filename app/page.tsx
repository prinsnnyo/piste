'use client'
import { useState, useCallback, useEffect } from 'react'
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents 
} from 'react-leaflet'
// Leaflet accesses `window` during module initialization. Import it dynamically
// inside a client-only effect to avoid server-side `window is not defined` errors.
import { MessageSquare, Plus, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix default markers
// Perform Leaflet-specific runtime setup on the client only (done inside component)


interface Message {
  id: string
  content: string
  created_at: string
  // location may be returned in different shapes from Supabase: GeoJSON, object, or WKT string
  location?: { type?: 'Point'; coordinates?: number[] } | string
  lat?: number
  lng?: number
}

export default function FreedomWall() {
  const [center, setCenter] = useState<[number, number]>([8.475, 124.646]) // Cagayan de Oro
  const [messages, setMessages] = useState<Message[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Dark map tiles
  const [tileUrl, setTileUrl] = useState('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
  const [attribution, setAttribution] = useState('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>')

  // Leaflet references `window` during module evaluation; import and configure it only on the client.
  useEffect(() => {
    if (typeof window === 'undefined') return

    ;(async () => {
      try {
        const L = await import('leaflet')
        // remove private getter then set icon URLs
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })
      } catch {
        // swallow: if leaflet can't load in some environment, avoid crashing the app
      }
    })()
  }, [])

  // Theme detection for map tiles
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const lightUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    const lightAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    const darkAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = (isDark: boolean) => {
      setTileUrl(isDark ? darkUrl : lightUrl)
      setAttribution(isDark ? darkAttr : lightAttr)
    }
    
    applyTheme(true) // Always use dark since we have dark palette
    mq.addEventListener('change', (e) => applyTheme(e.matches))
    return () => mq.removeEventListener('change', (e) => applyTheme(e.matches))
  }, [])

  const fetchMessages = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/messages?lat=${lat}&lng=${lng}&radius=100`)
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }, [])

  const LocationClickHandler = () => {
    const map = useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng
        setCenter([lat, lng])
        // ensure map recenters to the clicked location
        map.setView(e.latlng)
        fetchMessages(lat, lng)
        setShowForm(true)
      },
      zoomend: () => {
        const mapCenter = map.getCenter()
        fetchMessages(mapCenter.lat, mapCenter.lng)
      }
    })
    return null
  }

  const postMessage = async () => {
    if (!newMessage.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          lat: center[0],
          lng: center[1]
        })
      })
      
      if (res.ok) {
        setNewMessage('')
        await fetchMessages(center[0], center[1])
      }
    } catch (error) {
      console.error('Post failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(center[0], center[1])
  }, [center, fetchMessages])

  return (
    <main className="min-h-screen app-bg">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black brand-gradient-text mb-4">
            Freedom Wall
          </h1>
          <p className="text-xl muted-text max-w-2xl mx-auto">
            Drop anonymous messages anywhere on the map. Click to read/write!
          </p>
        </div>

        <div className="relative card-bg rounded-3xl shadow-2xl overflow-hidden card-border">
          <MapContainer
            center={center}
            zoom={16}
            style={{ height: '70vh', width: '100%' }}
            className="rounded-3xl"
          >
            <TileLayer
              attribution={attribution}
              url={tileUrl}
            />
            <LocationClickHandler />
            
            {messages.map((msg) => {
              // derive marker position from message if available, otherwise fall back to center
              const getPos = (): [number, number] => {
                // direct lat/lng fields
                if (typeof msg.lat === 'number' && typeof msg.lng === 'number') return [msg.lat, msg.lng]
                // GeoJSON { type: 'Point', coordinates: [lng, lat] }
                if (typeof msg.location !== 'string' && msg.location && msg.location.type === 'Point' && Array.isArray(msg.location.coordinates)) {
                  const [lng, lat] = msg.location.coordinates
                  return [lat, lng]
                }
                // WKT string 'POINT(lng lat)'
                if (typeof msg.location === 'string') {
                  const m = msg.location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/)
                  if (m) return [parseFloat(m[2]), parseFloat(m[1])]
                }
                return center
              }

              const position = getPos()

              return (
                <Marker key={msg.id} position={position}>
                  <Popup className="max-w-xs">
                      <div className="p-4">
                        <p className="font-semibold mb-2 whitespace-pre-wrap">
                        {msg.content}
                      </p>
                        <p className="text-xs muted-text">
                        {new Date(msg.created_at).toLocaleString('en-PH')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>

        {/* Floating message form card */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-lg card-bg card-border shadow-2xl rounded-2xl p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 brand-accent" />
                <h3 className="text-lg font-semibold">Anonymous Message</h3>
                <button
                  onClick={() => setShowForm(false)}
                  aria-label="Close message form"
                  className="ml-auto p-1 hover:opacity-90 rounded-lg"
                >
                  <X className="w-5 h-5 muted-text" />
                </button>
              </div>
              
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts anonymously... (max 280 chars)"
                className="w-full p-4 border rounded-xl resize-none h-24 focus:outline-none focus-ring"
                maxLength={280}
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={postMessage}
                  disabled={!newMessage.trim() || loading}
                  aria-label="Post anonymous message"
                  className="flex-1 brand-button text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? 'Posting...' : (
                    <>
                      <Plus className="w-5 h-5" />
                      Post Message
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs muted-text mt-2 text-right">
                {newMessage.length}/280
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-sm muted-text mt-8">
          Messages within 100m • Fully anonymous • Powered by Supabase + Bun
        </p>
      </div>
    </main>
  )
}
