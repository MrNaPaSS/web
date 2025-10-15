import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Shield, Loader2, AlertCircle, Check } from 'lucide-react'

export function TelegramAuth({ onAuthSuccess, onAuthError }) {
  const [authState, setAuthState] = useState('checking') // checking, authenticating, success, error, dev-mode
  const [errorMessage, setErrorMessage] = useState('')
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    initTelegramAuth()
  }, [])

  const initTelegramAuth = async () => {
    try {
      // Проверяем наличие Telegram WebApp
      if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
        console.warn('⚠️ Telegram WebApp SDK не найден - режим разработки')
        setAuthState('dev-mode')
        return
      }

      const tg = window.Telegram.WebApp
      
      // Разворачиваем WebApp на весь экран
      tg.expand()
      
      // Устанавливаем цвета интерфейса
      tg.setHeaderColor('#0f172a')
      tg.setBackgroundColor('#0f172a')

      // Получаем данные пользователя
      const initData = tg.initData
      const user = tg.initDataUnsafe?.user

      if (!user) {
        console.warn('⚠️ Данные пользователя не найдены - режим разработки')
        setAuthState('dev-mode')
        return
      }

      console.log('✅ Telegram данные получены:', user)
      
      setUserData(user)
      setAuthState('authenticating')

      // Отправляем данные на backend для проверки и регистрации
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initData: initData,
          userData: {
            id: user.id,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            username: user.username || '',
            language_code: user.language_code || 'en',
            is_premium: user.is_premium || false
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Авторизация успешна:', data.user)
        setAuthState('success')
        
        // Уведомляем родительский компонент
        setTimeout(() => {
          onAuthSuccess({
            userId: data.user.telegram_id,
            isAdmin: data.user.is_admin,
            userData: data.user,
            subscriptions: data.user.subscriptions || []
          })
        }, 1000)
      } else {
        throw new Error(data.error || 'Ошибка авторизации')
      }

    } catch (error) {
      console.error('❌ Ошибка авторизации:', error)
      setErrorMessage(error.message)
      setAuthState('error')
      
      if (onAuthError) {
        onAuthError(error)
      }
    }
  }

  const handleDevModeLogin = async () => {
    // Режим разработки - имитация входа
    const devUser = {
      userId: '123456789',
      isAdmin: true,
      userData: {
        telegram_id: '123456789',
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'ru',
        is_admin: true
      },
      subscriptions: ['logistic-spy']
    }
    
    console.log('🔧 DEV MODE: Вход без проверки Telegram')
    setAuthState('success')
    
    setTimeout(() => {
      onAuthSuccess(devUser)
    }, 500)
  }

  const handleRetry = () => {
    setAuthState('checking')
    setErrorMessage('')
    initTelegramAuth()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Card className="glass-effect backdrop-blur-xl border-slate-700/50 p-8 max-w-md w-full shadow-2xl">
        
        {/* Checking State */}
        {authState === 'checking' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Проверка доступа</h2>
            <p className="text-slate-400 mb-6">Подключаемся к Telegram...</p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-slate-400 text-sm">Инициализация</span>
            </div>
          </div>
        )}

        {/* Authenticating State */}
        {authState === 'authenticating' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Авторизация</h2>
            {userData && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p className="text-white font-semibold">
                  {userData.first_name} {userData.last_name}
                </p>
                {userData.username && (
                  <p className="text-slate-400 text-sm">@{userData.username}</p>
                )}
              </div>
            )}
            <p className="text-slate-400">Проверяем данные...</p>
          </div>
        )}

        {/* Success State */}
        {authState === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Доступ разрешён</h2>
            <p className="text-slate-400">Загрузка интерфейса...</p>
          </div>
        )}

        {/* Error State */}
        {authState === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Ошибка авторизации</h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
            <Button 
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Попробовать снова
            </Button>
          </div>
        )}

        {/* Dev Mode */}
        {authState === 'dev-mode' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Режим разработки</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <p className="text-amber-400 text-sm mb-2">
                ⚠️ Telegram WebApp SDK не обнаружен
              </p>
              <p className="text-slate-400 text-xs">
                Для корректной работы откройте приложение через Telegram
              </p>
            </div>
            <Button 
              onClick={handleDevModeLogin}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Войти без проверки (DEV)
            </Button>
          </div>
        )}

      </Card>
    </div>
  )
}


