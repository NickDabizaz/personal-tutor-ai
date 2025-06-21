"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/Components/LoadingOverlay";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";

export default function CreateCourseForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name as keyof typeof errors];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Course name is required.";
    // Description is now optional - no validation needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isGenerating) return;

    setIsGenerating(true);
    setErrors({});
    
    try {
      // Store course name and description in sessionStorage
      sessionStorage.setItem('courseName', form.name);
      sessionStorage.setItem('courseDescription', form.description);

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions.");
      }

      const questions = await response.json();
      
      // Console log hasil dari API sesuai permintaan
      console.log("Generated Questions from API:", questions);

      sessionStorage.setItem('generatedQuestions', JSON.stringify(questions));
      router.push('/curriculum-qa');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({ name: errorMessage });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Loader will appear when isGenerating is true */}
      {isGenerating && (
        <LoadingOverlay message="Analyzing Course Requirements..." />
      )}
      <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
        <AppHeader />
        <main className="flex-grow flex items-center justify-center px-4 py-16 antialiased selection:bg-amber-400/30">
          <div className="w-full max-w-xl">
            <form
              onSubmit={handleSubmit}
              className="w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-8"
            >
              <div className="animate-fade-in text-center">
                <h1 className="text-3xl font-bold text-white">
                  Tell Us About Your Course
                </h1>
                <p className="text-gray-400 mt-2 text-sm">
                  Let&apos;s start by defining your learning goal.
                </p>
              </div>

              {/* Input 1: Course Name with Floating Label and Icon */}
              <div className="relative animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="peer w-full p-3 pl-12 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-transparent transition"
                  placeholder="Course Name"
                  disabled={isGenerating}
                />
                <label
                  htmlFor="name"
                  className="absolute left-12 -top-2.5 text-xs text-gray-400 transition-all 
                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 
                             peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-amber-400"
                >
                  Course Name
                </label>
                {errors.name && <p className="text-red-400 text-xs mt-2 pl-1">{errors.name}</p>}
              </div>

              {/* Input 2: Course Description with Floating Label and Icon */}
              <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="absolute top-3.5 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className="peer w-full p-3 pl-12 rounded-lg bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-transparent transition"
                  placeholder="Course Description"
                  disabled={isGenerating}
                />
                <label
                  htmlFor="description"
                  className="absolute left-12 -top-2.5 text-xs text-gray-400 transition-all 
                             peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 
                             peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-amber-400"
                >
                  Course Description (Optional)
                </label>
                {errors.description && <p className="text-red-400 text-xs mt-2 pl-1">{errors.description}</p>}
              </div>

              {/* Submit Button */}
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-all duration-300 hover:scale-[1.02] disabled:bg-amber-400/50 disabled:cursor-wait"
                  disabled={isGenerating}
                >
                  Generate Questions
                </button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
