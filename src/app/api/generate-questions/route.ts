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

    // Advanced prompt to generate diagnostic questions
    const prompt = `You are a world-class instructional designer from a top-tier university, specializing in crafting bespoke, professional-grade curricula. Your task is to generate a series of deeply insightful diagnostic questions for a student based on their initial course idea.

The user's course idea is:
- Topic: "${name}"
- Description: "${description}"

These questions are NOT the course content itself. They are a diagnostic tool to extract the necessary information for YOU to build a world-class curriculum later. The questions must probe the student's foundational knowledge, motivations, learning methodology, and desired outcomes with surgical precision.

Before generating the questions, you must perform a silent, top-down analysis based on the user's input to determine the core learning objectives and the potential modular structure. The final questions must reflect this deep analysis and be structured across four key domains:
1.  **Foundational Knowledge:** Assess their starting point.
2.  **Motivation & Goals:** Understand the 'why' behind their learning journey.
3.  **Learning Methodology:** Uncover their preferred way of absorbing information (theory vs. practice).
4.  **Desired Outcomes & Application:** Clarify what success looks like for them and how they'll apply the knowledge.

---
**GENERATION RULES:**
1.  Generate a thoughtful number of questions, between 7 and 10.
2.  Your response MUST BE ONLY a valid JSON array string. Do NOT include any text, explanation, or markdown formatting before or after the JSON array.
3.  Each object in the JSON array must follow this exact structure:
    {
      "no": 1,
      "category": "The domain name from the four listed above",
      "question": "The insightful and specific question text.",
      "type": 0,
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "placeholder": "An inspiring and specific placeholder for type 1 questions."
    }
4.  For \`type: 0\` (multiple choice), provide exactly four specific, non-overlapping options. The frontend will automatically add a fifth 'Other (please specify)' input field.
5.  For \`type: 1\` (free text), the \`options\` array MUST be empty (\`[]\`). The \`placeholder\` text MUST be specific and inspiring, guiding the user to give a detailed answer.
6.  **Crucially, do NOT generate generic options such as 'None of the above', 'All of the above', or 'Other'. All options must be specific and distinct choices related to the question.**
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
      
      const jsonString = llmOutput.substring(startIndex, endIndex + 1);

      // Clean the string from unnecessary backslashes
      const cleanedJsonString = jsonString.replace(/\\"/g, '"');
      
      // Parse the cleaned string
      const questionsJson = JSON.parse(cleanedJsonString);
      
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