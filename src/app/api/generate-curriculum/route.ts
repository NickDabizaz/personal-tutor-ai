import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

export const runtime = "nodejs";

// Interface for the expected request body
interface GenerateCurriculumRequest {
  name: string;
  description?: string; // Made optional
  answers: {
    question: string;
    answer: string;
  }[];
}

// Helper function yang sangat robust untuk ekstraksi dan perbaikan JSON
function extractAndSanitizeJson(text: string): string | null {
  // 1. Cari '{' pertama dan '}' terakhir untuk menangkap blok JSON
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null; // Tidak ada blok objek JSON yang valid
  }

  let jsonString = text.substring(startIndex, endIndex + 1);

  // 2. SECARA OTOMATIS TAMBAHKAN KOMA YANG HILANG
  // Regex ini mencari pola: "sebuah-string" diikuti oleh newline lalu "properti_berikutnya":
  // dan menyisipkan koma di antaranya.
  jsonString = jsonString.replace(/"\s*\n\s*"/g, '",\n"');

  // 3. Hapus koma di akhir (trailing comma) yang mungkin juga dibuat oleh AI
  jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

  // 4. Hapus comments yang mungkin ada
  jsonString = jsonString.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

  // 5. Coba parse untuk validasi akhir
  try {
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    console.error("Gagal parse JSON bahkan setelah sanitasi:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {    const body: GenerateCurriculumRequest = await req.json();
    const { name, description, answers } = body;

    if (!name || !answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Course name and a non-empty array of answers are required" }, { status: 400 });
    }

    const qaString = answers
      .map(item => `Question: ${item.question}\nAnswer: ${item.answer}`)
      .join("\n\n");    const prompt = `
      You are an expert Curriculum Architect. Your task is to create a detailed, practical course curriculum based on a user's goal and their answers.

      **User's Goal:**
      - Topic: "${name}"${description ? `\n      - Description: "${description}"` : `\n      - Description: Not provided`}

      **User's Answers:**
      ${qaString}

      ---
      **CRITICAL INSTRUCTIONS:**
      1.  Analyze the user's goal and answers carefully.
      2.  Generate a curriculum with 4 to 6 distinct, logically sequenced modules.
      3.  Your response MUST BE a single, valid JSON object string and nothing else.
      4.  DO NOT include any text, explanation, or markdown formatting (like \`\`\`json\`) before or after the JSON object.
      5.  The JSON object must follow this exact structure:
          {
            "title": "A compelling course title.",
            "description": "A 2-3 sentence summary of the course.",
            "modules": [
              {
                "id": 1,
                "title": "Module 1 Title",
                "objective_1": "First learning objective.",
                "objective_2": "Second learning objective.",
                "objective_3": "Third learning objective.",
                "estimated_minutes": 90,
                "total_lessons": 5
              }
            ]
          }      6.  **JSON RULES TO FOLLOW STRICTLY:**
          - All property names (keys) MUST be enclosed in double quotes (e.g., "title").
          - **Ensure every key-value pair is separated by a comma, including between objectives (objective_1, objective_2, objective_3).**
          - Ensure every key is followed by a colon ':'.
          - Do NOT use single quotes.
          - Do NOT add a comma after the last item in a list or object.
          - **CRITICAL: Pay special attention to commas between consecutive properties. Missing commas will break the JSON format.**
    `;    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || "deepseek-r1:8b",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });    const llmOutput = response.message.content;

    try {
      const sanitizedJsonString = extractAndSanitizeJson(llmOutput);
      
      if (!sanitizedJsonString) {
        throw new Error("Could not extract or sanitize valid JSON from the LLM response.");
      }
      
      const curriculumJson = JSON.parse(sanitizedJsonString);

      return NextResponse.json(curriculumJson, { status: 200 });
    } catch (parseError: unknown) {
      // More detailed logging for debugging
      console.error("====================== DEBUG START ======================");
      console.error("Failed to parse LLM response. See raw output below.");
      console.error("ERROR MESSAGE:", parseError instanceof Error ? parseError.message : String(parseError));
      console.error("--- LLM RAW OUTPUT ---");
      console.error(llmOutput);
      console.error("--- END RAW OUTPUT ---");
      console.error("======================= DEBUG END =======================");
      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parsing error";
      return NextResponse.json({ error: `Failed to process AI response. Please try again. Details: ${errorMessage}` }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}