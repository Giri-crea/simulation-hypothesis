import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Event = {
  year: string;
  description: string;
};

type Artifact = {
  name: string;
  description: string;
  imageUrl?: string;
};

type Era = {
  id: string;
  name: string;
  yearRange: string;
  description: string;
  events: Event[];
  artifacts: Artifact[];
  theme: "primitive" | "classical" | "industrial" | "modern" | "cyberpunk" | "utopian" | "dystopian";
};

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function generateFallbackHistory(prompt: string): Era[] {
  const seed = prompt.trim() || "an unnamed simulation";
  const subject = seed.charAt(0).toUpperCase() + seed.slice(1);
  const idBase = slugify(seed) || "simulation";

  return [
    {
      id: `${idBase}-origin`,
      name: "The First Parameters",
      yearRange: "Cycle 0-140",
      theme: "primitive",
      description: `${subject} begins as a fragile society organized around survival, ritual, and the first shared maps of reality. Small discoveries become sacred because every pattern feels like a message from the system beneath the world.`,
      events: [
        { year: "Cycle 3", description: "The first settlements agree on a shared calendar of anomalies." },
        { year: "Cycle 47", description: "A generation of observers records repeating signs in weather, dreams, and machine-like coincidences." },
        { year: "Cycle 119", description: "Competing origin stories are merged into the first civic doctrine." },
      ],
      artifacts: [
        { name: "The Seed Ledger", description: "A carved index of early rules, omens, debts, and survival protocols.", imageUrl: "" },
        { name: "Founders' Compass", description: "A ceremonial tool said to point toward places where reality feels thin.", imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-accord`,
      name: "The Era of Accord",
      yearRange: "Cycle 141-420",
      theme: "classical",
      description: `Institutions form around ${seed}, transforming scattered beliefs into law, art, and public experiment. The civilization learns that stories can coordinate behavior as powerfully as armies.`,
      events: [
        { year: "Cycle 188", description: "The first open forum invites citizens to challenge official explanations of the world." },
        { year: "Cycle 266", description: "Architects build observatories aligned to recurring simulation-like glitches." },
        { year: "Cycle 399", description: "A peaceful succession system prevents the first great fracture." },
      ],
      artifacts: [
        { name: "Accord Tablets", description: "Legal records that double as philosophical arguments about agency.", imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-engine`,
      name: "The Engine Century",
      yearRange: "Cycle 421-760",
      theme: "industrial",
      description: `Energy, industry, and measurement reshape the civilization's confidence. The people stop asking whether the hidden machinery exists and begin asking who benefits from understanding it first.`,
      events: [
        { year: "Cycle 455", description: "Factories standardize instruments capable of detecting impossible statistical patterns." },
        { year: "Cycle 608", description: "A labor movement demands public access to predictive technologies." },
        { year: "Cycle 731", description: "The first continental network links observatories, libraries, and civic councils." },
      ],
      artifacts: [
        { name: "Variance Engine", description: "A brass-and-glass analytical machine built to forecast unstable futures.", imageUrl: "" },
        { name: "Signal Rail Map", description: "A transport chart annotated with zones of unusually high coincidence.", imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-mirror`,
      name: "The Mirror Protocols",
      yearRange: "Cycle 761-1040",
      theme: "cyberpunk",
      description: `Networks become intimate, predictive, and politically dangerous. Every citizen carries a partial model of the world, while underground groups search for exploits in causality itself.`,
      events: [
        { year: "Cycle 803", description: "Personal prediction assistants become common enough to alter elections and markets." },
        { year: "Cycle 912", description: "A leaked model reveals several officially impossible histories." },
        { year: "Cycle 1001", description: "Cities adopt reality audits after a coordinated cascade of false memories." },
      ],
      artifacts: [
        { name: "Black Mirror Key", description: "An encrypted access shard linked to forbidden simulation diagnostics.", imageUrl: "" },
        { name: "Memory Warrant", description: "A legal instrument used to challenge edited personal histories.", imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-horizon`,
      name: "The Horizon Settlement",
      yearRange: "Cycle 1041-1320",
      theme: "utopian",
      description: `After centuries of conflict, the civilization treats uncertainty as a civic resource instead of a threat. Its final achievement is not escaping the simulation, but learning to negotiate with the futures it can imagine.`,
      events: [
        { year: "Cycle 1088", description: "Rival factions sign a pact limiting reality manipulation to public-interest experiments." },
        { year: "Cycle 1196", description: "Schools teach citizens how to read probabilistic histories without surrendering choice." },
        { year: "Cycle 1319", description: "The first message is sent beyond the known boundary and receives a reply written as a question." },
      ],
      artifacts: [
        { name: "Horizon Charter", description: "A compact defining personhood across organic, artificial, and simulated lives.", imageUrl: "" },
      ],
    },
  ];
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
      return NextResponse.json({
        history: generateFallbackHistory(prompt),
        warning: "Gemini API key is missing, so a local simulation was generated instead.",
      });
    }

    try {
      const history = await generateHistory(prompt, apiKey, modelName);
      return NextResponse.json({ history });
    } catch (error: unknown) {
      console.error("API Error generating history:", error);
      return NextResponse.json({
        history: generateFallbackHistory(prompt),
        warning: `Gemini was unavailable, so a local simulation was generated instead. ${getErrorMessage(error)}`,
      });
    }
  } catch (error: unknown) {
    console.error("API Error generating history:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
