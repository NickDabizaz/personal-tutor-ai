"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
import Link from "next/link";
import { getCourseProgress, updateLessonCompletion, calculateModuleProgress } from "@/utils/progress";
import ChatbotTutor from "@/Components/ChatbotTutor"; // Import the chatbot component
import { loadLessonContentWithCache, isLessonContentLoaded } from "@/utils/lessonLoader"; // Add import for lazy loading lesson content

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

// Type for the active tab state
type ActiveTab = 'content' | 'chatbot';

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const courseTitle = decodeURIComponent(Array.isArray(params.courseTitle) ? params.courseTitle[0] : params.courseTitle || '');
  const moduleId = Array.isArray(params.moduleId) ? params.moduleId[0] : params.moduleId;
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [progressVersion, setProgressVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('content'); // New state for tabs
  // Add states for lazy loading lesson content
  const [lessonContentLoading, setLessonContentLoading] = useState<boolean>(false);
  const [lessonContentError, setLessonContentError] = useState<string | null>(null);
  const [loadedLessonContent, setLoadedLessonContent] = useState<string>('');

  // Reset to 'content' tab whenever the lesson changes
  useEffect(() => {
    setActiveTab('content');
  }, [selectedLessonIndex]);

  // Effect to load curriculum data
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
    }  }, [moduleId, courseTitle]);

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
    // This effect ensures the UI updates when progress changes
  }, [progressVersion]);
  
  const selectedLesson = currentModule?.lessons[selectedLessonIndex];
  const isLastLesson = selectedLessonIndex === (currentModule?.lessons.length || 0) - 1;

  // Load lesson content when lesson changes
  useEffect(() => {
    if (selectedLesson && currentModule) {
      const loadContent = async () => {
        // If content is already loaded, no need to fetch again
        if (isLessonContentLoaded(selectedLesson.content)) {
          setLoadedLessonContent(selectedLesson.content);
          return;
        }

        setLessonContentLoading(true);
        setLessonContentError(null);

        try {
          const content = await loadLessonContentWithCache(currentModule.title, selectedLesson.title);
          
          // Update the lesson content in the curriculum
          const updatedCurriculum = JSON.parse(sessionStorage.getItem('generatedCurriculum') || '{}');
          const moduleIndex = updatedCurriculum.modules.findIndex((m: Module) => m.id === currentModule.id);
          if (moduleIndex !== -1) {
            updatedCurriculum.modules[moduleIndex].lessons[selectedLessonIndex].content = content;
            sessionStorage.setItem('generatedCurriculum', JSON.stringify(updatedCurriculum));
          }
          
          setLoadedLessonContent(content);
        } catch (error) {
          console.error('Failed to load lesson content:', error);
          setLessonContentError('Failed to load lesson content. Please try again.');
        } finally {
          setLessonContentLoading(false);
        }
      };

      loadContent();
    }
  }, [selectedLessonIndex, currentModule, selectedLesson]);

  if (isLoading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!currentModule || !currentModule.lessons || !selectedLesson) {
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
      <AppHeader />      <div className="container mx-auto px-6 md:px-12 py-12 flex-grow">
        <div className="mb-8">
          <Link href="/generated-curriculum" className="text-sm text-amber-400 hover:text-amber-300">
            ← Back to Curriculum
          </Link>
        </div>        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
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
                        selectedLessonIndex === index ? "text-amber-400" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {lesson.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>          {/* Main Content with Tabs */}
          <main className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col">
            <div className="bg-gray-900 border border-gray-800 rounded-xl flex-grow flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-800">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'content' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Lesson Content
                </button>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'chatbot' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
                >
                  AI Tutor
                </button>
              </div>

              {/* Conditional Tab Content */}              <div className="flex-grow">
                {activeTab === 'content' && (                  <article className="p-6 md:p-8 overflow-y-auto h-[60vh]">
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedLesson.title}</h2>
                    <p className="text-sm text-gray-500 mb-6">Lesson {selectedLessonIndex + 1} of {currentModule.lessons.length}</p>
                    
                    {lessonContentLoading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mr-3"></div>
                        <span className="text-gray-400">Loading lesson content...</span>
                      </div>
                    )}
                    
                    {lessonContentError && (
                      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
                        <p className="text-red-400">{lessonContentError}</p>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    
                    {!lessonContentLoading && !lessonContentError && (
                      <div 
                        className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-amber-400" 
                        dangerouslySetInnerHTML={{ __html: loadedLessonContent || selectedLesson.content }} 
                      />
                    )}
                  </article>
                )}
                
                {activeTab === 'chatbot' && (
                  <ChatbotTutor
                    lessonTitle={selectedLesson.title}
                    lessonContent={selectedLesson.content}
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNextLesson}
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 bg-amber-400 text-gray-900 hover:bg-amber-300"
              >
                {isLastLesson ? 'Finish Module' : 'Mark as Complete & Next'}
              </button>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
