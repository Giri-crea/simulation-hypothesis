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
  anchorCycle?: string;
  includePast?: boolean;
};

const systemPrompt = `
You are The Simulator. You generate a coherent fictional or alternate-history timeline based on the user's input. The input may be a civilization, place, technology, event, person, or era.
Your output must be a valid JSON array of 5 "Era" objects.
Each Era object must have:
- name: string (Creative name for the historical era or phase)
- yearRange: string (chronological cycle or time range only, e.g., "Cycle 40-120", "1000-1200 AD", "Stardate 4000")
- description: string (2-3 sentences max)
- events: array of objects { year: string, description: string } (3-5 key events)
- theme: one of "primitive", "classical", "industrial", "modern", "cyberpunk", "utopian", "dystopian"
- artifacts: array of objects { name: string, description: string, imageUrl: string (leave empty for now) } (1-3 items)

Every era, event, and artifact must be clearly related to the user's topic. Do not drift into generic simulation lore unless the user's topic asks for it.
Era names, descriptions, events, and artifacts should reuse concrete nouns, environments, conflicts, materials, technologies, cultures, and constraints from the topic.
Do not confuse era and cycle: the era is the named period of culture/history, while the cycle is the time range when it happens.
The history should flow logically from one era to the next.
Ensure strict JSON format without markdown code blocks.
`;

function buildUserPrompt({ prompt, anchorEra, anchorCycle, includePast }: GenerationRequest) {
  if (!anchorEra?.trim()) {
    return `
Topic: ${prompt}
Mode: Generate the complete civilization timeline.
Requirements:
- Make all five eras directly about the topic.
- If the topic is an event, generate eras about the aftermath and consequences of that event.
- If the topic names a real person or event, keep the timeline historically plausible unless the user asks for fantasy or sci-fi.
- Each era should add a new topic-specific development, not generic history filler.
`;
  }

  return `
Topic: ${prompt}
Specific era to generate from: ${anchorEra}
Specific cycle/time range for that era: ${anchorCycle?.trim() || "not specified"}
Mode: Start the timeline from the specified era.
Include past before that era: ${includePast ? "yes" : "no"}
Requirements:
- The specified era must appear as the first era when include past is no.
- The specified era must appear around the middle when include past is yes, with earlier eras explaining how it came to exist.
- If a specific cycle/time range is provided, use it as yearRange for the specified era only.
- Keep era name and cycle/time range separate.
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

function cleanTopic(value: string) {
  return value
    .trim()
    .replace(/^the\s+/i, "")
    .replace(/\s+/g, " ");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function eventLabel(topic: string) {
  return topic.replace(/^after\s+/i, "the aftermath of ");
}

function generateFallbackHistory({ prompt, anchorEra, anchorCycle, includePast }: GenerationRequest): Era[] {
  const seed = cleanTopic(prompt) || "an unnamed turning point";
  const topic = eventLabel(seed);
  const titleTopic = capitalize(topic);
  const mode: GenerationMode = anchorEra?.trim() ? "from-era" : "full";
  const eraFocus = cleanTopic(anchorEra || "") || "the opening phase";
  const cycleFocus = anchorCycle?.trim();
  const idBase = slugify(`${seed}-${eraFocus}`) || "simulation";
  const firstCycle = mode === "from-era" && !includePast && cycleFocus ? cycleFocus : "Cycle 0-140";
  const anchoredCycle = includePast && cycleFocus ? cycleFocus : "Cycle 141-420";
  const openingName = mode === "from-era" && !includePast ? capitalize(eraFocus) : "The Opening Shock";
  const secondName = includePast ? capitalize(eraFocus) : "The Settlement of Power";

  return [
    {
      id: `${idBase}-opening`,
      name: openingName,
      yearRange: firstCycle,
      theme: mode === "from-era" && !includePast ? "classical" : "primitive",
      description: `The timeline begins with ${topic}, focusing on the immediate instability, leadership choices, and social pressure created by the topic. Instead of treating the prompt as a civilization name, this era frames it as the cause of a changing historical situation.`,
      events: [
        { year: "Cycle 3", description: `News and interpretations of ${topic} spread through the first affected communities.` },
        { year: "Cycle 47", description: `Rival groups compete to define what ${topic} means for authority, territory, and survival.` },
        { year: "Cycle 119", description: `Early institutions form around the practical problems created by ${topic}.` },
      ],
      artifacts: [
        { name: "Succession Record", description: `A compact record of claims, alliances, and disputes that followed ${topic}.`, imageUrl: "" },
        { name: "Boundary Map", description: `A map showing how power and movement changed after ${topic}.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-settlement`,
      name: secondName,
      yearRange: anchoredCycle,
      theme: "classical",
      description: `A more stable order emerges as leaders, families, cities, or factions adapt to ${topic}. This era is about consolidation: who gains legitimacy, who loses influence, and which rules survive the first crisis.`,
      events: [
        { year: "Cycle 188", description: `A council or ruling circle turns the first emergency around ${topic} into formal policy.` },
        { year: "Cycle 266", description: `Trade, military planning, and civic life reorganize around the new balance of power.` },
        { year: "Cycle 399", description: `A major dispute is settled by precedent rather than force, giving the new era its shape.` },
      ],
      artifacts: [
        { name: "Accord Tablets", description: `Legal records describing the agreements that stabilized society after ${topic}.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-expansion`,
      name: "The Expansion of Systems",
      yearRange: "Cycle 421-760",
      theme: "industrial",
      description: `${titleTopic} becomes the foundation for larger systems of administration, economy, memory, and defense. The society no longer only reacts to the event; it builds durable structures from its consequences.`,
      events: [
        { year: "Cycle 455", description: `Officials standardize records, routes, and obligations created by ${topic}.` },
        { year: "Cycle 608", description: `A reform movement challenges who benefits from the post-event order.` },
        { year: "Cycle 731", description: `A wider network links regions most affected by the consequences of ${topic}.` },
      ],
      artifacts: [
        { name: "Administrative Grid", description: `A planning system used to manage resources and loyalties after ${topic}.`, imageUrl: "" },
        { name: "Route Ledger", description: `A transport and tribute record connecting the major post-event centers.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-fracture`,
      name: "The Fracture Debates",
      yearRange: "Cycle 761-1040",
      theme: "modern",
      description: `Later generations reinterpret ${topic}, turning it into a political argument about identity, justice, and inheritance. The past becomes contested because different groups need different versions of it.`,
      events: [
        { year: "Cycle 803", description: `Schools and archives begin teaching competing explanations of ${topic}.` },
        { year: "Cycle 912", description: `A hidden record challenges the official story and reopens old claims.` },
        { year: "Cycle 1001", description: `Cities adopt public audits to settle disputed memories and property rights.` },
      ],
      artifacts: [
        { name: "Contradictory Chronicle", description: `A disputed text preserving an alternative account of ${topic}.`, imageUrl: "" },
        { name: "Memory Warrant", description: `A legal instrument used to challenge inherited claims from the earlier eras.`, imageUrl: "" },
      ],
    },
    {
      id: `${idBase}-legacy`,
      name: "The Legacy Settlement",
      yearRange: "Cycle 1041-1320",
      theme: "utopian",
      description: `The society finally treats ${topic} as shared history rather than a weapon. Its long-term achievement is not forgetting the rupture, but building a future that can admit what changed and why.`,
      events: [
        { year: "Cycle 1088", description: `Rival factions sign a pact governing how the history of ${topic} can be used in public life.` },
        { year: "Cycle 1196", description: `Schools teach the event as a chain of causes rather than a single myth.` },
        { year: "Cycle 1319", description: `A final charter defines rights and responsibilities for communities shaped by the event.` },
      ],
      artifacts: [
        { name: "Legacy Charter", description: `A compact defining stewardship, memory, and identity after ${topic}.`, imageUrl: "" },
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
    const anchorCycle = typeof body.anchorCycle === "string" ? body.anchorCycle : "";
    const includePast = Boolean(body.includePast);
    const generationRequest = { prompt, anchorEra, anchorCycle, includePast };
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





