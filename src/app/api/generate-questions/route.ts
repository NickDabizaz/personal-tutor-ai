// Lokasi: src/app/api/generate-questions/route.ts

import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";
import { parseAiJsonResponse } from "@/utils/ai-json-parser"; // <-- Impor parser baru kita

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;
    if (!name) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    // --- PROMPT DIPERBARUI DENGAN CONTOH ---
    const prompt = `
      You are an instructional designer. Generate 5-7 diagnostic questions for a student interested in a course on "${name}".
      The output MUST be a valid JSON array of objects.
      Each question MUST be "type": 0 (multiple choice).
      Provide 3-4 distinct and meaningful options for each question.
      Do not add explanations or markdown fences.

      HERE IS A PERFECT EXAMPLE OF THE OUTPUT FORMAT:
      [
        {
          "no": 1,
          "category": "Foundational Knowledge",
          "question": "How familiar are you with the basic syntax of this topic?",
          "type": 0,
          "options": ["Complete beginner, starting from zero", "I have some basic theoretical knowledge", "I've built a small project with it before"],
          "placeholder": ""
        },
        {
          "no": 2,
          "category": "Motivation & Goals",
          "question": "What is your primary goal for learning this?",
          "type": 0,
          "options": ["To build a personal project or portfolio", "To get a new job or promotion", "For academic purposes or curiosity"],
          "placeholder": ""
        }
      ]
      
      Now, generate the questions for the user's topic. YOUR RESPONSE MUST START WITH '[' AND END WITH ']'.
    `;
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || "deepseek-r1:8b",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });
    
    const llmOutput = response.message.content;

    try {
      // Gunakan parser baru kita yang lebih tangguh
      const questionsJson = parseAiJsonResponse(llmOutput);
      return NextResponse.json(questionsJson, { status: 200 });

    } catch (error: unknown) {
      console.error("====================== DEBUG START (generate-questions) ======================");
      console.error("Failed to parse LLM response. See raw output below.");
      console.error("ERROR MESSAGE:", error instanceof Error ? error.message : String(error));
      console.error("--- LLM RAW OUTPUT ---");
      console.error(llmOutput);
      console.error("======================= DEBUG END =======================");
      
      const errorMessage = error instanceof Error ? error.message : "Unknown parsing error";
      return NextResponse.json({ 
        error: `Failed to process AI response. Details: ${errorMessage}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error in generate-questions:", error);
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

