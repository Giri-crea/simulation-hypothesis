import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

if (!API_KEY) {
  throw new Error("Missing Gemini API Key. Set GEMINI_API_KEY in your environment.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: { responseMimeType: "application/json" },
});

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

async function generateHistory(prompt: string) {
  const result = await model.generateContent([systemPrompt, `User Prompt: ${prompt}`]);
  const response = result.response;
  let text = response.text();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(text);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const history = await generateHistory(prompt);
    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("API Error generating history:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate history" },
      { status: 500 }
    );
  }
}
