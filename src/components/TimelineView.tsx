"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "lucide-react";
import { Era, useSimulationStore } from "@/engine/simulationStore";

const themeStyles: Record<Era["theme"], string> = {
    primitive: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    classical: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    industrial: "border-zinc-300/30 bg-zinc-300/10 text-zinc-100",
    modern: "border-sky-300/30 bg-sky-300/10 text-sky-100",
    cyberpunk: "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100",
    utopian: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    dystopian: "border-red-300/30 bg-red-300/10 text-red-100",
};

export function TimelineView() {
    const { currentPrompt, generationNotice, history, selectedEraIndex, reset, selectEra } = useSimulationStore();
    const [themeFilter, setThemeFilter] = useState<Era["theme"] | "all">("all");
    const [isPlaying, setIsPlaying] = useState(false);

    const selectedEra = selectedEraIndex === null ? null : history[selectedEraIndex];
    const themes = useMemo(() => Array.from(new Set(history.map((era) => era.theme))), [history]);
    const visibleHistory = useMemo(
        () =>
            history
                .map((era, index) => ({ era, index }))
                .filter(({ era }) => themeFilter === "all" || era.theme === themeFilter),
        [history, themeFilter]
    );

    useEffect(() => {
        if (!isPlaying || history.length === 0) return;

        const timer = window.setInterval(() => {
            selectEra(
                selectedEraIndex === null || selectedEraIndex >= history.length - 1
                    ? 0
                    : selectedEraIndex + 1
            );
        }, 2600);

        return () => window.clearInterval(timer);
    }, [history.length, isPlaying, selectEra, selectedEraIndex]);

    const stepEra = (direction: -1 | 1) => {
        if (history.length === 0) return;
        const current = selectedEraIndex ?? (direction === 1 ? -1 : 0);
        const next = (current + direction + history.length) % history.length;
        selectEra(next);
    };

    if (history.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="text-sm uppercase tracking-widest text-white animate-pulse">Synchronizing Timeline...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#050505_0%,#0b1114_45%,#050505_100%)]">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 px-4 py-3 backdrop-blur md:px-8">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-widest text-cyan-300">Active Simulation</p>
                        <h1 className="truncate text-lg font-semibold text-white md:text-2xl">{currentPrompt}</h1>
                        {generationNotice && (
                            <p className="mt-1 line-clamp-2 text-xs text-amber-100/80">{generationNotice}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <IconButton label="Previous era" onClick={() => stepEra(-1)}>
                            <SkipBack className="h-4 w-4" />
                        </IconButton>
                        <IconButton label={isPlaying ? "Pause timeline" : "Play timeline"} onClick={() => setIsPlaying((value) => !value)}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </IconButton>
                        <IconButton label="Next era" onClick={() => stepEra(1)}>
                            <SkipForward className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Restart simulation" onClick={reset}>
                            <RotateCcw className="h-4 w-4" />
                        </IconButton>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 md:grid-cols-[minmax(0,1fr)_360px] md:p-8">
                <section className="relative">
                    <div className="mb-5 flex flex-wrap gap-2">
                        <FilterButton active={themeFilter === "all"} onClick={() => setThemeFilter("all")}>
                            All eras
                        </FilterButton>
                        {themes.map((theme) => (
                            <FilterButton key={theme} active={themeFilter === theme} onClick={() => setThemeFilter(theme)}>
                                {theme}
                            </FilterButton>
                        ))}
                    </div>

                    <div className="absolute bottom-0 left-4 top-14 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent md:left-8" />

                    <div className="space-y-6">
                        {visibleHistory.map(({ era, index }) => (
                            <TimelineCard
                                key={era.name + index}
                                era={era}
                                index={index}
                                isSelected={selectedEraIndex === index}
                                onSelect={() => selectEra(index)}
                            />
                        ))}
                    </div>
                </section>

                <EraInspector era={selectedEra} selectedIndex={selectedEraIndex} onClose={() => selectEra(null)} />
            </div>
        </div>
    );
}

function TimelineCard({
    era,
    index,
    isSelected,
    onSelect,
}: {
    era: Era;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="group relative ml-10 cursor-pointer md:ml-16"
            onClick={onSelect}
        >
            <div className={`absolute -left-[2.95rem] top-8 h-5 w-5 rounded-full border-4 border-black transition-transform group-hover:scale-125 md:-left-[4.05rem] ${isSelected ? "bg-cyan-300 shadow-[0_0_24px_rgba(103,232,249,0.7)]" : "bg-white"}`} />

            <div className={`rounded-lg border p-5 backdrop-blur-sm transition ${isSelected ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <span className="mb-1 block text-xs font-mono text-cyan-300">{era.yearRange}</span>
                        <h3 className="text-2xl font-bold font-serif">{era.name}</h3>
                    </div>
                    <div className={`w-fit rounded border px-3 py-1 text-xs uppercase tracking-wider ${themeStyles[era.theme]}`}>
                        {era.theme}
                    </div>
                </div>

                <p className="mb-5 leading-relaxed text-gray-300">{era.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
                    <Metric label="Events" value={era.events.length} />
                    <Metric label="Artifacts" value={era.artifacts.length} />
                </div>
            </div>
        </motion.div>
    );
}

function EraInspector({
    era,
    selectedIndex,
    onClose,
}: {
    era: Era | null;
    selectedIndex: number | null;
    onClose: () => void;
}) {
    return (
        <aside className="sticky top-24 h-fit rounded-lg border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            {era ? (
                <div className="space-y-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gray-500">Era {selectedIndex === null ? "" : selectedIndex + 1}</p>
                            <h2 className="mt-1 text-2xl font-semibold text-white">{era.name}</h2>
                        </div>
                        <IconButton label="Close inspector" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </IconButton>
                    </div>

                    <p className="text-sm leading-6 text-gray-300">{era.description}</p>

                    <DetailList icon={<Clock className="h-4 w-4" />} title="Key Events">
                        {era.events.map((event, index) => (
                            <li key={`${event.year}-${index}`} className="rounded border border-white/10 bg-black/30 p-3">
                                <span className="block text-xs font-mono text-cyan-300">{event.year}</span>
                                <span className="text-sm text-gray-200">{event.description}</span>
                            </li>
                        ))}
                    </DetailList>

                    <DetailList icon={<MapPin className="h-4 w-4" />} title="Artifacts">
                        {era.artifacts.map((artifact, index) => (
                            <li key={`${artifact.name}-${index}`} className="rounded border border-white/10 bg-black/30 p-3">
                                <span className="block text-sm font-medium text-white">{artifact.name}</span>
                                <span className="text-sm text-gray-400">{artifact.description}</span>
                            </li>
                        ))}
                    </DetailList>
                </div>
            ) : (
                <div className="flex min-h-80 flex-col items-center justify-center text-center text-gray-500">
                    <Clock className="mb-3 h-8 w-8 text-gray-600" />
                    <p className="text-sm uppercase tracking-widest">Select an era</p>
                    <p className="mt-2 text-sm">Open events, artifacts, and timeline details here.</p>
                </div>
            )}
        </aside>
    );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            className="flex h-10 w-10 items-center justify-center rounded border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
        >
            {children}
        </button>
    );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded border px-3 py-2 text-xs uppercase tracking-wider transition ${active ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}
        >
            {children}
        </button>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded border border-white/10 bg-black/20 p-3">
            <span className="block text-2xl font-semibold text-white">{value}</span>
            <span className="text-xs uppercase tracking-wider">{label}</span>
        </div>
    );
}

function DetailList({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                {icon}
                {title}
            </h3>
            <ul className="space-y-2">{children}</ul>
        </section>
    );
}
