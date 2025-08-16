import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://aewosvhgsgqosaitwhph.supabase.co" as string | undefined
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld29zdmhnc2dxb3NhaXR3aHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MzEwNzgsImV4cCI6MjA3MDMwNzA3OH0.KakadfxzYD1y2-918o1CuDFicuegUZH0q9_HRWU4UKo" as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw to keep build working; runtime will warn instead
  // eslint-disable-next-line no-console
  console.warn('Supabase URL or Anon Key is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')


