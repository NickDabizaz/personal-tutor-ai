// src/app/generated-curriculum/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
import { getCourseProgress, calculateModuleProgress, calculateCourseProgress } from "@/utils/progress";
import { getCurriculumFromStorage, Curriculum } from "@/utils/curriculumValidator";
import LoadingOverlay from "@/Components/LoadingOverlay";

// ... (Interface dan fungsi helper yang sudah ada seperti CurriculumCard & formatMinutes tetap di sini) ...

export default function GeneratedCurriculumPage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // State untuk menyimpan
  const [courseProgress, setCourseProgress] = useState<{ [key: string]: { lessons: { [key: number]: boolean } } }>({});
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressVersion, setProgressVersion] = useState(0);

  // Fungsi BARU untuk menyimpan kursus
  const handleSaveAndStart = async () => {
    if (!curriculum) {
      alert("No curriculum data to save.");
      return;
    }
    setIsSaving(true);
    
    // PERBAIKAN PENTING: Menambahkan module_number dan lesson_number sebelum mengirim
    const curriculumToSave = {
      ...curriculum,
      modules: curriculum.modules.map((module, moduleIndex) => ({
        ...module,
        module_number: module.id, // Menggunakan ID sebagai nomor modul
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          lesson_number: lessonIndex + 1, // Menambahkan nomor pelajaran
        })),
      })),
    };

    try {
      const response = await fetch('/api/save-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curriculumToSave),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save the course.');
      
      sessionStorage.removeItem('generatedCurriculum');
      sessionStorage.removeItem('answers');
      
      const firstModule = curriculumToSave.modules[0];
      const encodedTitle = encodeURIComponent(result.courseTitle);
      
      // Redirect ke halaman modul pertama
      router.push(`/course/${encodedTitle}/module/${firstModule.id}`);

    } catch (error) {
      console.error("Error saving course:", error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    const curriculumData = getCurriculumFromStorage();
    if (curriculumData) {
      setCurriculum(curriculumData);
      const progressData = getCourseProgress(curriculumData.title);
      setCourseProgress(progressData);
      const percentage = calculateCourseProgress(curriculumData.title, curriculumData.modules);
      setProgressPercentage(percentage);
    } else {
      console.log("No valid curriculum found in sessionStorage, checking database...");
      // TODO: Nanti di sini kita bisa tambahkan logika untuk fetch kursus dari DB
      // Untuk sekarang, kita anggap ini adalah alur setelah pembuatan
      // Jika tidak ada di session, mungkin user refresh halaman, kita tidak redirect
    }
    setIsLoading(false);
  }, [router, progressVersion]);
  
  // ... (sisa useEffect lainnya tetap sama) ...

  if (isLoading) {
    return <LoadingOverlay message="Checking your curriculum..." />;
  }

  if (isSaving) {
    return <LoadingOverlay message="Saving your new course to your profile..." />;
  }

  // Jika tidak ada kurikulum sama sekali (baik dari session atau DB nantinya)
  if (!curriculum) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
        <AppHeader />
        <main className="flex-grow flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">No Active Curriculum</h2>
          <p className="text-gray-400">You have not generated a new curriculum.</p>
          <Link href="/create-course" className="mt-4 px-6 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg">
            Create a New Course
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Tampilan asli Anda dikembalikan ke sini
  return (
    <main className="font-sans bg-gray-950 text-gray-100 antialiased selection:bg-amber-400/30">
      <AppHeader />
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="mb-12">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-white">{curriculum.title}</h2>
              <span className="text-lg font-semibold text-amber-400">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-sm text-gray-400 mt-3">{curriculum.description}</p>
        </div>
        
        {/* Tombol Aksi Baru */}
        <div className="mb-12 p-6 bg-gray-900 border border-amber-500/30 rounded-xl text-center">
            <h3 className="text-xl font-semibold text-white">Your new course is ready!</h3>
            <p className="text-gray-400 mt-2 mb-4">Save this course to your profile to track progress and access it anytime.</p>
            <button
                onClick={handleSaveAndStart}
                className="px-8 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors duration-300"
            >
                Save and Start Learning
            </button>
        </div>

        {/* ... (sisa kode JSX untuk menampilkan modul-modul tetap sama) ... */}
      </div>
      <Footer />
    </main>
  );
}