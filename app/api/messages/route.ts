import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const radius = parseInt(searchParams.get('radius') || '100')

  console.log('[API GET] Fetching messages:', { lat, lng, radius })

  // Try to use RPC that extracts coordinates
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('messages_nearby_with_coords', {
      center_lat: lat,
      center_lng: lng,
      radius_meters: radius
    })
  
  if (!rpcError && rpcData) {
    console.log('[API GET] Got', rpcData.length, 'messages with coords from RPC')
    return NextResponse.json(rpcData)
  }
  
  console.log('[API GET] RPC not available, returning empty array. Please run supabase-fix.sql')
  console.log('[API GET] Error:', rpcError?.message)
  
  // Return empty array until the SQL function is created
  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  try {
    const { content, lat, lng } = await request.json()
    console.log('[API POST] Creating message:', { content, lat, lng })
    
    const { data, error } = await supabase
      .from('messages')
      .insert({ content, location: `POINT(${lng} ${lat})` })
      .select()
      .single()

    if (error) {
      console.error('[API POST] Supabase error:', error)
      throw error
    }
    console.log('[API POST] Success, created:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API POST] Failed:', error)
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 })
  }
}
