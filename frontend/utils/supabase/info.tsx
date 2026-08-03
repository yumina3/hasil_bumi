import { createClient } from '@supabase/supabase-js'

export const projectId = "ppxtvcmbebzcsjaesyqe"
export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweHR2Y21iZWJ6Y3NqYWVzeXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjE1MTcsImV4cCI6MjA5MTgzNzUxN30.SR3dXAAxg5jfSROL6oA7njFhsLW9zxvVjUQo60TwGZA"

export const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey)