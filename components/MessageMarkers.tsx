import { Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { Message } from '@/lib/types'
import { getMessagePosition } from '@/lib/helpers'

const iconHtml = renderToString(<MapPin color="#fff" />)
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: iconHtml,
  iconSize: [24, 24],
  iconAnchor: [12, 24]
})

interface MessageMarkersProps {
  messages: Message[]
}

export function MessageMarkers({ messages }: MessageMarkersProps) {
  return (
    <>
      {messages.map((msg) => {
        const position = getMessagePosition(msg)

        return (
          <div key={msg.id}>
            {/* Glowing circle marker */}
            <CircleMarker
              center={position}
              radius={15}
              pathOptions={{
                fillColor: '#919191',
                fillOpacity: 0.6,
                color: '#919191',
                weight: 2,
                opacity: 0.8
              }}
              className="message-glow"
            />

            {/* Pin marker with popup */}
            <Marker position={position} icon={customIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="mb-2">{msg.content}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          </div>
        )
      })}
    </>
  )
}
