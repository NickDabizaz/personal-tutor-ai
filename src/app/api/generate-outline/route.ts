// src/app/api/generate-outline/route.ts

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
    const { name, description = "", answers } = body;
    const qaString = answers.map((item: { question: string; answer: string }) => `Q: ${item.question}\\nA: ${item.answer}`).join("\\n\\n");

    console.log("Generating course outline...");
    
    const structurePrompt = `
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

    console.log("Course outline generated successfully!");
    
    return NextResponse.json({
      title: courseTitle,
      description: courseDescription,
      moduleTitles: moduleTitles
    }, { status: 200 });

  } catch (error) {
    console.error("Error in generate-outline:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
