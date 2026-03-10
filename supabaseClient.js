// src/supabaseClient.js
// ─── Supabase connection client ───────────────────────────────────────────────
// All credentials come from environment variables only.
// Usage: import { supabase } from './supabaseClient'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false },
})

// ─── Connection test ──────────────────────────────────────────────────────────
export async function testConnection() {
  const { data, error } = await supabase.rpc('ping') // SELECT 1
  if (error) {
    console.error('Supabase connection error:', error.message)
    return false
  }
  console.log('✓ Supabase connected')
  return true
}
