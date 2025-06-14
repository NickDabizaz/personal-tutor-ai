// src/Components/AppHeader.tsx

import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-gray-950/70 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12 h-16">
        <Link href="/" className="font-bold text-lg text-white hover:text-amber-400 transition-colors duration-300">
          Course AI
        </Link>
        <nav>
          {/* Can add 'Dashboard' or 'Logout' links here later */}
          <Link
            href="/create-course"
            className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-semibold hover:bg-amber-300 hover:scale-105 transition-all duration-300 text-sm"
          >
            Create New Course
          </Link>
        </nav>
      </div>
    </header>
  );
}
