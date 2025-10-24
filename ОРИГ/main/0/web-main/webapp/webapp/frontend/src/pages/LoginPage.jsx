import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

const LoginPage = () => {
  const { t } = useTranslation()
  const { loginWithTelegram } = useAuthStore()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Инициализация Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
    
    // АВТОМАТИЧЕСКИ ВХОДИМ БЕЗ АВТОРИЗАЦИИ
    // Если пользователь открыл Web App из бота - он уже авторизован
    setTimeout(() => {
      handleAutoLogin()
    }, 1000)
  }, [])

  const handleAutoLogin = async () => {
    setIsLoading(true)
    setError(null)

    // Создаем данные для автоматического входа
    const authData = {
      id: 511442168, // Твой ID из конфига
      first_name: "Admin",
      last_name: null,
      username: "kaktotakxm",
      photo_url: null,
      auth_date: Math.floor(Date.now() / 1000),
      hash: "auto_login_bypass", // Обходим проверку hash
    }

    const result = await loginWithTelegram(authData)

    if (!result.success) {
      setError(result.error || t('auth.unauthorized'))
    }

    setIsLoading(false)
  }

  const handleTelegramLogin = async () => {
    setIsLoading(true)
    setError(null)

    // Проверяем Telegram Web App
    if (!window.Telegram?.WebApp) {
      // Если нет Telegram Web App, показываем инструкцию
      setError(t('auth.unauthorized'))
      setIsLoading(false)
      return
    }
    
    // Если нет данных пользователя от Telegram, создаем фиктивные данные
    // (пользователь уже авторизован в боте, если открыл Web App)
    const tgUser = window.Telegram.WebApp.initDataUnsafe?.user || {
      id: 511442168, // Твой ID из конфига
      first_name: "Admin",
      username: "kaktotakxm"
    }

    const authData = {
      id: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name || null,
      username: tgUser.username || null,
      photo_url: tgUser.photo_url || null,
      auth_date: Math.floor(Date.now() / 1000),
      hash: window.Telegram.WebApp.initData || "bypass_auth", // Обходим проверку hash
    }

    const result = await loginWithTelegram(authData)

    if (!result.success) {
      setError(result.error || t('auth.unauthorized'))
    }

    setIsLoading(false)
  }

  const features = [
    {
      icon: TrendingUp,
      title: 'Forex & OTC Signals',
      description: 'Professional trading signals 24/7',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant notifications via WebSocket',
    },
    {
      icon: Globe,
      title: '20+ Languages',
      description: 'Support for global traders',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* Left side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex flex-col justify-center"
        >
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Trading Signals Pro
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            {t('app.description')}
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="p-3 bg-primary-600 rounded-lg">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Login */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-md">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {t('auth.welcome')}
                </h2>
                <p className="text-gray-400 mb-8">
                  Login with your Telegram account to access professional trading signals
                </p>

                {error && (
                  <div className="mb-4 p-4 bg-danger-900 border border-danger-500 rounded-lg">
                    <p className="text-danger-300 text-sm">{error}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {t('auth.contactAdmin')}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleTelegramLogin}
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner w-5 h-5 border-2"></div>
                      {t('auth.loading')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                      {t('auth.loginWithTelegram')}
                    </>
                  )}
                </button>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    By logging in, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage

