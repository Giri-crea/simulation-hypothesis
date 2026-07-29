"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, History, Sparkles } from "lucide-react";
import { useSimulationStore } from "@/engine/simulationStore";

const promptPresets = [
    "A civilization inside a planet-sized clockwork archive",
    "Ocean nomads who discover mathematics in whale songs",
    "A desert empire ruled by predictive dreams",
    "Post-human botanists rebuilding Earth from orbit",
];

export function GenesisPrompt() {
    const [input, setInput] = useState("");
    const [anchorEra, setAnchorEra] = useState("");
    const [includePast, setIncludePast] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notice, setNotice] = useState("");
    const { setPrompt, setGenerationNotice, startSimulation, addEra } = useSimulationStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setNotice("");
        setGenerationNotice("");
        setPrompt(anchorEra.trim() ? `${input} from ${anchorEra}` : input);

        try {
            const response = await fetch("/api/generate-history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: input,
                    anchorEra,
                    includePast: anchorEra.trim() ? includePast : false,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || "Failed to generate history");
            }

            const history = data.history;
            setGenerationNotice(data.warning || "");
            startSimulation();

            for (const era of history) {
                await new Promise((resolve) => setTimeout(resolve, 600));
                addEra(era);
            }
        } catch (error: unknown) {
            console.error("Simulation failed:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            setNotice(`The simulation collapsed: ${message}. Please check your API key.`);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80" />

            <AnimatePresence>
                {!isLoading ? (
                    <motion.form
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        onSubmit={handleSubmit}
                        className="relative z-10 w-full max-w-2xl text-center"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500"
                        >
                            The Simulation Hypothesis
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative group"
                        >
                            <input
                                type="text"
                                id="genesis-prompt"
                                name="genesis-prompt"
                                autoComplete="off"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe a universe..."
                                className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-6 text-xl md:text-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all backdrop-blur-md"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 bg-white text-black hover:bg-gray-200 rounded-full aspect-square flex items-center justify-center transition-colors disabled:opacity-50"
                                disabled={!input.trim()}
                            >
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur"
                        >
                            <label htmlFor="anchor-era" className="mb-2 block text-xs uppercase tracking-widest text-cyan-300">
                                Start from a specific era
                            </label>
                            <input
                                type="text"
                                id="anchor-era"
                                name="anchor-era"
                                autoComplete="off"
                                value={anchorEra}
                                onChange={(e) => setAnchorEra(e.target.value)}
                                placeholder="Example: Bronze Age, first AI dynasty, post-collapse era"
                                className="w-full rounded border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder-gray-600 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                            />

                            {anchorEra.trim() && (
                                <div className="mt-3 flex items-center justify-between gap-4 rounded border border-white/10 bg-black/20 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-white">Generate the past too?</p>
                                        <p className="text-xs text-gray-500">If enabled, earlier eras explain how this era came to exist.</p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-pressed={includePast}
                                        onClick={() => setIncludePast((value) => !value)}
                                        className={`flex h-9 w-16 items-center rounded-full border p-1 transition ${includePast ? "border-cyan-300/50 bg-cyan-300/20" : "border-white/10 bg-white/5"}`}
                                    >
                                        <span className={`h-7 w-7 rounded-full bg-white transition ${includePast ? "translate-x-7" : "translate-x-0"}`} />
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2"
                        >
                            {promptPresets.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                        setInput(preset);
                                        setAnchorEra("");
                                        setIncludePast(false);
                                    }}
                                    className="rounded border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-gray-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
                                >
                                    {preset}
                                </button>
                            ))}
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 text-gray-500 text-sm tracking-widest uppercase"
                        >
                            <History className="mr-2 inline h-4 w-4 align-[-2px]" />
                            Topic-aware eras powered by Gemini 3.0
                        </motion.p>

                        {notice && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mx-auto mt-4 max-w-xl rounded border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100"
                            >
                                {notice}
                            </motion.p>
                        )}
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="z-10 text-center space-y-4"
                    >
                        <Sparkles className="w-12 h-12 text-white animate-spin-slow mx-auto" />
                        <h2 className="text-2xl font-light tracking-widest animate-pulse">GENERATING REALITY</h2>
                        <p className="text-gray-500">Constructing timeline from quantum foam...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
