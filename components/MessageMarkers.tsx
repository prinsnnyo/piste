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
              <Popup className="custom-dark-popup" closeButton={false}>
                {/* Main Dark Container */}
                <div className="bg-[#1c1d21] text-gray-200 p-5 rounded-2xl w-[280px] shadow-2xl flex flex-col items-center">
                
                  {/* Message Content */}
                  <p className="text-center font-serif italic text-lg leading-relaxed mb-6 text-white">
                    {msg.content}
                  </p>

                  {/* Reply Input Field */}
                  <div className="relative w-full mb-4">
                    <input 
                      type="text" 
                      placeholder="Whisper a reply..." 
                      className="w-full bg-[#2a2b30] text-gray-200 text-sm rounded-xl px-4 py-3 outline-none placeholder-gray-500 border border-transparent focus:border-gray-600 transition-colors"
                    />         
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs font-bold tracking-wider transition-colors">
                      REPLY
                    </button>
                  </div>

                  <button className="w-full bg-[#494949] hover:bg-[#616161] text-white text-[11px] font-bold py-3 rounded-xl tracking-widest shadow-lg transition-all">
                    YOU ARE LISTENING
                  </button>

                </div>
              </Popup>
            </Marker>
          </Fragment>
        )
      })}
    </>
  )}