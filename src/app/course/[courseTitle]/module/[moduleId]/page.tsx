"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
import Link from "next/link";
import { getCourseProgress, updateLessonCompletion, calculateModuleProgress } from "@/utils/progress";

interface Lesson { 
  title: string; 
  content: string; 
}

interface Module { 
  id: number; 
  title: string; 
  lessons: Lesson[]; 
}

interface Curriculum { 
  title: string; 
  modules: Module[]; 
}

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const courseTitle = decodeURIComponent(Array.isArray(params.courseTitle) ? params.courseTitle[0] : params.courseTitle || '');
  const moduleId = Array.isArray(params.moduleId) ? params.moduleId[0] : params.moduleId;

  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [progressVersion, setProgressVersion] = useState(0);

  useEffect(() => {
    if (moduleId && courseTitle) {
      const savedCurriculumStr = sessionStorage.getItem('generatedCurriculum');
      if (savedCurriculumStr) {
        const curriculum: Curriculum = JSON.parse(savedCurriculumStr);
        const moduleInfo = curriculum.modules.find(m => m.id.toString() === moduleId);
        if (moduleInfo && moduleInfo.lessons) {
          setCurrentModule(moduleInfo);
        }
      }
      setIsLoading(false);
    }
  }, [moduleId, courseTitle]);

  const handleSelectLesson = (index: number) => {
    setSelectedLessonIndex(index);
  };

  const handleNextLesson = () => {
    if (!moduleId) return;
    
    updateLessonCompletion(courseTitle, parseInt(moduleId), selectedLessonIndex, true);
    setProgressVersion(v => v + 1);
    
    const isLastLesson = selectedLessonIndex === (currentModule?.lessons.length || 0) - 1;
    if (!isLastLesson) {
      setSelectedLessonIndex(selectedLessonIndex + 1);
    } else {
      router.push('/generated-curriculum');
    }
  };
    const lessonProgress = moduleId ? getCourseProgress(courseTitle)[moduleId]?.lessons || {} : {};
  const moduleProgress = calculateModuleProgress({ lessons: lessonProgress }, currentModule?.lessons.length || 0);

  // Re-calculate progress when progressVersion changes
  useEffect(() => {
    // This effect ensures UI updates when progress changes
  }, [progressVersion]);
  
  const selectedLesson = currentModule?.lessons[selectedLessonIndex];
  const isLastLesson = selectedLessonIndex === (currentModule?.lessons.length || 0) - 1;

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

  if (!currentModule || !currentModule.lessons) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
        <AppHeader />
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Content Not Found</h2>
          <p className="text-gray-400 max-w-md">The lessons for this module could not be loaded.</p>
          <Link href="/generated-curriculum" className="mt-6 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors duration-300">
            ← Back to Curriculum
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
            ← Back to Curriculum
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
            <div className="sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-white">{currentModule.title}</h3>
              <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${moduleProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-right text-gray-400 mt-1">{moduleProgress}% Complete</p>
              </div>

              <ul className="space-y-1">
                {currentModule.lessons.map((lesson, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${selectedLessonIndex === index ? 'border-amber-400' : 'border-gray-600'}`}>
                        {lessonProgress[index] && <div className="w-3 h-3 bg-green-400 rounded-full"></div>}
                    </div>
                    <button
                      onClick={() => handleSelectLesson(index)}
                      className={`w-full text-left text-sm p-2 rounded-md transition-colors ${
                        selectedLessonIndex === index
                          ? "text-amber-400"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {lesson.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col justify-between">
            <article className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
              {selectedLesson ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedLesson.title}</h2>
                  <p className="text-sm text-gray-500 mb-6">Lesson {selectedLessonIndex + 1} of {currentModule.lessons.length}</p>
                  <div 
                    className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-amber-400" 
                    dangerouslySetInnerHTML={{ __html: selectedLesson.content }} 
                  />
                </>
              ) : (
                <p>Select a lesson to begin.</p>
              )}
            </article>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNextLesson}
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 bg-amber-400 text-gray-900 hover:bg-amber-300"
              >
                {isLastLesson ? 'Finish Module' : 'Next Lesson'}
              </button>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
