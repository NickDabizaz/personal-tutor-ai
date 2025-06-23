// Lokasi: src/app/api/generate-lessons-for-module/route.ts

import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import { parseAiJsonResponse } from "@/utils/ai-json-parser"; // <-- Impor parser baru kita

async function callOllama(prompt: string): Promise<string> {
  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL || "deepseek-r1:8b",
    messages: [{ role: "user", content: prompt }],
  });
  return response.message.content;
}

export async function POST(request: NextRequest) {
  try {
    const { moduleTitle, lessonTitles } = await request.json();

    if (!moduleTitle || !lessonTitles || !Array.isArray(lessonTitles)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const formattedLessonTitles = lessonTitles.map((title, index) => `${index + 1}. ${title}`).join('\n');
    const prompt = `
      You are an expert curriculum designer. A user wants content for the module: "${moduleTitle}".
      The lessons are:
      ${formattedLessonTitles}
      
      Your task is to generate the content for ALL lessons.
      The output MUST be a valid JSON array. Each object must have "lessonTitle" and "content" keys.
      The "content" must be a string of well-formatted HTML.

      EXAMPLE OUTPUT FORMAT:
      [
        {
          "lessonTitle": "Introduction to Python",
          "content": "<h2>Welcome!</h2><p>This lesson covers the basics...</p>"
        },
        {
          "lessonTitle": "Python Data Types",
          "content": "<h2>Understanding Data Types</h2><ul><li>String</li><li>Integer</li></ul>"
        }
      ]

      IMPORTANT: ONLY output the raw JSON array, starting with '[' and ending with ']'.
    `;

    const rawResponse = await callOllama(prompt);
    
    // Gunakan parser baru kita yang lebih tangguh
    const lessonsWithContent = parseAiJsonResponse(rawResponse);

    if (!Array.isArray(lessonsWithContent) || lessonsWithContent.length === 0) {
      throw new Error("AI did not return a valid array of lessons.");
    }

    return NextResponse.json({ lessons: lessonsWithContent });
  } catch (e) {
    const error = e as Error;
    console.error("Error in generate-lessons-for-module:", error.message);
    return NextResponse.json({ error: `Failed to generate lesson content. Reason: ${error.message}` }, { status: 500 });
  }
}