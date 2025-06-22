// src/app/api/save-course/route.ts

import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
// Gunakan validator yang sudah ada di proyek Anda
import { validateCurriculumStructure } from '@/utils/curriculumValidator';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const user = session.user;

  const requestBody = await request.json();

  // PERBAIKAN: Gunakan fungsi validasi manual, bukan Zod schema
  if (!validateCurriculumStructure(requestBody)) {
    return NextResponse.json({ error: 'Invalid curriculum data format' }, { status: 400 });
  }
  
  // Data sudah divalidasi, sekarang kita bisa menyebutnya 'curriculum'
  const curriculum = requestBody;

  const params = {
    p_user_id: user.id,
    p_course_title: curriculum.title,
    p_course_description: curriculum.description,
    p_modules: curriculum.modules, // Kirim langsung karena data sudah lengkap dari frontend
  };

  try {
    const { data: newCourseId, error: rpcError } = await supabase.rpc(
      'create_course_with_details',
      params
    );

    if (rpcError) {
      console.error('Supabase RPC Error:', rpcError);
      return NextResponse.json({ error: 'Failed to save course to database.', details: rpcError.message }, { status: 500 });
    }

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