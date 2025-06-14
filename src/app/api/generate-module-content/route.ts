import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

export const runtime = "nodejs";

// Helper untuk ekstraksi JSON yang sangat robust
function extractJsonFromString(text: string): string | null {
  // 1. Cari '{' pertama dan '}' terakhir untuk menangkap seluruh blok JSON
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    // Jika tidak ditemukan blok objek JSON yang valid
    return null;
  }

  // 2. Ekstrak string JSON potensial
  const jsonString = text.substring(startIndex, endIndex + 1);

  // 3. Coba parse untuk memastikan ini adalah JSON yang valid
  try {
    JSON.parse(jsonString);
    // Jika berhasil, kembalikan string JSON yang sudah bersih
    return jsonString;
  } catch (error) {
    // Jika gagal parse, berarti formatnya memang salah
    console.error("Failed to parse extracted JSON string:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Deklarasikan di luar agar bisa diakses di catch
  let llmOutput = "";
  
  try {
    const body = await req.json();
    const { moduleTitle, courseTitle, objectives, total_lessons } = body;

    if (!moduleTitle || !courseTitle || !objectives) {
      return NextResponse.json({ error: "moduleTitle, courseTitle, and objectives are required" }, { status: 400 });
    }

    const prompt = `
      You are an expert instructional designer creating a detailed lesson plan for a module within the course titled "${courseTitle}".

      Your current task is to design the structure for the module: "${moduleTitle}".
      This module's objectives are:
      - ${objectives.join("\n- ")}

      CRITICAL INSTRUCTIONS:
      1.  Based on the objectives, break this module down into exactly ${total_lessons || 5} distinct lessons.
      2.  Your entire response MUST BE a single, valid JSON object, starting with { and ending with }.
      3.  The JSON object must have a single key: "lessons".
      4.  The value of "lessons" MUST be an array of lesson objects.
      5.  Each lesson object must have "title" (string) and "content" (string).
      6.  For the "content", generate placeholder text using HTML format (e.g., "<h2>Lesson 1</h2><p>Lorem ipsum...</p>").
      7.  IMPORTANT: Do not include any text, explanations, or markdown formatting like \`\`\`json before or after the JSON object.

      JSON Structure Example:
      {
        "lessons": [
          {
            "title": "Lesson 1: Setting Up Your Environment",
            "content": "<h2>Lesson 1: Setting Up Your Environment</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p><p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
          },
          {
            "title": "Lesson 2: Understanding Core Concepts",
            "content": "<h2>Lesson 2: Understanding Core Concepts</h2><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>"
          }
        ]
      }
    `;

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || "deepseek-r1:8b",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    llmOutput = response.message.content; // Simpan output mentah
    const jsonString = extractJsonFromString(llmOutput);

    if (!jsonString) {
      throw new Error("Could not extract valid JSON from the LLM response for module content.");
    }

    const contentJson = JSON.parse(jsonString);
    return NextResponse.json(contentJson, { status: 200 });

  } catch (error: unknown) {
    // Logging yang jauh lebih baik untuk debugging
    console.error("\n--- ERROR IN generate-module-content ---");
    console.error("Error Message:", error instanceof Error ? error.message : String(error));
    console.error("--- RAW LLM OUTPUT RECEIVED ---");
    console.error(llmOutput); // Kita log output mentah dari AI
    console.error("--- END OF DEBUG ---\n");
    return NextResponse.json({ error: "Internal server error processing LLM response." }, { status: 500 });
  }
}
