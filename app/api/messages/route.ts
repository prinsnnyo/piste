import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const radius = parseInt(searchParams.get('radius') || '100')

  const { data, error } = await supabase.rpc('messages_nearby', {
    center_lat: lat,
    center_lng: lng,
    radius_meters: radius
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const { content, lat, lng } = await request.json()
    
    const { data, error } = await supabase
      .from('messages')
      .insert({ content, location: `POINT(${lng} ${lat})` })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 })
  }
}
