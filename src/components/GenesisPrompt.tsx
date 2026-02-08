"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSimulationStore } from "@/engine/simulationStore";
import { generateHistory } from "@/engine/gemini";

export function GenesisPrompt() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { setPrompt, startSimulation, addEra } = useSimulationStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setPrompt(input);
        startSimulation();

        try {
            // Generate the initial history (5 eras)
            const history = await generateHistory(input);

            // Add eras one by one with a slight delay for effect
            for (const era of history) {
                await new Promise(r => setTimeout(r, 800)); // Cinematic delay
                addEra(era);
            }
        } catch (error) {
            console.error("Simulation failed:", error);
            alert("The simulation collapsed before it began. Try again.");
        } finally {
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

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 text-gray-500 text-sm tracking-widest uppercase"
                        >
                            Powered by Gemini 3.0
                        </motion.p>
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
