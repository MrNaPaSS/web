import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      userId: null,
      isAdmin: false,
      isAuthorized: false,
      userData: null,
      selectedLanguage: null,
      isHydrated: false, // Флаг загрузки из localStorage
      
      setAuth: (data) => set({ 
        userId: data.userId,
        isAdmin: data.isAdmin,
        isAuthorized: true,
        userData: data.userData 
      }),
      setLanguage: (lang) => set({ selectedLanguage: lang }),
      logout: () => set({ 
        userId: null, 
        isAdmin: false, 
        isAuthorized: false, 
        userData: null 
      }),
      setHydrated: () => set({ isHydrated: true })
    }),
    { 
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      }
    }
  )
)
