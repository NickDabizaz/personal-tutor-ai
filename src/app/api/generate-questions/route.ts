import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

export const runtime = "nodejs";

// Helper function that's more robust for JSON extraction
function extractJsonFromString(text: string): string | null {
  // Regex to find the first valid JSON block (array [...] or object {...})
  const jsonRegex = /\[[\s\S]*\]|{[\s\S]*}/;
  const match = text.match(jsonRegex);

  if (match) {
    // Ensure the matched text is actually parseable JSON
    try {
      JSON.parse(match[0]);
      return match[0];    } catch {
      // If regex found wrong brackets/braces, ignore
      console.error("Regex match was not valid JSON, returning null.");
      return null;
    }
  }
  
  console.error("No valid JSON block found in the string.");
  return null;
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Course name and description are required" }, { status: 400 });
    }

    const prompt = `
      You are a world-class instructional designer, specializing in crafting professional-grade curricula. Your task is to generate a series of insightful diagnostic questions for a student based on their initial course idea.

      The user's course idea is:
      - Topic: "${name}"
      - Description: "${description}"

      These questions are a diagnostic tool to extract the necessary information for YOU to build a world-class curriculum later. The questions must probe the student's foundational knowledge, motivations, learning methodology, and desired outcomes with surgical precision.

      The final questions must be structured across four key domains:
      1.  **Foundational Knowledge:** Assess their starting point.
      2.  **Motivation & Goals:** Understand the 'why' behind their learning journey.
      3.  **Learning Methodology:** Uncover their preferred way of absorbing information.
      4.  **Desired Outcomes & Application:** Clarify what success looks like for them.

      ---
      **CRITICAL: JSON FORMAT EXAMPLE**
      Your output MUST be a valid JSON array.
      - **Correct Example of one object in the array:**
        \`{ "no": 1, "category": "Motivation & Goals", "question": "What is your primary goal?", "type": 0, "options": ["A", "B", "C", "D"], "placeholder": "" }\`
      - **Incorrect Example to AVOID (extra comma, missing quotes):**
        \`{ "no": 2,, category: "...", ... }\`
      ---
      
      **GENERATION RULES:**
      1.  **Generate a concise number of questions, between 5 and 7.**
      2.  Your response MUST BE ONLY a valid JSON array string. Do NOT include any text, explanation, or markdown formatting (like \`\`\`json\`) before or after the JSON array.
      3.  Each object in the JSON array must follow the exact structure shown in the 'Correct Example' above. All property names MUST be in double quotes.
      4.  For \`type: 0\` (multiple choice), provide exactly four specific, non-overlapping options.
      5.  For \`type: 1\` (free text), the \`options\` array MUST be empty (\`[]\`). The \`placeholder\` text MUST be specific and inspiring.
      6.  Crucially, do NOT generate generic options such as 'None of the above', 'All of the above', or 'Other'. All options must be specific and distinct choices.
    `;    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || "deepseek-r1:8b",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });    const llmOutput = response.message.content;

    try {
      const jsonString = extractJsonFromString(llmOutput);

      if (!jsonString) {
        // If no JSON could be extracted, throw error
        throw new Error("Could not extract valid JSON from the LLM response.");
      }

      const questionsJson = JSON.parse(jsonString);
      
      // Optional: You can still check if the result is an array
      if (!Array.isArray(questionsJson)) {
        throw new Error("Extracted JSON is not an array.");
      }
      
      return NextResponse.json(questionsJson, { status: 200 });

    } catch (error: unknown) {
      // More informative error logging
      console.error("====================== DEBUG START ======================");
      console.error("Failed to parse LLM response. See raw output below.");
      console.error("ERROR MESSAGE:", error instanceof Error ? error.message : String(error));
      console.error("--- LLM RAW OUTPUT ---");
      console.error(llmOutput);
      console.error("--- END RAW OUTPUT ---");
      console.error("======================= DEBUG END =======================");
      
      const errorMessage = error instanceof Error ? error.message : "Unknown parsing error";
      return NextResponse.json({ 
        error: `Failed to process AI response. Details: ${errorMessage}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}