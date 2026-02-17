export interface Message {
  id: string
  content: string
  created_at: string
  // location may be returned in different shapes from Supabase: GeoJSON, object, or WKT string
  location?: { type?: 'Point'; coordinates?: number[] } | string
  lat?: number
  lng?: number
}

export type LatLngTuple = [number, number]
