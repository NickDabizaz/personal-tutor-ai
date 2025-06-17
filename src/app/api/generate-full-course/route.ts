// src/app/api/generate-full-course/route.ts

import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

// Tipe data untuk struktur kita
interface Lesson {
  title: string;
  content: string;
}
interface Module {
  id: number;
  title: string;
  objective_1: string;
  objective_2: string;
  objective_3: string;
  total_lessons: number;
  estimated_minutes: number;
  lessons: Lesson[];
}
interface Curriculum {
  title: string;
  description: string;
  modules: Module[];
}

// Fungsi untuk memanggil AI dengan percobaan ulang sederhana
async function callOllama(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ollama.chat({
        model: process.env.OLLAMA_MODEL || "deepseek-r1:8b",
        messages: [{ role: "user", content: prompt }],
      });
      return response.message.content;
    } catch (error) {
      console.error(`Ollama call attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
    }
  }
  throw new Error("Ollama call failed after all retries.");
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description = "", answers } = body;
    const qaString = answers.map((item: { question: string; answer: string }) => `Q: ${item.question}\\nA: ${item.answer}`).join("\\n\\n");

    // === LANGKAH 1: Generate Judul, Deskripsi, dan Daftar Modul (sebagai teks) ===
    console.log("Step 1: Generating curriculum structure outline...");    const structurePrompt = `
      Based on the user's goal: "${name}"${description ? ` (${description})` : ""} and their answers: ${qaString}, generate a course outline.
      
      IMPORTANT DEVELOPMENT RULE: For faster testing, please generate a maximum of 3 modules.
      
      Provide your response in this exact format, with each item on a new line:
      Course Title: [A compelling title for the course]
      Course Description: [A brief, one-sentence description of the course]
      Module 1: [Title for Module 1]
      Module 2: [Title for Module 2]
      Module 3: [Title for Module 3]
    `;
    const structureResponse = await callOllama(structurePrompt);
    
    const lines = structureResponse.split('\n').filter(line => line.trim() !== '');
    const courseTitle = lines[0]?.replace('Course Title: ', '').trim();
    const courseDescription = lines[1]?.replace('Course Description: ', '').trim();
    const moduleTitles = lines.slice(2).map(line => line.replace(/Module \d+: /, '').trim());

    if (!courseTitle || !courseDescription || moduleTitles.length === 0) {
      throw new Error("Failed to parse the initial structure from AI response.");
    }
    
    // Inisialisasi struktur kurikulum di dalam kode kita
    const finalCurriculum: Curriculum = {
      title: courseTitle,
      description: courseDescription,
      modules: [],
    };
    
    console.log(`Step 2: Structure parsed. Generating content for ${moduleTitles.length} modules...`);

    // === LANGKAH 2: Generate Pelajaran untuk Setiap Modul ===
    const modulePromises = moduleTitles.map(async (moduleTitle, index) => {
      const lessonsPrompt = `
        For a course module titled "${moduleTitle}", generate a list of 3-4 relevant lesson titles.
        Provide your response as a simple list, with each lesson title on a new line. Do not add numbers or bullets.
        
        Example:
        Introduction to HTML
        HTML Tags and Elements
        Creating Your First Web Page
      `;
      const lessonsResponse = await callOllama(lessonsPrompt);
      const lessonTitles = lessonsResponse.split('\n').filter(t => t.trim() !== '');
      
      // Generate konten untuk setiap pelajaran
      const contentPromises = lessonTitles.map(async (lessonTitle) => {
        const contentPrompt = `
          Write the lesson content for a topic titled "${lessonTitle}" within the module "${moduleTitle}".
          The content should be in simple HTML format, like "<h2>${lessonTitle}</h2><p>Your explanation here...</p>".
          Provide ONLY the HTML content as your response.
        `;
        const content = await callOllama(contentPrompt);
        return { title: lessonTitle, content: content };
      });
      
      const lessons = await Promise.all(contentPromises);
        // Membuat objek modul lengkap
      const newModule: Partial<Module> = {
        id: index + 1,
        title: moduleTitle,
        lessons: lessons,
        total_lessons: lessons.length,
        // --- TAMBAHKAN ESTIMASI WAKTU ---
        estimated_minutes: lessons.length * 15, // Estimasi 15 menit per pelajaran
        // ------------------------------
        objective_1: `Understand the core concepts of ${moduleTitle}.`,
        objective_2: `Apply the principles of ${moduleTitle} in practice.`,
        objective_3: `Build foundational skills in ${moduleTitle}.`
      };
      return newModule;
    });

    finalCurriculum.modules = (await Promise.all(modulePromises)) as Module[];
    
    console.log("Step 3: All content generated successfully!");
    
    return NextResponse.json(finalCurriculum, { status: 200 });

  } catch (error) {
    console.error("Error in generate-full-course:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}