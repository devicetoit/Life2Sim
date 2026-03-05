import { create } from 'zustand';
import { ProjectData, AnnualResult } from '../types';
import { calculateSimulation } from '../logic/engine';
import { initialData } from './initialData';
import { normalizeProjectData } from '../lib/projectDataNormalizer';

interface AppState {
    data: ProjectData;
    results: AnnualResult[];

    // Actions
    setData: (data: ProjectData) => void;
    updateData: (updater: (prev: ProjectData) => ProjectData) => void;
    recalc: () => void;
    importData: (json: string) => void;
    reset: () => void;
}

export const STORAGE_KEY = 'life-plan-storage-v1.10';

export const useStore = create<AppState>((set, get) => ({
    data: normalizeProjectData(initialData),
    results: [],

    setData: (data) => {
        set({ data: normalizeProjectData(data) });
        get().recalc();
    },

    updateData: (updater) => {
        const newData = updater(get().data);
        set({ data: newData });
        get().recalc();
    },

    recalc: () => {
        const { data } = get();
        try {
            const results = calculateSimulation(data);
            set({ results });
            console.log("Recalculated", results.length, "years");
        } catch (e) {
            console.error("Simulation failed", e);
        }
    },

    importData: (json) => {
        try {
            const data = JSON.parse(json) as ProjectData;
            set({ data: normalizeProjectData(data) });
            get().recalc();
        } catch (e) {
            console.error("Import failed", e);
        }
    },

    reset: () => {
        set({ data: normalizeProjectData(initialData) });
        get().recalc();
    }
}));
