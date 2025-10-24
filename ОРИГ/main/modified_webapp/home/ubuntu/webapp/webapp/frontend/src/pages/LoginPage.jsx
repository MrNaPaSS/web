import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const LoginPage = () => {
  const { t } = useTranslation()
  const { setToken } = useAuthStore()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDirectLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Предполагаем, что user_id и telegram_id известны или могут быть жестко заданы
      // так как пользователь уже подтвержден через бота.
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/create_token`, {
        user_id: 511442168, // Пример ID, замените на актуальный или получите из конфига
        telegram_id: 511442168, // Пример ID, замените на актуальный или получите из конфига
      })
      setToken(response.data.access_token)
    } catch (err) {
      console.error('Login error:', err)
      setError(t('auth.unauthorized') + ": " + (err.response?.data?.detail || err.message))
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
                  Нажмите кнопку ниже, чтобы получить доступ к профессиональным торговым сигналам.
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
                  onClick={handleDirectLogin}
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
                      <Zap className="w-5 h-5" />
                      Получить доступ
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

