export interface Reply {
  id: string
  message_id: string
  content: string
  created_at: string
}

export interface Message {
  id: string
  content: string
  created_at: string
  // location may be returned in different shapes from Supabase: GeoJSON, object, or WKT string
  location?: { type?: 'Point'; coordinates?: number[] } | string
  lat?: number
  lng?: number
  listeners_count?: number
  replies?: Reply[]
}

export type LatLngTuple = [number, number]
