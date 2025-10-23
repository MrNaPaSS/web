import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      notificationSettings: {
        newSignals: true,
        signalResults: true,
        dailySummary: true,
        marketNews: false,
        systemUpdates: true,
        soundEnabled: true,
        vibrationEnabled: true,
        emailNotifications: false
      },
      
      updateNotificationSetting: (key, value) => 
        set((state) => ({
          notificationSettings: {
            ...state.notificationSettings,
            [key]: value
          }
        })),
      
      resetSettings: () => set({
        notificationSettings: {
          newSignals: true,
          signalResults: true,
          dailySummary: true,
          marketNews: false,
          systemUpdates: true,
          soundEnabled: true,
          vibrationEnabled: true,
          emailNotifications: false
        }
      })
    }),
    { name: 'settings-storage' }
  )
)
