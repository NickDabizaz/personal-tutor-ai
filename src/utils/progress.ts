// Definisikan struktur data progres yang baru dan lebih detail
interface LessonProgress {
  [lessonIndex: number]: boolean; // e.g., { 0: true, 1: false }
}

interface ModuleProgress {
  lessons: LessonProgress;
}

interface CourseProgress {
  [moduleId: string]: ModuleProgress;
}

// Fungsi untuk mendapatkan data progres sebuah kursus
export function getCourseProgress(courseTitle: string): CourseProgress {
  if (typeof window === "undefined") return {};
  const progress = localStorage.getItem(`progress_${courseTitle}`);
  return progress ? JSON.parse(progress) : {};
}

// Fungsi untuk memperbarui status selesai sebuah lesson
export function updateLessonCompletion(
  courseTitle: string,
  moduleId: number,
  lessonIndex: number,
  completed: boolean
) {
  const progress = getCourseProgress(courseTitle);

  // Inisialisasi objek modul jika belum ada
  if (!progress[moduleId]) {
    progress[moduleId] = { lessons: {} };
  }

  progress[moduleId].lessons[lessonIndex] = completed;
  localStorage.setItem(`progress_${courseTitle}`, JSON.stringify(progress));
}

// Fungsi untuk menghitung progres sebuah modul (dalam persen)
export function calculateModuleProgress(
  moduleProgress: ModuleProgress | undefined,
  totalLessons: number
): number {
  if (!moduleProgress || totalLessons === 0) {
    return 0;
  }
  const completedLessons = Object.values(moduleProgress.lessons).filter(
    (isDone) => isDone
  ).length;
  return Math.round((completedLessons / totalLessons) * 100);
}

// Fungsi untuk menghitung persentase progres keseluruhan course
export function calculateCourseProgress(
  courseTitle: string, 
  modules: { id: number; lessons: { title: string; content?: string }[] }[]
): number {
  if (modules.length === 0) return 0;
  
  const progress = getCourseProgress(courseTitle);
  let totalLessons = 0;
  let completedLessons = 0;
  
  modules.forEach(module => {
    totalLessons += module.lessons?.length || 0;
    const moduleProgressData = progress[module.id];
    if (moduleProgressData) {
      completedLessons += Object.values(moduleProgressData.lessons).filter(
        (isDone) => isDone
      ).length;
    }
  });
  
  return totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
}
