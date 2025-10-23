import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Check, AlertCircle } from 'lucide-react'

export function TelegramAuth({ onAuthSuccess, onAuthError, t }) {
  const [authState, setAuthState] = useState('checking') // checking, authenticating, success, error, dev-mode
  const [errorMessage, setErrorMessage] = useState('')
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // СРАЗУ ВХОДИМ БЕЗ АВТОРИЗАЦИИ
    // Пользователь уже получил доступ через бота
    handleDirectLogin()
  }, [])

  const handleDirectLogin = async () => {
    try {
      // Проверяем наличие Telegram WebApp
      if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
        console.warn('⚠️ Telegram WebApp недоступен - переходим в режим браузера')
        // Fallback для обычного браузера
        const testUserData = {
          userId: '123456789',
          userData: {
            id: 123456789,
            first_name: 'Browser',
            last_name: 'User',
            username: 'browser_user',
            language_code: 'ru',
            is_premium: false
          },
          isAdmin: false,
          subscriptions: ['logistic-spy']
        }
        setUserData(testUserData)
        setAuthState('success')
        onAuthSuccess(testUserData)
        return
      }

      const tg = window.Telegram.WebApp
      
      // Разворачиваем WebApp на весь экран
      tg.expand()
      
      // Устанавливаем цвета интерфейса
      tg.setHeaderColor('#0f172a')
      tg.setBackgroundColor('#0f172a')

      // Получаем данные пользователя
      const user = tg.initDataUnsafe?.user
      if (!user) {
        console.error('❌ Данные пользователя не найдены')
        setErrorMessage('Данные пользователя не найдены')
        setAuthState('error')
        return
      }
      
      const telegramId = user.id.toString()
      
      // Проверяем права администратора через бэкенд
      const checkAdminResponse = await fetch('https://bot.nomoneynohoney.online/api/auth/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: telegramId
        })
      })
      
      const adminData = await checkAdminResponse.json()
      const isAdmin = adminData.success && adminData.is_admin
      
      // Создаем данные пользователя
      const userData = {
        userId: telegramId,
        isAdmin: isAdmin, // Получено с бэкенда
        userData: {
          telegram_id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          username: user.username || '',
          language_code: null, // НЕ берем язык из Telegram - принудительный выбор
          is_admin: isAdmin // Получено с бэкенда
        },
        subscriptions: ['logistic-spy']
      }
      
      console.log('✅ Прямой вход без авторизации для пользователя:', telegramId, 'Admin:', isAdmin)
      setAuthState('success')
      
      // Сразу вызываем onAuthSuccess без задержки
      onAuthSuccess(userData)
      
    } catch (error) {
      console.error('❌ Ошибка при входе:', error)
      setErrorMessage('Ошибка при входе: ' + error.message)
      setAuthState('error')
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Card className="glass-effect backdrop-blur-xl border-slate-700/50 p-8 max-w-md w-full shadow-2xl">
        
        {/* Loading State */}
        {authState === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{t('welcome')}</h2>
            <p className="text-slate-400">{t('loadingInterface')}</p>
          </div>
        )}

        {/* Error State */}
        {authState === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{t('loginError')}</h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
            <Button 
              onClick={() => handleDirectLogin()}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {t('tryAgain')}
            </Button>
          </div>
        )}

      </Card>
    </div>
  )
}


