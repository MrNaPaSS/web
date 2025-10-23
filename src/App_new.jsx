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
  
  // КРИТИЧНО: Принудительная проверка активного сигнала в самом начале
  const pendingSignal = localStorage.getItem('pendingSignal')
  if (pendingSignal && currentScreen !== 'main') {
    console.log('🚨 [FORCE] Принудительный переход на main экран для активного сигнала')
    navigateTo('main')
  }
  
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
  
  // КРИТИЧНО: Проверяем активный сигнал СРАЗУ при загрузке
  useEffect(() => {
    console.log('🔍 [INIT] Проверяем активный сигнал при загрузке...')
    
    // Проверяем активный сигнал НЕЗАВИСИМО от всего
    const pendingSignal = localStorage.getItem('pendingSignal')
    if (pendingSignal) {
      try {
        const signal = JSON.parse(pendingSignal)
        console.log('✅ [INIT] Найден активный сигнал:', signal)
        
        // СРАЗУ переходим на main экран, не проверяя время
        console.log('🚀 [INIT] Переходим на main экран для активного сигнала')
        navigateTo('main')
        return
      } catch (error) {
        console.warn('❌ [INIT] Ошибка восстановления активного сигнала:', error)
        localStorage.removeItem('pendingSignal')
      }
    }
    
    // Проверяем авторизацию только если нет активного сигнала
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        if (parsed.state?.isAuthorized && parsed.state?.userId) {
          console.log('✅ [INIT] Восстановлено состояние авторизации из localStorage')
          if (currentScreen === 'auth') {
            navigateTo('welcome')
          }
        }
      } catch (error) {
        console.warn('❌ [INIT] Ошибка восстановления состояния:', error)
      }
    }
  }, []) // Убираем зависимости, чтобы сработало только один раз
  
  // Дополнительная проверка после загрузки Zustand store
  useEffect(() => {
    if (isHydrated && isAuthorized) {
      console.log('✅ [HYDRATED] Zustand store загружен, проверяем активный сигнал')
      const pendingSignal = localStorage.getItem('pendingSignal')
      if (pendingSignal && currentScreen !== 'main') {
        console.log('🚀 [HYDRATED] Переходим на main экран для активного сигнала')
        navigateTo('main')
      }
    }
  }, [isHydrated, isAuthorized, navigateTo, currentScreen])
  
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