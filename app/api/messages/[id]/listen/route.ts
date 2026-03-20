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

  const rateResult = checkRateLimit(ip)
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

  if (!messageId) {
    return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
  }

  try {
    // Increment the listeners_count for the specific message
    // We use Supabase RPC to safely increment the counter atomically
    const { error } = await supabase.rpc('increment_listeners', {
      message_id: messageId
    })

    if (error) {
      // Fallback if RPC doesn't exist: fetch and update (less safe for concurrency, but works if RPC isn't created yet)
      console.error('[API Listen] RPC error (fallback to standard update):', error.message)
      
      const { data: msgInfo } = await supabase
        .from('messages')
        .select('listeners_count')
        .eq('id', messageId)
        .single()
        
      if (msgInfo) {
        await supabase
          .from('messages')
          .update({ listeners_count: (msgInfo.listeners_count || 0) + 1 })
          .eq('id', messageId)
      }
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
