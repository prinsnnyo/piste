import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { parseMessageInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limit'

const MAX_RADIUS = 50_000 // 50 km cap

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  let radius = parseInt(searchParams.get('radius') || '5000', 10)

  // Validate query params
  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    return NextResponse.json(
      { error: 'Invalid query parameters: lat, lng, and radius must be numbers' },
      { status: 400 }
    )
  }

  // Clamp radius to prevent excessively large spatial queries
  radius = Math.min(Math.max(radius, 100), MAX_RADIUS)

  const { data, error } = await supabase.rpc('messages_nearby_with_coords', {
    center_lat: lat,
    center_lng: lng,
    radius_meters: radius,
  })

  if (error) {
    console.error('[API GET] Supabase RPC error:', error.message)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
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

  // --- Parse & Validate Body ---
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const parsed = parseMessageInput(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.errors },
      { status: 400 }
    )
  }

  const { content, lat, lng } = parsed.data

  // --- Insert into Supabase ---
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({ content, location: `POINT(${lng} ${lat})` })
      .select()
      .single()

    if (error) {
      console.error('[API POST] Supabase error:', error.message)
      return NextResponse.json(
        { error: 'Failed to post message' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API POST] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to post message' },
      { status: 500 }
    )
  }
}
