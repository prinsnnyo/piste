import { Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { renderToString } from 'react-dom/server'
import { Fragment } from 'react'
import { Message } from '@/lib/types'
import { getMessagePosition } from '@/lib/helpers'

const iconHtml = renderToString(<MapPin color="#fff" size={32} />)
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: iconHtml,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

interface MessageMarkersProps {
  messages: Message[]
}

export function MessageMarkers({ messages }: MessageMarkersProps) {
  console.debug('[MessageMarkers] Rendering', messages.length, 'messages')
  
  return (
    <>
      {messages.map((msg) => {
        const position = getMessagePosition(msg)
        console.debug('[MessageMarkers] Message', msg.id, 'at position', position)

        return (
          <Fragment key={msg.id}>
            {/* Glowing circle marker */}
            <CircleMarker
              center={position}
              radius={20}
              pathOptions={{
                fillColor: '#919191',
                fillOpacity: 0.8,
                color: '#ffffff',
                weight: 3,
                opacity: 1
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
          </Fragment>
        )
      })}
    </>
  )
}
