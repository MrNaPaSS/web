import React, { lazy, Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { useSignalStore } from '@/store/useSignalStore'
import { TelegramAuth } from '@/components/TelegramAuth'

// Code splitting для экранов
const WelcomeScreen = lazy(() => import('@/screens/WelcomeScreen'))
const MenuScreen = lazy(() => import('@/screens/MenuScreen'))
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen'))
const MainScreen = lazy(() => import('@/screens/MainScreen'))

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
  const { isAuthorized, setAuth, userId, isHydrated } = useAuthStore()
  const { currentScreen, navigateTo } = useUIStore()
  const { activeSignals } = useSignalStore()
  
  // Простая функция переводов
  const t = (key, params = {}) => {
    const translations = {
      welcome: 'Добро пожаловать!',
      loadingInterface: 'Загрузка интерфейса...',
      loginError: 'Ошибка входа',
      tryAgain: 'Попробовать снова'
    }
    return translations[key] || key
  }
  
  const handleAuthSuccess = (authData) => {
    setAuth(authData)
    // После успешной авторизации переходим на welcome экран
    navigateTo('welcome')
  }
  
  const handleAuthError = (error) => {
    console.error('Auth error:', error)
  }
  
  // Восстановление состояния при загрузке приложения
  useEffect(() => {
    // Проверяем, есть ли сохраненное состояние авторизации
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        if (parsed.state?.isAuthorized && parsed.state?.userId) {
          console.log('✅ Восстановлено состояние авторизации из localStorage')
          // Если пользователь авторизован, но на auth экране, переходим на welcome
          if (currentScreen === 'auth') {
            navigateTo('welcome')
          }
        }
      } catch (error) {
        console.warn('Ошибка восстановления состояния:', error)
      }
    }
    
    // КРИТИЧНО: Проверяем активный сигнал НЕЗАВИСИМО от Zustand store
    const pendingSignal = localStorage.getItem('pendingSignal')
    if (pendingSignal) {
      try {
        const signal = JSON.parse(pendingSignal)
        console.log('✅ Восстановлен активный сигнал из localStorage:', signal)
        
        // Проверяем, не истекло ли время сигнала
        const startTime = signal.startTime || Date.now()
        const expiration = signal.expiration * 60 // минуты в секунды
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = Math.max(0, expiration - elapsed)
        
        if (remaining > 0) {
          console.log('✅ Сигнал еще активен, переходим на main экран')
          navigateTo('main')
        } else {
          console.log('⏰ Время сигнала истекло, переходим на main для фидбека')
          navigateTo('main')
        }
      } catch (error) {
        console.warn('Ошибка восстановления активного сигнала:', error)
        localStorage.removeItem('pendingSignal')
      }
    }
  }, [currentScreen, navigateTo])
  
  // Дополнительная проверка активного сигнала после загрузки Zustand store
  useEffect(() => {
    if (isHydrated && isAuthorized) {
      const pendingSignal = localStorage.getItem('pendingSignal')
      if (pendingSignal) {
        try {
          const signal = JSON.parse(pendingSignal)
          console.log('✅ [HYDRATED] Восстановлен активный сигнал:', signal)
          
          // Проверяем, не истекло ли время сигнала
          const startTime = signal.startTime || Date.now()
          const expiration = signal.expiration * 60 // минуты в секунды
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const remaining = Math.max(0, expiration - elapsed)
          
          if (remaining > 0) {
            console.log('✅ [HYDRATED] Сигнал еще активен, переходим на main экран')
            navigateTo('main')
          } else {
            console.log('⏰ [HYDRATED] Время сигнала истекло, переходим на main для фидбека')
            navigateTo('main')
          }
        } catch (error) {
          console.warn('Ошибка восстановления активного сигнала после гидратации:', error)
          localStorage.removeItem('pendingSignal')
        }
      }
    }
  }, [isHydrated, isAuthorized, navigateTo])
  
  // Ждем загрузки Zustand store
  if (!isHydrated) {
    return <LoadingSpinner />
  }
  
  // Если пользователь авторизован, но все еще на auth экране, переходим на welcome
  if (isAuthorized && currentScreen === 'auth') {
    navigateTo('welcome')
  }
  
  if (!isAuthorized) {
    return <TelegramAuth onAuthSuccess={handleAuthSuccess} onAuthError={handleAuthError} t={t} />
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingSpinner />}>
        {currentScreen === 'welcome' && <WelcomeScreen />}
        {currentScreen === 'menu' && <MenuScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
        {currentScreen === 'main' && <MainScreen />}
      </Suspense>
    </QueryClientProvider>
  )
}

export default App