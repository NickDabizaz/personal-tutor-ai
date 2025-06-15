"use client";

import Link from "next/link";
import AppHeader from "@/Components/AppHeader";
import Footer from "@/Components/Footer";

export default function CourseCompletePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="animate-fade-in">
          {/* Trophy Icon */}
          <div className="mb-8">
            <svg className="w-24 h-24 text-amber-400 mx-auto animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L8.5 8.5H2l5.5 4-2 6.5L10 15l4.5 3.5-2-6.5L18 8.5h-6.5L10 2z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-extrabold text-green-400 mb-4 animate-bounce">
            🎉 Congratulations! 🎉
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-xl text-gray-300 mb-4">
              You have successfully completed all modules in this course!
            </p>            <p className="text-lg text-gray-400 mb-6">
              You&apos;ve taken a significant step in your learning journey. Your dedication and hard work have paid off!
            </p>
            
            {/* Achievement Badge */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-4 inline-block mb-6">
              <div className="bg-white rounded-full p-3">
                <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/create-course"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
            >
              🚀 Start a New Learning Adventure
            </Link>
            
            <div className="block">
              <Link
                href="/generated-curriculum"
                className="inline-block px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors duration-300"
              >
                📚 Review Course Content
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
