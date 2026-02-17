import { useMapEvents } from 'react-leaflet'
import { LatLngTuple } from '@/lib/types'
import { calculateVisibleRadius } from '@/lib/helpers'

interface LocationClickHandlerProps {
  onLocationClick: (position: LatLngTuple) => void
  onMapMove: (center: LatLngTuple, radius: number) => void
}

export function LocationClickHandler({
  onLocationClick,
  onMapMove
}: LocationClickHandlerProps) {
  useMapEvents({
    click(e) {
      onLocationClick([e.latlng.lat, e.latlng.lng])
    },
    moveend(e) {
      const map = e.target
      const mapCenter = map.getCenter()
      const bounds = map.getBounds()
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      const radius = calculateVisibleRadius(mapCenter, ne, sw)
      onMapMove([mapCenter.lat, mapCenter.lng], radius)
    }
  })

  return null
}
