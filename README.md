# The Simulation Hypothesis

An interactive 2D timeline generator for fictional civilizations. Type a universe idea, let Gemini shape a five-era history, then explore the result through playable timeline controls, filters, era cards, and a detail inspector.

## 2D Workflow Map

```text
┌────────────────────┐
│  Genesis Prompt    │
│  type or preset    │
└─────────┬──────────┘
          │
          v
┌────────────────────┐
│  Next.js API Route │
│  /generate-history │
└─────────┬──────────┘
          │
          v
┌────────────────────┐      Gemini unavailable?
│  Gemini Generator  │──────────────┐
│  JSON era history  │              │
└─────────┬──────────┘              v
          │               ┌────────────────────┐
          │               │  Local Fallback    │
          │               │  deterministic era │
          │               │  history           │
          │               └─────────┬──────────┘
          v                         │
┌────────────────────┐              │
│  Zustand Store     │<─────────────┘
│  prompt, history,  │
│  selection, notice │
└─────────┬──────────┘
          │
          v
┌──────────────────────────────────────────────┐
│              Timeline Explorer              │
│  filters | play/pause | next/prev | restart  │
│  selectable cards | event/artifact inspector │
└──────────────────────────────────────────────┘
```

## Interactive Flow

1. Enter a custom universe idea or click one of the prompt presets.
2. The app calls `POST /api/generate-history`.
3. Gemini returns a structured five-era civilization history.
4. If Gemini fails, the API returns a local fallback timeline instead of stopping the app.
5. The timeline reveals eras one by one.
6. Select any era to inspect its events and artifacts.
7. Use play, pause, previous, next, theme filters, and restart to explore the simulation.

## Tech Stack

| Layer | Tooling | Purpose |
| --- | --- | --- |
| Framework | Next.js App Router | Full-stack React app with API routes |
| Language | TypeScript | Typed components, store state, and API data |
| UI | React | Interactive prompt and timeline views |
| Styling | Tailwind CSS | Responsive 2D interface and visual states |
| Animation | Framer Motion | Screen transitions and timeline reveal effects |
| Icons | Lucide React | Control buttons and timeline labels |
| State | Zustand | Simulation state, selected era, and fallback notices |
| AI | Google Gemini API | Generates fictional civilization histories |
| Fallback | Local deterministic generator | Keeps the experience working when Gemini is unavailable |

## Project Structure

```text
src/
├─ app/
│  ├─ api/generate-history/route.ts   # Gemini call and local fallback generator
│  ├─ layout.tsx                      # App shell metadata
│  └─ page.tsx                        # Chooses prompt screen or timeline screen
├─ components/
│  ├─ GenesisPrompt.tsx               # Prompt input, presets, loading state
│  └─ TimelineView.tsx                # Timeline explorer and era inspector
└─ engine/
   └─ simulationStore.ts              # Zustand simulation state
```

## Environment Variables

Create `.env.local` for local development:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3-flash-preview
```

`GEMINI_API_KEY` is required for AI-generated timelines. Without it, the app still runs with the local fallback generator.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm run lint
npm run build
```

On Windows PowerShell, if `npm` scripts are blocked by execution policy, use:

```bash
npm.cmd run lint
npm.cmd run build
```

## Deploy

1. Push the repository to GitHub.
2. Create a Vercel project connected to `Giri-crea/simulation-hypothesis`.
3. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL`.
4. Deploy.

Keep `.env.local` private. Environment files are ignored by Git.
