import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '../services/apiClient'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      userId: null,
      isAdmin: false,
      isAuthorized: false,
      userData: null,
      selectedLanguage: null,
      token: null,
      userSubscriptions: [], // Подписки пользователя
      
      // Функция #1: Вход в систему (при логине или проверке)
      login: (data) => {
        const token = data.token || localStorage.getItem('auth_token')
        
        if (token) {
          apiClient.setToken(token)
        }
        
        set({ 
          userId: data.userId,
          isAdmin: data.isAdmin,
          isAuthorized: true,
          userData: data.userData,
          token: token,
          userSubscriptions: data.userData?.subscriptions || []
        })
      },
      
      setAuth: (data) => set({ 
        userId: data.userId,
        isAdmin: data.isAdmin,
        isAuthorized: true,
        userData: data.userData 
      }),
      
      // !!!!!!!! КЛЮЧЕВАЯ ФУНКЦИЯ !!!!!!!
      // Функция для обновления ТОЛЬКО подписок (для WS и React Query)
      updateUserSubscriptions: (newSubscriptions) => {
        const state = get()
        console.log('🔄 ZUSTAND: Обновляю подписки:', newSubscriptions)
        
        set({
          userSubscriptions: newSubscriptions,
          userData: state.userData ? {
            ...state.userData,
            subscriptions: newSubscriptions
          } : null
        })
      },
      
      setLanguage: (lang) => set({ selectedLanguage: lang }),
      
      logout: () => {
        apiClient.removeToken()
        set({ 
          userId: null, 
          isAdmin: false, 
          isAuthorized: false, 
          userData: null,
          token: null,
          userSubscriptions: []
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        selectedLanguage: state.selectedLanguage
      })
    }
  )
)
