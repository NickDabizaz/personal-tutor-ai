// src/app/api/generate-modules/route.ts

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
    const { courseTitle, moduleTitles } = body;

    if (!courseTitle || !moduleTitles || !Array.isArray(moduleTitles)) {
      return NextResponse.json({ error: "courseTitle and moduleTitles are required" }, { status: 400 });
    }

    console.log(`Generating module details for ${moduleTitles.length} modules...`);

    // Generate details untuk setiap modul secara paralel
    const modulePromises = moduleTitles.map(async (moduleTitle: string, index: number) => {
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
      
      // Buat lessons dengan title tapi content kosong
      const lessons: Lesson[] = lessonTitles.map(title => ({
        title: title.trim(),
        content: "" // Kosong, akan diisi nanti oleh generate-lesson-content
      }));

      // Membuat objek modul lengkap
      const newModule: Module = {
        id: index + 1,
        title: moduleTitle,
        lessons: lessons,
        total_lessons: lessons.length,
        estimated_minutes: lessons.length * 15, // Estimasi 15 menit per pelajaran
        objective_1: `Understand the core concepts of ${moduleTitle}.`,
        objective_2: `Apply the principles of ${moduleTitle} in practice.`,
        objective_3: `Build foundational skills in ${moduleTitle}.`
      };
      
      return newModule;
    });

    const modules = await Promise.all(modulePromises);
    
    console.log("Module structure generated successfully!");
    
    return NextResponse.json({ modules }, { status: 200 });

  } catch (error) {
    console.error("Error in generate-modules:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
