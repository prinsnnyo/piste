import { Message, LatLngTuple } from './types'

/**
 * Parse message location from multiple formats:
 * - GeoJSON: { type: 'Point', coordinates: [lng, lat] }
 * - WKT string: 'POINT(lng lat)'
 * - Direct lat/lng properties
 */
export function getMessagePosition(message: Message): LatLngTuple {
  console.log('[getMessagePosition] Parsing message', message.id, ':', {
    location: message.location,
    lat: message.lat,
    lng: message.lng
  })
  
  // Try GeoJSON format
  if (
    message.location &&
    typeof message.location === 'object' &&
    'coordinates' in message.location &&
    Array.isArray(message.location.coordinates)
  ) {
    const [lng, lat] = message.location.coordinates
    console.log('[getMessagePosition] GeoJSON format ->', [lat, lng])
    return [lat, lng]
  }

  // Try WKT string format
  if (message.location && typeof message.location === 'string') {
    const match = message.location.match(/POINT\(([^ ]+) ([^ )]+)\)/)
    if (match) {
      const result: LatLngTuple = [parseFloat(match[2]), parseFloat(match[1])]
      console.log('[getMessagePosition] WKT format ->', result)
      return result
    }
  }

  // Fallback to direct lat/lng properties
  if (message.lat != null && message.lng != null) {
    console.log('[getMessagePosition] Direct lat/lng ->', [message.lat, message.lng])
    return [message.lat, message.lng]
  }

  // Default fallback (should not happen)
  console.warn('[getMessagePosition] No valid location found! Returning [0,0]')
  return [0, 0]
}

/**
 * Calculate visible radius based on map viewport bounds
 */
export function calculateVisibleRadius(
  mapCenter: L.LatLng,
  northEast: L.LatLng,
  southWest: L.LatLng
): number {
  const distToNE = mapCenter.distanceTo(northEast)
  const distToSW = mapCenter.distanceTo(southWest)
  return Math.max(distToNE, distToSW, 5000)
}
