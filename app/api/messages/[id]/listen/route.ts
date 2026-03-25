import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const messageId = id

  // --- Rate Limiting for Security ---
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

  const rateResult = checkRateLimit(`${ip}:listen`)
  if (!rateResult.allowed) {
    const retryAfter = Math.ceil((rateResult.retryAfterMs ?? 60_000) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!messageId || !UUID_REGEX.test(messageId)) {
    return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.rpc('increment_listeners', {
      message_id: messageId,
      listener_ip: ip
    })

    if (error) {
      console.error('[API Listen] RPC error:', error.message)
      return NextResponse.json(
        { error: 'Failed to update listen status' },
        { status: 500 }
      )
    }

    // RPC returns { success: false, reason: 'already_listened' } for duplicates
    const result = data as { success: boolean; reason?: string }
    if (!result?.success) {
      return NextResponse.json(
        { success: false, alreadyListened: true },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Listen] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to update listen status' },
      { status: 500 }
    )
  }
}
