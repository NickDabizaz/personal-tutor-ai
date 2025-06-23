// Lokasi: src/app/generated-curriculum/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
import { getCourseProgress, calculateModuleProgress, calculateCourseProgress } from "@/utils/progress";
import { getCurriculumFromStorage, Curriculum, Module } from "@/utils/curriculumValidator";
import LoadingOverlay from "@/Components/LoadingOverlay";

// Komponen Kartu Modul (sesuai desain asli Anda)
function CurriculumCard({
  id,
  title,
  objective_1,
  objective_2,
  objective_3,
  estimated_minutes,
  total_lessons,
  courseTitle,
  progress,
}: Module & { courseTitle: string; progress: number }) {
  const isCompleted = progress === 100;
  return (
    <div className={`bg-gray-900 border rounded-xl p-6 transition-all duration-300 relative ${isCompleted ? 'border-green-500/30' : 'border-gray-800 hover:border-amber-400/50'}`} id={`module-${id}`}>
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside flex-grow mb-4">
            <li>{objective_1}</li>
            <li>{objective_2}</li>
            <li>{objective_3}</li>
        </ul>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{total_lessons} Lessons • {estimated_minutes} min</span>
          <Link 
            href={`/course/${encodeURIComponent(courseTitle)}/module/${id}`}
            className="px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors duration-300"
          >
            Start Module
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GeneratedCurriculumPage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCourseSaved, setIsCourseSaved] = useState(false); // State untuk menandai kursus sudah tersimpan

  useEffect(() => {
    const curriculumData = getCurriculumFromStorage();
    if (curriculumData) {
      setCurriculum(curriculumData);
    } else {
      // Jika tidak ada kurikulum, mungkin pengguna refresh atau akses langsung
      // Bisa tampilkan pesan atau redirect
      console.log("No curriculum in session storage.");
    }
  }, []);

  const handleSaveCourse = async () => {
    if (!curriculum) {
      alert("No curriculum data available to save.");
      return;
    }

    setIsSaving(true);
    
    // Menyiapkan data untuk dikirim, memastikan semua field ada
    const curriculumToSave = {
      ...curriculum,
      modules: curriculum.modules.map(module => ({
        ...module,
        module_number: module.id,
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          lesson_number: lessonIndex + 1,
        })),
      })),
    };

    // DEBUG: Tampilkan data yang akan dikirim ke console
    console.log("Attempting to save this data:", JSON.stringify(curriculumToSave, null, 2));

    try {
      const response = await fetch('/api/save-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(curriculumToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save the course.");
      }

      const result = await response.json();
      console.log("Course saved successfully:", result);
      
      // Tandai bahwa kursus sudah berhasil disimpan
      setIsCourseSaved(true);
      alert("Course saved successfully to your profile!");

      // Hapus dari session storage setelah berhasil disimpan
      sessionStorage.removeItem('generatedCurriculum');
      sessionStorage.removeItem('answers');

    } catch (error) {
      console.error("Error saving course:", error);
      alert(`An error occurred: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!curriculum) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
            <AppHeader />
            <main className="flex-grow flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold">No Generated Curriculum Found</h2>
                <p className="text-gray-400">Please create a new course first.</p>
                <Link href="/create-course" className="mt-4 px-6 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg">
                    Create a New Course
                </Link>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <main className="font-sans bg-gray-950 text-gray-100 antialiased">
      {isSaving && <LoadingOverlay message="Saving your course..." />}
      <AppHeader />

      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">{curriculum.title}</h1>
          <p className="text-lg text-gray-400 mt-2">{curriculum.description}</p>
        </div>

        {/* Tombol Save hanya muncul jika kursus BELUM disimpan */}
        {!isCourseSaved && (
            <div className="mb-12 p-6 bg-gray-900 border border-amber-500/30 rounded-xl text-center shadow-lg">
                <h3 className="text-xl font-semibold text-white">Your new course is ready!</h3>
                <p className="text-gray-400 mt-2 mb-4">Save this course to your profile to track progress and access it anytime.</p>
                <button
                    onClick={handleSaveCourse}
                    disabled={isSaving}
                    className="px-8 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors duration-300 disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save to My Profile"}
                </button>
            </div>
        )}

        {/* Daftar Modul */}
        <div className="space-y-6">
          {curriculum.modules.map((module) => (
            <CurriculumCard
              key={module.id}
              {...module}
              courseTitle={curriculum.title}
              progress={0} // Default progress 0 untuk kursus baru
            />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}