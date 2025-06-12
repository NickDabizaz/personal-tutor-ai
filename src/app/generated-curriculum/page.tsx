// src/app/generated-curriculum/page.tsx

"use client";

import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

// Mock data that matches the API output structure.
// Later, this will come from a state updated by a fetch call to your API.
const mockCurriculum = {
  title: "Machine Learning Fundamentals",
  description: "This course is designed to provide a comprehensive introduction to the fundamentals of machine learning. You will start with the basic concepts and gradually move towards understanding different algorithms and their applications.",
  modules: [
    {
      id: 1,
      title: "1. Introduction To Machine Learning",
      objective_1: "Understand the core concepts and types of machine learning.",
      objective_2: "Identify real-world applications and use cases.",
      objective_3: "Set up your Python environment for data science.",
      estimated_minutes: 75,
      total_lessons: 5
    },
    {
      id: 2,
      title: "2. Data Preprocessing and Cleaning",
      objective_1: "Learn techniques for handling missing or corrupt data.",
      objective_2: "Implement feature scaling and normalization.",
      objective_3: "Split datasets into training and testing sets.",
      estimated_minutes: 90,
      total_lessons: 6
    },
    {
      id: 3,
      title: "3. Supervised Learning: Regression",
      objective_1: "Build and train a Linear Regression model from scratch.",
      objective_2: "Evaluate model performance using metrics like R-squared.",
      objective_3: "Understand the concept of gradient descent.",
      estimated_minutes: 120,
      total_lessons: 7
    },
    {
      id: 4,
      title: "4. Supervised Learning: Classification",
      objective_1: "Implement Logistic Regression for binary classification.",
      objective_2: "Analyze a confusion matrix to assess accuracy.",
      objective_3: "Explore Decision Trees and their advantages.",
      estimated_minutes: 120,
      total_lessons: 7
    },
    {
      id: 5,
      title: "5. Unsupervised Learning: Clustering",
      objective_1: "Apply the K-Means algorithm to group unlabeled data.",
      objective_2: "Visualize clusters using Matplotlib or Seaborn.",
      objective_3: "Understand how to choose the optimal number of clusters.",
      estimated_minutes: 100,
      total_lessons: 6
    }
  ]
};

// A helper function to format minutes into a readable string (e.g., 90 -> "1h 30m")
function formatMinutes(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

// Component for the new curriculum card
function CurriculumCard({ title, objective_1, objective_2, objective_3, estimated_minutes, total_lessons }: {
    title: string;
    objective_1: string;
    objective_2: string;
    objective_3: string;
    estimated_minutes: number;
    total_lessons: number;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all duration-300 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10">
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        
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
          <button className="px-5 py-2.5 rounded-lg bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors duration-300">
            Start Module
          </button>
        </div>
      </div>
    </div>
  );
}


export default function GeneratedCurriculumPage() {
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];
  
  return (
    <main className="font-sans bg-gray-950 text-gray-100 antialiased selection:bg-amber-400/30">
      <Header navLinks={navLinks} />

      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="md:grid md:grid-cols-12 md:gap-12">
          
          {/* Left Column: Table of Contents */}
          <aside className="md:col-span-3 lg:col-span-3 mb-12 md:mb-0">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-2">{mockCurriculum.title}</h2>
              <p className="text-sm text-gray-400 mb-6">{mockCurriculum.description}</p>
              <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-xs mb-3">Modules</h4>
              <ul className="space-y-2">
                {mockCurriculum.modules.map((module) => (
                  <li key={module.id}>
                    <a href={`#module-${module.id}`} className="text-sm text-gray-400 hover:text-white transition-colors duration-300 block">
                      {module.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Column: Module Cards */}
          <div className="md:col-span-9 lg:col-span-9">
            <div className="space-y-6">
              {mockCurriculum.modules.map((module) => (
                <section key={module.id} id={`module-${module.id}`}>
                   <CurriculumCard
                    title={module.title}
                    objective_1={module.objective_1}
                    objective_2={module.objective_2}
                    objective_3={module.objective_3}
                    estimated_minutes={module.estimated_minutes}
                    total_lessons={module.total_lessons}
                  />
                </section>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}