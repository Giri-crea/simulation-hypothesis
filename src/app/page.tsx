"use client";

import { useSimulationStore } from "@/engine/simulationStore";
import { GenesisPrompt } from "@/components/GenesisPrompt";
import { TimelineView } from "@/components/TimelineView";

export default function Home() {
  const { isSimulating } = useSimulationStore();

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
      {!isSimulating ? (
        <GenesisPrompt />
      ) : (
        <TimelineView />
      )}
    </main>
  );
}
