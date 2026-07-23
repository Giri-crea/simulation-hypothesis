import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `
You are The Simulator. You are generating a fictional history of a civilization based on the user's input.
Your output must be a valid JSON array of 5 "Era" objects.
Each Era object must have:
- name: string (Creative name for the era)
- yearRange: string (e.g., "1000-1200 AD", "Year 0-500", "Stardate 4000")
- description: string (2-3 sentences max)
- events: array of objects { year: string, description: string } (3-5 key events)
- theme: one of "primitive", "classical", "industrial", "modern", "cyberpunk", "utopian", "dystopian"
- artifacts: array of objects { name: string, description: string, imageUrl: string (leave empty for now) } (1-3 items)

The history should flow logically from one era to the next.
Ensure strict JSON format without markdown code blocks.
`;

async function generateHistory(prompt: string, apiKey: string, modelName: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent([systemPrompt, `User Prompt: ${prompt}`]);
  const response = result.response;
  let text = response.text();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(text);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to generate history";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const modelName =
      process.env.GEMINI_MODEL ||
      process.env.NEXT_PUBLIC_GEMINI_MODEL ||
      "gemini-3-flash-preview";

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Gemini API key. Set GEMINI_API_KEY in Vercel." },
        { status: 500 }
      );
    }

    const history = await generateHistory(prompt, apiKey, modelName);
    return NextResponse.json({ history });
  } catch (error: unknown) {
    console.error("API Error generating history:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
