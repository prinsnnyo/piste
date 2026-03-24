import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; replyId: string } }
) {
  const { id, replyId } = params
  if (!id || !replyId) {
    return NextResponse.json({ error: 'Message ID and Reply ID are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('replies')
    .delete()
    .eq('id', replyId)
    .eq('message_id', id)

  if (error) {
    console.error('[API DELETE Reply] Supabase error:', error.message)
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
