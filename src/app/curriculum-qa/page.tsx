"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/Components/LoadingOverlay";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
import { validateCurriculumStructure } from "@/utils/curriculumValidator";

// Interface for the question structure from the AI's JSON output
interface Question {
  no: number;
  category: string;
  question: string;
  type: 0 | 1; // 0: Multiple Choice, 1: Fill-in
  options: string[];
  placeholder: string;
}

const OTHER_OPTION_VALUE = "other_option_input";

export default function CurriculumQaPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(""); // State untuk pesan loading dinamis

  useEffect(() => {
    const savedQuestions = sessionStorage.getItem('generatedQuestions');
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      router.push('/create-course');
    }
    setIsLoading(false);
  }, [router]);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // If this is the 'other' input, save it as the main answer
    if (name.includes(OTHER_OPTION_VALUE)) {
        const questionName = `question_${questions[currentStep].no}`;
        setAnswers((prev) => ({ ...prev, [questionName]: value }));
    } else {
        setAnswers((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };
  
  const handleNext = () => {
    const questionName = `question_${questions[currentStep].no}`;
    if (!answers[questionName]?.trim()) {
      setError("Please provide an answer to continue.");
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };  const handleSubmit = async () => {
    // Validasi dasar
    const questionName = `question_${questions[currentStep].no}`;
    if (!answers[questionName]?.trim() && currentStep < questions.length - 1) {
      setError("Please provide an answer to continue.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Clear any existing curriculum data to prevent conflicts
    sessionStorage.removeItem('generatedCurriculum');

    const formattedAnswers = questions.map(q => ({
      question: q.question,
      answer: answers[`question_${q.no}`] || "Not answered",
    }));

    const name = sessionStorage.getItem('courseName') || '';
    const description = sessionStorage.getItem('courseDescription') || '';

    try {
      // --- Tahap 1: Generate Outline ---
      setLoadingMessage("Crafting your course outline...");
      console.log("Step 1: Fetching course outline...");

      const outlineResponse = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, answers: formattedAnswers }),
      });

      if (!outlineResponse.ok) {
        throw new Error('Failed to generate course outline.');
      }

      const outline = await outlineResponse.json();
      console.log("✅ Step 1 Success: Outline received", outline);

      const { title, description: courseDescription, moduleTitles } = outline;

      // --- Tahap 2: Generate Detail Modul ---
      setLoadingMessage("Structuring course modules...");
      console.log("Step 2: Fetching module structures...");

      const modulesResponse = await fetch('/api/generate-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseTitle: title, moduleTitles }),
      });

      if (!modulesResponse.ok) {
        throw new Error('Failed to generate module structures.');
      }

      const modulesData = await modulesResponse.json();
      console.log("✅ Step 2 Success: Module structures received", modulesData);
      console.log("modulesData.modules is array:", Array.isArray(modulesData.modules));

      // Buat struktur kurikulum awal
      const finalCurriculum = {
        title,
        description: courseDescription,
        modules: modulesData.modules, // Gunakan modulesData.modules bukan modules
      };

      console.log("Final curriculum structure before lesson content:", finalCurriculum);

      // --- Tahap 3: Generate Konten untuk Setiap Pelajaran ---
      console.log("Step 3: Fetching lesson content for all modules...");

      for (let i = 0; i < finalCurriculum.modules.length; i++) {
        const currentModule = finalCurriculum.modules[i];
        for (let j = 0; j < currentModule.lessons.length; j++) {
          const lesson = currentModule.lessons[j];
          
          setLoadingMessage(`Generating: "${lesson.title}"...`);
          console.log(`- Fetching content for Module ${i + 1} / Lesson ${j + 1}: "${lesson.title}"`);

          const contentResponse = await fetch('/api/generate-lesson-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleTitle: currentModule.title, lessonTitle: lesson.title }),
          });

          if (!contentResponse.ok) {
            throw new Error(`Failed to generate content for lesson "${lesson.title}".`);
          }

          const { content } = await contentResponse.json();
          // Masukkan konten ke dalam objek kurikulum kita
          finalCurriculum.modules[i].lessons[j].content = content;
        }
      }

      console.log("✅ Step 3 Success: All lesson content generated.");
      console.log("Final Curriculum:", finalCurriculum);      // --- Tahap 4: Finalisasi ---
      setLoadingMessage("Finalizing your course...");
      
      // Validate the final curriculum structure before saving
      if (!validateCurriculumStructure(finalCurriculum)) {
        throw new Error("Generated curriculum has invalid structure");
      }
      
      console.log("✅ Curriculum validation passed");
      sessionStorage.setItem('generatedCurriculum', JSON.stringify(finalCurriculum));
      localStorage.removeItem(`progress_${name}`); // Hapus progres lama
      
      router.push('/generated-curriculum');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("❌ Error during curriculum generation:", errorMessage);
      setError(errorMessage);
      setIsGenerating(false); // Pastikan loader berhenti jika ada error
    } 
    // Tidak ada finally block di sini karena kita hanya ingin berhenti loading jika ada error atau setelah redirect
  };

  if (isLoading || questions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <p>Loading intelligent questions...</p>
      </main>
    );
  }

  const currentQuestion = questions[currentStep];
  const questionName = `question_${currentQuestion.no}`;
  const progressPercentage = ((currentStep) / (questions.length - 1)) * 100;  return (
    <>      {/* Loader akan muncul ketika isGenerating true dengan pesan dinamis */}
      {isGenerating && (
        <LoadingOverlay message={loadingMessage || "Please wait..."} />
      )}
      <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
        <AppHeader />        <main className="flex-grow flex items-center justify-center px-4 py-16 antialiased selection:bg-amber-400/30">
          <div className="w-full max-w-2xl bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
            <div className="mb-8">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">{currentQuestion.category}</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-amber-400 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}/>
          </div>
        </div>

        <div key={currentStep}>
          <h2 className="text-2xl font-bold text-white mb-6 animate-fade-in">{currentQuestion.question}</h2>
          <div className="space-y-4 mb-8">
            {currentQuestion.type === 0 ? (
              <>
                {currentQuestion.options.map((option, index) => (
                  <label key={option} className="flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 animate-fade-in" style={{ animationDelay: `${index * 80}ms` }} data-checked={answers[questionName] === option}>
                    <input type="radio" name={questionName} value={option} checked={answers[questionName] === option} onChange={handleRadioChange} className="hidden"/>
                    <span className="font-medium text-gray-200">{option}</span>
                  </label>
                ))}
                {/* "Other" option with a text input */}
                <div className="animate-fade-in" style={{ animationDelay: `${currentQuestion.options.length * 80}ms` }}>
                  <label className="flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200" data-checked={answers[questionName + OTHER_OPTION_VALUE] === answers[questionName]}>
                    <input type="radio" name={questionName} value={answers[questionName + OTHER_OPTION_VALUE] || ''} checked={answers[questionName + OTHER_OPTION_VALUE] === answers[questionName]} onChange={() => setAnswers(prev => ({...prev, [questionName]: prev[questionName+OTHER_OPTION_VALUE] || ''}))} className="hidden"/>
                    <input type="text" name={questionName + OTHER_OPTION_VALUE} onChange={handleTextChange} placeholder="Other (please specify)..." className="w-full bg-transparent focus:outline-none text-gray-200 placeholder-gray-500" />
                  </label>
                </div>
              </>
            ) : (
              // Premium display for fill-in (textarea)
              <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="absolute top-3.5 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                </div>
                <textarea id={questionName} name={questionName} rows={4} value={answers[questionName] || ""} onChange={handleTextChange} className="peer w-full p-3 pl-12 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-transparent transition" placeholder={currentQuestion.placeholder} />
                <label htmlFor={questionName} className="absolute left-12 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-amber-400">{currentQuestion.placeholder}</label>
              </div>
            )}          </div>
        </div>
        
        {error && <p className="text-red-400 text-sm mb-6 text-center animate-fade-in">{error}</p>}

        <div className="flex justify-between items-center">
          <button onClick={handleBack} disabled={currentStep === 0 || isGenerating} className="px-6 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed">Back</button>
          <button onClick={handleNext} disabled={isGenerating} className="px-6 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait">
            {currentStep === questions.length - 1 ? "Generate Curriculum" : "Next"}
          </button>        </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}