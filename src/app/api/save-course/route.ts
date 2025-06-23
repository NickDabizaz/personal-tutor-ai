// Lokasi: src/app/api/save-course/route.ts

import { createClient } from '@/utils/supabase/server'; // <-- Ganti import ini
import { NextRequest, NextResponse } from 'next/server';
import { validateCurriculumStructure } from '@/utils/curriculumValidator';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // Gunakan pola yang sama dengan auth/callback untuk membuat client
  const cookieStore = cookies()
  const supabase = await createClient(); // <-- Ganti cara pemanggilan ini

  // 1. Verifikasi autentikasi pengguna
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const user = session.user;

  // 2. Ambil dan validasi data dari body request
  const requestBody = await request.json();
  if (!validateCurriculumStructure(requestBody)) {
    return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
  }
  const curriculum = requestBody;

  // 3. Siapkan parameter untuk fungsi database
  const params = {
    p_user_id: user.id,
    p_course_title: curriculum.title,
    p_course_description: curriculum.description,
    p_modules: curriculum.modules
  };

  try {
    // 4. Panggil fungsi RPC di Supabase
    const { data: newCourseId, error: rpcError } = await supabase.rpc(
      'create_course_with_details',
      params
    );

    if (rpcError) {
      console.error('Supabase RPC Error:', rpcError);
      return NextResponse.json({ error: 'Failed to save course to database.', details: rpcError.message }, { status: 500 });
    }

    // 5. Berhasil! Kembalikan ID kursus dan judulnya
    return NextResponse.json({ 
      message: 'Course saved successfully!',
      courseId: newCourseId,
      courseTitle: curriculum.title,
    }, { status: 200 });

  } catch (e) {
    const error = e as Error;
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}