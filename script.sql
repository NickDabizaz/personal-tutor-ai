-- =================================================================
-- SKRIP FINAL UNTUK RESET DAN SETUP DATABASE (V6 - Fungsi Create Course)
-- Deskripsi: Skrip ini membersihkan dan membangun kembali seluruh struktur
-- database. Versi ini menambahkan fungsi transaksional `create_course_with_details`
-- untuk menyimpan kursus, modul, dan pelajaran secara atomik.
-- =================================================================

-- STEP 0: CLEAN UP (Urutan sudah diperbaiki)
-- Membersihkan semua objek database sebelum membuat ulang untuk memastikan state yang bersih.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_course_with_details(uuid, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP TABLE IF EXISTS public.quiz_attempt_answers CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.question_options CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.chat_histories CASCADE;
DROP TABLE IF EXISTS public.lesson_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;


-- =================================================================
-- STEP 1: BUAT FUNGSI-FUNGSI TRIGGER & PROSEDUR
-- =================================================================

-- Fungsi untuk memperbarui kolom `updated_at` secara otomatis.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fungsi untuk membuat baris profil baru di `public.users` setiap kali user baru mendaftar di `auth.users`.
-- Dijalankan dengan hak akses superuser (SECURITY DEFINER) untuk memastikan bisa menyisipkan data.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Fungsi untuk menyimpan kursus, modul, dan pelajaran dalam satu transaksi atomik.
CREATE OR REPLACE FUNCTION public.create_course_with_details(
    p_user_id uuid,
    p_course_title text,
    p_course_description text,
    p_modules jsonb -- Format: '[{"title": "...", "module_number": 1, "lessons": [{"title": "...", "lesson_number": 1, "content": "..."}, ...]}, ...]'
)
RETURNS uuid -- Mengembalikan ID kursus yang baru dibuat
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_course_id uuid;
    v_module_id uuid;
    module_record jsonb;
    lesson_record jsonb;
BEGIN
    -- 1. Buat entri di tabel courses dan dapatkan ID-nya
    INSERT INTO public.courses (user_id, title, description)
    VALUES (p_user_id, p_course_title, p_course_description)
    RETURNING id INTO v_course_id;

    -- 2. Loop melalui setiap modul dalam data JSON
    FOR module_record IN SELECT * FROM jsonb_array_elements(p_modules)
    LOOP
        -- 3. Buat entri di tabel modules dan dapatkan ID-nya
        INSERT INTO public.modules (course_id, title, module_number)
        VALUES (
            v_course_id,
            module_record->>'title',
            (module_record->>'module_number')::integer
        )
        RETURNING id INTO v_module_id;

        -- 4. Loop melalui setiap pelajaran dalam modul saat ini
        FOR lesson_record IN SELECT * FROM jsonb_array_elements(module_record->'lessons')
        LOOP
            -- 5. Buat entri di tabel lessons
            INSERT INTO public.lessons (module_id, title, lesson_number, content)
            VALUES (
                v_module_id,
                lesson_record->>'title',
                (lesson_record->>'lesson_number')::integer,
                lesson_record->>'content'
            );
        END LOOP;
    END LOOP;

    -- 6. Kembalikan ID kursus yang baru dibuat sebagai konfirmasi
    RETURN v_course_id;
END;
$$;


-- =================================================================
-- STEP 2: BUAT SEMUA TABEL
-- =================================================================

CREATE TABLE public.users (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.courses (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.modules (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_number integer NOT NULL,
  title text NOT NULL,
  objective_1 text,
  objective_2 text,
  objective_3 text,
  total_lessons integer,
  estimated_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.lessons (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  lesson_number integer NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT true,
  completed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE public.chat_histories (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  messages_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.quizzes (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE UNIQUE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.question_options (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score integer,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.quiz_attempt_answers (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  chosen_option_id uuid NOT NULL REFERENCES public.question_options(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);


-- =================================================================
-- STEP 3: PASANG SEMUA TRIGGER
-- =================================================================

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
CREATE TRIGGER on_users_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_courses_update BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_modules_update BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_lessons_update BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_chat_histories_update BEFORE UPDATE ON public.chat_histories FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_quizzes_update BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_quiz_questions_update BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_question_options_update BEFORE UPDATE ON public.question_options FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- =================================================================
-- STEP 4: AKTIFKAN RLS DAN BUAT POLICIES
-- =================================================================

-- Kebijakan untuk tabel: users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Kebijakan untuk tabel: courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own courses." ON public.courses FOR ALL USING (auth.uid() = user_id);

-- Kebijakan untuk tabel: modules
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage modules of their own courses." ON public.modules FOR ALL USING ((SELECT user_id FROM public.courses WHERE id = course_id) = auth.uid());

-- Kebijakan untuk tabel: lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage lessons of their own courses." ON public.lessons FOR ALL USING ((SELECT user_id FROM public.courses WHERE id = (SELECT course_id FROM public.modules WHERE id = module_id)) = auth.uid());

-- Kebijakan untuk tabel: lesson_progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own lesson progress." ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);

-- Kebijakan untuk tabel: chat_histories
ALTER TABLE public.chat_histories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own chat histories." ON public.chat_histories FOR ALL USING (auth.uid() = user_id);

-- Kebijakan untuk tabel: quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage quizzes of their own courses." ON public.quizzes FOR ALL USING ((SELECT user_id FROM public.courses WHERE id = course_id) = auth.uid());

-- Kebijakan untuk tabel: quiz_questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view quiz questions." ON public.quiz_questions FOR SELECT USING (auth.role() = 'authenticated');

-- Kebijakan untuk tabel: question_options
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view question options." ON public.question_options FOR SELECT USING (auth.role() = 'authenticated');

-- Kebijakan untuk tabel: quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own quiz attempts." ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- Kebijakan untuk tabel: quiz_attempt_answers
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own attempt answers." ON public.quiz_attempt_answers FOR ALL USING ((SELECT user_id FROM public.quiz_attempts WHERE id = attempt_id) = auth.uid());