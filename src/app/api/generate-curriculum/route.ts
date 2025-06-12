import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

export const runtime = "nodejs";

// Interface for the expected request body
interface GenerateCurriculumRequest {
  name: string;
  description: string;
  answers: {
    question: string;
    answer: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateCurriculumRequest = await req.json();
    const { name, description, answers } = body;

    if (!name || !description || !answers || answers.length === 0) {
      return NextResponse.json({ error: "Course name, description, and answers are required" }, { status: 400 });
    }

    // Format the Q&A into a readable string for the prompt
    const qaString = answers
      .map(item => `Question: ${item.question}\nAnswer: ${item.answer}`)
      .join("\n\n");

    const prompt = `
      You are an expert Curriculum Architect and Instructional Designer. Your task is to create a detailed, practical, and engaging course curriculum based on a user's goal and their answers to a diagnostic questionnaire.

      **User's Initial Goal:**
      - Course Topic: "${name}"
      - Course Description: "${description}"

      **User's Diagnostic Answers:**
      ${qaString}

      ---
      **CURRICULUM GENERATION INSTRUCTIONS:**
      1.  Analyze the user's goal and answers to understand their skill level, motivation, and desired outcomes.
      2.  Generate a curriculum with 4 to 6 distinct, logically sequenced modules.
      3.  The curriculum should be beginner-friendly but comprehensive, guiding the user from foundational concepts to practical application.
      4.  Your response MUST BE ONLY a valid JSON object string. Do not include any text, explanation, or markdown formatting before or after the JSON object.
      5.  The JSON object must follow this exact structure:
          {
            "title": "A compelling and comprehensive title for the entire course.",
            "description": "A 2-3 sentence summary of what the user will learn and achieve in this course.",
            "modules": [
              {
                "id": 1,
                "title": "Module Title (e.g., '1. Introduction to Topic X')",
                "objective_1": "A clear, action-oriented learning objective for this module.",
                "objective_2": "A second distinct learning objective.",
                "objective_3": "A third distinct learning objective.",
                "estimated_minutes": 90,
                "total_lessons": 5
              }
            ]
          }
      6.  For each module:
          - The title must be descriptive and include the module number.
          - The three objectives must be concise, unique, and start with a verb (e.g., "Understand...", "Implement...", "Analyze...").
          - \`estimated_minutes\` must be a single integer representing the total time for the module in minutes.
          - \`total_lessons\` must be a single integer representing the number of lessons or topics within that module.
    `;

    const response = await ollama.chat({
      model: "deepseek-r1:8b", // You can use a more powerful model if available
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    const llmOutput = response.message.content;

    try {
      // Basic cleanup for the LLM response to ensure it's valid JSON
      const startIndex = llmOutput.indexOf('{');
      const endIndex = llmOutput.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("Valid JSON object not found in the LLM response.");
      }
      const jsonString = llmOutput.substring(startIndex, endIndex + 1);
      const curriculumJson = JSON.parse(jsonString);

      return NextResponse.json(curriculumJson, { status: 200 });
    } catch (parseError: any) {
      console.error("Failed to parse LLM response. Raw output:", llmOutput);
      return NextResponse.json({ error: `Failed to process AI response: ${parseError.message}` }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}