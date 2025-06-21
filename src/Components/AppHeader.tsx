// src/Components/AppHeader.tsx
"use client" // Tambahkan ini agar bisa menggunakan form

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AppHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/'); // Arahkan ke homepage setelah logout
    router.refresh(); // Refresh untuk memastikan state server terupdate
  }

  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-gray-950/70 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12 h-16">
        <Link href="/" className="font-bold text-lg text-white hover:text-amber-400 transition-colors duration-300">
          Course AI
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/create-course"
            className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-semibold hover:bg-amber-300 hover:scale-105 transition-all duration-300 text-sm"
          >
            Create New Course
          </Link>
          {/* Form untuk logout */}
          <form action={handleSignOut}>
             <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors duration-300 text-sm"
            >
              Logout
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}