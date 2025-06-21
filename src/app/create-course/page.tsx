import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CreateCourseForm from './CreateCourseForm';

export default async function CreateCoursePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return <CreateCourseForm />;
}