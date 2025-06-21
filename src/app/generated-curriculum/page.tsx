// src/app/generated-curriculum/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
// Impor helper yang relevan
import { getCourseProgress, calculateModuleProgress, calculateCourseProgress } from "@/utils/progress";
import { getCurriculumFromStorage } from "@/utils/curriculumValidator";

// Interface for curriculum structure
interface Module {
  id: number;
  title: string;
  objective_1: string;
  objective_2: string;
  objective_3: string;
  estimated_minutes: number;
  total_lessons: number;
  lessons: { title: string; content: string }[];
}

interface Curriculum {
  title: string;
  description: string;
  modules: Module[];
}

// A helper function to format minutes into a readable string (e.g., 90 -> "1h 30m")
function formatMinutes(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function CurriculumCard({
  id,
  title,
  objective_1,
  objective_2,
  objective_3,
  estimated_minutes,
  total_lessons,
  courseTitle,
  progress, // prop baru
}: Module & { courseTitle: string; progress: number }) {
  const isCompleted = progress === 100;
  return (
    <div className={`bg-gray-900 border rounded-xl p-6 transition-all duration-300 relative ${isCompleted ? 'border-green-500/30' : 'border-gray-800 hover:border-amber-400/50'}`}>
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-xs mb-4">
            {total_lessons} Lessons | {estimated_minutes} min
        </p>
        
        {/* Progress Bar */}
        <div className="mb-4">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-amber-400'}`} 
                style={{ width: `${progress}%` }}>
              </div>
            </div>
            <p className="text-xs text-right text-gray-400 mt-1">{progress}% Complete</p>
        </div>

        {/* Objectives List */}
        <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside flex-grow">
            <li>{objective_1}</li>
            <li>{objective_2}</li>
            <li>{objective_3}</li>
        </ul>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatMinutes(estimated_minutes)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>{total_lessons} Lessons</span>
            </div>
          </div>
          <Link 
            href={`/course/${encodeURIComponent(courseTitle)}/module/${id}`}
            className="px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors duration-300"
          >
            {progress > 0 && progress < 100 ? 'Continue' : progress === 100 ? 'Review' : 'Start Module'}
          </Link>
        </div>
      </div>
    </div>
  );
}


export default function GeneratedCurriculumPage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // State baru untuk data progres
  const [courseProgress, setCourseProgress] = useState<{[key: string]: {lessons: {[key: number]: boolean}}}>({});
  const [progressPercentage, setProgressPercentage] = useState(0);  const [progressVersion, setProgressVersion] = useState(0); // Tambahkan state ini untuk refresh

  useEffect(() => {
    const curriculum = getCurriculumFromStorage();
    if (curriculum) {
      console.log("✅ Valid curriculum loaded from storage:", curriculum);
      setCurriculum(curriculum);
      
      // Ambil dan atur data progres
      const progressData = getCourseProgress(curriculum.title);
      setCourseProgress(progressData);
      
      const percentage = calculateCourseProgress(curriculum.title, curriculum.modules);
      setProgressPercentage(percentage);
    } else {
      console.log("❌ No valid curriculum found, redirecting to create course");
      router.push('/create-course');
    }
    setIsLoading(false);
  }, [router, progressVersion]);// Tambahkan progressVersion sebagai dependency
  // Trigger refresh ketika window focus (saat kembali dari halaman lain)
  useEffect(() => {
    const handleFocus = () => {
      setProgressVersion(v => v + 1);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // --- TAMBAHKAN useEffect BARU INI ---
  useEffect(() => {
    if (!curriculum || Object.keys(courseProgress).length === 0) {
      return;
    }

    const allModulesCompleted = curriculum.modules.every(module => {
      const moduleProgressData = courseProgress[module.id];
      const progressPercentage = calculateModuleProgress(moduleProgressData, module.lessons.length);
      return progressPercentage === 100;
    });

    if (allModulesCompleted && curriculum.modules.length > 0) {
      // Tunggu sebentar lalu arahkan ke halaman selamat
      setTimeout(() => {
        router.push('/course-complete');
      }, 1500); // Delay 1.5 detik agar pengguna sempat melihat 100%
    }
  }, [curriculum, courseProgress, router]);
  // ------------------------------------

  if (isLoading || !curriculum) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p>Generating your personalized curriculum...</p>
      </main>
    );
  }

  return (
    <main className="font-sans bg-gray-950 text-gray-100 antialiased selection:bg-amber-400/30">
      <AppHeader />

      <div className="container mx-auto px-6 md:px-12 py-16">
        {/* TAMPILKAN PROGRESS BAR DI SINI */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-white">{curriculum.title}</h2>
            <span className="text-lg font-semibold text-amber-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-3">{curriculum.description}</p>
        </div>

        <div className="md:grid md:grid-cols-12 md:gap-12">
            {/* Left Column: Table of Contents */}
          <aside className="md:col-span-3 lg:col-span-3 mb-12 md:mb-0">            <div className="sticky top-24">
              <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-xs mb-3">Modules</h4>
              <ul className="space-y-2">
                {curriculum.modules.map((module) => {
                  const moduleProgressData = courseProgress[module.id];
                  const progressPercentage = calculateModuleProgress(moduleProgressData, module.lessons?.length || 0);
                  return (
                    <li key={module.id} className="flex items-center gap-2">
                      {progressPercentage === 100 && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                      <a href={`#module-${module.id}`} className="text-sm text-gray-400 hover:text-white transition-colors duration-300 block">
                        {module.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Right Column: Module Cards */}
          <div className="md:col-span-9 lg:col-span-9">            <div className="space-y-6">
              {curriculum.modules.map((module) => {
                const moduleProgressData = courseProgress[module.id];
                const progressPercentage = calculateModuleProgress(moduleProgressData, module.lessons.length);
                
                return (
                  <section key={module.id} id={`module-${module.id}`}>
                    <CurriculumCard
                      {...module}
                      courseTitle={curriculum.title}
                      // Kirim progress percentage ke card
                      progress={progressPercentage}
                    />
                  </section>
                );
              })}
            </div>
          </div>

        </div>
      </div>      <Footer />
    </main>
  );
}