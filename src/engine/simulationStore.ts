import { create } from 'zustand';

export interface Event {
    year: string;
    description: string;
}

export interface Artifact {
    name: string;
    description: string;
    imageUrl?: string; // Generated URI
}

export interface Era {
    id: string; // e.g., "ancient", "medieval"
    name: string;
    yearRange: string;
    description: string;
    events: Event[];
    artifacts: Artifact[];
    theme: 'primitive' | 'classical' | 'industrial' | 'modern' | 'cyberpunk' | 'utopian' | 'dystopian';
}

export interface SimulationState {
    isSimulating: boolean;
    currentPrompt: string; // "The Genesis Prompt"
    history: Era[];
    selectedEraIndex: number | null;

    // Actions
    setPrompt: (prompt: string) => void;
    startSimulation: () => void;
    addEra: (era: Era) => void;
    selectEra: (index: number | null) => void;
    reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    isSimulating: false,
    currentPrompt: '',
    history: [],
    selectedEraIndex: null,

    setPrompt: (prompt) => set({ currentPrompt: prompt }),
    startSimulation: () => set({ isSimulating: true, history: [], selectedEraIndex: null }),
    addEra: (era) => set((state) => ({ history: [...state.history, era] })),
    selectEra: (index) => set({ selectedEraIndex: index }),
    reset: () => set({ isSimulating: false, currentPrompt: '', history: [], selectedEraIndex: null }),
}));
