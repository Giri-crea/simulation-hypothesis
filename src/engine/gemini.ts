import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" }
});

export async function generateHistory(prompt: string) {
    if (!API_KEY) {
        throw new Error("Missing Gemini API Key");
    }

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

    try {
        const result = await model.generateContent([
            systemPrompt,
            `User Prompt: ${prompt}`
        ]);

        const response = result.response;
        let text = response.text();
        console.log("Gemini Raw Response:", text); // Debug log

        // Clean up markdown just in case, though JSON mode should handle it
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (e) {
        console.error("Gemini API Error:", e);
        throw e;
    }
}
