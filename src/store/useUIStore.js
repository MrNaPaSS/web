import { create } from 'zustand'

export const useUIStore = create((set) => ({
  currentScreen: 'auth',
  activeTab: 'active',
  
  navigateTo: (screen) => set({ currentScreen: screen }),
  setActiveTab: (tab) => set({ activeTab: tab })
}))
