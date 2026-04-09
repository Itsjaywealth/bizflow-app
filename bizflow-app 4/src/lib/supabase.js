import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://tcvodiobdznhpbaxgdly.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdm9kaW9iZHpuaHBiYXhnZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjI2NzcsImV4cCI6MjA5MTI5ODY3N30.WnBKb2gPKSxpu01LBYDZpkvwg6mJ6SlLxW2TRiTZkrg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
