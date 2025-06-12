import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

export const runtime = "nodejs";

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
    `;

    const response = await ollama.chat({
      model: "deepseek-r1:8b",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    const llmOutput = response.message.content;

    try {
      const startIndex = llmOutput.indexOf('[');
      const endIndex = llmOutput.lastIndexOf(']');

      if (startIndex === -1 || endIndex === -1) {
        throw new Error("Valid JSON array not found in the LLM response.");
      }
      
      let jsonString = llmOutput.substring(startIndex, endIndex + 1);

      // Clean the string from any potential markdown formatting that might have slipped through
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
      
      const questionsJson = JSON.parse(jsonString);
      
      if (!Array.isArray(questionsJson)) {
        throw new Error("LLM did not return a valid JSON array.");
      }
      
      return NextResponse.json(questionsJson, { status: 200 });

    } catch (parseError: any) {
      console.error("Failed to parse LLM response. Raw output:", llmOutput);
      return NextResponse.json({ error: `Failed to process AI response: ${parseError.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}