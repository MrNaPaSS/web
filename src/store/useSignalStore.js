import { create } from 'zustand'

export const useSignalStore = create((set) => ({
  signals: [],
  activeSignals: [],
  historySignals: [],
  selectedMarket: null,
  selectedMode: null,
  selectedMLModel: 'logistic-spy',
  isGenerating: false,
  generationStage: '',
  
  setMarket: (market) => set({ selectedMarket: market }),
  setMode: (mode) => set({ selectedMode: mode }),
  setMLModel: (model) => set({ selectedMLModel: model }),
  setGenerating: (isGenerating, stage = '') => 
    set({ isGenerating, generationStage: stage }),
  addSignals: (signals) => set((state) => ({ 
    signals: [...state.signals, ...signals],
    activeSignals: [...state.activeSignals, ...signals]
  })),
  markSignalResult: (signalId, result) => 
    set((state) => ({
      activeSignals: state.activeSignals.filter(s => s.id !== signalId),
      historySignals: [
        ...state.historySignals,
        { ...state.activeSignals.find(s => s.id === signalId), result }
      ]
    }))
}))
