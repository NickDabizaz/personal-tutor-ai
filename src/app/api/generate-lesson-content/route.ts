// src/app/api/generate-lesson-content/route.ts

import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

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
    const { moduleTitle, lessonTitle } = body;

    if (!moduleTitle || !lessonTitle) {
      return NextResponse.json({ error: "moduleTitle and lessonTitle are required" }, { status: 400 });
    }

    console.log(`Generating content for lesson: ${lessonTitle}`);

    const contentPrompt = `
      Generate a brief, placeholder lesson content for a topic titled "${lessonTitle}" within the module "${moduleTitle}".

      IMPORTANT DEVELOPMENT RULE: For faster testing, keep the content very short. Just one heading and one sentence.
      
      Use this exact HTML format: "<h2>${lessonTitle}</h2><p>This is a placeholder for the lesson content. More details will be added later in production.</p>"

      Provide ONLY the HTML content as your response. Do not add any other text.
    `;

    const content = await callOllama(contentPrompt);
    
    console.log(`Content generated for lesson: ${lessonTitle}`);
    
    return NextResponse.json({ content: content.trim() }, { status: 200 });

  } catch (error) {
    console.error("Error in generate-lesson-content:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
