import { MapContainer, TileLayer } from 'react-leaflet'
import { Message, LatLngTuple } from '@/lib/types'
import { LocationClickHandler } from './LocationClickHandler'
import { MessageMarkers } from './MessageMarkers'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  center: LatLngTuple
  messages: Message[]
  onLocationClick: (position: LatLngTuple) => void
  onMapMove: (center: LatLngTuple, radius: number) => void
}

export function MapView({
  center,
  messages,
  onLocationClick,
  onMapMove
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      minZoom={6}
      maxZoom={100}
      className="w-full h-screen"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <LocationClickHandler
        onLocationClick={onLocationClick}
        onMapMove={onMapMove}
      />
      <MessageMarkers messages={messages} />
    </MapContainer>
  )
}
