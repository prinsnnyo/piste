import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const messageId = id

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!messageId || !UUID_REGEX.test(messageId)) {
    return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('replies')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[API GET Replies] Supabase error:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    )
  }

  return NextResponse.json(data ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const messageId = id

  const POST_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!messageId || !POST_UUID_REGEX.test(messageId)) {
    return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
  }

  // --- Rate Limiting ---
  const postForwarded = request.headers.get('x-forwarded-for')
  const postIp = postForwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

  const postRateResult = checkRateLimit(`${postIp}:reply`)
  if (!postRateResult.allowed) {
    const retryAfter = Math.ceil((postRateResult.retryAfterMs ?? 60_000) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  let body: { content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const content = body.content?.trim()
  if (!content) {
    return NextResponse.json({ error: 'Reply content cannot be empty' }, { status: 400 })
  }
  
  if (content.length > 500) {
    return NextResponse.json({ error: 'Reply content cannot exceed 500 characters' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('replies')
      .insert({ message_id: messageId, content })
      .select()
      .single()

    if (error) {
      console.error('[API POST Reply] Supabase error:', error.message)
      return NextResponse.json(
        { error: 'Failed to post reply' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API POST Reply] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to post reply' },
      { status: 500 }
    )
  }
}
