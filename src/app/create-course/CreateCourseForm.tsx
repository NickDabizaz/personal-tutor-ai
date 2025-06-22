// Lokasi: src/app/create-course/CreateCourseForm.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingOverlay from "@/Components/LoadingOverlay";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";
import { createClient } from "@/utils/supabase/client";

// Komponen Modal
function CompleteProfileModal({ 
  isOpen, 
  onClose, 
  userEmail 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  userEmail: string;
}) {
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailPlaceholder = userEmail.split('@')[0];

  const handleSaveProfile = async () => {
    const nameToSave = fullName.trim() || emailPlaceholder;
    if (!nameToSave) {
      alert("Please enter your full name");
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("User not authenticated"); return;
      }
      const { error } = await supabase
        .from('users')
        .update({ full_name: nameToSave })
        .eq('id', user.id);
      if (error) {
        alert(`Failed to update profile: ${error.message}`); return;
      }
      onClose();
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    /* ================================================================
        --- INI ADALAH PERBAIKAN FINAL ---
        ================================================================
        Kita gunakan kelas `modal-backdrop` dari globals.css dan buang
        semua kelas `bg-*` dari Tailwind untuk menghindari konflik.
        `backdrop-blur-sm` tetap dipertahankan untuk efek blur.
    */
    <div className="fixed inset-0 modal-backdrop backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Complete Your Profile</h2>
        <div className="flex flex-col items-center mb-6">
          <Image 
            src="/profile_picture.png" 
            alt="Profile Picture" 
            width={80}
            height={80}
            className="rounded-full mb-2 object-cover"
          />
          <button className="text-amber-400 text-sm hover:text-amber-300 transition-colors">
            Change Picture
          </button>
        </div>
        <div className="mb-6">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={emailPlaceholder}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

// Komponen Utama Form (Tidak ada perubahan di sini)
export default function CreateCourseForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkUserProfile = async () => {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserEmail(user.email || "");
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        if (!userData || !userData.full_name) {
          setShowProfileModal(true);
        }
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code !== 'PGRST116') {
            console.error('Error checking profile:', error);
        }
      }
    };
    checkUserProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isGenerating) return;
    setIsGenerating(true);
    setErrors({});
    try {
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
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      <CompleteProfileModal 
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userEmail={userEmail}
      />
      {isGenerating && <LoadingOverlay message="Analyzing Course Requirements..." />}
      <AppHeader />
      <main className="flex-grow flex items-center justify-center px-4 py-16 antialiased selection:bg-amber-400/30">
        <div className="w-full max-w-xl">
          <form onSubmit={handleSubmit} className="w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 space-y-8">
             <div className="animate-fade-in text-center">
                <h1 className="text-3xl font-bold text-white">
                  Tell Us About Your Course
                </h1>
                <p className="text-gray-400 mt-2 text-sm">
                  Let&apos;s start by defining your learning goal.
                </p>
              </div>
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
                  className="absolute left-12 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-amber-400"
                >
                  Course Name
                </label>
                {errors.name && <p className="text-red-400 text-xs mt-2 pl-1">{errors.name}</p>}
              </div>
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
                  className="absolute left-12 -top-2.5 text-xs text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-amber-400"
                >
                  Course Description (Optional)
                </label>
                {errors.description && <p className="text-red-400 text-xs mt-2 pl-1">{errors.description}</p>}
              </div>
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
  );
}