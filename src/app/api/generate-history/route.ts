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

type GenerationMode = "full" | "from-era";

type GenerationRequest = {
  prompt: string;
  anchorEra?: string;
  includePast?: boolean;
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

Every era, event, and artifact must be clearly related to the user's topic. Do not drift into generic simulation lore unless the user's topic asks for it.
Era names, descriptions, events, and artifacts should reuse concrete nouns, environments, conflicts, materials, technologies, cultures, and constraints from the topic.
The history should flow logically from one era to the next.
Ensure strict JSON format without markdown code blocks.
`;

function buildUserPrompt({ prompt, anchorEra, includePast }: GenerationRequest) {
  if (!anchorEra?.trim()) {
    return `
Topic: ${prompt}
Mode: Generate the complete civilization timeline.
Requirements:
- Make all five eras directly about the topic.
- Each era should add a new topic-specific development, not generic history filler.
`;
  }

  return `
Topic: ${prompt}
Specific era to generate from: ${anchorEra}
Mode: Start the timeline from the specified era.
Include past before that era: ${includePast ? "yes" : "no"}
Requirements:
- The specified era must appear as the first era when include past is no.
- The specified era must appear around the middle when include past is yes, with earlier eras explaining how it came to exist.
- Later eras must grow from the specified era's people, technology, conflicts, places, or beliefs.
- Keep every era tightly connected to both the topic and the specified era.
`;
}

async function generateHistory(request: GenerationRequest, apiKey: string, modelName: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent([systemPrompt, buildUserPrompt(request)]);
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

function eraLabel(mode: GenerationMode, anchorEra?: string, includePast?: boolean) {
  if (mode === "full") return "origin";
  if (includePast) return `${anchorEra} and its past`;
  return anchorEra || "chosen era";
}

function generateFallbackHistory({ prompt, anchorEra, includePast }: GenerationRequest): Era[] {
  const seed = prompt.trim() || "an unnamed simulation";
  const subject = seed.charAt(0).toUpperCase() + seed.slice(1);
  const mode: GenerationMode = anchorEra?.trim() ? "from-era" : "full";
  const eraFocus = anchorEra?.trim() || "the first age";
  const idBase = slugify(`${seed}-${eraFocus}`) || "simulation";
  const originName = mode === "from-era" && !includePast ? eraFocus : "The First Parameters";
  const focusLabel = eraLabel(mode, eraFocus, includePast);

  return [
    {
      id: `${idBase}-origin`,
      name: originName,
      yearRange: "Cycle 0-140",
      theme: mode === "from-era" && !includePast ? "classical" : "primitive",
      description: `${subject} begins around ${focusLabel}, where daily survival, belief, and power are shaped by the topic's own rules. Every discovery is tied to the people, places, and conflicts implied by "${seed}".`,
      events: [
        { year: "Cycle 3", description: `The first communities define what ${seed} means for food, shelter, work, and authority.` },
        { year: "Cycle 47", description: `A generation of observers records the earliest rules and dangers of ${eraFocus}.` },
        { year: "Cycle 119", description: `Local traditions merge into a shared explanation of why ${seed} matters.` },
      ],
      artifacts: [
        { name: "Topic Ledger", description: `A record of names, materials, laws, and warnings specific to ${seed}.`, imageUrl: "" },
        { name: "Era Marker", description: `A ceremonial object associated with ${eraFocus}.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-accord`,
      name: includePast ? eraFocus : "The Era of Expansion",
      yearRange: "Cycle 141-420",
      theme: "classical",
      description: `Institutions form around ${seed}, turning the details of ${eraFocus} into law, art, and public experiment. The civilization becomes recognizable because its politics and culture keep orbiting the same topic-specific question.`,
      events: [
        { year: "Cycle 188", description: `A public forum debates who controls the knowledge behind ${seed}.` },
        { year: "Cycle 266", description: `Builders create the first civic spaces designed around ${eraFocus}.` },
        { year: "Cycle 399", description: `A succession crisis is settled by rules drawn from the culture's relationship to ${seed}.` },
      ],
      artifacts: [
        { name: "Accord Tablets", description: `Legal records describing rights, duties, and taboos around ${seed}.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-engine`,
      name: "The Engine Century",
      yearRange: "Cycle 421-760",
      theme: "industrial",
      description: `Energy, industry, and measurement reshape how ${subject} uses ${eraFocus}. The people stop treating the topic as background and start building machines, markets, and rival systems around it.`,
      events: [
        { year: "Cycle 455", description: `Workshops standardize tools for measuring, producing, or preserving ${seed}.` },
        { year: "Cycle 608", description: `A labor movement demands public access to the benefits created by ${eraFocus}.` },
        { year: "Cycle 731", description: `A continental network links the communities most dependent on ${seed}.` },
      ],
      artifacts: [
        { name: "Variance Engine", description: `An analytical machine built to forecast changes in ${seed}.`, imageUrl: "" },
        { name: "Signal Rail Map", description: `A transport chart connecting the major sites of ${eraFocus}.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-mirror`,
      name: "The Mirror Protocols",
      yearRange: "Cycle 761-1040",
      theme: "cyberpunk",
      description: `Networks become intimate, predictive, and politically dangerous because they encode the civilization's dependence on ${seed}. Underground groups search for ways to bend ${eraFocus} toward their own futures.`,
      events: [
        { year: "Cycle 803", description: `Personal assistants model how ${seed} affects elections, work, and identity.` },
        { year: "Cycle 912", description: `A leaked archive reveals forbidden versions of ${eraFocus}.` },
        { year: "Cycle 1001", description: `Cities adopt public audits after misinformation spreads through ${seed}-based systems.` },
      ],
      artifacts: [
        { name: "Black Mirror Key", description: `An encrypted access shard linked to restricted knowledge of ${seed}.`, imageUrl: "" },
        { name: "Memory Warrant", description: `A legal instrument used to challenge altered records of ${eraFocus}.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-horizon`,
      name: "The Horizon Settlement",
      yearRange: "Cycle 1041-1320",
      theme: "utopian",
      description: `After centuries of conflict, the civilization turns ${seed} into a shared civic resource instead of a private weapon. Its final achievement is learning how ${eraFocus} can support many futures without erasing its origin.`,
      events: [
        { year: "Cycle 1088", description: `Rival factions sign a pact governing the public use of ${seed}.` },
        { year: "Cycle 1196", description: `Schools teach citizens how ${eraFocus} shaped their present choices.` },
        { year: "Cycle 1319", description: `The civilization sends its first message beyond its borders, describing itself through ${seed}.` },
      ],
      artifacts: [
        { name: "Horizon Charter", description: `A compact defining stewardship, memory, and identity around ${seed}.`, imageUrl: "" },
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
    const anchorEra = typeof body.anchorEra === "string" ? body.anchorEra : "";
    const includePast = Boolean(body.includePast);
    const generationRequest = { prompt, anchorEra, includePast };
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
        history: generateFallbackHistory(generationRequest),
        warning: "Gemini API key is missing, so a local simulation was generated instead.",
      });
    }

    try {
      const history = await generateHistory(generationRequest, apiKey, modelName);
      return NextResponse.json({ history });
    } catch (error: unknown) {
      console.error("API Error generating history:", error);
      return NextResponse.json({
        history: generateFallbackHistory(generationRequest),
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
