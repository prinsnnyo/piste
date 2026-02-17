import { Message } from './types'

export async function fetchMessages(
  lat: number,
  lng: number,
  radius = 5000
): Promise<Message[]> {
  try {
    const res = await fetch(`/api/messages?lat=${lat}&lng=${lng}&radius=${radius}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return []
  }
}

export async function postMessage(
  content: string,
  lat: number,
  lng: number
): Promise<boolean> {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, lat, lng })
    })
    return res.ok
  } catch (error) {
    console.error('Post failed:', error)
    return false
  }
}
