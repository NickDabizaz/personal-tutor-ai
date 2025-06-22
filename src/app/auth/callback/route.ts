// Lokasi: src/app/auth/callback/route.ts

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // --- PERUBAHAN DI SINI ---
  // Default redirect sekarang ke halaman pembuatan kursus.
  const next = searchParams.get('next') ?? '/create-course' 

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Jika ada error, arahkan ke halaman error.
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}