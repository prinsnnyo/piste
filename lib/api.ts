import { Message } from './types'

export async function fetchMessages(
  lat: number,
  lng: number,
  radius = 5000
): Promise<Message[]> {
  try {
    const url = `/api/messages?lat=${lat}&lng=${lng}&radius=${radius}`
    const res = await fetch(url)

    if (!res.ok) return []

    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function postMessage(
  content: string,
  lat: number,
  lng: number
): Promise<Message | null> {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, lat, lng })
    })

    if (!res.ok) return null
    const data = await res.json()

    // Ensure the returned message has explicit lat/lng for immediate rendering
    const message: Message = {
      ...data,
      lat: lat,
      lng: lng
    }

    return message
  } catch {
    return null
  }
}
