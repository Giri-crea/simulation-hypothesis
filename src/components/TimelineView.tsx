"use client";

import { motion } from "framer-motion";
import { useSimulationStore, Era } from "@/engine/simulationStore";
import { User, Clock, MapPin } from "lucide-react";

export function TimelineView() {
    const { history, selectEra } = useSimulationStore();

    if (history.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white animate-pulse tracking-widest uppercase text-sm">Synchronizing Timeline...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-8 relative">
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

            <div className="space-y-12">
                {history.map((era, index) => (
                    <TimelineCard key={era.name + index} era={era} index={index} />
                ))}
            </div>

            <div className="h-64 flex items-center justify-center text-gray-500 animate-pulse">
                <span className="text-sm tracking-widest uppercase">Calculating Future...</span>
            </div>
        </div>
    );
}

function TimelineCard({ era, index }: { era: Era; index: number }) {
    const { selectEra } = useSimulationStore();

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="ml-16 relative group cursor-pointer"
            onClick={() => selectEra(index)}
        >
            {/* Connector Dot */}
            <div className="absolute -left-[4.5rem] top-8 w-6 h-6 rounded-full border-4 border-black bg-white group-hover:scale-125 transition-transform" />

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-mono text-cyan-400 mb-1 block">{era.yearRange}</span>
                        <h3 className="text-2xl font-bold font-serif">{era.name}</h3>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-white/10">
                        {era.theme}
                    </div>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">{era.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div className="border border-white/5 rounded p-3">
                        <h4 className="flex items-center gap-2 text-white mb-2"><Clock className="w-4 h-4" /> Key Events</h4>
                        <ul className="space-y-1">
                            {era.events.map((e, i) => (
                                <li key={i}>• {e.description} ({e.year})</li>
                            ))}
                        </ul>
                    </div>
                    <div className="border border-white/5 rounded p-3">
                        <h4 className="flex items-center gap-2 text-white mb-2"><MapPin className="w-4 h-4" /> Artifacts</h4>
                        <ul className="space-y-1">
                            {era.artifacts.map((a, i) => (
                                <li key={i}>• {a.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
