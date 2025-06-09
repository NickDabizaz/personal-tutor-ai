import { NextRequest } from "next/server";
import ollama from "ollama";

export const runtime = "nodejs"; 

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, model = "deepseek-r1:8b" } = body;

  const ollamaStream = await ollama.chat({
    model,
    stream: true,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of ollamaStream) {
        controller.enqueue(encoder.encode(chunk.message.content));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
    },
  });
}
