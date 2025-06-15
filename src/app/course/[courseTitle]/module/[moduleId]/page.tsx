"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
import Link from "next/link";

// Definisikan tipe data yang kita harapkan
interface Lesson {
  title: string;
  content: string;
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
  // tambahkan properti lain jika perlu ditampilkan
}

interface Curriculum {
  modules: Module[];
}

export default function ModulePage() {
  const params = useParams();
  // Pastikan moduleId adalah string
  const moduleId = Array.isArray(params.moduleId) ? params.moduleId[0] : params.moduleId;

  // State untuk data
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (moduleId) {
      // Ambil seluruh data kurikulum dari sessionStorage
      const savedCurriculum = sessionStorage.getItem(`generatedCurriculum`);
      if (savedCurriculum) {
        const parsedCurriculum: Curriculum = JSON.parse(savedCurriculum);
        
        // Cari modul yang sesuai berdasarkan moduleId dari URL
        const foundModule = parsedCurriculum.modules.find(
          (module) => module.id.toString() === moduleId
        );

        if (foundModule) {
            setCurrentModule(foundModule);
            // Otomatis pilih lesson pertama saat data dimuat
            if (foundModule.lessons && foundModule.lessons.length > 0) {
              setSelectedLesson(foundModule.lessons[0]);
            }
        }
      }
      setIsLoading(false);
    }
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p>Loading lessons...</p>
        </div>
      </div>
    );
  }

  // Tampilan jika konten tidak ada
  if (!currentModule || !currentModule.lessons || currentModule.lessons.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
        <AppHeader />
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Content Not Available</h2>
          <p className="text-gray-400 max-w-md">Content for this module could not be loaded. Please try generating the course again.</p>
          <Link href="/create-course" className="mt-6 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors duration-300">
            Generate New Course
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      <AppHeader />
      <div className="container mx-auto px-6 md:px-12 py-12 flex-grow">
        <div className="mb-8">
          <Link href="/generated-curriculum" className="text-sm text-amber-400 hover:text-amber-300">
            &larr; Back to Curriculum
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Daftar Lesson */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
            <div className="sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-white">{currentModule.title}</h3>
              <ul className="space-y-1">
                {currentModule.lessons.map((lesson, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left text-sm p-3 rounded-md transition-colors ${
                        selectedLesson?.title === lesson.title
                          ? "bg-amber-400/10 text-amber-400 font-semibold border border-amber-400/20"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <span className="text-gray-500 mr-2">{index + 1}.</span>
                      {lesson.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Konten Utama Lesson */}
          <main className="col-span-12 md:col-span-8 lg:col-span-9">
            <article className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8 min-h-[60vh]">
              {selectedLesson ? (
                <div 
                  className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-amber-400" 
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }} 
                />
              ) : (
                <p>Select a lesson to begin.</p>
              )}
            </article>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
