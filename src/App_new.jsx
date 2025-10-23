import React, { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { TelegramAuth } from '@/features/auth/components/TelegramAuth'

// Code splitting для экранов
const WelcomeScreen = lazy(() => import('@/screens/WelcomeScreen'))
const MenuScreen = lazy(() => import('@/screens/MenuScreen'))
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen'))

// Loading компонент
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
    <div className="text-white">Загрузка...</div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000
    }
  }
})

function App() {
  const { isAuthorized } = useAuthStore()
  const { currentScreen } = useUIStore()
  
  if (!isAuthorized) {
    return <TelegramAuth />
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingSpinner />}>
        {currentScreen === 'welcome' && <WelcomeScreen />}
        {currentScreen === 'menu' && <MenuScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
