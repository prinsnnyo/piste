import { Message } from './types'

export async function fetchMessages(
  lat: number,
  lng: number,
  radius = 5000
): Promise<Message[]> {
  try {
    const url = `/api/messages?lat=${lat}&lng=${lng}&radius=${radius}`
    console.debug('[lib/api] Fetching from:', url)
    const res = await fetch(url)
    
    if (!res.ok) {
      console.error('[lib/api] Fetch failed with status:', res.status)
      return []
    }
    
    const data = await res.json()
    console.debug('[lib/api] Received', Array.isArray(data) ? data.length : 0, 'messages')
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('[lib/api] Failed to fetch messages:', error)
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
    console.debug('[lib/api] postMessage response:', data)
    
    // Ensure the returned message has explicit lat/lng for immediate rendering
    const message: Message = {
      ...data,
      lat: lat,
      lng: lng
    }
    
    return message
  } catch (error) {
    console.error('Post failed:', error)
    return null
  }
}
