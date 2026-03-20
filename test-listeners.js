import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testListeners() {
  // 1. Check if listeners_count column exists
  console.log("--- Checking messages table for listeners_count ---");
  const { data: msgs, error: msgErr } = await supabase.from('messages').select('id, content, listeners_count').limit(5);
  if (msgErr) {
    console.error("Error fetching messages:", msgErr);
  } else {
    console.log("Messages:", msgs);
  }

  // 2. Try the RPC
  console.log("\n--- Testing increment_listeners RPC ---");
  if (msgs && msgs.length > 0) {
    const testId = msgs[0].id;
    console.log("Testing with message:", testId);
    const { data: rpcData, error: rpcErr } = await supabase.rpc('increment_listeners', { message_id: testId });
    if (rpcErr) {
      console.error("RPC Error:", rpcErr);
    } else {
      console.log("RPC Success:", rpcData);
    }

    // 3. Check the count after
    const { data: after } = await supabase.from('messages').select('id, listeners_count').eq('id', testId).single();
    console.log("After increment:", after);
  }
}

testListeners();
