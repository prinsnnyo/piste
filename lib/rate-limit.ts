/**
 * Simple in-memory sliding-window rate limiter.
 * Limits each IP to a configurable number of requests within a time window.
 *
 * Note: State is per-process and resets on cold starts.
 * For distributed rate limiting, replace with Upstash Redis.
 */

const MAX_REQUESTS = 5
const WINDOW_MS = 60_000 // 60 seconds

const requestLog = new Map<string, number[]>()

// Periodically clean up stale entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60_000 // every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS
  for (const [ip, timestamps] of requestLog) {
    const filtered = timestamps.filter((t) => t > cutoff)
    if (filtered.length === 0) {
      requestLog.delete(ip)
    } else {
      requestLog.set(ip, filtered)
    }
  }
}, CLEANUP_INTERVAL_MS)

/**
 * Check rate limit for a given key.
 * Pass a namespaced key to keep limits separate per endpoint:
 *   checkRateLimit(`${ip}:post-message`)
 *   checkRateLimit(`${ip}:listen`)
 *   checkRateLimit(`${ip}:reply`)
 */
export function checkRateLimit(key: string): {
  allowed: boolean
  remaining: number
  retryAfterMs?: number
} {
  const now = Date.now()
  const cutoff = now - WINDOW_MS

  const timestamps = (requestLog.get(key) || []).filter((t) => t > cutoff)

  if (timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = timestamps[0]
    const retryAfterMs = oldestInWindow + WINDOW_MS - now
    return { allowed: false, remaining: 0, retryAfterMs }
  }

  timestamps.push(now)
  requestLog.set(key, timestamps)

  return { allowed: true, remaining: MAX_REQUESTS - timestamps.length }
}
