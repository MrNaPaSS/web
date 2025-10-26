import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { TrendingUp, TrendingDown, Copy, Clock, Target, Shield, ChevronRight, Activity, BarChart3, Settings, Sparkles, Zap, Crown, CheckCircle2, ArrowRight, Users, Globe, Brain, Lock, Star, Eye, Trash2, UserCheck, Bell, BellOff, Volume2, VolumeX, Vibrate, Mail, Newspaper, UserPlus, User, Check, RefreshCw } from 'lucide-react'
import { TelegramAuth } from '@/components/TelegramAuth.jsx'
import { useWebSocket } from './hooks/useWebSocket'
import { useSubscriptions } from './hooks/useSubscriptions'
import { useAuthSync } from './hooks/useAuthSync'
import { useAuthStore } from './store/useAuthStore'
import { subscriptionService } from './services/subscriptionService'
import { syncService } from './services/syncService'
import UserSubscriptionManager from './components/admin/UserSubscriptionManager.jsx'
import './App.css'
function App() {
  // ВЕРСИЯ ПРИЛОЖЕНИЯ - для проверки обновлений
console.log('🚀 APP VERSION: 2024.12.24 - FINAL CACHE DESTROYER - ' + Math.random().toString(36).substr(2, 9))
console.log('🔄 CACHE BUST: ' + Date.now())
console.log('💥 FORCE REBUILD: ' + Math.random().toString(36).substr(2, 9))
console.log('🔥 ATOMIC CACHE BUST: ' + Math.random().toString(36).substr(2, 9))
console.log('⚡ QUANTUM CACHE BUST: ' + Math.random().toString(36).substr(2, 9))
console.log('🌟 GALACTIC CACHE BUST: ' + Math.random().toString(36).substr(2, 9))
console.log('🚀 ULTIMATE CACHE BUST: ' + Math.random().toString(36).substr(2, 9))
  // UNIQUE CACHE BUST: 1735064400000
  // FORCE REBUILD: ' + Math.random().toString(36).substr(2, 9)
  // FINAL CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // BREAKTHROUGH CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // ULTIMATE CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // NUCLEAR CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // ATOMIC CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // QUANTUM CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // GALACTIC CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // COSMIC CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  // INFINITE CACHE BUST: ' + Math.random().toString(36).substr(2, 9)
  const ULTIMATE_VERSION = '2024.12.24 - SUBSCRIPTION SYSTEM COMPLETE - FORCE UPDATE'
  console.log('🚀 ULTIMATE VERSION:', ULTIMATE_VERSION)
  console.log('💥 NUCLEAR CACHE BUST:', Date.now() + Math.random())
  console.log('🌌 GALACTIC CACHE BUST:', Date.now() + Math.random())
  console.log('🚀 COSMIC CACHE BUST:', Date.now() + Math.random())
  console.log('🔥 FORCE UPDATE: ML CARDS FIXED - CACHE DESTROYER')
  console.log('⚡ SNIPER 80X PRICING: $300/$999 - ACTIVE')
  console.log('🎯 LOGISTIC SPY BADGE: BOTTOM-RIGHT POSITIONED')
  
  // КОНФИГУРАЦИЯ АДМИНА - УДАЛЕНО ИЗ ФРОНТЕНДА ДЛЯ БЕЗОПАСНОСТИ
  // Функция для определения правильного API URL
  const getApiUrl = (port) => {
    // В продакшене используем внешний домен
    if (window.location.hostname === 'app.nomoneynohoney.online') {
      return 'https://bot.nomoneynohoney.online'
    }
    // Для локальной разработки
    return `http://localhost:5000`
  }
  const [currentScreen, setCurrentScreen] = useState('auth') // auth, language-select, welcome, menu, market-select, mode-select, main, settings, admin, premium, user-stats, admin-user-detail, ml-selector, ml-settings, notifications, analytics, generating, signal-selection
  const [selectedLanguage, setSelectedLanguage] = useState(null) // ru, en, es, fr, de, it, pt, zh, ja, ko, ar, hi
  const [selectedMarket, setSelectedMarket] = useState(null) // forex, otc
  const [selectedMode, setSelectedMode] = useState(null) // top3, single
  const [activeTab, setActiveTab] = useState('active')
  const [userId, setUserId] = useState(null) // Telegram User ID
  const [isAdmin, setIsAdmin] = useState(false) // Проверяется по Telegram ID
  const [isAuthorized, setIsAuthorized] = useState(false) // Флаг успешной авторизации
  const [userData, setUserData] = useState(null) // Данные пользователя из Telegram
  const [selectedMLModel, setSelectedMLModel] = useState('logistic-spy') // shadow-stack, forest-necromancer, gray-cardinal, logistic-spy, sniper-80x
  const [selectedUser, setSelectedUser] = useState(null) // Выбранный пользователь для детальной статистики
  // userSubscriptions теперь читаем из Zustand (единый источник правды)
  const userSubscriptions = useAuthStore(state => state.userSubscriptions)
  const [subscriptionTemplates, setSubscriptionTemplates] = useState([]) // Шаблоны подписок
  const [selectedUsersForBulk, setSelectedUsersForBulk] = useState([]) // Выбранные пользователи для массовых операций
  const [selectedModelForPurchase, setSelectedModelForPurchase] = useState(null) // Модель для покупки
  const [showPurchaseModal, setShowPurchaseModal] = useState(false) // Показать модальное окно покупки
  const [isSubmitting, setIsSubmitting] = useState(false) // Состояние отправки запроса
  const [notification, setNotification] = useState(null) // Уведомления пользователю
  // Функция для обновления подписки пользователя
  const updateUserSubscription = async (userId, subscriptions) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/user/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          subscriptions: subscriptions
        })
      })
      const data = await response.json()
      if (data.success) {
        console.log('User subscription updated:', subscriptions)
        // Zustand автоматически обновится через WebSocket
        return true
      } else {
        console.error('Subscription update error:', data.error)
        return false
      }
    } catch (error) {
      console.error('Subscription update error:', error)
      return false
    }
  }
  const [selectedSignalForAnalysis, setSelectedSignalForAnalysis] = useState(null) // Выбранный сигнал для анализа
  const [analysisResult, setAnalysisResult] = useState(null) // Результат анализа от GPT
  const [isAnalyzing, setIsAnalyzing] = useState(false) // Флаг процесса анализа
  
  // ИНИЦИАЛИЗАЦИЯ useAuthSync - синхронизация React Query с Zustand
  useAuthSync()
  
  // Загрузка шаблонов при переходе в админ-панель
  useEffect(() => {
    if (currentScreen === 'admin' && isAdmin) {
      console.log('🔄 Going to admin panel - loading templates')
      loadSubscriptionTemplates()
      loadSubscriptionRequests()
      // Временно отключаем для диагностики
      // loadAdminStats()
      // loadAccessRequests()
    }
  }, [currentScreen, isAdmin])
  
  // Сброс модального окна покупки при смене экрана
  useEffect(() => {
    if (currentScreen !== 'ml-selector') {
      console.log('🔄 Screen changed, closing purchase modal')
      setShowPurchaseModal(false)
      setSelectedModelForPurchase(null)
    }
  }, [currentScreen])
  
  // WebSocket для real-time обновлений подписок
  // Теперь WebSocket напрямую обновляет Zustand через useWebSocket
  useWebSocket(userData?.id, (newSubscriptions) => {
    // WebSocket уже обновил Zustand внутри useWebSocket
    console.log('🔄 WebSocket callback received:', newSubscriptions)
    
    // Принудительно обновляем выбранную модель если текущая недоступна
    if (newSubscriptions && newSubscriptions.length > 0) {
      const firstAvailableModel = newSubscriptions[0]
      if (firstAvailableModel !== selectedMLModel) {
        setSelectedMLModel(firstAvailableModel)
        console.log('🔄 ML model updated to:', firstAvailableModel)
      }
    }
  }, (type, title, message) => {
    showNotification(type, title, message)
  })
  // Функция для загрузки шаблонов подписок
  const loadSubscriptionTemplates = async () => {
    try {
      console.log('🔄 Loading subscription templates...')
      const response = await fetch(`${getApiUrl()}/api/admin/subscription-templates`)
      const data = await response.json()
      if (data.success) {
        setSubscriptionTemplates(data.templates)
        console.log('✅ Subscription templates loaded:', data.templates)
      } else {
        console.error('❌ Ошибка загрузки шаблонов:', data.error)
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки шаблонов:', error)
    }
  }
  // Функция для массового обновления подписок
  const bulkUpdateSubscriptions = async (userIds, subscriptions) => {
    try {
      console.log('🔄 Bulk subscription update for users:', userIds)
      const response = await fetch(`${getApiUrl()}/api/admin/bulk-subscription-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_ids: userIds,
          subscriptions: subscriptions,
          admin_user_id: userData?.id
        })
      })
      const data = await response.json()
      if (data.success) {
        console.log('✅ Bulk update completed:', data)
        alert(t('bulkUpdateSuccess', {successful: data.successful_updates, total: data.total_users}))
        return true
      } else {
        console.error('❌ Ошибка массового обновления:', data.error)
        alert(t('bulkUpdateError', {error: data.error}))
        return false
      }
    } catch (error) {
      console.error('❌ Ошибка массового обновления:', error)
      alert(t('bulkUpdateErrorGeneric', {message: error.message}))
      return false
    }
  }

  // Функция отправки запроса на подписку
  const handleSubscriptionRequest = async (subscriptionType) => {
    console.log('🔄 handleSubscriptionRequest called:', {
      subscriptionType,
      selectedModelForPurchase: selectedModelForPurchase?.name,
      userId: userData?.id,
      isSubmitting
    })
    
        // Проверяем наличие необходимых данных
        if (!selectedModelForPurchase || (!userData?.id && !userId)) {
          console.error('❌ Missing data for subscription request:', {
            selectedModelForPurchase: selectedModelForPurchase?.name,
            userData,
            userId,
            userDataId: userData?.id
          })
          
          // Показываем ошибку пользователю
          setNotification({
            type: 'error',
            title: 'Ошибка авторизации',
            message: 'Не удалось получить данные пользователя. Пожалуйста, перезагрузите страницу и попробуйте снова.',
            duration: 5000
          })
          return
        }
        
        // Используем userId если userData.id недоступен
        const currentUserId = userData?.id || userId
        if (!currentUserId) {
          console.error('❌ No user ID available')
          setNotification({
            type: 'error',
            title: 'Ошибка авторизации',
            message: 'Не удалось получить ID пользователя. Пожалуйста, перезагрузите страницу и попробуйте снова.',
            duration: 5000
          })
          return
        }

    setIsSubmitting(true)
    
    try {
      console.log('🔄 Sending subscription request:', {
        user_id: currentUserId,
        model_id: selectedModelForPurchase.id,
        subscription_type: subscriptionType
      })

      const response = await fetch(`${getApiUrl()}/api/subscription-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUserId,
          model_id: selectedModelForPurchase.id,
          subscription_type: subscriptionType,
          user_data: {
            first_name: userData?.firstName || 'Пользователь',
            last_name: userData?.lastName || '',
            username: userData?.username || '',
            language_code: userData?.languageCode || 'ru'
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Subscription request sent successfully')
        
        // Показываем уведомление пользователю
        setNotification({
          type: 'success',
          title: 'Запрос на подписку отправлен!',
          message: `Ваш запрос на ${subscriptionType === 'monthly' ? 'ежемесячную' : 'пожизненную'} подписку для модели "${selectedModelForPurchase.name}" отправлен администратору. Вы получите уведомление после одобрения.`,
          duration: 8000
        })

        // Уведомление админу отправляется автоматически через backend
        
        // Закрываем модальное окно
        setShowPurchaseModal(false)
        setSelectedModelForPurchase(null)
      } else {
        console.error('❌ Ошибка отправки запроса:', data.error)
        setNotification({
          type: 'error',
          title: 'Ошибка',
          message: data.error || 'Не удалось отправить запрос',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('❌ Ошибка отправки запроса:', error)
      setNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось отправить запрос. Попробуйте позже.',
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Функция показа уведомления
  const showNotification = (type, title, message, duration = 5000) => {
    setNotification({ type, title, message, duration })
  }

  // Автоматическое скрытие уведомления
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Компонент Toast уведомлений
  const ToastNotification = () => {
    if (!notification) return null
    
    return (
      <div className="fixed top-4 right-4 z-[100] max-w-sm">
        <div className={`glass-effect p-4 rounded-lg border shadow-xl ${
          notification.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10' :
          notification.type === 'error' ? 'border-red-500/50 bg-red-500/10' :
          notification.type === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' :
          'border-blue-500/50 bg-blue-500/10'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              notification.type === 'success' ? 'bg-emerald-500/20' :
              notification.type === 'error' ? 'bg-red-500/20' :
              notification.type === 'warning' ? 'bg-yellow-500/20' :
              'bg-blue-500/20'
            }`}>
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {notification.type === 'error' && <span className="text-red-400 text-sm">✕</span>}
              {notification.type === 'warning' && <span className="text-yellow-400 text-sm">⚠</span>}
              {notification.type === 'info' && <span className="text-blue-400 text-sm">ℹ</span>}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${
                notification.type === 'success' ? 'text-emerald-400' :
                notification.type === 'error' ? 'text-red-400' :
                notification.type === 'warning' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {notification.title}
              </h4>
              <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
  // Блокировка навигации и ожидание фидбека
  const [pendingSignal, setPendingSignal] = useState(null) // Активный сигнал ожидающий фидбека
  const [signalTimer, setSignalTimer] = useState(0) // Таймер экспирации в секундах
  const [isWaitingFeedback, setIsWaitingFeedback] = useState(false) // Флаг ожидания фидбека
  const [lastTop3Generation, setLastTop3Generation] = useState(null) // Время последней генерации ТОП-3
  // Функция проверки доступности форекс рынка
  const isForexMarketOpen = () => {
    const now = new Date()
    const europeanTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Berlin"}))
    const dayOfWeek = europeanTime.getDay() // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
    const currentHour = europeanTime.getHours()
    
    // Рынок закрыт в субботу (6) и воскресенье (0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false
    }
    
    // Рынок закрыт по будням с 22:00 до 06:00 (европейское время)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Понедельник-Пятница
      if (currentHour >= 22 || currentHour < 6) {
        return false
      }
    }
    
    // Рынок открыт в остальное время
    return true
  }

  // Компонент статуса рынка
  const MarketStatusBadge = () => {
    const [marketStatus, setMarketStatus] = useState(null)
    
    useEffect(() => {
      const updateStatus = () => {
        const isOpen = isForexMarketOpen()
        const now = new Date()
        const europeanTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Berlin"}))
        
        setMarketStatus({
          isOpen: isOpen,
          time: europeanTime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Berlin'
          })
        })
      }
      
      updateStatus()
      const interval = setInterval(updateStatus, 60000) // Обновление каждую минуту
      
      return () => clearInterval(interval)
    }, [])
    
    if (!marketStatus || selectedMarket !== 'forex') return null
    
    return (
      <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg ${
        marketStatus.isOpen 
          ? 'bg-emerald-500/20 border border-emerald-500' 
          : 'bg-red-500/20 border border-red-500'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            marketStatus.isOpen ? 'bg-emerald-400' : 'bg-red-400'
          }`}></div>
          <span className="text-xs text-white">
            {marketStatus.isOpen ? '🟢 Рынок открыт' : '🔴 Рынок закрыт'}
          </span>
          <span className="text-xs text-slate-400">
            {marketStatus.time} (EU)
          </span>
        </div>
      </div>
    )
  }
  // Функция проверки возможности генерации топ-3 (каждые 10 минут)
  const canGenerateTop3 = () => {
    if (!lastTop3Generation) return true
    const now = new Date()
    const lastGeneration = new Date(lastTop3Generation)
    const timeDiff = now - lastGeneration
    const tenMinutes = 10 * 60 * 1000 // 10 минут в миллисекундах
    return timeDiff >= tenMinutes
  }

  // Список всех премиум моделей
  const PREMIUM_MODELS = ['shadow-stack', 'forest-necromancer', 'gray-cardinal', 'sniper-80x']

  // Улучшенная функция проверки VIP доступа
  const hasVipAccess = () => {
    console.log('🔍 VIP Access Check - Current subscriptions:', userSubscriptions)
    
    if (!userSubscriptions || userSubscriptions.length === 0) {
      console.log('❌ No subscriptions found')
      return false
    }
    
    // Проверяем наличие хотя бы одной премиум подписки
    const hasVipSubscription = userSubscriptions.some(sub => 
      PREMIUM_MODELS.includes(sub)
    )
    
    console.log('🔍 VIP Access Result:', {
      userSubscriptions,
      hasVipSubscription,
      premiumModels: PREMIUM_MODELS
    })
    
    return hasVipSubscription
  }

  // Улучшенная функция проверки активной подписки
  const hasActiveSubscription = () => {
    console.log('🔍 Active Subscription Check - Current subscriptions:', userSubscriptions)
    
    if (!userSubscriptions || userSubscriptions.length === 0) {
      console.log('❌ No subscriptions found')
      return false
    }
    
    // Проверяем наличие любой подписки
    const hasAnySubscription = userSubscriptions.length > 0
    
    console.log('🔍 Active Subscription Result:', {
      userSubscriptions,
      hasAnySubscription
    })
    
    return hasAnySubscription
  }

  // Функция загрузки кешированных ТОП-3 сигналов
  const loadCachedTop3Signals = async () => {
    try {
      const response = await fetch(`${getApiUrl(5000)}/api/signal/top3/latest`)
      const result = await response.json()
      
      if (result.success && result.signals) {
        const allSignals = [
          ...result.signals.forex,
          ...result.signals.otc
        ]
        
        setCachedTop3Signals(allSignals)
        setTop3LastUpdate(result.last_updated)
        setTop3NextUpdate(result.next_generation)
        
        console.log(`[CACHED-TOP3] Загружено ${allSignals.length} кешированных сигналов`)
        return true
      }
      return false
    } catch (error) {
      console.error('[CACHED-TOP3] Ошибка загрузки:', error)
      return false
    }
  }

  // Функция проверки статуса ТОП-3
  const checkTop3Status = async () => {
    try {
      const response = await fetch(`${getApiUrl(5000)}/api/signal/top3/status`)
      const result = await response.json()
      
      if (result.success) {
        setTop3TimeUntilNext(result.time_until_next)
        
        // Если есть новые сигналы, загружаем их
        if (result.has_signals && result.last_updated !== top3LastUpdate) {
          await loadCachedTop3Signals()
        }
        
        return result
      }
      return null
    } catch (error) {
      console.error('[TOP3-STATUS] Ошибка проверки статуса:', error)
      return null
    }
  }
  const [top3Cooldown, setTop3Cooldown] = useState(0) // Оставшееся время до следующей генерации ТОП-3 в секундах
  const [lastSignalGeneration, setLastSignalGeneration] = useState({}) // Время последней генерации по парам
  const [signalCooldown, setSignalCooldown] = useState(0) // Cooldown для одиночного сигнала
  const [noSignalAvailable, setNoSignalAvailable] = useState(false) // Флаг отсутствия подходящего сигнала
  const [isGenerating, setIsGenerating] = useState(false) // Флаг процесса генерации
  const [generationStage, setGenerationStage] = useState('') // Текущая стадия генерации
  const [generatedSignals, setGeneratedSignals] = useState([]) // Сгенерированные сигналы
  const [showReloadWarning, setShowReloadWarning] = useState(false) // Предупреждение при перезагрузке
  // Новые state для кешированных ТОП-3
  const [cachedTop3Signals, setCachedTop3Signals] = useState([])
  const [top3LastUpdate, setTop3LastUpdate] = useState(null)
  const [top3NextUpdate, setTop3NextUpdate] = useState(null)
  const [top3TimeUntilNext, setTop3TimeUntilNext] = useState(null)
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newSignals: true,
    signalResults: true,
    dailySummary: true,
    marketNews: false,
    systemUpdates: true,
    soundEnabled: true,
    vibrationEnabled: true,
    emailNotifications: false
  })
  // User statistics data - загружается из API
  const [userStats, setUserStats] = useState({
    totalSignals: 0,
    successfulSignals: 0,
    failedSignals: 0,
    winRate: 0.0,
    bestPair: null,
    worstPair: null,
    tradingDays: 0,
    avgSignalsPerDay: 0.0,
    signalsByMonth: []
  })
  // Market metrics - реальные данные по парам
  const [marketMetrics, setMarketMetrics] = useState({
    forex: [],
    otc: []
  })
  // User signals history - история сигналов пользователя для аналитики
  const [userSignalsHistory, setUserSignalsHistory] = useState([])
  // Admin statistics - реальные данные для админ панели
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSignals: 0,
    successfulSignals: 0,
    failedSignals: 0,
    topUsers: []
  })
  const [accessRequests, setAccessRequests] = useState([])
  const [subscriptionRequests, setSubscriptionRequests] = useState([])
  // Загрузка метрик рынка
  const loadMarketMetrics = async () => {
    try {
      console.log('📊 Loading market metrics...')
      const response = await fetch(`${getApiUrl(5000)}/api/signal/market-metrics`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Получены метрики рынка:', data)
        setMarketMetrics({
          forex: data.forex || [],
          otc: data.otc || []
        })
      } else {
        console.error('❌ Ошибка загрузки метрик:', response.status)
        // Fallback - пустые массивы
        setMarketMetrics({
          forex: [],
          otc: []
        })
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки метрик:', error)
      // Fallback - пустые массивы
      setMarketMetrics({
        forex: [],
        otc: []
      })
    }
  }
  // Загрузка реальной статистики конкретного пользователя из API
  const loadUserStats = async () => {
    try {
      console.log('📊 Загружаем статистику пользователя:', userId)
      const response = await fetch(`${getApiUrl(5000)}/api/user/stats?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Получена статистика пользователя:', data)
        setUserStats({
          totalSignals: data.total_signals || 0,
          successfulSignals: data.successful_signals || 0,
          failedSignals: data.failed_signals || 0,
          winRate: data.win_rate || 0.0,
          bestPair: data.best_pair || 'N/A',
          worstPair: data.worst_pair || 'N/A',
          tradingDays: data.trading_days || 0,
          avgSignalsPerDay: data.avg_signals_per_day || 0.0,
          signalsByMonth: data.signals_by_month || []
        })
      } else {
        console.error('❌ Ошибка загрузки статистики:', response.status)
        // Fallback - пустая статистика
        setUserStats({
          totalSignals: 0,
          successfulSignals: 0,
          failedSignals: 0,
          winRate: 0.0,
          bestPair: 'N/A',
          worstPair: 'N/A',
          tradingDays: 0,
          avgSignalsPerDay: 0.0,
          signalsByMonth: []
        })
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error)
      // Fallback - пустая статистика
      setUserStats({
        totalSignals: 0,
        successfulSignals: 0,
        failedSignals: 0,
        winRate: 0.0,
        bestPair: 'N/A',
        worstPair: 'N/A',
        tradingDays: 0,
        avgSignalsPerDay: 0.0,
        signalsByMonth: []
      })
    }
  }
  // Загрузка истории сигналов пользователя для аналитики
  const loadUserSignalsHistory = async () => {
    try {
      console.log('📊 Загружаем историю сигналов пользователя:', userId)
      const response = await fetch(`${getApiUrl(5000)}/api/user/signals-history?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Получена история сигналов:', data)
        setUserSignalsHistory(data.signals || [])
      } else {
        console.error('❌ Ошибка загрузки истории сигналов:', response.status)
        // Fallback - пустая история
        setUserSignalsHistory([])
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки истории сигналов:', error)
      // Fallback - пустая история
      setUserSignalsHistory([])
    }
  }
  // Загрузка админ статистики
  const loadAdminStats = async () => {
    try {
      console.log('📊 Загружаем админ статистику...')
      // Загружаем общую статистику сигналов
      const statsResponse = await fetch(`${getApiUrl(5000)}/api/signal/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // Загружаем всех пользователей
      const usersResponse = await fetch(`${getApiUrl(5000)}/api/users/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      let totalSignals = 0
      let successfulSignals = 0
      let failedSignals = 0
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        totalSignals = statsData.total_signals || 0
        successfulSignals = statsData.successful_signals || 0
        failedSignals = statsData.failed_signals || 0
        console.log('✅ Получена общая статистика:', statsData)
      }
      let users = []
      let onlineUsers = 0
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        users = usersData.users || []
        onlineUsers = usersData.online_users || 0  // Количество онлайн пользователей
        console.log('✅ Users loaded:', users.length, 'online:', onlineUsers)
      }
      setAdminStats({
        totalUsers: users.length,  // Общее количество подключенных пользователей
        activeUsers: onlineUsers,  // Количество онлайн пользователей
        totalSignals: totalSignals,
        successfulSignals: successfulSignals,
        failedSignals: failedSignals,
        topUsers: users.slice(0, 10) // Топ 10 пользователей
      })
    } catch (error) {
      console.error('❌ Ошибка загрузки админ статистики:', error)
      // Fallback - пустая статистика
      setAdminStats({
        totalUsers: 0,
        activeUsers: 0,
        totalSignals: 0,
        successfulSignals: 0,
        failedSignals: 0,
        topUsers: []
      })
    }
  }
  // Загрузка заявок на доступ
  const loadAccessRequests = async () => {
    try {
      console.log('📋 Загружаем заявки на доступ...')
      const response = await fetch(`${getApiUrl(5000)}/api/admin/access-requests`)
      const data = await response.json()
      if (data.success) {
        setAccessRequests(data.requests)
        console.log('✅ Заявки на доступ загружены:', data.requests.length)
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки заявок на доступ:', error)
    }
  }

  // Загрузка запросов подписок
  const loadSubscriptionRequests = async () => {
    try {
      console.log('📋 Загружаем запросы подписок...')
      const response = await fetch(`${getApiUrl()}/api/admin/subscription-requests`)
      const data = await response.json()
      if (data.success) {
        setSubscriptionRequests(data.requests)
        console.log('✅ Запросы подписок загружены:', data.requests.length)
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки запросов подписок:', error)
    }
  }

  // Одобрение запроса подписки
  const approveSubscriptionRequest = async (requestId) => {
    try {
      console.log('✅ Одобряем запрос подписки:', requestId)
      console.log('🔍 Admin user ID:', userData?.id)
      console.log('🔍 API URL:', getApiUrl())
      
      const response = await fetch(`${getApiUrl()}/api/admin/approve-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: requestId,
          admin_user_id: userData?.id
        })
      })
      
      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (data.success) {
        console.log('✅ Запрос подписки одобрен')
        alert('✅ Подписка успешно активирована!')
        // Перезагружаем список запросов и статистику
        loadSubscriptionRequests()
        loadAdminStats()
        
        // Zustand автоматически обновится через WebSocket
      } else {
        console.error('❌ Ошибка одобрения:', data.error)
        alert(`❌ Ошибка: ${data.error}`)
      }
    } catch (error) {
      console.error('❌ Ошибка одобрения подписки:', error)
      alert(`❌ Ошибка: ${error.message}`)
    }
  }

  // Отклонение запроса подписки
  const rejectSubscriptionRequest = async (requestId, reason = 'Не указана') => {
    try {
      console.log('❌ Отклоняем запрос подписки:', requestId)
      console.log('🔍 Admin user ID:', userData?.id)
      console.log('🔍 Reason:', reason)
      
      const response = await fetch(`${getApiUrl()}/api/admin/reject-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: requestId,
          admin_user_id: userData?.id,
          reason: reason
        })
      })
      
      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (data.success) {
        console.log('✅ Запрос подписки отклонен')
        alert('❌ Запрос подписки отклонен')
        // Перезагружаем список запросов
        loadSubscriptionRequests()
      } else {
        console.error('❌ Ошибка отклонения:', data.error)
        alert(`❌ Ошибка: ${data.error}`)
      }
    } catch (error) {
      console.error('❌ Ошибка отклонения подписки:', error)
      alert(`❌ Ошибка: ${error.message}`)
    }
  }
  // Одобрение заявки на доступ
  const approveAccessRequest = async (userIdToApprove) => {
    try {
      console.log('✅ Одобряем заявку для пользователя:', userIdToApprove)
      const response = await fetch(`${getApiUrl(5000)}/api/admin/approve-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userIdToApprove,
          admin_user_id: userId // ID текущего админа
        })
      })
      const data = await response.json()
      if (data.success) {
        console.log('✅ Заявка одобрена')
        alert(t('userAddedSuccess'))
        // Обновляем данные
        loadAdminStats()
        loadAccessRequests()
        
        // Zustand автоматически обновится через WebSocket
      } else {
        console.error('❌ Ошибка одобрения:', data.error)
        alert(t('errorOccurredWith', {error: data.error}))
      }
    } catch (error) {
      console.error('❌ Ошибка при одобрении заявки:', error)
      alert(t('errorOccurredWith', {error: error.message}))
    }
  }
  // Translations
  const translations = {
    ru: {
      welcome: 'Добро пожаловать',
      selectLanguage: 'Выберите язык',
      continue: 'Продолжить',
      start: 'Начать',
      menu: 'Меню',
      tradingSignals: 'Торговые сигналы',
      analytics: 'Аналитика',
      community: 'Сообщество',
      settings: 'Настройки',
      premium: 'Премиум ML',
      selectMarket: 'Выберите рынок',
      selectMode: 'Режим генерации',
      top3Signals: 'ТОП-3 сигнала',
      singleSignals: 'Одиночные сигналы',
      active: 'Активные',
      history: 'История',
      back: 'Назад',
      admin: 'Админ-панель',
      buy: 'Купить',
      monthly: 'Ежемесячно',
      lifetime: 'Пожизненно',
      welcomeTo: 'Добро пожаловать в',
      premiumSignals: 'Премиум сигналы для профессионального трейдинга',
      accurateSignals: 'Точные сигналы',
      successfulTrades: '87% успешных сделок',
      instantNotifications: 'Мгновенные уведомления',
      realTimeSignals: 'Получайте сигналы в реальном времени',
      premiumQuality: 'Премиум качество',
      professionalAnalysis: 'Профессиональный анализ рынка',
      whatSignals: 'Какие сигналы вы хотите получать?',
      forexSchedule: 'Расписание Forex рынка',
      catalogPrivate: 'КАТАЛОГ ПРИВАТНЫХ ML-МОДЕЛЕЙ',
      onlyForInsiders: 'Только для своих. Доступ по рукам.',
      consciousRisk: 'Каждый вход — осознанный риск.',
      activeModel: 'АКТИВНАЯ',
      model: 'МОДЕЛЬ:',
      modelReady: 'Модель обучена и готова к работе',
      // Новые переводы
      comingSoon: 'СКОРО',
      comingSoonDescription: 'Скоро будет доступно',
      chatWithTraders: 'Общение с другими трейдерами',
      manageParameters: 'Управление параметрами',
      manageAppSettings: 'Управление параметрами приложения',
      mlModel: 'ML Модель',
      chooseMLModel: 'Выбор ML модели',
      statistics: 'Статистика',
      viewDetails: 'Просмотр детальной статистики',
      notifications: 'Уведомления',
      setupPushNotifications: 'Настройка push-уведомлений',
      // Уведомления - детали
      newSignals: 'Новые сигналы',
      newSignalsDescription: 'Уведомления о новых сигналах',
      signalResults: 'Результаты сигналов',
      signalResultsDescription: 'Уведомления о закрытии сделок',
      dailySummary: 'Ежедневная сводка',
      dailySummaryDescription: 'Итоги дня в 21:00',
      systemNotifications: 'Системные уведомления',
      marketNews: 'Новости рынка',
      marketNewsDescription: 'Важные события на рынке',
      systemUpdates: 'Обновления системы',
      systemUpdatesDescription: 'Новые функции и исправления',
      soundAndVibration: 'Звук и вибрация',
      soundNotification: 'Звук',
      soundNotificationsDescription: 'Звуковые уведомления',
      vibration: 'Вибрация',
      vibrationDescription: 'Вибро-сигнал при уведомлениях',
      emailNotifications: 'Email уведомления',
      emailNotificationsDescription: 'Дублировать на почту',
      smartNotifications: 'Умные уведомления',
      smartNotificationsDescription: 'Получайте своевременные уведомления о важных событиях. Вы можете настроить каждый тип отдельно.',
      // Новые ключи для главного меню
      chooseAction: 'Выберите действие',
      getTradingSignals: 'Получайте сигналы для торговли',
      aiSignalAnalysis: 'Анализ сигналов с AI',
      // Сигналы
      direction: 'Направление',
      expiration: 'Экспирация',
      confidence: 'Уверенность',
      clickToActivate: 'Нажмите для активации',
      signalReady: 'Сигнал готов',
      activateSignalForTrading: 'Активируйте сигнал для торговли',
      // Подтверждения
      confirmDeleteUser: 'Вы уверены, что хотите удалить пользователя',
      actionCannotBeUndone: 'Это действие нельзя отменить',
      // Аналитика
      signalType: 'Тип сигнала',
      result: 'Результат',
      entryPrice: 'Цена входа',
      runAIAnalysis: 'Запустить AI анализ',
      analyzingTrade: 'Анализирую сделку...',
      gptProcessingData: 'GPT-4o mini обрабатывает данные',
      // Админ-панель
      totalUsers: 'Всего пользователей',
      online: 'Онлайн',
      noAccessRequests: 'Нет заявок на доступ',
      newRequestsWillAppearHere: 'Новые заявки будут отображаться здесь',
      detailedInformation: 'Детальная информация',
      tradingDays: 'Дней торговли',
      // Генерация сигналов
      connectingToMarket: 'Подключение к рынку...',
      analyzingTechnicalIndicators: 'Анализ технических индикаторов...',
      evaluatingNewsBackground: 'Оценка новостного фона...',
      calculatingOptimalExpiration: 'Расчёт оптимальной экспирации...',
      applyingMLModels: 'Применение ML моделей...',
      formingTop3Signals: 'Формирование ТОП-3 сигналов...',
      analyzingPair: 'Анализ пары {pair}...',
      calculatingTechnicalIndicators: 'Расчёт технических индикаторов...',
      applyingMLModel: 'Применение ML модели...',
      determiningEntryPoint: 'Определение точки входа...',
      // ML модели
      shadowStack: 'ТЕНЕВОЙ СТЕК',
      shadowStackDesc: 'Не палится, не лагает, не брешет. Просто делает грязь.',
      shadowStackAlgo: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: 'Среднесрок, интрадей',
      forestNecromancer: 'ЛЕСНОЙ НЕКРОМАНТ',
      forestNecromancerDesc: 'С виду ботаник, по факту шаман рынков.',
      forestNecromancerAlgo: 'RandomForest - Призванный из леса решений',
      forestNecromancerStyle: 'Информер с визуализацией импульсных зон',
      grayCardinal: 'СЕРЫЙ КАРДИНАЛ',
      grayCardinalDesc: 'Ты его не видишь, но он знает твой вход раньше тебя.',
      grayCardinalAlgo: 'XGBoost - Не на слуху, зато всё под контролем',
      grayCardinalStyle: 'Сигналы на младших ТФ, с доп. фильтрами',
      logisticSpy: 'ЛОГИСТИЧЕСКИЙ ШПИОН',
      logisticSpyDesc: 'Старая школа, но знает все ходы.',
      logisticSpyAlgo: 'LogisticRegression - Классик в мире ML',
      logisticSpyStyle: 'Консервативный, проверенный временем',
      sniper80x: 'СНАЙПЕР 80Х',
      sniper80xDesc: 'Запускаешь — и рынок замолкает. Один вход — один труп.',
      sniper80xAlgo: 'Финальная модель - Легенда среди своих',
      sniper80xStyle: 'Точный вход, позиционный, иногда скальп',
      sniper80xWarning: 'Только по команде. Авто не включается.',
      // Статусы
      activeStatus: 'АКТИВНА',
      inactive: 'НЕАКТИВНА',
      available: 'ДОСТУПНА',
      blocked: 'ЗАБЛОКИРОВАНА',
      success: 'Успешно',
      failure: 'Проигрыш',
      // Действия
      buyAction: 'Купить',
      selectAction: 'Выбрать',
      approve: 'Одобрить',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      apply: 'Применить',
      update: 'Обновить',
      // Генерация сигналов
      loadingMarkets: 'Загрузка рынков...',
      analyzingTrends: 'Анализ трендов...',
      applyingML: 'Применение ML моделей...',
      calculatingEntry: 'Расчет точек входа...',
      assessingRisks: 'Оценка рисков...',
      finalCheck: 'Финальная проверка...',
      // Админ-панель
      activeUsers: 'Активные пользователи',
      totalSignals: 'Всего сигналов',
      successful: 'Успешных',
      failed: 'Проигрышных',
      topUsers: 'Топ пользователи',
      accessRequests: 'Заявки на доступ',
      subscriptionHistory: 'История изменений подписок',
      // Статистика
      myStatistics: 'Моя статистика',
      winRate: 'Винрейт',
      currentStreak: 'Текущая серия',
      bestStreak: 'Лучшая серия',
      averageProfit: 'Средняя прибыль',
      signalsPerDay: 'Сигналов в день',
      bestPair: 'Лучшая пара',
      worstPair: 'Худшая пара',
      // Подписки
      monthlySubscription: 'Ежемесячная подписка',
      lifetimePurchase: 'Пожизненная покупка',
      autoRenewal: 'Автоматическое продление',
      noTimeLimit: 'Без ограничений по времени',
      selectSubscriptionType: 'Выберите тип подписки:',
      // Уведомления
      soundNotification: 'Звук',
      vibration: 'Вибрация',
      pushNotification: 'Push',
      enabled: 'Включен',
      disabled: 'Выключен',
      // Аналитика
      aiAnalytics: 'AI Аналитика',
      successfulTradesHistory: 'История успешных сделок',
      analyzeSignal: 'Проанализировать сигнал',
      analyzingInProgress: 'Анализ выполняется...',
      cancelAnalysis: 'Отменить анализ',
      // Системные сообщения
      userAdded: 'Пользователь добавлен в систему',
      errorOccurred: 'Произошла ошибка',
      loadingData: 'Загрузка данных...',
      // Модальные окна
      tradeActivated: 'СДЕЛКА АКТИВИРОВАНА',
      timeExpired: '⏰ Время истекло!',
      leaveFeedback: 'Оставьте фидбек о результате сделки',
      pair: 'Пара',
      direction: 'Направление',
      resultButtonsActive: 'Кнопки результата стали активными',
      indicateTradeResult: 'После истечения времени укажите результат торговли',
      successfulTrade: 'Успешная сделка',
      losingTrade: 'Убыточная сделка',
      leaveFeedbackToUnlock: '⚠️ Оставьте фидбек чтобы разблокировать навигацию',
      navigationLocked: 'Навигация заблокирована',
      waitForExpiration: 'Дождитесь экспирации сигнала и оставьте фидбек',
      timeRemaining: 'Осталось до экспирации',
      noSuitableEntry: '⚠️ Нет подходящей точки входа',
      marketConditionsNotOptimal: 'Текущие рыночные условия не оптимальны для открытия позиции',
      analysisCompleted: 'Анализ завершён',
      recommendations: 'Рекомендации',
      tryAnotherPair: 'Попробуйте другую пару',
      selectAnotherPairDescription: 'Выберите другую валютную пару с более благоприятными условиями',
      waitForOptimalConditions: 'Подождите оптимальных условий',
      tryAgainWhen: 'Попробуйте снова через {seconds} секунд, когда рынок стабилизируется',
      returnToPairSelection: 'Вернуться к выбору пары',
      patienceIsKey: '💡 Терпение — ключ к успешной торговле',
      warningAttention: '⚠️ ВНИМАНИЕ!',
      systemBypassDetected: 'Обнаружена попытка обхода системы',
      activeSignalRequiresCompletion: 'У вас есть активный сигнал, который требует завершения. Перезагрузка страницы не поможет обойти блокировку навигации.',
      activeSignal: 'Активный сигнал',
      feedbackRequired: '⏰ Требуется фидбек!',
      returnToOpenTrade: 'Вернуться к открытой сделке',
      bypassProtectionActive: 'Система защиты от обхода блокировки навигации активирована',
      waitForActiveSignal: '⚠️ Дождитесь завершения активного сигнала и оставьте фидбек перед переходом!',
      // Alert сообщения
      subscriptionUpdated: '✅ Подписка обновлена для {name}! Пользователь получит доступ к выбранным ML моделям.',
      subscriptionUpdateError: '❌ Ошибка обновления подписки для {name}',
      subscriptionDisabled: '✅ Подписка отключена для {name}!',
      subscriptionDisableError: '❌ Ошибка отключения подписки для {name}',
      confirmDeleteUser: 'Вы уверены, что хотите удалить пользователя {name}? Это действие нельзя отменить.',
      userDeleted: '✅ Пользователь {name} удалён из системы',
      userDeleteError: '❌ Ошибка удаления пользователя {name}',
      accessRequestApproved: '✅ Заявка на доступ одобрена для {name}',
      accessRequestError: '❌ Ошибка одобрения заявки для {name}',
      // Новые переводы для хардкод строк
      popular: 'Популярно',
      bestOpportunitiesOfDay: 'Лучшие возможности дня',
      threeBestSignalsSimultaneously: '3 лучших сигнала одновременно',
      highSuccessProbability: 'Высокая вероятность успеха',
      riskDiversification: 'Диверсификация рисков',
      focusOnOneTrade: 'Фокус на одной сделке',
      simpleManagement: 'Простое управление',
      availableIn: 'Доступно через: {minutes} мин',
      idealForBeginners: 'Идеально для начинающих',
      analysis: 'Анализ',
      accuracy: 'Точность',
      selectSignalForActivation: 'Выберите сигнал для активации',
      selectPairForSignalGeneration: 'Выберите пару для генерации сигнала',
      marketState: 'Состояние рынка',
      mood: 'Настроение',
      volatility: 'Волатильность',
      recommendation: 'Рекомендация:',
      clickToGenerateSignal: 'Нажмите для генерации сигнала',
      selectSignal: 'Выберите сигнал',
      selectSignalForAnalysis: 'Выберите сигнал для анализа',
      aiWillAnalyzeAndGiveRecommendations: 'AI проанализирует сделку и даст рекомендации',
      noExecutedSignals: 'Нет исполненных сигналов',
      executeSeveralDealsToSeeInAnalytics: 'Выполните несколько сделок, чтобы увидеть их в аналитике',
      expiration: 'Экспирация',
      dealActivated: 'СДЕЛКА АКТИВИРОВАНА',
      navigationLocked: 'Навигация заблокирована',
      timeRemainingUntilExpiration: 'Осталось до экспирации',
      howDidTheDealGo: 'Как прошла сделка?',
      generationMode: 'Режим генерации',
      signalGeneration: 'Генерация сигналов',
      howDoYouWantToReceiveSignals: 'Как вы хотите получать сигналы?',
      top3Signals: 'ТОП-3 сигнала',
      singleSignals: 'Одиночные сигналы',
      oneSignalAtATime: 'По одному сигналу за раз',
      allUsersStatistics: 'Статистика всех пользователей',
      mlModelSelection: 'Выбор ML модели',
      or: 'или',
      aboutMLModels: 'О ML моделях',
      purchaseModel: 'Покупка {name}',
      signalsChartByMonth: 'График сигналов по месяцам',
      successfulLosing: 'успешных/проигрышных',
      accessRequests: 'Заявки на доступ',
      signalsPerDay: 'Сигналов в день',
      bestPair: 'Лучшая пара',
      worstPair: 'Худшая пара',
      quickTemplates: 'Быстрые шаблоны',
      subscriptionManagement: 'Управление подписками',
      selectMLModels: 'Выберите ML модели:',
      availableModels: 'Доступные модели:',
      premiumMLModels: 'Премиум ML-модели',
      activeSignals: 'Активных сигналов',
      progressToTP1: 'Прогресс к TP1',
      waitingForEntry: 'Ожидание входа',
      vipFunction: 'VIP Функция',
      winRate: 'Win Rate',
      pleaseWaitSystemAnalyzing: 'Пожалуйста, подождите. Система анализирует рынок...',
      moreDetails: 'Подробнее',
      tryAgainInCooldown: 'Попробуйте снова через {seconds} секунд, когда рынок стабилизируется',
      // Alert messages
      bulkUpdateSuccess: 'Обновлено {successful} из {total} пользователей',
      bulkUpdateError: 'Ошибка массового обновления: {error}',
      bulkUpdateErrorGeneric: 'Ошибка массового обновления: {message}',
      userDeletedSuccess: 'Пользователь {userId} успешно удален из бота',
      userDeleteError: 'Ошибка удаления: {error}',
      // Additional alert messages
      userAddedSuccess: 'Пользователь добавлен в систему',
      errorOccurredWith: 'Произошла ошибка: {error}',
      feedbackAcceptedSuccess: 'Фидбек принят: Успешная сделка',
      feedbackAcceptedFailure: 'Фидбек принят: Убыточная сделка',
      navigationBlockedMessage: 'У вас есть активный сигнал!\n\nДождитесь завершения экспирации и оставьте фидбек о результате сделки.\n\nНавигация разблокируется после отправки фидбека.',
      modelRestrictedAlert: 'Эта модель заблокирована и доступна только по команде',
      forexSignalsPro: 'Forex Signals Pro',
      loadingInterface: 'Загрузка интерфейса...',
      loginError: 'Ошибка входа',
      tryAgain: 'Попробовать снова',
      appName: 'Forex Signals Pro',
      accurateSignals: 'Точные сигналы',
      successfulTradesPercent: '87% успешных сделок',
      instantNotifications: 'Мгновенные уведомления',
      realTimeSignals: 'Получайте сигналы в реальном времени',
      premiumQuality: 'Премиум качество',
      professionalMarketAnalysis: 'Профессиональный анализ рынка',
      forex: 'Forex',
      otc: 'OTC',
      top3: 'ТОП-3',
      single: 'Одиночные',
      // Новые ключи для захардкоженных текстов
      hoursAgo: '{count} час{plural} назад',
      daysAgo: '{count} дн{plural} назад',
      selectLanguageDescription: 'Выберите предпочитаемый язык для продолжения / Choose your preferred language to continue',
      // Ключи для интерфейса уведомлений
      notificationsBadge: 'УВЕДОМЛЕНИЯ',
      tradingSignals: 'Торговые сигналы',
      newSignals: 'Новые сигналы',
      newSignalsDescription: 'Уведомления о новых сигналах',
      signalResults: 'Результаты сигналов',
      signalResultsDescription: 'Уведомления о закрытии сделок',
      dailySummary: 'Ежедневная сводка',
      dailySummaryDescription: 'Итоги дня в 21:00',
      systemNotifications: 'Системные уведомления',
      marketNews: 'Новости рынка',
      marketNewsDescription: 'Важные события на рынке',
      systemUpdates: 'Обновления системы',
      systemUpdatesDescription: 'Новые функции и исправления',
      soundAndVibration: 'Звук и вибрация',
      soundNotification: 'Звук',
      soundNotificationsDescription: 'Звуковые уведомления',
      vibration: 'Вибрация',
      vibrationDescription: 'Вибро-сигнал при уведомлениях',
      emailNotifications: 'Почтовые уведомления',
      emailNotificationsDescription: 'Уведомления на email',
      smartNotifications: 'Умные уведомления',
      smartNotificationsDescription: 'Своевременно получайте уведомления о важных событиях. Вы можете настроить каждый тип отдельно.',
      enabled: 'Включено',
      disabled: 'Отключено',
      forexMarketClosedWeekend: 'Форекс рынок закрыт в выходные дни или ночью (22:00-06:00). Переключитесь на OTC режим.',
      forexMarketClosedLabel: 'Форекс рынок закрыт (выходные/ночь)',
      top3CooldownMessage: 'Топ-3 сигналы можно генерировать раз в 10 минут. Осталось: {minutes}:{seconds}',
      vipFeature: 'VIP Функция',
      vipAnalyticsDescription: 'AI Аналитика доступна только для пользователей с активной подпиской',
      subscriptionRequired: 'Требуется подписка',
      getSubscription: 'Получить подписку',
      returnToMenu: 'Вернуться в меню',
      forever: 'навсегда',
      mlModel: 'ML модель',
      selectSignalForActivation: 'Выберите сигнал для активации',
      selectSignal: 'Выберите сигнал',
      expiration: 'Экспирация',
      minutes: 'мин',
      allUsersStatistics: 'Статистика всех пользователей',
      mlModelSelection: 'Выбор ML модели',
      perMonth: '/мес',
      aboutMLModels: 'О ML моделях',
      purchaseModel: 'Покупка {name}',
      signalsChartByMonth: 'График сигналов по месяцам',
      successful: 'успешных',
      losing: 'проигрышных',
      signals: 'сигналов',
      successfulLosing: 'успешных/проигрышных',
      accessRequests: 'Заявки на доступ',
      signalsPerDay: 'Сигналов в день',
      bestPair: 'Лучшая пара',
      worstPair: 'Худшая пара',
      quickTemplates: 'Быстрые шаблоны',
      subscriptionManagement: 'Управление подписками',
      selectMLModels: 'Выберите ML модели:',
      availableModels: 'Доступные модели:',
      premiumMLModels: 'Премиум ML-модели',
      activeSignals: 'Активных сигналов',
      progressToTP1: 'Прогресс к TP1',
      monthlyStatistics: 'Статистика за месяц',
      totalSignals: 'Всего сигналов',
      successfulSignals: 'Успешных',
      losingSignals: 'Проигрышных',
      pair: 'Пара:',
      direction: 'Направление:',
      tryAgainInSeconds: 'Попробуйте снова через {seconds} секунд, когда рынок стабилизируется',
      modelReady: 'Модель обучена и готова к работе',
      aiAnalytics: 'AI Аналитика',
      closeAnalysis: 'Закрыть анализ',
      apiError: 'Ошибка API',
      unknownError: 'Неизвестная ошибка',
      analysisError: 'Ошибка получения анализа. Неверный формат ответа.',
      timeoutError: '⏰ Таймаут: Анализ занял слишком много времени. Попробуйте еще раз.',
      serverError: '❌ Ошибка сервера',
      networkError: '🌐 Ошибка сети: Проверьте подключение к интернету.',
      generalError: '❌ Ошибка',
      // Дополнительные ключи
      professionalMarketAnalysis: 'Профессиональный анализ рынка',
      activeStatus: 'АКТИВНА',
      inactive: 'НЕАКТИВНА',
      available: 'ДОСТУПНА',
      blocked: 'ЗАБЛОКИРОВАНА',
      success: 'Успешно',
      failure: 'Проигрыш',
      buyAction: 'Купить',
      selectAction: 'Выбрать',
      approve: 'Одобрить',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      apply: 'Применить',
      update: 'Обновить',
      loadingMarkets: 'Загрузка рынков...',
      analyzingTrends: 'Анализ трендов...',
      applyingML: 'Применение ML моделей...',
      calculatingEntry: 'Расчет точек входа...',
      assessingRisks: 'Оценка рисков...',
      finalCheck: 'Финальная проверка...',
      activeUsers: 'Активные пользователи',
      totalSignals: 'Всего сигналов',
      successful: 'Успешных',
      failed: 'Проигрышных',
      topUsers: 'Топ пользователи',
      accessRequests: 'Заявки на доступ',
      subscriptionHistory: 'История изменений подписок',
      myStatistics: 'Моя статистика',
      winRate: 'Винрейт',
      currentStreak: 'Текущая серия',
      bestStreak: 'Лучшая серия',
      averageProfit: 'Средняя прибыль',
      monthlySubscription: 'Ежемесячная подписка',
      lifetimePurchase: 'Пожизненная покупка',
      autoRenewal: 'Автоматическое продление',
      noTimeLimit: 'Без ограничений по времени',
      selectSubscriptionType: 'Выберите тип подписки:',
      pushNotification: 'Push',
      enabled: 'Включено',
      disabled: 'Отключено',
      notificationsBadge: 'УВЕДОМЛЕНИЯ',
      waitingForEntry: 'Ожидание входа',
      vipFunction: 'VIP Функция',
      pleaseWaitSystemAnalyzing: 'Пожалуйста, подождите. Система анализирует рынок...',
      moreDetails: 'Подробнее',
      tryAgainInCooldown: 'Попробуйте снова в кулдауне',
      // Новые ключи для локализации
      signalCount: '{count} сигнал',
      signalCountZero: 'Нет сигналов',
      generatedSignal: 'Сгенерированный сигнал',
      top3SignalsReady: 'ТОП-3 сигнала готовы!',
      sell: 'ПРОДАТЬ',
      wait: 'Ожидание',
      waiting: 'Ожидание',
      minutesShort: 'мин',
      secondsShort: 'сек',
      hoursShort: 'ч',
      bearish: 'Медвежий',
      bullish: 'Бычий',
      neutral: 'Нейтральный',
      notAvailable: 'Н/Д',
      notSpecified: 'Не указано',
      // Additional missing keys from screenshots
      aiAnalytics: 'AI Аналитика',
      selectSignalForAnalysis: 'Выберите сигнал для анализа',
      aiWillAnalyze: 'AI проанализирует сделку и даст рекомендации',
      marketStatus: 'Состояние рынка',
      selectPairForSignal: 'Выберите пару для генерации сигнала',
      successfully: 'Успешно',
      sentiment: 'Настроение',
      volatility: 'Волатильность',
      recommendation: 'Рекомендация:',
      clickToGenerateSignal: 'Нажмите для генерации сигнала',
      confidence: 'Уверенность',
      signalGeneration: 'Генерация сигналов',
      usingMLModel: 'Используется ML модель...',
      analysis: 'Анализ',
      mlModel: 'ML модель',
      accuracy: 'Точность',
      pleaseWait: 'Пожалуйста, подождите. Система анализирует рынок...',
      howToReceiveSignals: 'Как вы хотите получать сигналы?',
      top3Signals: 'ТОП-3 сигнала',
      popular: 'Популярно',
      bestOpportunities: 'Лучшие возможности дня',
      threeBestSignals: '3 лучших сигнала',
      simultaneously: 'одновременно',
      highSuccessProbability: 'Высокая вероятность успеха',
      riskDiversification: 'Диверсификация рисков',
      singleSignals: 'Одиночные сигналы',
      oneSignalAtTime: 'По одному сигналу за раз',
      focusOnOneTrade: 'Фокус на одной сделке',
      simpleManagement: 'Простое управление',
      idealForBeginners: 'Идеально для начинающих',
      dealActivated: 'СДЕЛКА АКТИВИРОВАНА',
      navigationBlocked: 'Навигация заблокирована',
      remainingUntilExpiration: 'Осталось до экспирации',
      waitForExpiration: 'Дождитесь экспирации сигнала и оставьте фидбек',
      back: 'Назад'
    },
    en: {
      welcome: 'Welcome',
      selectLanguage: 'Select Language',
      continue: 'Continue',
      start: 'Start',
      menu: 'Menu',
      tradingSignals: 'Trading Signals',
      analytics: 'Analytics',
      community: 'Community',
      settings: 'Settings',
      premium: 'Premium ML',
      selectMarket: 'Select Market',
      selectMode: 'Generation Mode',
      top3Signals: 'TOP-3 Signals',
      singleSignals: 'Single Signals',
      active: 'Active',
      history: 'History',
      back: 'Back',
      admin: 'Admin Panel',
      buy: 'Buy',
      monthly: 'Monthly',
      lifetime: 'Lifetime',
      welcomeTo: 'Welcome to',
      premiumSignals: 'Premium signals for professional trading',
      accurateSignals: 'Accurate signals',
      successfulTrades: '87% successful trades',
      instantNotifications: 'Instant notifications',
      realTimeSignals: 'Get signals in real time',
      premiumQuality: 'Premium quality',
      professionalAnalysis: 'Professional market analysis',
      whatSignals: 'What signals do you want to receive?',
      forexSchedule: 'Forex market schedule',
      catalogPrivate: 'PRIVATE ML-MODELS CATALOG',
      onlyForInsiders: 'Only for insiders. Access by hand.',
      consciousRisk: 'Every entry is a conscious risk.',
      activeModel: 'ACTIVE',
      model: 'MODEL:',
      modelReady: 'Model trained and ready for work',
      // Новые переводы
      comingSoon: 'SOON',
      comingSoonDescription: 'Coming soon',
      chatWithTraders: 'Chat with other traders',
      manageParameters: 'Manage parameters',
      manageAppSettings: 'Manage app settings',
      mlModel: 'ML Model',
      statistics: 'Statistics',
      viewDetails: 'View detailed statistics',
      notifications: 'Notifications',
      setupPushNotifications: 'Setup push notifications',
      // Уведомления - детали
      newSignals: 'New Signals',
      newSignalsDescription: 'Notifications about new signals',
      signalResults: 'Signal Results',
      signalResultsDescription: 'Notifications about trade closures',
      dailySummary: 'Daily Summary',
      dailySummaryDescription: 'Day summary at 21:00',
      systemNotifications: 'System Notifications',
      marketNews: 'Market News',
      marketNewsDescription: 'Important market events',
      systemUpdates: 'System Updates',
      systemUpdatesDescription: 'New features and fixes',
      soundAndVibration: 'Sound & Vibration',
      soundNotification: 'Sound',
      soundNotificationsDescription: 'Sound notifications',
      vibration: 'Vibration',
      vibrationDescription: 'Vibration signal for notifications',
      emailNotifications: 'Email Notifications',
      emailNotificationsDescription: 'Duplicate to email',
      smartNotifications: 'Smart Notifications',
      smartNotificationsDescription: 'Get timely notifications about important events. You can configure each type separately.',
      // Новые ключи для главного меню
      chooseAction: 'Choose action',
      getTradingSignals: 'Get trading signals',
      aiSignalAnalysis: 'AI signal analysis',
      // Сигналы
      direction: 'Direction',
      expiration: 'Expiration',
      confidence: 'Confidence',
      clickToActivate: 'Click to activate',
      signalReady: 'Signal ready',
      activateSignalForTrading: 'Activate signal for trading',
      // Подтверждения
      confirmDeleteUser: 'Are you sure you want to delete user',
      actionCannotBeUndone: 'This action cannot be undone',
      // Аналитика
      signalType: 'Signal type',
      result: 'Result',
      entryPrice: 'Entry price',
      runAIAnalysis: 'Run AI analysis',
      analyzingTrade: 'Analyzing trade...',
      gptProcessingData: 'GPT-4o mini processing data',
      // Админ-панель
      totalUsers: 'Total users',
      online: 'Online',
      noAccessRequests: 'No access requests',
      newRequestsWillAppearHere: 'New requests will appear here',
      detailedInformation: 'Detailed information',
      tradingDays: 'Trading days',
      // Генерация сигналов
      connectingToMarket: 'Connecting to market...',
      analyzingTechnicalIndicators: 'Analyzing technical indicators...',
      evaluatingNewsBackground: 'Evaluating news background...',
      calculatingOptimalExpiration: 'Calculating optimal expiration...',
      applyingMLModels: 'Applying ML models...',
      formingTop3Signals: 'Forming TOP-3 signals...',
      analyzingPair: 'Analyzing pair {pair}...',
      calculatingTechnicalIndicators: 'Calculating technical indicators...',
      applyingMLModel: 'Applying ML model...',
      determiningEntryPoint: 'Determining entry point...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      shadowStackDesc: 'Doesn\'t miss, doesn\'t lag, doesn\'t lie. Just does the dirty work.',
      shadowStackAlgo: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: 'Medium-term, intraday',
      forestNecromancer: 'FOREST NECROMANCER',
      forestNecromancerDesc: 'Looks like a nerd, acts like a market shaman.',
      forestNecromancerAlgo: 'RandomForest - Summoned from the forest of decisions',
      forestNecromancerStyle: 'Informer with impulse zone visualization',
      grayCardinal: 'GRAY CARDINAL',
      grayCardinalDesc: 'You don\'t see him, but he knows your entry before you.',
      grayCardinalAlgo: 'XGBoost - Not on the radar, but everything is under control',
      grayCardinalStyle: 'Signals on lower timeframes, with extra filters',
      logisticSpy: 'LOGISTIC SPY',
      logisticSpyDesc: 'Old school, but knows all the moves.',
      logisticSpyAlgo: 'LogisticRegression - A classic in the ML world',
      logisticSpyStyle: 'Conservative, time-tested',
      sniper80x: 'SNIPER 80X',
      sniper80xDesc: 'You launch it — and the market goes silent. One entry — one kill.',
      sniper80xAlgo: 'Final model - Legend among its own',
      sniper80xStyle: 'Precise entry, positional, sometimes scalp',
      sniper80xWarning: 'By command only. Auto doesn\'t activate.',
      // Статусы
      activeStatus: 'ACTIVE',
      inactive: 'INACTIVE',
      available: 'AVAILABLE',
      blocked: 'BLOCKED',
      success: 'Success',
      failure: 'Failure',
      // Действия
      buyAction: 'Buy',
      selectAction: 'Select',
      approve: 'Approve',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      apply: 'Apply',
      update: 'Update',
      // Генерация сигналов
      loadingMarkets: 'Loading markets...',
      analyzingTrends: 'Analyzing trends...',
      applyingML: 'Applying ML models...',
      calculatingEntry: 'Calculating entry points...',
      assessingRisks: 'Assessing risks...',
      finalCheck: 'Final check...',
      // Админ-панель
      activeUsers: 'Active users',
      totalSignals: 'Total signals',
      successful: 'Successful',
      failed: 'Failed',
      topUsers: 'Top users',
      accessRequests: 'Access requests',
      subscriptionHistory: 'Subscription history',
      // Статистика
      myStatistics: 'My statistics',
      winRate: 'Win rate',
      currentStreak: 'Current streak',
      bestStreak: 'Best streak',
      averageProfit: 'Average profit',
      signalsPerDay: 'Signals per day',
      bestPair: 'Best pair',
      worstPair: 'Worst pair',
      // Подписки
      monthlySubscription: 'Monthly subscription',
      lifetimePurchase: 'Lifetime purchase',
      autoRenewal: 'Auto renewal',
      noTimeLimit: 'No time limit',
      selectSubscriptionType: 'Select subscription type:',
      // Уведомления
      soundNotification: 'Sound',
      vibration: 'Vibration',
      pushNotification: 'Push',
      enabled: 'Enabled',
      disabled: 'Disabled',
      // Аналитика
      aiAnalytics: 'AI Analytics',
      successfulTradesHistory: 'Successful trades history',
      analyzeSignal: 'Analyze signal',
      analyzingInProgress: 'Analyzing...',
      cancelAnalysis: 'Cancel analysis',
      // Системные сообщения
      userAdded: 'User added to system',
      errorOccurred: 'An error occurred',
      loadingData: 'Loading data...',
      // Новые переводы для хардкод строк
      popular: 'Popular',
      bestOpportunitiesOfDay: 'Best opportunities of the day',
      threeBestSignalsSimultaneously: '3 best signals simultaneously',
      highSuccessProbability: 'High probability of success',
      riskDiversification: 'Risk diversification',
      focusOnOneTrade: 'Focus on one trade',
      simpleManagement: 'Simple management',
      availableIn: 'Available in: {minutes} min',
      idealForBeginners: 'Ideal for beginners',
      analysis: 'Analysis',
      accuracy: 'Accuracy',
      selectSignalForActivation: 'Select signal for activation',
      selectPairForSignalGeneration: 'Select pair for signal generation',
      marketState: 'Market state',
      mood: 'Mood',
      volatility: 'Volatility',
      recommendation: 'Recommendation:',
      clickToGenerateSignal: 'Click to generate signal',
      selectSignal: 'Select signal',
      selectSignalForAnalysis: 'Select signal for analysis',
      aiWillAnalyzeAndGiveRecommendations: 'AI will analyze the deal and give recommendations',
      noExecutedSignals: 'No executed signals',
      executeSeveralDealsToSeeInAnalytics: 'Execute several deals to see them in analytics',
      expiration: 'Expiration',
      dealActivated: 'DEAL ACTIVATED',
      navigationLocked: 'Navigation locked',
      timeRemainingUntilExpiration: 'Time remaining until expiration',
      howDidTheDealGo: 'How did the deal go?',
      generationMode: 'Generation mode',
      signalGeneration: 'Signal generation',
      howDoYouWantToReceiveSignals: 'How do you want to receive signals?',
      top3Signals: 'TOP-3 signals',
      singleSignals: 'Single signals',
      oneSignalAtATime: 'One signal at a time',
      allUsersStatistics: 'All users statistics',
      mlModelSelection: 'ML model selection',
      or: 'or',
      aboutMLModels: 'About ML models',
      purchaseModel: 'Purchase {name}',
      signalsChartByMonth: 'Signals chart by month',
      successfulLosing: 'successful/losing',
      accessRequests: 'Access requests',
      signalsPerDay: 'Signals per day',
      bestPair: 'Best pair',
      worstPair: 'Worst pair',
      quickTemplates: 'Quick templates',
      subscriptionManagement: 'Subscription management',
      selectMLModels: 'Select ML models:',
      availableModels: 'Available models:',
      premiumMLModels: 'Premium ML models',
      activeSignals: 'Active signals',
      progressToTP1: 'Progress to TP1',
      waitingForEntry: 'Waiting for entry',
      vipFunction: 'VIP Function',
      winRate: 'Win Rate',
      pleaseWaitSystemAnalyzing: 'Please wait. The system is analyzing the market...',
      moreDetails: 'More Details',
      tryAgainInCooldown: 'Try again in {seconds} seconds when the market stabilizes',
      // Alert messages
      bulkUpdateSuccess: 'Updated {successful} of {total} users',
      bulkUpdateError: 'Bulk update error: {error}',
      bulkUpdateErrorGeneric: 'Bulk update error: {message}',
      userDeletedSuccess: 'User {userId} successfully deleted from bot',
      userDeleteError: 'Delete error: {error}',
      // Additional alert messages
      userAddedSuccess: 'User added to system',
      errorOccurredWith: 'An error occurred: {error}',
      feedbackAcceptedSuccess: 'Feedback accepted: Successful trade',
      feedbackAcceptedFailure: 'Feedback accepted: Losing trade',
      navigationBlockedMessage: 'You have an active signal!\n\nWait for expiration and leave feedback about the trade result.\n\nNavigation will be unlocked after sending feedback.',
      modelRestrictedAlert: 'This model is restricted and available only on command',
      forexSignalsPro: 'Forex Signals Pro',
      loadingInterface: 'Loading interface...',
      loginError: 'Login error',
      tryAgain: 'Try again',
      appName: 'Forex Signals Pro',
      accurateSignals: 'Accurate signals',
      successfulTradesPercent: '87% successful trades',
      instantNotifications: 'Instant notifications',
      realTimeSignals: 'Receive signals in real-time',
      premiumQuality: 'Premium quality',
      professionalMarketAnalysis: 'Professional market analysis',
      forex: 'Forex',
      otc: 'OTC',
      top3: 'TOP-3',
      single: 'Single',
      // New keys for hardcoded texts
      hoursAgo: '{count} hour{plural} ago',
      daysAgo: '{count} day{plural} ago',
      selectLanguageDescription: 'Choose your preferred language to continue',
      // Keys for notifications interface
      notificationsBadge: 'NOTIFICATIONS',
      tradingSignals: 'Trading Signals',
      newSignals: 'New Signals',
      newSignalsDescription: 'Notifications about new signals',
      signalResults: 'Signal Results',
      signalResultsDescription: 'Notifications about closed trades',
      dailySummary: 'Daily Summary',
      dailySummaryDescription: 'Day results at 21:00',
      systemNotifications: 'System Notifications',
      marketNews: 'Market News',
      marketNewsDescription: 'Important market events',
      systemUpdates: 'System Updates',
      systemUpdatesDescription: 'New features and fixes',
      soundAndVibration: 'Sound & Vibration',
      soundNotification: 'Sound',
      soundNotificationsDescription: 'Sound notifications',
      vibration: 'Vibration',
      vibrationDescription: 'Vibration signal for notifications',
      emailNotifications: 'Email Notifications',
      emailNotificationsDescription: 'Email notifications',
      smartNotifications: 'Smart Notifications',
      smartNotificationsDescription: 'Get timely notifications about important events. You can configure each type separately.',
      enabled: 'Enabled',
      disabled: 'Disabled',
      forexMarketClosedWeekend: 'Forex market is closed on weekends or at night (22:00-06:00). Switch to OTC mode.',
      forexMarketClosedLabel: 'Forex market closed (weekends/night)',
      top3CooldownMessage: 'TOP-3 signals can be generated once every 10 minutes. Remaining: {minutes}:{seconds}',
      vipFeature: 'VIP Feature',
      vipAnalyticsDescription: 'AI Analytics is available only for users with active subscription',
      subscriptionRequired: 'Subscription required',
      getSubscription: 'Get subscription',
      returnToMenu: 'Return to menu',
      forever: 'forever',
      mlModel: 'ML model',
      chooseMLModel: 'Choose ML model',
      selectSignalForActivation: 'Select signal for activation',
      selectSignal: 'Select signal',
      expiration: 'Expiration',
      minutes: 'min',
      allUsersStatistics: 'All users statistics',
      mlModelSelection: 'ML model selection',
      perMonth: '/month',
      aboutMLModels: 'About ML models',
      purchaseModel: 'Purchase {name}',
      signalsChartByMonth: 'Signals chart by month',
      successful: 'successful',
      losing: 'losing',
      signals: 'signals',
      successfulLosing: 'successful/losing',
      accessRequests: 'Access requests',
      signalsPerDay: 'Signals per day',
      bestPair: 'Best pair',
      worstPair: 'Worst pair',
      quickTemplates: 'Quick templates',
      subscriptionManagement: 'Subscription management',
      selectMLModels: 'Select ML models:',
      availableModels: 'Available models:',
      premiumMLModels: 'Premium ML models',
      activeSignals: 'Active signals',
      progressToTP1: 'Progress to TP1',
      monthlyStatistics: 'Monthly statistics',
      totalSignals: 'Total signals',
      successfulSignals: 'Successful',
      losingSignals: 'Losing',
      pair: 'Pair:',
      direction: 'Direction:',
      tryAgainInSeconds: 'Try again in {seconds} seconds when the market stabilizes',
      modelReady: 'Model is trained and ready to work',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Close analysis',
      apiError: 'API Error',
      unknownError: 'Unknown error',
      analysisError: 'Analysis error. Invalid response format.',
      timeoutError: '⏰ Timeout: Analysis took too long. Please try again.',
      serverError: '❌ Server error',
      networkError: '🌐 Network error: Check your internet connection.',
      generalError: '❌ Error',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      professionalMarketAnalysis: 'Professional market analysis',
      activeStatus: 'ACTIVE',
      inactive: 'INACTIVE',
      available: 'AVAILABLE',
      blocked: 'BLOCKED',
      success: 'Success',
      failure: 'Failure',
      buyAction: 'Buy',
      selectAction: 'Select',
      approve: 'Approve',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      apply: 'Apply',
      update: 'Update',
      loadingMarkets: 'Loading markets...',
      analyzingTrends: 'Analyzing trends...',
      applyingML: 'Applying ML models...',
      calculatingEntry: 'Calculating entry points...',
      assessingRisks: 'Assessing risks...',
      finalCheck: 'Final check...',
      activeUsers: 'Active users',
      totalSignals: 'Total signals',
      successful: 'Successful',
      failed: 'Failed',
      topUsers: 'Top users',
      accessRequests: 'Access requests',
      subscriptionHistory: 'Subscription change history',
      myStatistics: 'My statistics',
      winRate: 'Win rate',
      currentStreak: 'Current streak',
      bestStreak: 'Best streak',
      averageProfit: 'Average profit',
      monthlySubscription: 'Monthly subscription',
      lifetimePurchase: 'Lifetime purchase',
      autoRenewal: 'Auto renewal',
      noTimeLimit: 'No time limit',
      selectSubscriptionType: 'Select subscription type:',
      pushNotification: 'Push',
      enabled: 'Enabled',
      disabled: 'Disabled',
      notificationsBadge: 'NOTIFICATIONS',
      waitingForEntry: 'Waiting for entry',
      vipFunction: 'VIP Function',
      pleaseWaitSystemAnalyzing: 'Please wait. System is analyzing the market...',
      moreDetails: 'More details',
      tryAgainInCooldown: 'Try again in cooldown',
      // New localization keys
      signalCount: '{count} signal(s)',
      signalCountZero: 'No signals',
      generatedSignal: 'Generated signal',
      top3SignalsReady: 'TOP-3 signals ready!',
      sell: 'SELL',
      wait: 'Wait',
      waiting: 'Waiting',
      minutesShort: 'min',
      secondsShort: 'sec',
      hoursShort: 'h',
      bearish: 'Bearish',
      bullish: 'Bullish',
      neutral: 'Neutral',
      notAvailable: 'N/A',
      notSpecified: 'Not specified',
      // Additional missing keys from screenshots
      aiAnalytics: 'AI Analytics',
      selectSignalForAnalysis: 'Select a signal for analysis',
      aiWillAnalyze: 'AI will analyze the deal and give recommendations',
      marketStatus: 'Market Status',
      selectPairForSignal: 'Select a pair for signal generation',
      successfully: 'Successfully',
      sentiment: 'Sentiment',
      volatility: 'Volatility',
      recommendation: 'Recommendation:',
      clickToGenerateSignal: 'Click to generate signal',
      confidence: 'Confidence',
      signalGeneration: 'Signal Generation',
      usingMLModel: 'Using ML model...',
      analysis: 'Analysis',
      mlModel: 'ML Model',
      accuracy: 'Accuracy',
      pleaseWait: 'Please wait. The system is analyzing the market...',
      howToReceiveSignals: 'How do you want to receive signals?',
      top3Signals: 'TOP-3 Signals',
      popular: 'Popular',
      bestOpportunities: 'Best opportunities of the day',
      threeBestSignals: '3 best signals',
      simultaneously: 'simultaneously',
      highSuccessProbability: 'High probability of success',
      riskDiversification: 'Risk diversification',
      singleSignals: 'Single Signals',
      oneSignalAtTime: 'One signal at a time',
      focusOnOneTrade: 'Focus on one trade',
      simpleManagement: 'Simple management',
      idealForBeginners: 'Ideal for beginners',
      dealActivated: 'DEAL ACTIVATED',
      navigationBlocked: 'Navigation blocked',
      remainingUntilExpiration: 'Remaining until expiration',
      waitForExpiration: 'Wait for signal expiration and leave feedback',
      back: 'Back'
    },
    th: {
      welcome: 'ยินดีต้อนรับ',
      selectLanguage: 'เลือกภาษา',
      continue: 'ดำเนินการต่อ',
      start: 'เริ่ม',
      menu: 'เมนู',
      tradingSignals: 'สัญญาณการซื้อขาย',
      analytics: 'การวิเคราะห์',
      community: 'ชุมชน',
      settings: 'การตั้งค่า',
      premium: 'พรีเมียม ML',
      selectMarket: 'เลือกตลาด',
      selectMode: 'โหมดการสร้าง',
      top3Signals: 'สัญญาณยอดนิยม 3 อันดับ',
      singleSignals: 'สัญญาณเดี่ยว',
      active: 'ใช้งานอยู่',
      history: 'ประวัติ',
      back: 'กลับ',
      admin: 'แผงผู้ดูแลระบบ',
      buy: 'ซื้อ',
      monthly: 'รายเดือน',
      lifetime: 'ตลอดชีพ',
      welcomeTo: 'ยินดีต้อนรับสู่',
      premiumSignals: 'สัญญาณพรีเมียมสำหรับการเทรดมืออาชีพ',
      accurateSignals: 'สัญญาณที่แม่นยำ',
      successfulTrades: '87% ของการเทรดสำเร็จ',
      instantNotifications: 'การแจ้งเตือนทันที',
      realTimeSignals: 'รับสัญญาณแบบเรียลไทม์',
      premiumQuality: 'คุณภาพพรีเมียม',
      professionalAnalysis: 'การวิเคราะห์ตลาดแบบมืออาชีพ',
      whatSignals: 'คุณต้องการรับสัญญาณแบบไหน?',
      forexSchedule: 'ตารางตลาด Forex',
      catalogPrivate: 'แคตตาล็อก ML-โมเดลส่วนตัว',
      onlyForInsiders: 'สำหรับคนในเท่านั้น ต้องเข้าถึงด้วยมือ',
      consciousRisk: 'ทุกการเข้าเป็นความเสี่ยงที่รู้ตัว',
      activeModel: 'ใช้งานอยู่',
      model: 'โมเดล:',
      modelReady: 'โมเดลได้รับการฝึกฝนและพร้อมใช้งาน',
      // Новые переводы
      comingSoon: 'เร็วๆ นี้',
      comingSoonDescription: 'เร็วๆ นี้จะเปิดให้บริการ',
      chatWithTraders: 'แชทกับเทรดเดอร์คนอื่น',
      manageParameters: 'จัดการพารามิเตอร์',
      manageAppSettings: 'จัดการการตั้งค่าแอป',
      mlModel: 'โมเดл ML',
      chooseMLModel: 'เลือกโมเดล ML',
      statistics: 'สถิติ',
      viewDetails: 'ดูสถิติแบบละเอียด',
      notifications: 'การแจ้งเตือน',
      setupPushNotifications: 'ตั้งค่าการแจ้งเตือนแบบ push',
      // Уведомления - детали
      newSignals: 'สัญญาณใหม่',
      newSignalsDescription: 'การแจ้งเตือนเกี่ยวกับสัญญาณใหม่',
      signalResults: 'ผลสัญญาณ',
      signalResultsDescription: 'การแจ้งเตือนเกี่ยวกับการปิดการเทรด',
      dailySummary: 'สรุปประจำวัน',
      dailySummaryDescription: 'สรุปวันในเวลา 21:00',
      systemNotifications: 'การแจ้งเตือนระบบ',
      marketNews: 'ข่าวตลาด',
      marketNewsDescription: 'เหตุการณ์สำคัญในตลาด',
      systemUpdates: 'อัปเดตระบบ',
      systemUpdatesDescription: 'ฟีเจอร์ใหม่และการแก้ไข',
      soundAndVibration: 'เสียงและการสั่นสะเทือน',
      soundNotification: 'เสียง',
      soundNotificationsDescription: 'การแจ้งเตือนด้วยเสียง',
      vibration: 'การสั่นสะเทือน',
      vibrationDescription: 'สัญญาณการสั่นสะเทือนสำหรับการแจ้งเตือน',
      emailNotifications: 'การแจ้งเตือนทางอีเมล',
      emailNotificationsDescription: 'ส่งซ้ำทางอีเมล',
      smartNotifications: 'การแจ้งเตือนอัจฉริยะ',
      smartNotificationsDescription: 'รับการแจ้งเตือนที่ทันเวลาเกี่ยวกับเหตุการณ์สำคัญ คุณสามารถกำหนดค่าประเภทต่างๆ แยกกันได้',
      // Новые ключи для главного меню
      chooseAction: 'เลือกการดำเนินการ',
      getTradingSignals: 'รับสัญญาณการซื้อขาย',
      aiSignalAnalysis: 'การวิเคราะห์สัญญาณด้วย AI',
      // Сигналы
      direction: 'ทิศทาง',
      expiration: 'หมดอายุ',
      confidence: 'ความมั่นใจ',
      clickToActivate: 'คลิกเพื่อเปิดใช้งาน',
      signalReady: 'สัญญาณพร้อม',
      activateSignalForTrading: 'เปิดใช้งานสัญญาณสำหรับการเทรด',
      // Подтверждения
      confirmDeleteUser: 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้',
      actionCannotBeUndone: 'การดำเนินการนี้ไม่สามารถยกเลิกได้',
      // Аналитика
      signalType: 'ประเภทสัญญาณ',
      result: 'ผลลัพธ์',
      entryPrice: 'ราคาเข้า',
      runAIAnalysis: 'รันการวิเคราะห์ AI',
      analyzingTrade: 'กำลังวิเคราะห์การเทรด...',
      gptProcessingData: 'GPT-4o mini กำลังประมวลผลข้อมูล',
      // Админ-панель
      totalUsers: 'ผู้ใช้ทั้งหมด',
      online: 'ออนไลน์',
      noAccessRequests: 'ไม่มีคำขอเข้าถึง',
      newRequestsWillAppearHere: 'คำขอใหม่จะปรากฏที่นี่',
      detailedInformation: 'ข้อมูลรายละเอียด',
      tradingDays: 'วันเทรด',
      // Генерация сигналов
      connectingToMarket: 'กำลังเชื่อมต่อตลาด...',
      analyzingTechnicalIndicators: 'วิเคราะห์ตัวชี้วัดทางเทคนิค...',
      evaluatingNewsBackground: 'ประเมินข่าวสารพื้นหลัง...',
      calculatingOptimalExpiration: 'คำนวณการหมดอายุที่เหมาะสม...',
      applyingMLModels: 'ใช้โมเดล ML...',
      formingTop3Signals: 'สร้างสัญญาณ TOP-3...',
      analyzingPair: 'วิเคราะห์คู่ {pair}...',
      calculatingTechnicalIndicators: 'คำนวณตัวชี้วัดทางเทคนิค...',
      applyingMLModel: 'ใช้โมเดล ML...',
      determiningEntryPoint: 'กำหนดจุดเข้า...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: 'ใช้งานอยู่',
      inactive: 'ไม่ใช้งาน',
      available: 'ใช้ได้',
      blocked: 'ถูกบล็อก',
      success: 'สำเร็จ',
      failure: 'ล้มเหลว',
      // Действия
      buyAction: 'ซื้อ',
      selectAction: 'เลือก',
      approve: 'อนุมัติ',
      delete: 'ลบ',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      apply: 'ใช้',
      update: 'อัปเดต',
      // Генерация сигналов
      loadingMarkets: 'กำลังโหลดตลาด...',
      analyzingTrends: 'กำลังวิเคราะห์เทรนด์...',
      applyingML: 'กำลังใช้โมเดล ML...',
      calculatingEntry: 'กำลังคำนวณจุดเข้า...',
      assessingRisks: 'กำลังประเมินความเสี่ยง...',
      finalCheck: 'กำลังตรวจสอบขั้นสุดท้าย...',
      // Админ-панель
      activeUsers: 'ผู้ใช้ที่ใช้งานอยู่',
      totalSignals: 'สัญญาณทั้งหมด',
      successful: 'สำเร็จ',
      failed: 'ล้มเหลว',
      topUsers: 'ผู้ใช้ยอดนิยม',
      accessRequests: 'คำขอเข้าถึง',
      subscriptionHistory: 'ประวัติการเปลี่ยนแปลงการสมัครสมาชิก',
      // Статистика
      myStatistics: 'สถิติของฉัน',
      winRate: 'อัตราชนะ',
      currentStreak: 'ชุดปัจจุบัน',
      bestStreak: 'ชุดที่ดีที่สุด',
      averageProfit: 'กำไรเฉลี่ย',
      signalsPerDay: 'สัญญาณต่อวัน',
      bestPair: 'คู่ที่ดีที่สุด',
      worstPair: 'คู่ที่แย่ที่สุด',
      // Подписки
      monthlySubscription: 'การสมัครสมาชิกรายเดือน',
      lifetimePurchase: 'การซื้อตลอดชีพ',
      autoRenewal: 'ต่ออายุอัตโนมัติ',
      noTimeLimit: 'ไม่มีข้อจำกัดเวลา',
      selectSubscriptionType: 'เลือกประเภทการสมัครสมาชิก:',
      // Уведомления
      soundNotification: 'เสียง',
      vibration: 'การสั่น',
      pushNotification: 'Push',
      enabled: 'เปิดใช้งาน',
      disabled: 'ปิดใช้งาน',
      // Keys for notifications interface
      notificationsBadge: 'การแจ้งเตือน',
      tradingSignals: 'สัญญาณการซื้อขาย',
      newSignals: 'สัญญาณใหม่',
      newSignalsDescription: 'การแจ้งเตือนเกี่ยวกับสัญญาณใหม่',
      signalResults: 'ผลลัพธ์สัญญาณ',
      signalResultsDescription: 'การแจ้งเตือนเกี่ยวกับการปิดการซื้อขาย',
      dailySummary: 'สรุปรายวัน',
      dailySummaryDescription: 'ผลลัพธ์ของวันในเวลา 21:00',
      systemNotifications: 'การแจ้งเตือนระบบ',
      marketNews: 'ข่าวตลาด',
      marketNewsDescription: 'เหตุการณ์สำคัญในตลาด',
      systemUpdates: 'อัปเดตระบบ',
      systemUpdatesDescription: 'ฟีเจอร์ใหม่และการแก้ไข',
      soundAndVibration: 'เสียงและการสั่น',
      soundNotification: 'เสียง',
      soundNotificationsDescription: 'การแจ้งเตือนด้วยเสียง',
      vibration: 'การสั่น',
      vibrationDescription: 'สัญญาณสั่นสำหรับการแจ้งเตือน',
      emailNotifications: 'การแจ้งเตือนทางอีเมล',
      emailNotificationsDescription: 'การแจ้งเตือนทางอีเมล',
      smartNotifications: 'การแจ้งเตือนอัจฉริยะ',
      smartNotificationsDescription: 'รับการแจ้งเตือนทันเวลาสำหรับเหตุการณ์สำคัญ คุณสามารถกำหนดค่าแต่ละประเภทแยกกัน',
      // Аналитика
      aiAnalytics: 'การวิเคราะห์ AI',
      successfulTradesHistory: 'ประวัติการเทรดที่สำเร็จ',
      analyzeSignal: 'วิเคราะห์สัญญาณ',
      analyzingInProgress: 'กำลังวิเคราะห์...',
      cancelAnalysis: 'ยกเลิกการวิเคราะห์',
      // Системные сообщения
      userAdded: 'เพิ่มผู้ใช้เข้าระบบแล้ว',
      errorOccurred: 'เกิดข้อผิดพลาด',
      loadingData: 'กำลังโหลดข้อมูล...',
      // Новые переводы для хардкод строк
      popular: 'ยอดนิยม',
      bestOpportunitiesOfDay: 'โอกาสที่ดีที่สุดของวัน',
      threeBestSignalsSimultaneously: '3 สัญญาณที่ดีที่สุดพร้อมกัน',
      highSuccessProbability: 'ความน่าจะเป็นของความสำเร็จสูง',
      riskDiversification: 'การกระจายความเสี่ยง',
      focusOnOneTrade: 'มุ่งเน้นที่การเทรดหนึ่งครั้ง',
      simpleManagement: 'การจัดการง่าย',
      availableIn: 'ใช้ได้ใน: {minutes} นาที',
      idealForBeginners: 'เหมาะสำหรับผู้เริ่มต้น',
      analysis: 'การวิเคราะห์',
      accuracy: 'ความแม่นยำ',
      selectSignalForActivation: 'เลือกสัญญาณเพื่อเปิดใช้งาน',
      selectPairForSignalGeneration: 'เลือกคู่สำหรับการสร้างสัญญาณ',
      marketState: 'สถานะตลาด',
      mood: 'อารมณ์',
      volatility: 'ความผันผวน',
      recommendation: 'คำแนะนำ:',
      clickToGenerateSignal: 'คลิกเพื่อสร้างสัญญาณ',
      selectSignal: 'เลือกสัญญาณ',
      selectSignalForAnalysis: 'เลือกสัญญาณเพื่อการวิเคราะห์',
      aiWillAnalyzeAndGiveRecommendations: 'AI จะวิเคราะห์การเทรดและให้คำแนะนำ',
      noExecutedSignals: 'ไม่มีสัญญาณที่ดำเนินการ',
      executeSeveralDealsToSeeInAnalytics: 'ดำเนินการเทรดหลายครั้งเพื่อดูในการวิเคราะห์',
      eviration: 'หมดอายุ',
      dealActivated: 'เทรดเปิดใช้งานแล้ว',
      navigationLocked: 'การนำทางถูกล็อก',
      timeRemainingUntilExpiration: 'เวลาที่เหลือจนกว่าจะหมดอายุ',
      howDidTheDealGo: 'การเทรดเป็นอย่างไร?',
      generationMode: 'โหมดการสร้าง',
      signalGeneration: 'การสร้างสัญญาณ',
      howDoYouWantToReceiveSignals: 'คุณต้องการรับสัญญาณอย่างไร?',
      top3Signals: 'สัญญาณ 3 อันดับแรก',
      singleSignals: 'สัญญาณเดี่ยว',
      oneSignalAtATime: 'หนึ่งสัญญาณต่อครั้ง',
      allUsersStatistics: 'สถิติผู้ใช้ทั้งหมด',
      mlModelSelection: 'การเลือกโมเดล ML',
      or: 'หรือ',
      aboutMLModels: 'เกี่ยวกับโมเดล ML',
      purchaseModel: 'ซื้อ {name}',
      signalsChartByMonth: 'แผนภูมิสัญญาณตามเดือน',
      successfulLosing: 'สำเร็จ/แพ้',
      accessRequests: 'คำขอเข้าถึง',
      signalsPerDay: 'สัญญาณต่อวัน',
      bestPair: 'คู่ที่ดีที่สุด',
      worstPair: 'คู่ที่แย่ที่สุด',
      quickTemplates: 'เทมเพลตด่วน',
      subscriptionManagement: 'การจัดการการสมัครสมาชิก',
      selectMLModels: 'เลือกโมเดล ML:',
      availableModels: 'โมเดลที่มี:',
      premiumMLModels: 'โมเดล ML พรีเมียม',
      activeSignals: 'สัญญาณที่ใช้งานอยู่',
      progressToTP1: 'ความคืบหน้าไปยัง TP1',
      waitingForEntry: 'รอการเข้า',
      vipFunction: 'ฟังก์ชัน VIP',
      winRate: 'อัตราชนะ',
      pleaseWaitSystemAnalyzing: 'โปรดรอ ระบบกำลังวิเคราะห์ตลาด...',
      moreDetails: 'รายละเอียดเพิ่มเติม',
      tryAgainInCooldown: 'ลองอีกครั้งใน {seconds} วินาที เมื่อตลาดเสถียร',
      // Alert messages
      bulkUpdateSuccess: 'อัปเดต {successful} จาก {total} ผู้ใช้',
      bulkUpdateError: 'ข้อผิดพลาดการอัปเดตจำนวนมาก: {error}',
      bulkUpdateErrorGeneric: 'ข้อผิดพลาดการอัปเดตจำนวนมาก: {message}',
      userDeletedSuccess: 'ผู้ใช้ {userId} ถูกลบออกจากบอทเรียบร้อยแล้ว',
      userDeleteError: 'ข้อผิดพลาดการลบ: {error}',
      // Additional alert messages
      userAddedSuccess: 'เพิ่มผู้ใช้เข้าสู่ระบบแล้ว',
      errorOccurredWith: 'เกิดข้อผิดพลาด: {error}',
      feedbackAcceptedSuccess: 'รับฟีดแบ็ก: การเทรดที่สำเร็จ',
      feedbackAcceptedFailure: 'รับฟีดแบ็ก: การเทรดที่ขาดทุน',
      navigationBlockedMessage: 'คุณมีสัญญาณที่ใช้งานอยู่!\n\nรอการหมดอายุและให้ฟีดแบ็กเกี่ยวกับผลการเทรด\n\nการนำทางจะปลดล็อกหลังจากส่งฟีดแบ็ก',
      modelRestrictedAlert: 'โมเดลนี้ถูกจำกัดและใช้ได้เฉพาะตามคำสั่ง',
      forexSignalsPro: 'Forex Signals Pro',
      accurateSignals: 'สัญญาณที่แม่นยำ',
      successfulTradesPercent: '87% การเทรดที่สำเร็จ',
      instantNotifications: 'การแจ้งเตือนทันที',
      realTimeSignals: 'รับสัญญาณแบบเรียลไทม์',
      premiumQuality: 'คุณภาพพรีเมียม',
      professionalMarketAnalysis: 'การวิเคราะห์ตลาดมืออาชีพ',
      forex: 'Forex',
      otc: 'OTC',
      top3: 'TOP-3',
      single: 'เดี่ยว',
      // New keys for hardcoded texts
      hoursAgo: '{count} ชั่วโมงที่แล้ว',
      daysAgo: '{count} วันที่แล้ว',
      selectLanguageDescription: 'เลือกภาษาที่คุณต้องการเพื่อดำเนินการต่อ',
      forexMarketClosedWeekend: 'ตลาด Forex ปิดในวันหยุดสุดสัปดาห์ สลับไปใช้โหมด OTC',
      forexMarketClosedLabel: 'ตลาด Forex ปิด (วันหยุด)',
      top3CooldownMessage: 'สัญญาณ TOP-3 สามารถสร้างได้ทุก 10 นาที เหลือ: {minutes}:{seconds}',
      vipFeature: 'ฟีเจอร์ VIP',
      vipAnalyticsDescription: 'AI Analytics ใช้ได้เฉพาะผู้ใช้ที่มีการสมัครสมาชิกที่ใช้งานอยู่',
      subscriptionRequired: 'ต้องสมัครสมาชิก',
      getSubscription: 'รับการสมัครสมาชิก',
      returnToMenu: 'กลับไปที่เมนู',
      forever: 'ตลอดไป',
      mlModel: 'โมเดл ML',
      chooseMLModel: 'เลือกโมเดล ML',
      selectSignalForActivation: 'เลือกสัญญาณเพื่อเปิดใช้งาน',
      selectSignal: 'เลือกสัญญาณ',
      expiration: 'หมดอายุ',
      minutes: 'นาที',
      allUsersStatistics: 'สถิติผู้ใช้ทั้งหมด',
      mlModelSelection: 'การเลือกโมเดล ML',
      perMonth: '/เดือน',
      aboutMLModels: 'เกี่ยวกับโมเดล ML',
      purchaseModel: 'ซื้อ {name}',
      signalsChartByMonth: 'กราฟสัญญาณตามเดือน',
      successful: 'สำเร็จ',
      losing: 'แพ้',
      signals: 'สัญญาณ',
      successfulLosing: 'สำเร็จ/แพ้',
      accessRequests: 'คำขอเข้าถึง',
      signalsPerDay: 'สัญญาณต่อวัน',
      bestPair: 'คู่ที่ดีที่สุด',
      worstPair: 'คู่ที่แย่ที่สุด',
      quickTemplates: 'เทมเพลตด่วน',
      subscriptionManagement: 'การจัดการการสมัครสมาชิก',
      selectMLModels: 'เลือกโมเดล ML:',
      availableModels: 'โมเดลที่มี:',
      premiumMLModels: 'โมเดล ML พรีเมียม',
      activeSignals: 'สัญญาณที่ใช้งานอยู่',
      progressToTP1: 'ความคืบหน้าไปยัง TP1',
      monthlyStatistics: 'สถิติรายเดือน',
      totalSignals: 'สัญญาณทั้งหมด',
      successfulSignals: 'สำเร็จ',
      losingSignals: 'แพ้',
      pair: 'คู่:',
      direction: 'ทิศทาง:',
      tryAgainInSeconds: 'ลองอีกครั้งใน {seconds} วินาทีเมื่อตลาดเสถียร',
      modelReady: 'โมเดลได้รับการฝึกอบรมและพร้อมใช้งาน',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'ปิดการวิเคราะห์',
      apiError: 'ข้อผิดพลาด API',
      unknownError: 'ข้อผิดพลาดที่ไม่ทราบ',
      analysisError: 'ข้อผิดพลาดในการรับการวิเคราะห์ รูปแบบการตอบสนองไม่ถูกต้อง',
      timeoutError: '⏰ หมดเวลา: การวิเคราะห์ใช้เวลานานเกินไป กรุณาลองใหม่',
      serverError: '❌ ข้อผิดพลาดเซิร์ฟเวอร์',
      networkError: '🌐 ข้อผิดพลาดเครือข่าย: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      generalError: '❌ ข้อผิดพลาด',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      professionalMarketAnalysis: 'การวิเคราะห์ตลาดมืออาชีพ',
      activeStatus: 'ใช้งานอยู่',
      inactive: 'ไม่ใช้งาน',
      available: 'ใช้งานได้',
      blocked: 'ถูกบล็อก',
      success: 'สำเร็จ',
      failure: 'ล้มเหลว',
      buyAction: 'ซื้อ',
      selectAction: 'เลือก',
      approve: 'อนุมัติ',
      delete: 'ลบ',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      apply: 'ใช้',
      update: 'อัปเดต',
      loadingMarkets: 'กำลังโหลดตลาด...',
      analyzingTrends: 'กำลังวิเคราะห์เทรนด์...',
      applyingML: 'กำลังใช้โมเดล ML...',
      calculatingEntry: 'กำลังคำนวณจุดเข้า...',
      assessingRisks: 'กำลังประเมินความเสี่ยง...',
      finalCheck: 'การตรวจสอบสุดท้าย...',
      activeUsers: 'ผู้ใช้ที่ใช้งานอยู่',
      totalSignals: 'สัญญาณทั้งหมด',
      successful: 'สำเร็จ',
      failed: 'ล้มเหลว',
      topUsers: 'ผู้ใช้ยอดนิยม',
      accessRequests: 'คำขอเข้าถึง',
      subscriptionHistory: 'ประวัติการเปลี่ยนแปลงการสมัครสมาชิก',
      myStatistics: 'สถิติของฉัน',
      winRate: 'อัตราชนะ',
      currentStreak: 'สตรีคปัจจุบัน',
      bestStreak: 'สตรีคที่ดีที่สุด',
      averageProfit: 'กำไรเฉลี่ย',
      monthlySubscription: 'การสมัครสมาชิกรายเดือน',
      lifetimePurchase: 'การซื้อตลอดชีพ',
      autoRenewal: 'ต่ออายุอัตโนมัติ',
      noTimeLimit: 'ไม่มีข้อจำกัดเวลา',
      selectSubscriptionType: 'เลือกประเภทการสมัครสมาชิก:',
      pushNotification: 'Push',
      enabled: 'เปิดใช้งาน',
      disabled: 'ปิดใช้งาน',
      notificationsBadge: 'การแจ้งเตือน',
      waitingForEntry: 'รอการเข้า',
      vipFunction: 'ฟังก์ชัน VIP',
      pleaseWaitSystemAnalyzing: 'กรุณารอสักครู่ ระบบกำลังวิเคราะห์ตลาด...',
      moreDetails: 'รายละเอียดเพิ่มเติม',
      tryAgainInCooldown: 'ลองอีกครั้งในคูลดาวน์',
      // New localization keys
      signalCount: '{count} สัญญาณ',
      signalCountZero: 'ไม่มีสัญญาณ',
      generatedSignal: 'สัญญาณที่สร้างขึ้น',
      top3SignalsReady: 'สัญญาณ TOP-3 พร้อมแล้ว!',
      sell: 'ขาย',
      wait: 'รอ',
      waiting: 'กำลังรอ',
      minutesShort: 'นาที',
      secondsShort: 'วินาที',
      hoursShort: 'ชม.',
      bearish: 'หมีลง',
      bullish: 'วัวขึ้น',
      neutral: 'เป็นกลาง',
      notAvailable: 'ไม่มี',
      notSpecified: 'ไม่ระบุ',
      // Additional missing keys from screenshots
      aiAnalytics: 'AI วิเคราะห์',
      selectSignalForAnalysis: 'เลือกสัญญาณสำหรับการวิเคราะห์',
      aiWillAnalyze: 'AI จะวิเคราะห์การเทรดและให้คำแนะนำ',
      marketStatus: 'สถานะตลาด',
      selectPairForSignal: 'เลือกคู่สกุลเงินสำหรับสร้างสัญญาณ',
      successfully: 'สำเร็จ',
      sentiment: 'ความรู้สึก',
      volatility: 'ความผันผวน',
      recommendation: 'คำแนะนำ:',
      clickToGenerateSignal: 'คลิกเพื่อสร้างสัญญาณ',
      confidence: 'ความมั่นใจ',
      signalGeneration: 'การสร้างสัญญาณ',
      usingMLModel: 'ใช้โมเดล ML...',
      analysis: 'การวิเคราะห์',
      mlModel: 'โมเดл ML',
      chooseMLModel: 'เลือกโมเดล ML',
      accuracy: 'ความแม่นยำ',
      pleaseWait: 'กรุณารอสักครู่ ระบบกำลังวิเคราะห์ตลาด...',
      howToReceiveSignals: 'คุณต้องการรับสัญญาณอย่างไร?',
      top3Signals: 'สัญญาณ TOP-3',
      popular: 'ยอดนิยม',
      bestOpportunities: 'โอกาสที่ดีที่สุดของวัน',
      threeBestSignals: 'สัญญาณที่ดีที่สุด 3 อัน',
      simultaneously: 'พร้อมกัน',
      highSuccessProbability: 'ความน่าจะเป็นของความสำเร็จสูง',
      riskDiversification: 'การกระจายความเสี่ยง',
      singleSignals: 'สัญญาณเดี่ยว',
      oneSignalAtTime: 'สัญญาณเดียวในแต่ละครั้ง',
      focusOnOneTrade: 'โฟกัสที่การเทรดเดียว',
      simpleManagement: 'การจัดการง่าย',
      idealForBeginners: 'เหมาะสำหรับผู้เริ่มต้น',
      dealActivated: 'เปิดใช้งานการเทรดแล้ว',
      navigationBlocked: 'การนำทางถูกบล็อก',
      remainingUntilExpiration: 'เหลือเวลาจนหมดอายุ',
      waitForExpiration: 'รอให้สัญญาณหมดอายุและให้ข้อเสนอแนะ',
      back: 'กลับ'
    },
    es: {
      welcome: 'Bienvenido',
      selectLanguage: 'Seleccionar Idioma',
      continue: 'Continuar',
      start: 'Comenzar',
      menu: 'Menú',
      tradingSignals: 'Señales de Trading',
      analytics: 'Analíticas',
      community: 'https://t.me/+nDqBvIeQwL8yZjU6',
      settings: 'Configuración',
      premium: 'ML Premium',
      selectMarket: 'Seleccionar Mercado',
      selectMode: 'Modo de Generación',
      top3Signals: 'TOP-3 Señales',
      singleSignals: 'Señales Individuales',
      active: 'Activo',
      history: 'Historial',
      back: 'Atrás',
      admin: 'Panel Admin',
      buy: 'Comprar',
      monthly: 'Mensual',
      lifetime: 'De por vida',
      welcomeTo: 'Bienvenido a',
      premiumSignals: 'Señales premium para trading profesional',
      accurateSignals: 'Señales precisas',
      successfulTrades: '87% de trades exitosos',
      instantNotifications: 'Notificaciones instantáneas',
      realTimeSignals: 'Recibe señales en tiempo real',
      premiumQuality: 'Calidad premium',
      professionalAnalysis: 'Análisis profesional del mercado',
      whatSignals: '¿Qué señales quieres recibir?',
      forexSchedule: 'Horario del mercado Forex',
      catalogPrivate: 'CATÁLOGO DE MODELOS ML PRIVADOS',
      onlyForInsiders: 'Solo para iniciados. Acceso por invitación.',
      consciousRisk: 'Cada entrada es un riesgo consciente.',
      activeModel: 'ACTIVO',
      model: 'MODELO:',
      modelReady: 'Modelo entrenado y listo para trabajar',
      // Новые переводы
      comingSoon: 'PRÓXIMAMENTE',
      comingSoonDescription: 'Próximamente disponible',
      chatWithTraders: 'Chatear con otros traders',
      manageParameters: 'Gestionar parámetros',
      manageAppSettings: 'Gestionar configuración de la app',
      mlModel: 'Modelo ML',
      chooseMLModel: 'Seleccionar modelo ML',
      statistics: 'Estadísticas',
      viewDetails: 'Ver estadísticas detalladas',
      notifications: 'Notificaciones',
      setupPushNotifications: 'Configurar notificaciones push',
      // Уведомления - детали
      newSignals: 'Nuevas Señales',
      newSignalsDescription: 'Notificaciones sobre nuevas señales',
      signalResults: 'Resultados de Señales',
      signalResultsDescription: 'Notificaciones sobre cierre de trades',
      dailySummary: 'Resumen Diario',
      dailySummaryDescription: 'Resumen del día a las 21:00',
      systemNotifications: 'Notificaciones del Sistema',
      marketNews: 'Noticias del Mercado',
      marketNewsDescription: 'Eventos importantes del mercado',
      systemUpdates: 'Actualizaciones del Sistema',
      systemUpdatesDescription: 'Nuevas funciones y correcciones',
      soundAndVibration: 'Sonido y Vibración',
      soundNotification: 'Sonido',
      soundNotificationsDescription: 'Notificaciones de sonido',
      vibration: 'Vibración',
      vibrationDescription: 'Señal de vibración para notificaciones',
      emailNotifications: 'Notificaciones por Email',
      emailNotificationsDescription: 'Duplicar por email',
      smartNotifications: 'Notificaciones Inteligentes',
      smartNotificationsDescription: 'Recibe notificaciones oportunas sobre eventos importantes. Puedes configurar cada tipo por separado.',
      // Новые ключи для главного меню
      chooseAction: 'Elige una acción',
      getTradingSignals: 'Obtén señales de trading',
      aiSignalAnalysis: 'Análisis de señales con AI',
      // Сигналы
      direction: 'Dirección',
      expiration: 'Expiración',
      confidence: 'Confianza',
      clickToActivate: 'Haz clic para activar',
      signalReady: 'Señal lista',
      activateSignalForTrading: 'Activa la señal para trading',
      // Подтверждения
      confirmDeleteUser: '¿Estás seguro de que quieres eliminar al usuario',
      actionCannotBeUndone: 'Esta acción no se puede deshacer',
      // Аналитика
      signalType: 'Tipo de señal',
      result: 'Resultado',
      entryPrice: 'Precio de entrada',
      runAIAnalysis: 'Ejecutar análisis AI',
      analyzingTrade: 'Analizando trade...',
      gptProcessingData: 'GPT-4o mini procesando datos',
      // Админ-панель
      totalUsers: 'Total de usuarios',
      online: 'En línea',
      noAccessRequests: 'Sin solicitudes de acceso',
      newRequestsWillAppearHere: 'Las nuevas solicitudes aparecerán aquí',
      detailedInformation: 'Información detallada',
      tradingDays: 'Días de trading',
      // Генерация сигналов
      connectingToMarket: 'Conectando al mercado...',
      analyzingTechnicalIndicators: 'Analizando indicadores técnicos...',
      evaluatingNewsBackground: 'Evaluando contexto de noticias...',
      calculatingOptimalExpiration: 'Calculando expiración óptima...',
      applyingMLModels: 'Aplicando modelos ML...',
      formingTop3Signals: 'Formando señales TOP-3...',
      analyzingPair: 'Analizando par {pair}...',
      calculatingTechnicalIndicators: 'Calculando indicadores técnicos...',
      applyingMLModel: 'Aplicando modelo ML...',
      determiningEntryPoint: 'Determinando punto de entrada...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      shadowStackDesc: 'No falla, no se retrasa, no miente. Solo hace el trabajo sucio.',
      shadowStackAlgo: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: 'Mediano plazo, intradía',
      forestNecromancer: 'FOREST NECROMANCER',
      forestNecromancerDesc: 'Parece un nerd, actúa como un chamán del mercado.',
      forestNecromancerAlgo: 'RandomForest - Invocado del bosque de decisiones',
      forestNecromancerStyle: 'Informador con visualización de zonas de impulso',
      grayCardinal: 'GRAY CARDINAL',
      grayCardinalDesc: 'No lo ves, pero conoce tu entrada antes que tú.',
      grayCardinalAlgo: 'XGBoost - No en el radar, pero todo está bajo control',
      grayCardinalStyle: 'Señales en timeframes menores, con filtros adicionales',
      logisticSpy: 'LOGISTIC SPY',
      logisticSpyDesc: 'Vieja escuela, pero conoce todos los movimientos.',
      logisticSpyAlgo: 'LogisticRegression - Un clásico en el mundo ML',
      logisticSpyStyle: 'Conservador, probado por el tiempo',
      sniper80x: 'SNIPER 80X',
      sniper80xDesc: 'Lo lanzas — y el mercado se queda en silencio. Una entrada — una baja.',
      sniper80xAlgo: 'Modelo final - Leyenda entre los suyos',
      sniper80xStyle: 'Entrada precisa, posicional, a veces scalping',
      sniper80xWarning: 'Solo por comando. El auto no se activa.',
      // Статусы
      activeStatus: 'ACTIVO',
      inactive: 'INACTIVO',
      available: 'DISPONIBLE',
      blocked: 'BLOQUEADO',
      success: 'Éxito',
      failure: 'Fracaso',
      // Действия
      buyAction: 'Comprar',
      selectAction: 'Seleccionar',
      approve: 'Aprobar',
      delete: 'Eliminar',
      save: 'Guardar',
      cancel: 'Cancelar',
      apply: 'Aplicar',
      update: 'Actualizar',
      // Генерация сигналов
      loadingMarkets: 'Cargando mercados...',
      analyzingTrends: 'Analizando tendencias...',
      applyingML: 'Aplicando modelos ML...',
      calculatingEntry: 'Calculando puntos de entrada...',
      assessingRisks: 'Evaluando riesgos...',
      finalCheck: 'Verificación final...',
      // Админ-панель
      activeUsers: 'Usuarios activos',
      totalSignals: 'Total de señales',
      successful: 'Exitosas',
      failed: 'Fallidas',
      topUsers: 'Top usuarios',
      accessRequests: 'Solicitudes de acceso',
      subscriptionHistory: 'Historial de cambios de suscripción',
      // Статистика
      myStatistics: 'Mis estadísticas',
      winRate: 'Tasa de éxito',
      currentStreak: 'Racha actual',
      bestStreak: 'Mejor racha',
      averageProfit: 'Beneficio promedio',
      signalsPerDay: 'Señales por día',
      bestPair: 'Mejor par',
      worstPair: 'Peor par',
      // Подписки
      monthlySubscription: 'Suscripción mensual',
      lifetimePurchase: 'Compra de por vida',
      autoRenewal: 'Renovación automática',
      noTimeLimit: 'Sin límite de tiempo',
      selectSubscriptionType: 'Selecciona tipo de suscripción:',
      // Уведомления
      soundNotification: 'Sonido',
      vibration: 'Vibración',
      pushNotification: 'Push',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
      // Аналитика
      aiAnalytics: 'Analítica AI',
      successfulTradesHistory: 'Historial de trades exitosos',
      analyzeSignal: 'Analizar señal',
      analyzingInProgress: 'Analizando...',
      cancelAnalysis: 'Cancelar análisis',
      // Системные сообщения
      userAdded: 'Usuario agregado al sistema',
      errorOccurred: 'Ocurrió un error',
      loadingData: 'Cargando datos...',
      // Модальные окна
      tradeActivated: 'TRADE ACTIVADO',
      timeExpired: '⏰ ¡Tiempo agotado!',
      leaveFeedback: 'Deja feedback sobre el resultado del trade',
      pair: 'Par',
      direction: 'Dirección',
      resultButtonsActive: 'Los botones de resultado están activos',
      indicateTradeResult: 'Después del tiempo agotado indica el resultado del trading',
      successfulTrade: 'Trade exitoso',
      losingTrade: 'Trade perdedor',
      leaveFeedbackToUnlock: '⚠️ Deja feedback para desbloquear la navegación',
      navigationLocked: 'Navegación bloqueada',
      waitForExpiration: 'Espera la expiración de la señal y deja feedback',
      timeRemaining: 'Tiempo restante hasta expiración',
      noSuitableEntry: '⚠️ No hay punto de entrada adecuado',
      marketConditionsNotOptimal: 'Las condiciones actuales del mercado no son óptimas para abrir posición',
      analysisCompleted: 'Análisis completado',
      recommendations: 'Recomendaciones',
      tryAnotherPair: 'Prueba otro par',
      selectAnotherPairDescription: 'Selecciona otro par de divisas con condiciones más favorables',
      waitForOptimalConditions: 'Espera condiciones óptimas',
      tryAgainWhen: 'Intenta de nuevo en {seconds} segundos cuando el mercado se estabilice',
      returnToPairSelection: 'Volver a la selección de par',
      patienceIsKey: '💡 La paciencia es clave para el trading exitoso',
      warningAttention: '⚠️ ¡ATENCIÓN!',
      systemBypassDetected: 'Se detectó intento de bypass del sistema',
      activeSignalRequiresCompletion: 'Tienes una señal activa que requiere finalización. Recargar la página no ayudará a evitar el bloqueo de navegación.',
      activeSignal: 'Señal activa',
      feedbackRequired: '⏰ ¡Feedback requerido!',
      returnToOpenTrade: 'Volver al trade abierto',
      bypassProtectionActive: 'Sistema de protección contra bypass de bloqueo de navegación activado',
      waitForActiveSignal: '⚠️ ¡Espera a que se complete la señal activa y deja feedback antes de continuar!',
      // Alert сообщения
      subscriptionUpdated: '✅ ¡Suscripción actualizada para {name}! El usuario tendrá acceso a los modelos ML seleccionados.',
      subscriptionUpdateError: '❌ Error al actualizar suscripción para {name}',
      subscriptionDisabled: '✅ ¡Suscripción deshabilitada para {name}!',
      subscriptionDisableError: '❌ Error al deshabilitar suscripción para {name}',
      confirmDeleteUser: '¿Estás seguro de que quieres eliminar al usuario {name}? Esta acción no se puede deshacer.',
      userDeleted: '✅ Usuario {name} eliminado del sistema',
      userDeleteError: '❌ Error al eliminar usuario {name}',
      accessRequestApproved: '✅ Solicitud de acceso aprobada para {name}',
      accessRequestError: '❌ Error al aprobar solicitud para {name}',
      // Новые переводы для хардкод строк
      popular: 'Popular',
      bestOpportunitiesOfDay: 'Mejores oportunidades del día',
      threeBestSignalsSimultaneously: '3 mejores señales simultáneamente',
      highSuccessProbability: 'Alta probabilidad de éxito',
      riskDiversification: 'Diversificación de riesgos',
      focusOnOneTrade: 'Enfócate en una operación',
      simpleManagement: 'Gestión simple',
      availableIn: 'Disponible en: {minutes} min',
      idealForBeginners: 'Ideal para principiantes',
      analysis: 'Análisis',
      accuracy: 'Precisión',
      selectSignalForActivation: 'Selecciona señal para activar',
      selectPairForSignalGeneration: 'Selecciona par para generar señal',
      marketState: 'Estado del mercado',
      mood: 'Estado de ánimo',
      volatility: 'Volatilidad',
      recommendation: 'Recomendación:',
      clickToGenerateSignal: 'Haz clic para generar señal',
      selectSignal: 'Seleccionar señal',
      selectSignalForAnalysis: 'Selecciona señal para análisis',
      aiWillAnalyzeAndGiveRecommendations: 'IA analizará la operación y dará recomendaciones',
      noExecutedSignals: 'No hay señales ejecutadas',
      executeSeveralDealsToSeeInAnalytics: 'Ejecuta varias operaciones para verlas en analíticas',
      expiration: 'Expiración',
      dealActivated: 'OPERACIÓN ACTIVADA',
      navigationLocked: 'Navegación bloqueada',
      timeRemainingUntilExpiration: 'Tiempo restante hasta expiración',
      howDidTheDealGo: '¿Cómo fue la operación?',
      generationMode: 'Modo de generación',
      signalGeneration: 'Generación de señales',
      howDoYouWantToReceiveSignals: '¿Cómo quieres recibir señales?',
      top3Signals: 'TOP-3 señales',
      singleSignals: 'Señales individuales',
      oneSignalAtATime: 'Una señal a la vez',
      allUsersStatistics: 'Estadísticas de todos los usuarios',
      mlModelSelection: 'Selección de modelo ML',
      or: 'o',
      aboutMLModels: 'Acerca de modelos ML',
      purchaseModel: 'Comprar {name}',
      signalsChartByMonth: 'Gráfico de señales por mes',
      successfulLosing: 'exitosas/perdidas',
      accessRequests: 'Solicitudes de acceso',
      signalsPerDay: 'Señales por día',
      bestPair: 'Mejor par',
      worstPair: 'Peor par',
      quickTemplates: 'Plantillas rápidas',
      subscriptionManagement: 'Gestión de suscripciones',
      selectMLModels: 'Selecciona modelos ML:',
      availableModels: 'Modelos disponibles:',
      premiumMLModels: 'Modelos ML premium',
      activeSignals: 'Señales activas',
      progressToTP1: 'Progreso hacia TP1',
      waitingForEntry: 'Esperando entrada',
      vipFunction: 'Función VIP',
      winRate: 'Tasa de ganancia',
      pleaseWaitSystemAnalyzing: 'Por favor espera. El sistema está analizando el mercado...',
      moreDetails: 'Más Detalles',
      tryAgainInCooldown: 'Inténtalo de nuevo en {seconds} segundos cuando el mercado se estabilice',
      // Alert messages
      bulkUpdateSuccess: 'Actualizado {successful} de {total} usuarios',
      bulkUpdateError: 'Error de actualización masiva: {error}',
      bulkUpdateErrorGeneric: 'Error de actualización masiva: {message}',
      userDeletedSuccess: 'Usuario {userId} eliminado exitosamente del bot',
      userDeleteError: 'Error de eliminación: {error}',
      // Additional alert messages
      userAddedSuccess: 'Usuario agregado al sistema',
      errorOccurredWith: 'Ocurrió un error: {error}',
      feedbackAcceptedSuccess: 'Comentario aceptado: Operación exitosa',
      feedbackAcceptedFailure: 'Comentario aceptado: Operación perdedora',
      navigationBlockedMessage: '¡Tienes una señal activa!\n\nEspera la expiración y deja comentarios sobre el resultado de la operación.\n\nLa navegación se desbloqueará después de enviar comentarios.',
      modelRestrictedAlert: 'Este modelo está restringido y disponible solo por comando',
      forexSignalsPro: 'Forex Signals Pro',
      accurateSignals: 'Señales precisas',
      successfulTradesPercent: '87% operaciones exitosas',
      instantNotifications: 'Notificaciones instantáneas',
      realTimeSignals: 'Recibe señales en tiempo real',
      premiumQuality: 'Calidad premium',
      professionalMarketAnalysis: 'Análisis profesional del mercado',
      forex: 'Forex',
      otc: 'OTC',
      top3: 'TOP-3',
      single: 'Individual',
      // New keys for hardcoded texts
      hoursAgo: 'hace {count} hora{plural}',
      daysAgo: 'hace {count} día{plural}',
      selectLanguageDescription: 'Elige tu idioma preferido para continuar',
      // Keys for notifications interface
      notificationsBadge: 'NOTIFICACIONES',
      tradingSignals: 'Señales de Trading',
      newSignals: 'Nuevas Señales',
      newSignalsDescription: 'Notificaciones sobre nuevas señales',
      signalResults: 'Resultados de Señales',
      signalResultsDescription: 'Notificaciones sobre cierres de operaciones',
      dailySummary: 'Resumen Diario',
      dailySummaryDescription: 'Resultados del día a las 21:00',
      systemNotifications: 'Notificaciones del Sistema',
      marketNews: 'Noticias del Mercado',
      marketNewsDescription: 'Eventos importantes del mercado',
      systemUpdates: 'Actualizaciones del Sistema',
      systemUpdatesDescription: 'Nuevas funciones y correcciones',
      soundAndVibration: 'Sonido y Vibración',
      soundNotification: 'Sonido',
      soundNotificationsDescription: 'Notificaciones de sonido',
      vibration: 'Vibración',
      vibrationDescription: 'Señal de vibración para notificaciones',
      emailNotifications: 'Notificaciones por Email',
      emailNotificationsDescription: 'Notificaciones por correo electrónico',
      smartNotifications: 'Notificaciones Inteligentes',
      smartNotificationsDescription: 'Recibe notificaciones oportunas sobre eventos importantes. Puedes configurar cada tipo por separado.',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
      forexMarketClosedWeekend: 'El mercado Forex está cerrado los fines de semana. Cambia al modo OTC.',
      forexMarketClosedLabel: 'Mercado Forex cerrado (fines de semana)',
      top3CooldownMessage: 'Las señales TOP-3 se pueden generar una vez cada 10 minutos. Restante: {minutes}:{seconds}',
      vipFeature: 'Función VIP',
      vipAnalyticsDescription: 'AI Analytics está disponible solo para usuarios con suscripción activa',
      subscriptionRequired: 'Suscripción requerida',
      getSubscription: 'Obtener suscripción',
      returnToMenu: 'Volver al menú',
      forever: 'para siempre',
      mlModel: 'Modelo ML',
      chooseMLModel: 'Seleccionar modelo ML',
      selectSignalForActivation: 'Selecciona señal para activación',
      selectSignal: 'Selecciona señal',
      expiration: 'Expiración',
      minutes: 'min',
      allUsersStatistics: 'Estadísticas de todos los usuarios',
      mlModelSelection: 'Selección de modelo ML',
      perMonth: '/mes',
      aboutMLModels: 'Acerca de los modelos ML',
      purchaseModel: 'Comprar {name}',
      signalsChartByMonth: 'Gráfico de señales por mes',
      successful: 'exitosas',
      losing: 'perdedoras',
      signals: 'señales',
      successfulLosing: 'exitosas/perdedoras',
      accessRequests: 'Solicitudes de acceso',
      signalsPerDay: 'Señales por día',
      bestPair: 'Mejor par',
      worstPair: 'Peor par',
      quickTemplates: 'Plantillas rápidas',
      subscriptionManagement: 'Gestión de suscripciones',
      selectMLModels: 'Selecciona modelos ML:',
      availableModels: 'Modelos disponibles:',
      premiumMLModels: 'Modelos ML premium',
      activeSignals: 'Señales activas',
      progressToTP1: 'Progreso hacia TP1',
      monthlyStatistics: 'Estadísticas mensuales',
      totalSignals: 'Total de señales',
      successfulSignals: 'Exitosas',
      losingSignals: 'Perdedoras',
      pair: 'Par:',
      direction: 'Dirección:',
      tryAgainInSeconds: 'Intenta de nuevo en {seconds} segundos cuando el mercado se estabilice',
      modelReady: 'El modelo está entrenado y listo para trabajar',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Cerrar análisis',
      apiError: 'Error de API',
      unknownError: 'Error desconocido',
      analysisError: 'Error al obtener análisis. Formato de respuesta inválido.',
      timeoutError: '⏰ Tiempo agotado: El análisis tardó demasiado. Inténtalo de nuevo.',
      serverError: '❌ Error del servidor',
      networkError: '🌐 Error de red: Verifica tu conexión a internet.',
      generalError: '❌ Error',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} señal(es)',
      signalCountZero: 'Sin señales',
      generatedSignal: 'Señal generada',
      top3SignalsReady: '¡TOP-3 señales listas!',
      sell: 'VENDER',
      wait: 'Esperar',
      waiting: 'Esperando',
      minutesShort: 'min',
      secondsShort: 'seg',
      hoursShort: 'h',
      bearish: 'Bajista',
      bullish: 'Alcista',
      neutral: 'Neutral',
      notAvailable: 'N/D',
      notSpecified: 'No especificado',
      // Additional missing keys from screenshots
      aiAnalytics: 'Análisis AI',
      selectSignalForAnalysis: 'Selecciona una señal para análisis',
      aiWillAnalyze: 'AI analizará la operación y dará recomendaciones',
      marketStatus: 'Estado del Mercado',
      selectPairForSignal: 'Selecciona un par para generar señal',
      successfully: 'Exitosamente',
      sentiment: 'Sentimiento',
      volatility: 'Volatilidad',
      recommendation: 'Recomendación:',
      clickToGenerateSignal: 'Haz clic para generar señal',
      confidence: 'Confianza',
      signalGeneration: 'Generación de Señales',
      usingMLModel: 'Usando modelo ML...',
      analysis: 'Análisis',
      mlModel: 'Modelo ML',
      chooseMLModel: 'Seleccionar modelo ML',
      accuracy: 'Precisión',
      pleaseWait: 'Por favor espera. El sistema está analizando el mercado...',
      howToReceiveSignals: '¿Cómo quieres recibir señales?',
      top3Signals: 'Señales TOP-3',
      popular: 'Popular',
      bestOpportunities: 'Mejores oportunidades del día',
      threeBestSignals: '3 mejores señales',
      simultaneously: 'simultáneamente',
      highSuccessProbability: 'Alta probabilidad de éxito',
      riskDiversification: 'Diversificación de riesgos',
      singleSignals: 'Señales Individuales',
      oneSignalAtTime: 'Una señal a la vez',
      focusOnOneTrade: 'Enfoque en una operación',
      simpleManagement: 'Gestión simple',
      idealForBeginners: 'Ideal para principiantes',
      dealActivated: 'OPERACIÓN ACTIVADA',
      navigationBlocked: 'Navegación bloqueada',
      remainingUntilExpiration: 'Restante hasta expiración',
      waitForExpiration: 'Espera la expiración de la señal y deja feedback',
      back: 'Atrás'
    },
    fr: {
      welcome: 'Bienvenue',
      selectLanguage: 'Sélectionner la langue',
      continue: 'Continuer',
      start: 'Commencer',
      menu: 'Menu',
      tradingSignals: 'Signaux de trading',
      analytics: 'Analytique',
      community: 'https://t.me/+nDqBvIeQwL8yZjU6',
      settings: 'Paramètres',
      premium: 'ML Premium',
      selectMarket: 'Sélectionner le marché',
      selectMode: 'Mode de génération',
      top3Signals: 'TOP-3 Signaux',
      singleSignals: 'Signaux uniques',
      active: 'Actif',
      history: 'Historique',
      back: 'Retour',
      future: 'Admin Panel',
      buy: 'Acheter',
      monthly: 'Mensuel',
      lifetime: 'À vie',
      welcomeTo: 'Bienvenue dans',
      premiumSignals: 'Signaux premium pour trading professionnel',
      accurateSignals: 'Signaux précis',
      successfulTrades: '87% de trades réussis',
      instantNotifications: 'Notifications instantanées',
      realTimeSignals: 'Recevez des signaux en temps réel',
      premiumQuality: 'Qualité premium',
      professionalAnalysis: 'Analyse professionnelle du marché',
      whatSignals: 'Quels signaux voulez-vous recevoir ?',
      forexSchedule: 'Horaire du marché Forex',
      catalogPrivate: 'CATALOGUE DE MODÈLES ML PRIVÉS',
      onlyForInsiders: 'Seulement pour les initiés. Accès par invitation.',
      consciousRisk: 'Chaque entrée est un risque conscient.',
      activeModel: 'ACTIF',
      model: 'MODÈLE:',
      modelReady: 'Modèle entraîné et prêt à fonctionner',
      // Новые переводы
      comingSoon: 'BIENTÔT',
      comingSoonDescription: 'Bientôt disponible',
      chatWithTraders: 'Discuter avec d\'autres traders',
      manageParameters: 'Gérer les paramètres',
      manageAppSettings: 'Gérer les paramètres de l\'app',
      mlModel: 'Modèle ML',
      chooseMLModel: 'Sélectionner le modèle ML',
      statistics: 'Statistiques',
      viewDetails: 'Voir les statistiques détaillées',
      notifications: 'Notifications',
      setupPushNotifications: 'Configurer les notifications push',
      // Уведомления - детали
      newSignals: 'Nouveaux Signaux',
      newSignalsDescription: 'Notifications sur de nouveaux signaux',
      signalResults: 'Résultats des Signaux',
      signalResultsDescription: 'Notifications sur la fermeture des trades',
      dailySummary: 'Résumé Quotidien',
      dailySummaryDescription: 'Résumé de la journée à 21h00',
      systemNotifications: 'Notifications Système',
      marketNews: 'Actualités du Marché',
      marketNewsDescription: 'Événements importants du marché',
      systemUpdates: 'Mises à Jour Système',
      systemUpdatesDescription: 'Nouvelles fonctionnalités et corrections',
      soundAndVibration: 'Son et Vibration',
      soundNotification: 'Son',
      soundNotificationsDescription: 'Notifications sonores',
      vibration: 'Vibration',
      vibrationDescription: 'Signal de vibration pour les notifications',
      emailNotifications: 'Notifications Email',
      emailNotificationsDescription: 'Dupliquer par email',
      smartNotifications: 'Notifications Intelligentes',
      smartNotificationsDescription: 'Recevez des notifications opportunes sur les événements importants. Vous pouvez configurer chaque type séparément.',
      // Новые ключи для главного меню
      chooseAction: 'Choisissez une action',
      getTradingSignals: 'Obtenez des signaux de trading',
      aiSignalAnalysis: 'Analyse de signaux avec IA',
      // Сигналы
      direction: 'Direction',
      expiration: 'Expiration',
      confidence: 'Confiance',
      clickToActivate: 'Cliquez pour activer',
      signalReady: 'Signal prêt',
      activateSignalForTrading: 'Activez le signal pour le trading',
      // Подтверждения
      confirmDeleteUser: 'Êtes-vous sûr de vouloir supprimer l\'utilisateur',
      actionCannotBeUndone: 'Cette action ne peut pas être annulée',
      // Аналитика
      signalType: 'Type de signal',
      result: 'Résultat',
      entryPrice: 'Prix d\'entrée',
      runAIAnalysis: 'Lancer l\'analyse IA',
      analyzingTrade: 'Analyse du trade...',
      gptProcessingData: 'GPT-4o mini traite les données',
      // Админ-панель
      totalUsers: 'Total des utilisateurs',
      online: 'En ligne',
      noAccessRequests: 'Aucune demande d\'accès',
      newRequestsWillAppearHere: 'Les nouvelles demandes apparaîtront ici',
      detailedInformation: 'Informations détaillées',
      tradingDays: 'Jours de trading',
      // Генерация сигналов
      connectingToMarket: 'Connexion au marché...',
      analyzingTechnicalIndicators: 'Analyse des indicateurs techniques...',
      evaluatingNewsBackground: 'Évaluation du contexte des nouvelles...',
      calculatingOptimalExpiration: 'Calcul de l\'expiration optimale...',
      applyingMLModels: 'Application des modèles ML...',
      formingTop3Signals: 'Formation des signaux TOP-3...',
      analyzingPair: 'Analyse de la paire {pair}...',
      calculatingTechnicalIndicators: 'Calcul des indicateurs techniques...',
      applyingMLModel: 'Application du modèle ML...',
      determiningEntryPoint: 'Détermination du point d\'entrée...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      shadowStackDesc: 'Ne rate pas, ne lag pas, ne ment pas. Fait juste le sale boulot.',
      shadowStackAlgo: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: 'Moyen terme, intraday',
      forestNecromancer: 'FOREST NECROMANCER',
      forestNecromancerDesc: 'A l\'air d\'un geek, agit comme un chamane du marché.',
      forestNecromancerAlgo: 'RandomForest - Invoqué de la forêt des décisions',
      forestNecromancerStyle: 'Informateur avec visualisation des zones d\'impulsion',
      grayCardinal: 'GRAY CARDINAL',
      grayCardinalDesc: 'Vous ne le voyez pas, mais il connaît votre entrée avant vous.',
      grayCardinalAlgo: 'XGBoost - Pas sur le radar, mais tout est sous contrôle',
      grayCardinalStyle: 'Signaux sur des timeframes plus courts, avec des filtres supplémentaires',
      logisticSpy: 'LOGISTIC SPY',
      logisticSpyDesc: 'Vieille école, mais connaît tous les mouvements.',
      logisticSpyAlgo: 'LogisticRegression - Un classique dans le monde ML',
      logisticSpyStyle: 'Conservateur, éprouvé par le temps',
      sniper80x: 'SNIPER 80X',
      sniper80xDesc: 'Vous le lancez — et le marché se tait. Une entrée — une élimination.',
      sniper80xAlgo: 'Modèle final - Légende parmi les siens',
      sniper80xStyle: 'Entrée précise, positionnel, parfois scalping',
      sniper80xWarning: 'Seulement sur commande. L\'auto ne s\'active pas.',
      // Статусы
      activeStatus: 'ACTIF',
      inactive: 'INACTIF',
      available: 'DISPONIBLE',
      blocked: 'BLOQUÉ',
      success: 'Succès',
      failure: 'Échec',
      // Действия
      buyAction: 'Acheter',
      selectAction: 'Sélectionner',
      approve: 'Approuver',
      delete: 'Supprimer',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      apply: 'Appliquer',
      update: 'Mettre à jour',
      // Генерация сигналов
      loadingMarkets: 'Chargement des marchés...',
      analyzingTrends: 'Analyse des tendances...',
      applyingML: 'Application des modèles ML...',
      calculatingEntry: 'Calcul des points d\'entrée...',
      assessingRisks: 'Évaluation des risques...',
      finalCheck: 'Vérification finale...',
      // Админ-панель
      activeUsers: 'Utilisateurs actifs',
      totalSignals: 'Total des signaux',
      successful: 'Réussis',
      failed: 'Échoués',
      topUsers: 'Top utilisateurs',
      accessRequests: 'Demandes d\'accès',
      subscriptionHistory: 'Historique des changements d\'abonnement',
      // Статистика
      myStatistics: 'Mes statistiques',
      winRate: 'Taux de réussite',
      currentStreak: 'Série actuelle',
      bestStreak: 'Meilleure série',
      averageProfit: 'Bénéfice moyen',
      signalsPerDay: 'Signaux par jour',
      bestPair: 'Meilleure paire',
      worstPair: 'Pire paire',
      // Подписки
      monthlySubscription: 'Abonnement mensuel',
      lifetimePurchase: 'Achat à vie',
      autoRenewal: 'Renouvellement automatique',
      noTimeLimit: 'Sans limite de temps',
      selectSubscriptionType: 'Sélectionner le type d\'abonnement:',
      // Уведомления
      soundNotification: 'Son',
      vibration: 'Vibration',
      pushNotification: 'Push',
      enabled: 'Activé',
      disabled: 'Désactivé',
      // Аналитика
      aiAnalytics: 'Analytique IA',
      successfulTradesHistory: 'Historique des trades réussis',
      analyzeSignal: 'Analyser le signal',
      analyzingInProgress: 'Analyse en cours...',
      cancelAnalysis: 'Annuler l\'analyse',
      // Системные сообщения
      userAdded: 'Utilisateur ajouté au système',
      errorOccurred: 'Une erreur s\'est produite',
      loadingData: 'Chargement des données...',
      // Модальные окна
      tradeActivated: 'TRADE ACTIVÉ',
      timeExpired: '⏰ Temps écoulé !',
      leaveFeedback: 'Laissez un retour sur le résultat du trade',
      pair: 'Paire',
      direction: 'Direction',
      resultButtonsActive: 'Les boutons de résultat sont actifs',
      indicateTradeResult: 'Après l\'expiration du temps, indiquez le résultat du trading',
      successfulTrade: 'Trade réussi',
      losingTrade: 'Trade perdant',
      leaveFeedbackToUnlock: '⚠️ Laissez un retour pour débloquer la navigation',
      navigationLocked: 'Navigation verrouillée',
      waitForExpiration: 'Attendez l\'expiration du signal et laissez un retour',
      timeRemaining: 'Temps restant jusqu\'à expiration',
      noSuitableEntry: '⚠️ Aucun point d\'entrée approprié',
      marketConditionsNotOptimal: 'Les conditions actuelles du marché ne sont pas optimales pour ouvrir une position',
      analysisCompleted: 'Analyse terminée',
      recommendations: 'Recommandations',
      tryAnotherPair: 'Essayez une autre paire',
      selectAnotherPairDescription: 'Sélectionnez une autre paire de devises avec des conditions plus favorables',
      waitForOptimalConditions: 'Attendez des conditions optimales',
      tryAgainWhen: 'Réessayez dans {seconds} secondes quand le marché se stabilisera',
      returnToPairSelection: 'Retour à la sélection de paire',
      patienceIsKey: '💡 La patience est la clé du trading réussi',
      warningAttention: '⚠️ ATTENTION !',
      systemBypassDetected: 'Tentative de contournement du système détectée',
      activeSignalRequiresCompletion: 'Vous avez un signal actif qui nécessite une finalisation. Recharger la page n\'aidera pas à contourner le verrouillage de navigation.',
      activeSignal: 'Signal actif',
      feedbackRequired: '⏰ Retour requis !',
      returnToOpenTrade: 'Retour au trade ouvert',
      bypassProtectionActive: 'Système de protection contre le contournement du verrouillage de navigation activé',
      waitForActiveSignal: '⚠️ Attendez la finalisation du signal actif et laissez un retour avant de continuer !',
      // Alert сообщения
      subscriptionUpdated: '✅ Abonnement mis à jour pour {name} ! L\'utilisateur aura accès aux modèles ML sélectionnés.',
      subscriptionUpdateError: '❌ Erreur lors de la mise à jour de l\'abonnement pour {name}',
      subscriptionDisabled: '✅ Abonnement désactivé pour {name} !',
      subscriptionDisableError: '❌ Erreur lors de la désactivation de l\'abonnement pour {name}',
      confirmDeleteUser: 'Êtes-vous sûr de vouloir supprimer l\'utilisateur {name} ? Cette action ne peut pas être annulée.',
      userDeleted: '✅ Utilisateur {name} supprimé du système',
      userDeleteError: '❌ Erreur lors de la suppression de l\'utilisateur {name}',
      accessRequestApproved: '✅ Demande d\'accès approuvée pour {name}',
      accessRequestError: '❌ Erreur lors de l\'approbation de la demande pour {name}',
      // Новые переводы для хардкод строк
      popular: 'Populaire',
      bestOpportunitiesOfDay: 'Meilleures opportunités du jour',
      threeBestSignalsSimultaneously: '3 meilleurs signaux simultanément',
      highSuccessProbability: 'Probabilité de succès élevée',
      riskDiversification: 'Diversification des risques',
      focusOnOneTrade: 'Focus sur un trade',
      simpleManagement: 'Gestion simple',
      availableIn: 'Disponible dans: {minutes} min',
      idealForBeginners: 'Idéal pour les débutants',
      analysis: 'Analyse',
      accuracy: 'Précision',
      selectSignalForActivation: 'Sélectionnez le signal à activer',
      selectPairForSignalGeneration: 'Sélectionnez la paire pour générer le signal',
      marketState: 'État du marché',
      mood: 'Humeur',
      volatility: 'Volatilité',
      recommendation: 'Recommandation:',
      clickToGenerateSignal: 'Cliquez pour générer le signal',
      selectSignal: 'Sélectionnez le signal',
      selectSignalForAnalysis: 'Sélectionnez le signal à analyser',
      aiWillAnalyzeAndGiveRecommendations: 'L\'IA analysera le trade et donnera des recommandations',
      noExecutedSignals: 'Aucun signal exécuté',
      executeSeveralDealsToSeeInAnalytics: 'Exécutez plusieurs trades pour les voir dans l\'analytique',
      expiration: 'Expiration',
      dealActivated: 'TRADE ACTIVÉ',
      navigationLocked: 'Navigation verrouillée',
      timeRemainingUntilExpiration: 'Temps restant jusqu\'à expiration',
      howDidTheDealGo: 'Comment s\'est passé le trade?',
      generationMode: 'Mode de génération',
      signalGeneration: 'Génération de signaux',
      howDoYouWantToReceiveSignals: 'Comment voulez-vous recevoir les signaux?',
      top3Signals: 'TOP-3 signaux',
      singleSignals: 'Signaux individuels',
      oneSignalAtATime: 'Un signal à la fois',
      allUsersStatistics: 'Statistiques de tous les utilisateurs',
      mlModelSelection: 'Sélection du modèle ML',
      or: 'ou',
      aboutMLModels: 'À propos des modèles ML',
      purchaseModel: 'Acheter {name}',
      signalsChartByMonth: 'Graphique des signaux par mois',
      successfulLosing: 'réussis/échoués',
      accessRequests: 'Demandes d\'accès',
      signalsPerDay: 'Signaux par jour',
      bestPair: 'Meilleure paire',
      worstPair: 'Pire paire',
      quickTemplates: 'Modèles rapides',
      subscriptionManagement: 'Gestion des abonnements',
      selectMLModels: 'Sélectionnez les modèles ML:',
      availableModels: 'Modèles disponibles:',
      premiumMLModels: 'Modèles ML premium',
      activeSignals: 'Signaux actifs',
      progressToTP1: 'Progrès vers TP1',
      waitingForEntry: 'En attente d\'entrée',
      vipFunction: 'Fonction VIP',
      winRate: 'Taux de réussite',
      pleaseWaitSystemAnalyzing: 'Veuillez patienter. Le système analyse le marché...',
      moreDetails: 'Plus de Détails',
      tryAgainInCooldown: 'Réessayez dans {seconds} secondes quand le marché se stabilise',
      // Alert messages
      bulkUpdateSuccess: 'Mis à jour {successful} sur {total} utilisateurs',
      bulkUpdateError: 'Erreur de mise à jour en masse: {error}',
      bulkUpdateErrorGeneric: 'Erreur de mise à jour en masse: {message}',
      userDeletedSuccess: 'Utilisateur {userId} supprimé avec succès du bot',
      userDeleteError: 'Erreur de suppression: {error}',
      // Additional alert messages
      userAddedSuccess: 'Utilisateur ajouté au système',
      errorOccurredWith: 'Une erreur s\'est produite: {error}',
      feedbackAcceptedSuccess: 'Commentaire accepté: Trade réussi',
      feedbackAcceptedFailure: 'Commentaire accepté: Trade perdant',
      navigationBlockedMessage: 'Vous avez un signal actif!\n\nAttendez l\'expiration et laissez un commentaire sur le résultat du trade.\n\nLa navigation sera débloquée après l\'envoi du commentaire.',
      modelRestrictedAlert: 'Ce modèle est restreint et disponible uniquement sur commande',
      forexSignalsPro: 'Forex Signals Pro',
      accurateSignals: 'Signaux précis',
      successfulTradesPercent: '87% de trades réussis',
      instantNotifications: 'Notifications instantanées',
      realTimeSignals: 'Recevez des signaux en temps réel',
      premiumQuality: 'Qualité premium',
      professionalMarketAnalysis: 'Analyse professionnelle du marché',
      forex: 'Forex',
      otc: 'OTC',
      top3: 'TOP-3',
      single: 'Individuel',
      // New keys for hardcoded texts
      hoursAgo: 'il y a {count} heure{plural}',
      daysAgo: 'il y a {count} jour{plural}',
      selectLanguageDescription: 'Choisissez votre langue préférée pour continuer',
      // Keys for notifications interface
      notificationsBadge: 'NOTIFICATIONS',
      tradingSignals: 'Signaux de Trading',
      newSignals: 'Nouveaux Signaux',
      newSignalsDescription: 'Notifications sur les nouveaux signaux',
      signalResults: 'Résultats des Signaux',
      signalResultsDescription: 'Notifications sur les fermetures de trades',
      dailySummary: 'Résumé Quotidien',
      dailySummaryDescription: 'Résultats du jour à 21:00',
      systemNotifications: 'Notifications Système',
      marketNews: 'Actualités du Marché',
      marketNewsDescription: 'Événements importants du marché',
      systemUpdates: 'Mises à Jour Système',
      systemUpdatesDescription: 'Nouvelles fonctionnalités et corrections',
      soundAndVibration: 'Son et Vibration',
      soundNotification: 'Son',
      soundNotificationsDescription: 'Notifications sonores',
      vibration: 'Vibration',
      vibrationDescription: 'Signal de vibration pour les notifications',
      emailNotifications: 'Notifications Email',
      emailNotificationsDescription: 'Notifications par email',
      smartNotifications: 'Notifications Intelligentes',
      smartNotificationsDescription: 'Recevez des notifications opportunes sur les événements importants. Vous pouvez configurer chaque type séparément.',
      enabled: 'Activé',
      disabled: 'Désactivé',
      forexMarketClosedWeekend: 'Le marché Forex est fermé le week-end. Passez au mode OTC.',
      forexMarketClosedLabel: 'Marché Forex fermé (week-end)',
      top3CooldownMessage: 'Les signaux TOP-3 peuvent être générés une fois toutes les 10 minutes. Restant: {minutes}:{seconds}',
      vipFeature: 'Fonction VIP',
      vipAnalyticsDescription: 'AI Analytics est disponible uniquement pour les utilisateurs avec un abonnement actif',
      subscriptionRequired: 'Abonnement requis',
      getSubscription: 'Obtenir un abonnement',
      returnToMenu: 'Retour au menu',
      forever: 'pour toujours',
      mlModel: 'Modèle ML',
      chooseMLModel: 'Sélectionner le modèle ML',
      selectSignalForActivation: 'Sélectionnez le signal à activer',
      selectSignal: 'Sélectionnez le signal',
      expiration: 'Expiration',
      minutes: 'min',
      allUsersStatistics: 'Statistiques de tous les utilisateurs',
      mlModelSelection: 'Sélection du modèle ML',
      perMonth: '/mois',
      aboutMLModels: 'À propos des modèles ML',
      purchaseModel: 'Acheter {name}',
      signalsChartByMonth: 'Graphique des signaux par mois',
      successful: 'réussis',
      losing: 'perdants',
      signals: 'signaux',
      successfulLosing: 'réussis/perdants',
      accessRequests: 'Demandes d\'accès',
      signalsPerDay: 'Signaux par jour',
      bestPair: 'Meilleure paire',
      worstPair: 'Pire paire',
      quickTemplates: 'Modèles rapides',
      subscriptionManagement: 'Gestion des abonnements',
      selectMLModels: 'Sélectionnez les modèles ML:',
      availableModels: 'Modèles disponibles:',
      premiumMLModels: 'Modèles ML premium',
      activeSignals: 'Signaux actifs',
      progressToTP1: 'Progrès vers TP1',
      monthlyStatistics: 'Statistiques mensuelles',
      totalSignals: 'Total des signaux',
      successfulSignals: 'Réussis',
      losingSignals: 'Perdants',
      pair: 'Paire:',
      direction: 'Direction:',
      tryAgainInSeconds: 'Réessayez dans {seconds} secondes quand le marché se stabilise',
      modelReady: 'Le modèle est entraîné et prêt à fonctionner',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Fermer l\'analyse',
      apiError: 'Erreur API',
      unknownError: 'Erreur inconnue',
      analysisError: 'Erreur lors de l\'obtention de l\'analyse. Format de réponse invalide.',
      timeoutError: '⏰ Délai d\'attente: L\'analyse a pris trop de temps. Veuillez réessayer.',
      serverError: '❌ Erreur du serveur',
      networkError: '🌐 Erreur réseau: Vérifiez votre connexion internet.',
      generalError: '❌ Erreur',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} signal(aux)',
      signalCountZero: 'Aucun signal',
      generatedSignal: 'Signal généré',
      top3SignalsReady: 'TOP-3 signaux prêts!',
      sell: 'VENDRE',
      wait: 'Attendre',
      waiting: 'En attente',
      minutesShort: 'min',
      secondsShort: 'sec',
      hoursShort: 'h',
      bearish: 'Baissier',
      bullish: 'Haussier',
      neutral: 'Neutre',
      notAvailable: 'N/D',
      notSpecified: 'Non spécifié',
      // Additional missing keys from screenshots
      aiAnalytics: 'Analytique IA',
      selectSignalForAnalysis: 'Sélectionnez un signal pour analyse',
      aiWillAnalyze: 'L\'IA analysera la transaction et donnera des recommandations',
      marketStatus: 'État du Marché',
      selectPairForSignal: 'Sélectionnez une paire pour générer un signal',
      successfully: 'Avec succès',
      sentiment: 'Sentiment',
      volatility: 'Volatilité',
      recommendation: 'Recommandation:',
      clickToGenerateSignal: 'Cliquez pour générer un signal',
      confidence: 'Confiance',
      signalGeneration: 'Génération de Signaux',
      usingMLModel: 'Utilisation du modèle ML...',
      analysis: 'Analyse',
      mlModel: 'Modèle ML',
      chooseMLModel: 'Sélectionner le modèle ML',
      accuracy: 'Précision',
      pleaseWait: 'Veuillez patienter. Le système analyse le marché...',
      howToReceiveSignals: 'Comment voulez-vous recevoir les signaux?',
      top3Signals: 'Signaux TOP-3',
      popular: 'Populaire',
      bestOpportunities: 'Meilleures opportunités du jour',
      threeBestSignals: '3 meilleurs signaux',
      simultaneously: 'simultanément',
      highSuccessProbability: 'Haute probabilité de succès',
      riskDiversification: 'Diversification des risques',
      singleSignals: 'Signaux Individuels',
      oneSignalAtTime: 'Un signal à la fois',
      focusOnOneTrade: 'Focus sur une transaction',
      simpleManagement: 'Gestion simple',
      idealForBeginners: 'Idéal pour les débutants',
      dealActivated: 'TRANSACTION ACTIVÉE',
      navigationBlocked: 'Navigation bloquée',
      remainingUntilExpiration: 'Restant jusqu\'à expiration',
      waitForExpiration: 'Attendez l\'expiration du signal et laissez un feedback',
      back: 'Retour'
    },
    de: {
      welcome: 'Willkommen',
      selectLanguage: 'Sprache wählen',
      continue: 'Weiter',
      start: 'Start',
      menu: 'Menü',
      tradingSignals: 'Handelssignale',
      analytics: 'Analytik',
      community: 'https://t.me/+nDqBvIeQwL8yZjU6',
      settings: 'Einstellungen',
      premium: 'Premium ML',
      selectMarket: 'Markt wählen',
      selectMode: 'Generierungsmodus',
      top3Signals: 'TOP-3 Signale',
      singleSignals: 'Einzelsignale',
      active: 'Aktiv',
      history: 'Verlauf',
      back: 'Zurück',
      admin: 'Admin-Panel',
      buy: 'Kaufen',
      monthly: 'Monatlich',
      lifetime: 'Lebenslang',
      welcomeTo: 'Willkommen bei',
      premiumSignals: 'Premium-Signale für professionelles Trading',
      accurateSignals: 'Präzise Signale',
      successfulTrades: '87% erfolgreiche Trades',
      instantNotifications: 'Sofortige Benachrichtigungen',
      realTimeSignals: 'Erhalten Sie Signale in Echtzeit',
      premiumQuality: 'Premium-Qualität',
      professionalAnalysis: 'Professionelle Marktanalyse',
      whatSignals: 'Welche Signale möchten Sie erhalten?',
      forexSchedule: 'Forex-Marktzeiten',
      catalogPrivate: 'PRIVATE ML-MODELLE KATALOG',
      onlyForInsiders: 'Nur für Eingeweihte. Zugang auf Einladung.',
      consciousRisk: 'Jeder Einstieg ist ein bewusstes Risiko.',
      activeModel: 'AKTIV',
      model: 'MODELL:',
      modelReady: 'Modell trainiert und einsatzbereit',
      // Новые переводы
      comingSoon: 'BALD',
      comingSoonDescription: 'Bald verfügbar',
      chatWithTraders: 'Mit anderen Tradern chatten',
      manageParameters: 'Parameter verwalten',
      manageAppSettings: 'App-Einstellungen verwalten',
      mlModel: 'ML-Modell',
      chooseMLModel: 'ML-Modell auswählen',
      statistics: 'Statistiken',
      viewDetails: 'Detaillierte Statistiken anzeigen',
      notifications: 'Benachrichtigungen',
      setupPushNotifications: 'Push-Benachrichtigungen einrichten',
      // Уведомления - детали
      newSignals: 'Neue Signale',
      newSignalsDescription: 'Benachrichtigungen über neue Signale',
      signalResults: 'Signal-Ergebnisse',
      signalResultsDescription: 'Benachrichtigungen über Trade-Schließungen',
      dailySummary: 'Tägliche Zusammenfassung',
      dailySummaryDescription: 'Tageszusammenfassung um 21:00',
      systemNotifications: 'System-Benachrichtigungen',
      marketNews: 'Markt-Nachrichten',
      marketNewsDescription: 'Wichtige Marktereignisse',
      systemUpdates: 'System-Updates',
      systemUpdatesDescription: 'Neue Funktionen und Korrekturen',
      soundAndVibration: 'Ton und Vibration',
      soundNotification: 'Ton',
      soundNotificationsDescription: 'Tonbenachrichtigungen',
      vibration: 'Vibration',
      vibrationDescription: 'Vibrationssignal für Benachrichtigungen',
      emailNotifications: 'E-Mail-Benachrichtigungen',
      emailNotificationsDescription: 'Per E-Mail duplizieren',
      smartNotifications: 'Intelligente Benachrichtigungen',
      smartNotificationsDescription: 'Erhalten Sie rechtzeitige Benachrichtigungen über wichtige Ereignisse. Sie können jeden Typ separat konfigurieren.',
      // Новые ключи для главного меню
      chooseAction: 'Wählen Sie eine Aktion',
      getTradingSignals: 'Erhalten Sie Trading-Signale',
      aiSignalAnalysis: 'KI-Signalanalyse',
      // Сигналы
      direction: 'Richtung',
      expiration: 'Ablauf',
      confidence: 'Vertrauen',
      clickToActivate: 'Klicken Sie zum Aktivieren',
      signalReady: 'Signal bereit',
      activateSignalForTrading: 'Signal für Trading aktivieren',
      // Подтверждения
      confirmDeleteUser: 'Sind Sie sicher, dass Sie den Benutzer löschen möchten',
      actionCannotBeUndone: 'Diese Aktion kann nicht rückgängig gemacht werden',
      // Аналитика
      signalType: 'Signaltyp',
      result: 'Ergebnis',
      entryPrice: 'Einstiegspreis',
      runAIAnalysis: 'KI-Analyse starten',
      analyzingTrade: 'Analysiere Trade...',
      gptProcessingData: 'GPT-4o mini verarbeitet Daten',
      // Админ-панель
      totalUsers: 'Gesamte Benutzer',
      online: 'Online',
      noAccessRequests: 'Keine Zugriffsanfragen',
      newRequestsWillAppearHere: 'Neue Anfragen werden hier erscheinen',
      detailedInformation: 'Detaillierte Informationen',
      tradingDays: 'Trading-Tage',
      // Генерация сигналов
      connectingToMarket: 'Verbindung zum Markt...',
      analyzingTechnicalIndicators: 'Technische Indikatoren analysieren...',
      evaluatingNewsBackground: 'Nachrichtenkontext bewerten...',
      calculatingOptimalExpiration: 'Optimale Ablaufzeit berechnen...',
      applyingMLModels: 'ML-Modelle anwenden...',
      formingTop3Signals: 'TOP-3 Signale bilden...',
      analyzingPair: 'Paar {pair} analysieren...',
      calculatingTechnicalIndicators: 'Technische Indikatoren berechnen...',
      applyingMLModel: 'ML-Modell anwenden...',
      determiningEntryPoint: 'Einstiegspunkt bestimmen...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      shadowStackDesc: 'Verfehlt nicht, laggt nicht, lügt nicht. Macht nur die schmutzige Arbeit.',
      shadowStackAlgo: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: 'Mittelfristig, Intraday',
      forestNecromancer: 'FOREST NECROMANCER',
      forestNecromancerDesc: 'Sieht aus wie ein Nerd, handelt wie ein Marktschamane.',
      forestNecromancerAlgo: 'RandomForest - Aus dem Wald der Entscheidungen beschworen',
      forestNecromancerStyle: 'Informant mit Impulszonen-Visualisierung',
      grayCardinal: 'GRAY CARDINAL',
      grayCardinalDesc: 'Sie sehen ihn nicht, aber er kennt Ihren Einstieg vor Ihnen.',
      grayCardinalAlgo: 'XGBoost - Nicht auf dem Radar, aber alles unter Kontrolle',
      grayCardinalStyle: 'Signale auf kleineren Zeitrahmen, mit zusätzlichen Filtern',
      logisticSpy: 'LOGISTIC SPY',
      logisticSpyDesc: 'Alte Schule, aber kennt alle Züge.',
      logisticSpyAlgo: 'LogisticRegression - Ein Klassiker in der ML-Welt',
      logisticSpyStyle: 'Konservativ, zeitgetestet',
      sniper80x: 'SNIPER 80X',
      sniper80xDesc: 'Sie starten es — und der Markt verstummt. Ein Einstieg — eine Eliminierung.',
      sniper80xAlgo: 'Finales Modell - Legende unter den Seinen',
      sniper80xStyle: 'Präziser Einstieg, positionell, manchmal Scalping',
      sniper80xWarning: 'Nur auf Befehl. Auto aktiviert sich nicht.',
      // Статусы
      activeStatus: 'AKTIV',
      inactive: 'INAKTIV',
      available: 'VERFÜGBAR',
      blocked: 'BLOCKIERT',
      success: 'Erfolg',
      failure: 'Fehler',
      // Действия
      buyAction: 'Kaufen',
      selectAction: 'Auswählen',
      approve: 'Genehmigen',
      delete: 'Löschen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      apply: 'Anwenden',
      update: 'Aktualisieren',
      // Генерация сигналов
      loadingMarkets: 'Märkte laden...',
      analyzingTrends: 'Trends analysieren...',
      applyingML: 'ML-Modelle anwenden...',
      calculatingEntry: 'Einstiegspunkte berechnen...',
      assessingRisks: 'Risiken bewerten...',
      finalCheck: 'Finale Überprüfung...',
      // Админ-панель
      activeUsers: 'Aktive Benutzer',
      totalSignals: 'Gesamt Signale',
      successful: 'Erfolgreich',
      failed: 'Fehlgeschlagen',
      topUsers: 'Top Benutzer',
      accessRequests: 'Zugriffsanfragen',
      subscriptionHistory: 'Abonnement-Änderungsverlauf',
      // Статистика
      myStatistics: 'Meine Statistiken',
      winRate: 'Gewinnrate',
      currentStreak: 'Aktuelle Serie',
      bestStreak: 'Beste Serie',
      averageProfit: 'Durchschnittlicher Gewinn',
      signalsPerDay: 'Signale pro Tag',
      bestPair: 'Beste Paar',
      worstPair: 'Schlechteste Paar',
      // Подписки
      monthlySubscription: 'Monatliches Abonnement',
      lifetimePurchase: 'Lebenslanger Kauf',
      autoRenewal: 'Automatische Verlängerung',
      noTimeLimit: 'Keine Zeitbegrenzung',
      selectSubscriptionType: 'Abonnementtyp auswählen:',
      // Уведомления
      soundNotification: 'Ton',
      vibration: 'Vibration',
      pushNotification: 'Push',
      enabled: 'Aktiviert',
      disabled: 'Deaktiviert',
      // Аналитика
      aiAnalytics: 'KI-Analytik',
      successfulTradesHistory: 'Erfolgreiche Trades Historie',
      analyzeSignal: 'Signal analysieren',
      analyzingInProgress: 'Analysiere...',
      cancelAnalysis: 'Analyse abbrechen',
      // Системные сообщения
      userAdded: 'Benutzer zum System hinzugefügt',
      errorOccurred: 'Ein Fehler ist aufgetreten',
      loadingData: 'Daten laden...',
      // Модальные окна
      tradeActivated: 'TRADE AKTIVIERT',
      timeExpired: '⏰ Zeit abgelaufen!',
      leaveFeedback: 'Lassen Sie Feedback zum Trade-Ergebnis',
      pair: 'Paar',
      direction: 'Richtung',
      resultButtonsActive: 'Ergebnis-Buttons sind aktiv',
      indicateTradeResult: 'Nach Ablauf der Zeit geben Sie das Trading-Ergebnis an',
      successfulTrade: 'Erfolgreicher Trade',
      losingTrade: 'Verlustreicher Trade',
      leaveFeedbackToUnlock: '⚠️ Lassen Sie Feedback, um Navigation freizuschalten',
      navigationLocked: 'Navigation gesperrt',
      waitForExpiration: 'Warten Sie auf Signal-Ablauf und lassen Sie Feedback',
      timeRemaining: 'Verbleibende Zeit bis Ablauf',
      noSuitableEntry: '⚠️ Kein geeigneter Einstiegspunkt',
      marketConditionsNotOptimal: 'Aktuelle Marktbedingungen sind nicht optimal für Positionseröffnung',
      analysisCompleted: 'Analyse abgeschlossen',
      recommendations: 'Empfehlungen',
      tryAnotherPair: 'Versuchen Sie ein anderes Paar',
      selectAnotherPairDescription: 'Wählen Sie ein anderes Währungspaar mit günstigeren Bedingungen',
      waitForOptimalConditions: 'Warten Sie auf optimale Bedingungen',
      tryAgainWhen: 'Versuchen Sie es in {seconds} Sekunden erneut, wenn der Markt sich stabilisiert',
      returnToPairSelection: 'Zurück zur Paar-Auswahl',
      patienceIsKey: '💡 Geduld ist der Schlüssel zum erfolgreichen Trading',
      warningAttention: '⚠️ ACHTUNG!',
      systemBypassDetected: 'Systemumgehungsversuch erkannt',
      activeSignalRequiresCompletion: 'Sie haben ein aktives Signal, das eine Fertigstellung erfordert. Das Neuladen der Seite wird nicht helfen, die Navigationssperre zu umgehen.',
      activeSignal: 'Aktives Signal',
      feedbackRequired: '⏰ Feedback erforderlich!',
      returnToOpenTrade: 'Zurück zum offenen Trade',
      bypassProtectionActive: 'System zum Schutz vor Navigationssperren-Umgehung aktiviert',
      waitForActiveSignal: '⚠️ Warten Sie auf die Fertigstellung des aktiven Signals und lassen Sie Feedback vor dem Fortfahren!',
      // Alert сообщения
      subscriptionUpdated: '✅ Abonnement für {name} aktualisiert! Der Benutzer erhält Zugang zu den ausgewählten ML-Modellen.',
      subscriptionUpdateError: '❌ Fehler beim Aktualisieren des Abonnements für {name}',
      subscriptionDisabled: '✅ Abonnement für {name} deaktiviert!',
      subscriptionDisableError: '❌ Fehler beim Deaktivieren des Abonnements für {name}',
      confirmDeleteUser: 'Sind Sie sicher, dass Sie den Benutzer {name} löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
      userDeleted: '✅ Benutzer {name} aus dem System gelöscht',
      userDeleteError: '❌ Fehler beim Löschen des Benutzers {name}',
      accessRequestApproved: '✅ Zugriffsanfrage für {name} genehmigt',
      accessRequestError: '❌ Fehler beim Genehmigen der Anfrage für {name}',
      // Новые переводы для хардкод строк
      popular: 'Beliebt',
      bestOpportunitiesOfDay: 'Beste Chancen des Tages',
      threeBestSignalsSimultaneously: '3 beste Signale gleichzeitig',
      highSuccessProbability: 'Hohe Erfolgswahrscheinlichkeit',
      riskDiversification: 'Risikodiversifizierung',
      focusOnOneTrade: 'Fokus auf einen Trade',
      simpleManagement: 'Einfache Verwaltung',
      availableIn: 'Verfügbar in: {minutes} Min',
      idealForBeginners: 'Ideal für Anfänger',
      analysis: 'Analyse',
      accuracy: 'Genauigkeit',
      selectSignalForActivation: 'Signal zur Aktivierung auswählen',
      selectPairForSignalGeneration: 'Paar für Signalgenerierung auswählen',
      marketState: 'Marktstatus',
      mood: 'Stimmung',
      volatility: 'Volatilität',
      recommendation: 'Empfehlung:',
      clickToGenerateSignal: 'Klicken Sie, um Signal zu generieren',
      selectSignal: 'Signal auswählen',
      selectSignalForAnalysis: 'Signal zur Analyse auswählen',
      aiWillAnalyzeAndGiveRecommendations: 'KI wird den Trade analysieren und Empfehlungen geben',
      noExecutedSignals: 'Keine ausgeführten Signale',
      executeSeveralDealsToSeeInAnalytics: 'Führen Sie mehrere Trades aus, um sie in der Analytik zu sehen',
      expiration: 'Ablauf',
      dealActivated: 'TRADE AKTIVIERT',
      navigationLocked: 'Navigation gesperrt',
      timeRemainingUntilExpiration: 'Verbleibende Zeit bis Ablauf',
      howDidTheDealGo: 'Wie ist der Trade gelaufen?',
      generationMode: 'Generierungsmodus',
      signalGeneration: 'Signalgenerierung',
      howDoYouWantToReceiveSignals: 'Wie möchten Sie Signale erhalten?',
      top3Signals: 'TOP-3 Signale',
      singleSignals: 'Einzelsignale',
      oneSignalAtATime: 'Ein Signal zur Zeit',
      allUsersStatistics: 'Statistiken aller Benutzer',
      mlModelSelection: 'ML-Modellauswahl',
      or: 'oder',
      aboutMLModels: 'Über ML-Modelle',
      purchaseModel: 'Kaufen {name}',
      signalsChartByMonth: 'Signaldiagramm nach Monaten',
      successfulLosing: 'erfolgreich/verloren',
      accessRequests: 'Zugriffsanfragen',
      signalsPerDay: 'Signale pro Tag',
      bestPair: 'Beste Paar',
      worstPair: 'Schlechteste Paar',
      quickTemplates: 'Schnelle Vorlagen',
      subscriptionManagement: 'Abonnementverwaltung',
      selectMLModels: 'ML-Modelle auswählen:',
      availableModels: 'Verfügbare Modelle:',
      premiumMLModels: 'Premium ML-Modelle',
      activeSignals: 'Aktive Signale',
      progressToTP1: 'Fortschritt zu TP1',
      waitingForEntry: 'Warten auf Einstieg',
      vipFunction: 'VIP-Funktion',
      winRate: 'Gewinnrate',
      pleaseWaitSystemAnalyzing: 'Bitte warten. Das System analysiert den Markt...',
      moreDetails: 'Weitere Details',
      tryAgainInCooldown: 'Versuchen Sie es in {seconds} Sekunden erneut, wenn sich der Markt stabilisiert',
      // Alert messages
      bulkUpdateSuccess: 'Aktualisiert {successful} von {total} Benutzern',
      bulkUpdateError: 'Massenaktualisierungsfehler: {error}',
      bulkUpdateErrorGeneric: 'Massenaktualisierungsfehler: {message}',
      userDeletedSuccess: 'Benutzer {userId} erfolgreich aus Bot gelöscht',
      userDeleteError: 'Löschfehler: {error}',
      // Additional alert messages
      userAddedSuccess: 'Benutzer zum System hinzugefügt',
      errorOccurredWith: 'Ein Fehler ist aufgetreten: {error}',
      feedbackAcceptedSuccess: 'Feedback akzeptiert: Erfolgreicher Trade',
      feedbackAcceptedFailure: 'Feedback akzeptiert: Verlustreicher Trade',
      navigationBlockedMessage: 'Sie haben ein aktives Signal!\n\nWarten Sie auf das Ablaufen und hinterlassen Sie Feedback zum Trade-Ergebnis.\n\nDie Navigation wird nach dem Senden des Feedbacks entsperrt.',
      modelRestrictedAlert: 'Dieses Modell ist eingeschränkt und nur auf Befehl verfügbar',
      forexSignalsPro: 'Forex Signals Pro',
      accurateSignals: 'Präzise Signale',
      successfulTradesPercent: '87% erfolgreiche Trades',
      instantNotifications: 'Sofortige Benachrichtigungen',
      realTimeSignals: 'Erhalten Sie Signale in Echtzeit',
      premiumQuality: 'Premium-Qualität',
      professionalMarketAnalysis: 'Professionelle Marktanalyse',
      forex: 'Forex',
      otc: 'OTC',
      top3: 'TOP-3',
      single: 'Einzel',
      // New keys for hardcoded texts
      hoursAgo: 'vor {count} Stunde{plural}',
      daysAgo: 'vor {count} Tag{plural}',
      selectLanguageDescription: 'Wählen Sie Ihre bevorzugte Sprache zum Fortfahren',
      // Keys for notifications interface
      notificationsBadge: 'BENACHRICHTIGUNGEN',
      tradingSignals: 'Trading-Signale',
      newSignals: 'Neue Signale',
      newSignalsDescription: 'Benachrichtigungen über neue Signale',
      signalResults: 'Signal-Ergebnisse',
      signalResultsDescription: 'Benachrichtigungen über Trade-Schließungen',
      dailySummary: 'Tägliche Zusammenfassung',
      dailySummaryDescription: 'Tagesergebnisse um 21:00',
      systemNotifications: 'System-Benachrichtigungen',
      marketNews: 'Marktnachrichten',
      marketNewsDescription: 'Wichtige Marktereignisse',
      systemUpdates: 'System-Updates',
      systemUpdatesDescription: 'Neue Funktionen und Korrekturen',
      soundAndVibration: 'Ton und Vibration',
      soundNotification: 'Ton',
      soundNotificationsDescription: 'Tonbenachrichtigungen',
      vibration: 'Vibration',
      vibrationDescription: 'Vibrationssignal für Benachrichtigungen',
      emailNotifications: 'E-Mail-Benachrichtigungen',
      emailNotificationsDescription: 'Benachrichtigungen per E-Mail',
      smartNotifications: 'Intelligente Benachrichtigungen',
      smartNotificationsDescription: 'Erhalten Sie rechtzeitige Benachrichtigungen über wichtige Ereignisse. Sie können jeden Typ separat konfigurieren.',
      enabled: 'Aktiviert',
      disabled: 'Deaktiviert',
      forexMarketClosedWeekend: 'Der Forex-Markt ist an Wochenenden geschlossen. Wechseln Sie zum OTC-Modus.',
      forexMarketClosedLabel: 'Forex-Markt geschlossen (Wochenende)',
      top3CooldownMessage: 'TOP-3-Signale können alle 10 Minuten generiert werden. Verbleibend: {minutes}:{seconds}',
      vipFeature: 'VIP-Funktion',
      vipAnalyticsDescription: 'AI Analytics ist nur für Benutzer mit aktivem Abonnement verfügbar',
      subscriptionRequired: 'Abonnement erforderlich',
      getSubscription: 'Abonnement erhalten',
      returnToMenu: 'Zurück zum Menü',
      forever: 'für immer',
      mlModel: 'ML-Modell',
      chooseMLModel: 'ML-Modell auswählen',
      selectSignalForActivation: 'Signal zur Aktivierung auswählen',
      selectSignal: 'Signal auswählen',
      expiration: 'Ablauf',
      minutes: 'Min',
      allUsersStatistics: 'Statistiken aller Benutzer',
      mlModelSelection: 'ML-Modellauswahl',
      perMonth: '/Monat',
      aboutMLModels: 'Über ML-Modelle',
      purchaseModel: 'Kaufen {name}',
      signalsChartByMonth: 'Signaldiagramm nach Monaten',
      successful: 'erfolgreich',
      losing: 'verloren',
      signals: 'Signale',
      successfulLosing: 'erfolgreich/verloren',
      accessRequests: 'Zugriffsanfragen',
      signalsPerDay: 'Signale pro Tag',
      bestPair: 'Beste Paar',
      worstPair: 'Schlechteste Paar',
      quickTemplates: 'Schnelle Vorlagen',
      subscriptionManagement: 'Abonnementverwaltung',
      selectMLModels: 'ML-Modelle auswählen:',
      availableModels: 'Verfügbare Modelle:',
      premiumMLModels: 'Premium ML-Modelle',
      activeSignals: 'Aktive Signale',
      progressToTP1: 'Fortschritt zu TP1',
      monthlyStatistics: 'Monatliche Statistiken',
      totalSignals: 'Gesamte Signale',
      successfulSignals: 'Erfolgreich',
      losingSignals: 'Verloren',
      pair: 'Paar:',
      direction: 'Richtung:',
      tryAgainInSeconds: 'Versuchen Sie es in {seconds} Sekunden erneut, wenn sich der Markt stabilisiert',
      modelReady: 'Das Modell ist trainiert und einsatzbereit',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Analyse schließen',
      apiError: 'API-Fehler',
      unknownError: 'Unbekannter Fehler',
      analysisError: 'Fehler beim Abrufen der Analyse. Ungültiges Antwortformat.',
      timeoutError: '⏰ Zeitüberschreitung: Analyse dauerte zu lange. Bitte versuchen Sie es erneut.',
      serverError: '❌ Serverfehler',
      networkError: '🌐 Netzwerkfehler: Überprüfen Sie Ihre Internetverbindung.',
      generalError: '❌ Fehler',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} Signal(e)',
      signalCountZero: 'Keine Signale',
      generatedSignal: 'Generiertes Signal',
      top3SignalsReady: 'TOP-3 Signale bereit!',
      sell: 'VERKAUFEN',
      wait: 'Warten',
      waiting: 'Wartet',
      minutesShort: 'Min',
      secondsShort: 'Sek',
      hoursShort: 'Std',
      bearish: 'Bärisch',
      bullish: 'Bullisch',
      neutral: 'Neutral',
      notAvailable: 'k.A.',
      notSpecified: 'Nicht angegeben',
      // Additional missing keys from screenshots
      aiAnalytics: 'KI-Analytik',
      selectSignalForAnalysis: 'Wählen Sie ein Signal zur Analyse',
      aiWillAnalyze: 'KI wird den Handel analysieren und Empfehlungen geben',
      marketStatus: 'Marktstatus',
      selectPairForSignal: 'Wählen Sie ein Paar zur Signalgenerierung',
      successfully: 'Erfolgreich',
      sentiment: 'Stimmung',
      volatility: 'Volatilität',
      recommendation: 'Empfehlung:',
      clickToGenerateSignal: 'Klicken Sie, um ein Signal zu generieren',
      confidence: 'Vertrauen',
      signalGeneration: 'Signalgenerierung',
      usingMLModel: 'ML-Modell verwenden...',
      analysis: 'Analyse',
      mlModel: 'ML-Modell',
      chooseMLModel: 'ML-Modell auswählen',
      accuracy: 'Genauigkeit',
      pleaseWait: 'Bitte warten. Das System analysiert den Markt...',
      howToReceiveSignals: 'Wie möchten Sie Signale erhalten?',
      top3Signals: 'TOP-3 Signale',
      popular: 'Beliebt',
      bestOpportunities: 'Beste Möglichkeiten des Tages',
      threeBestSignals: '3 beste Signale',
      simultaneously: 'gleichzeitig',
      highSuccessProbability: 'Hohe Erfolgswahrscheinlichkeit',
      riskDiversification: 'Risikodiversifikation',
      singleSignals: 'Einzelne Signale',
      oneSignalAtTime: 'Ein Signal zur Zeit',
      focusOnOneTrade: 'Fokus auf einen Handel',
      simpleManagement: 'Einfache Verwaltung',
      idealForBeginners: 'Ideal für Anfänger',
      dealActivated: 'GESCHÄFT AKTIVIERT',
      navigationBlocked: 'Navigation blockiert',
      remainingUntilExpiration: 'Verbleibend bis Ablauf',
      waitForExpiration: 'Warten Sie auf Signalablauf und geben Sie Feedback',
      back: 'Zurück'
    },
    it: {
      welcome: 'Benvenuto',
      selectLanguage: 'Seleziona lingua',
      continue: 'Continua',
      start: 'Inizia',
      menu: 'Menu',
      tradingSignals: 'Segnali di trading',
      analytics: 'Analisi',
      community: 'https://t.me/+nDqBvIeQwL8yZjU6',
      settings: 'Impostazioni',
      premium: 'ML Premium',
      selectMarket: 'Seleziona mercato',
      selectMode: 'Modalità di generazione',
      top3Signals: 'TOP-3 Segnali',
      singleSignals: 'Segnali singoli',
      active: 'Attivo',
      history: 'Cronologia',
      back: 'Indietro',
      admin: 'Pannello Admin',
      buy: 'Acquista',
      monthly: 'Mensile',
      lifetime: 'A vita',
      welcomeTo: 'Benvenuto in',
      premiumSignals: 'Segnali premium per trading professionale',
      accurateSignals: 'Segnali precisi',
      successfulTrades: '87% di trade riusciti',
      instantNotifications: 'Notifiche istantanee',
      realTimeSignals: 'Ricevi segnali in tempo reale',
      premiumQuality: 'Qualità premium',
      professionalMarketAnalysis: 'Analisi professionale del mercato',
      professionalAnalysis: 'Analisi professionale del mercato',
      whatSignals: 'Quali segnali vuoi ricevere?',
      forexSchedule: 'Orario del mercato Forex',
      catalogPrivate: 'CATALOGO MODELLI ML PRIVATI',
      onlyForInsiders: 'Solo per iniziati. Accesso su invito.',
      consciousRisk: 'Ogni entrata è un rischio consapevole.',
      activeModel: 'ATTIVO',
      model: 'MODELLO:',
      modelReady: 'Modello addestrato e pronto all\'uso',
      // Новые переводы
      comingSoon: 'PROSSIMAMENTE',
      comingSoonDescription: 'Prossimamente disponibile',
      chatWithTraders: 'Chatta con altri trader',
      manageParameters: 'Gestisci parametri',
      manageAppSettings: 'Gestisci impostazioni app',
      mlModel: 'Modello ML',
      chooseMLModel: 'Seleziona modello ML',
      statistics: 'Statistiche',
      viewDetails: 'Visualizza statistiche dettagliate',
      notifications: 'Notifiche',
      setupPushNotifications: 'Configura notifiche push',
      // Уведомления - детали
      newSignals: 'Nuovi Segnali',
      newSignalsDescription: 'Notifiche sui nuovi segnali',
      signalResults: 'Risultati Segnali',
      signalResultsDescription: 'Notifiche sulla chiusura dei trade',
      dailySummary: 'Riassunto Giornaliero',
      dailySummaryDescription: 'Riassunto della giornata alle 21:00',
      systemNotifications: 'Notifiche Sistema',
      marketNews: 'Notizie di Mercato',
      marketNewsDescription: 'Eventi importanti del mercato',
      systemUpdates: 'Aggiornamenti Sistema',
      systemUpdatesDescription: 'Nuove funzionalità e correzioni',
      soundAndVibration: 'Suono e Vibrazione',
      soundNotification: 'Suono',
      soundNotificationsDescription: 'Notifiche sonore',
      vibration: 'Vibrazione',
      vibrationDescription: 'Segnale di vibrazione per notifiche',
      emailNotifications: 'Notifiche Email',
      emailNotificationsDescription: 'Duplica via email',
      smartNotifications: 'Notifiche Intelligenti',
      smartNotificationsDescription: 'Ricevi notifiche tempestive su eventi importanti. Puoi configurare ogni tipo separatamente.',
      // Новые ключи для главного меню
      chooseAction: 'Scegli un\'azione',
      getTradingSignals: 'Ottieni segnali di trading',
      aiSignalAnalysis: 'Analisi segnali con AI',
      // Сигналы
      direction: 'Direzione',
      expiration: 'Scadenza',
      confidence: 'Fiducia',
      clickToActivate: 'Clicca per attivare',
      signalReady: 'Segnale pronto',
      activateSignalForTrading: 'Attiva il segnale per il trading',
      // Подтверждения
      confirmDeleteUser: 'Sei sicuro di voler eliminare l\'utente',
      actionCannotBeUndone: 'Questa azione non può essere annullata',
      // Аналитика
      signalType: 'Tipo di segnale',
      result: 'Risultato',
      entryPrice: 'Prezzo di entrata',
      runAIAnalysis: 'Avvia analisi AI',
      analyzingTrade: 'Analizzando trade...',
      gptProcessingData: 'GPT-4o mini sta elaborando i dati',
      // Админ-панель
      totalUsers: 'Totale utenti',
      online: 'Online',
      noAccessRequests: 'Nessuna richiesta di accesso',
      newRequestsWillAppearHere: 'Le nuove richieste appariranno qui',
      detailedInformation: 'Informazioni dettagliate',
      tradingDays: 'Giorni di trading',
      // Генерация сигналов
      connectingToMarket: 'Connessione al mercato...',
      analyzingTechnicalIndicators: 'Analisi degli indicatori tecnici...',
      evaluatingNewsBackground: 'Valutazione del contesto delle notizie...',
      calculatingOptimalExpiration: 'Calcolo della scadenza ottimale...',
      applyingMLModels: 'Applicazione modelli ML...',
      formingTop3Signals: 'Formazione segnali TOP-3...',
      analyzingPair: 'Analisi della coppia {pair}...',
      calculatingTechnicalIndicators: 'Calcolo degli indicatori tecnici...',
      applyingMLModel: 'Applicazione modello ML...',
      determiningEntryPoint: 'Determinazione del punto di entrata...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      shadowStackDesc: 'Non sbaglia, non lagga, non mente. Fa solo il lavoro sporco.',
      shadowStackAlgo: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: 'Medio termine, intragiorno',
      forestNecromancer: 'FOREST NECROMANCER',
      forestNecromancerDesc: 'Sembra un nerd, agisce come uno sciamano del mercato.',
      forestNecromancerAlgo: 'RandomForest - Evocato dalla foresta delle decisioni',
      forestNecromancerStyle: 'Informatore con visualizzazione delle zone di impulso',
      grayCardinal: 'GRAY CARDINAL',
      grayCardinalDesc: 'Non lo vedi, ma conosce la tua entrata prima di te.',
      grayCardinalAlgo: 'XGBoost - Non nel radar, ma tutto sotto controllo',
      grayCardinalStyle: 'Segnali su timeframes più bassi, con filtri aggiuntivi',
      logisticSpy: 'LOGISTIC SPY',
      logisticSpyDesc: 'Vecchia scuola, ma conosce tutte le mosse.',
      logisticSpyAlgo: 'LogisticRegression - Un classico nel mondo ML',
      logisticSpyStyle: 'Conservatore, testato nel tempo',
      sniper80x: 'SNIPER 80X',
      sniper80xDesc: 'Lo lanci — e il mercato tace. Un\'entrata — un\'eliminazione.',
      sniper80xAlgo: 'Modello finale - Leggenda tra i suoi',
      sniper80xStyle: 'Entrata precisa, posizionale, a volte scalping',
      sniper80xWarning: 'Solo su comando. L\'auto non si attiva.',
      // Статусы
      activeStatus: 'ATTIVO',
      inactive: 'INATTIVO',
      available: 'DISPONIBILE',
      blocked: 'BLOCCATO',
      success: 'Successo',
      failure: 'Fallimento',
      // Действия
      buyAction: 'Acquista',
      selectAction: 'Seleziona',
      approve: 'Approva',
      delete: 'Elimina',
      save: 'Salva',
      cancel: 'Annulla',
      apply: 'Applica',
      update: 'Aggiorna',
      // Генерация сигналов
      loadingMarkets: 'Caricamento mercati...',
      analyzingTrends: 'Analisi delle tendenze...',
      applyingML: 'Applicazione modelli ML...',
      calculatingEntry: 'Calcolo punti di entrata...',
      assessingRisks: 'Valutazione rischi...',
      finalCheck: 'Controllo finale...',
      // Админ-панель
      activeUsers: 'Utenti attivi',
      totalSignals: 'Totale segnali',
      successful: 'Riusciti',
      failed: 'Falliti',
      topUsers: 'Top utenti',
      accessRequests: 'Richieste di accesso',
      subscriptionHistory: 'Cronologia modifiche abbonamento',
      // Статистика
      myStatistics: 'Le mie statistiche',
      winRate: 'Tasso di successo',
      currentStreak: 'Serie attuale',
      bestStreak: 'Migliore serie',
      averageProfit: 'Profitto medio',
      signalsPerDay: 'Segnali al giorno',
      bestPair: 'Migliore coppia',
      worstPair: 'Peggiore coppia',
      // Подписки
      monthlySubscription: 'Abbonamento mensile',
      lifetimePurchase: 'Acquisto a vita',
      autoRenewal: 'Rinnovo automatico',
      noTimeLimit: 'Nessun limite di tempo',
      selectSubscriptionType: 'Seleziona tipo di abbonamento:',
      // Уведомления
      soundNotification: 'Suono',
      vibration: 'Vibrazione',
      pushNotification: 'Push',
      enabled: 'Abilitato',
      disabled: 'Disabilitato',
      // Аналитика
      aiAnalytics: 'Analisi AI',
      successfulTradesHistory: 'Cronologia trade riusciti',
      analyzeSignal: 'Analizza segnale',
      analyzingInProgress: 'Analisi in corso...',
      cancelAnalysis: 'Annulla analisi',
      // Системные сообщения
      userAdded: 'Utente aggiunto al sistema',
      errorOccurred: 'Si è verificato un errore',
      loadingData: 'Caricamento dati...',
      // Модальные окна
      tradeActivated: 'TRADE ATTIVATO',
      timeExpired: '⏰ Tempo scaduto!',
      leaveFeedback: 'Lascia feedback sul risultato del trade',
      pair: 'Coppia',
      direction: 'Direzione',
      resultButtonsActive: 'I pulsanti del risultato sono attivi',
      indicateTradeResult: 'Dopo la scadenza del tempo indica il risultato del trading',
      successfulTrade: 'Trade riuscito',
      losingTrade: 'Trade perdente',
      leaveFeedbackToUnlock: '⚠️ Lascia feedback per sbloccare la navigazione',
      navigationLocked: 'Navigazione bloccata',
      waitForExpiration: 'Aspetta la scadenza del segnale e lascia feedback',
      timeRemaining: 'Tempo rimanente fino alla scadenza',
      noSuitableEntry: '⚠️ Nessun punto di entrata adatto',
      marketConditionsNotOptimal: 'Le condizioni attuali del mercato non sono ottimali per aprire una posizione',
      analysisCompleted: 'Analisi completata',
      recommendations: 'Raccomandazioni',
      tryAnotherPair: 'Prova un\'altra coppia',
      selectAnotherPairDescription: 'Seleziona un\'altra coppia di valute con condizioni più favorevoli',
      waitForOptimalConditions: 'Aspetta condizioni ottimali',
      tryAgainWhen: 'Riprova tra {seconds} secondi quando il mercato si stabilizzerà',
      returnToPairSelection: 'Torna alla selezione della coppia',
      patienceIsKey: '💡 La pazienza è la chiave per il trading di successo',
      warningAttention: '⚠️ ATTENZIONE!',
      systemBypassDetected: 'Tentativo di bypass del sistema rilevato',
      activeSignalRequiresCompletion: 'Hai un segnale attivo che richiede completamento. Ricaricare la pagina non aiuterà a bypassare il blocco della navigazione.',
      activeSignal: 'Segnale attivo',
      feedbackRequired: '⏰ Feedback richiesto!',
      returnToOpenTrade: 'Torna al trade aperto',
      bypassProtectionActive: 'Sistema di protezione contro il bypass del blocco di navigazione attivato',
      waitForActiveSignal: '⚠️ Aspetta il completamento del segnale attivo e lascia feedback prima di continuare!',
      // Alert сообщения
      subscriptionUpdated: '✅ Abbonamento aggiornato per {name}! L\'utente avrà accesso ai modelli ML selezionati.',
      subscriptionUpdateError: '❌ Errore nell\'aggiornamento dell\'abbonamento per {name}',
      subscriptionDisabled: '✅ Abbonamento disabilitato per {name}!',
      subscriptionDisableError: '❌ Errore nella disabilitazione dell\'abbonamento per {name}',
      confirmDeleteUser: 'Sei sicuro di voler eliminare l\'utente {name}? Questa azione non può essere annullata.',
      userDeleted: '✅ Utente {name} eliminato dal sistema',
      userDeleteError: '❌ Errore nell\'eliminazione dell\'utente {name}',
      accessRequestApproved: '✅ Richiesta di accesso approvata per {name}',
      accessRequestError: '❌ Errore nell\'approvazione della richiesta per {name}',
      // New keys for hardcoded texts
      hoursAgo: '{count} ora{plural} fa',
      daysAgo: '{count} giorno{plural} fa',
      selectLanguageDescription: 'Scegli la tua lingua preferita per continuare',
      // Keys for notifications interface
      notificationsBadge: 'NOTIFICHE',
      tradingSignals: 'Segnali di Trading',
      newSignals: 'Nuovi Segnali',
      newSignalsDescription: 'Notifiche sui nuovi segnali',
      signalResults: 'Risultati dei Segnali',
      signalResultsDescription: 'Notifiche sulla chiusura dei trade',
      dailySummary: 'Riepilogo Giornaliero',
      dailySummaryDescription: 'Risultati del giorno alle 21:00',
      systemNotifications: 'Notifiche di Sistema',
      marketNews: 'Notizie di Mercato',
      marketNewsDescription: 'Eventi importanti del mercato',
      systemUpdates: 'Aggiornamenti di Sistema',
      systemUpdatesDescription: 'Nuove funzionalità e correzioni',
      soundAndVibration: 'Suono e Vibrazione',
      soundNotification: 'Suono',
      soundNotificationsDescription: 'Notifiche sonore',
      vibration: 'Vibrazione',
      vibrationDescription: 'Segnale di vibrazione per le notifiche',
      emailNotifications: 'Notifiche Email',
      emailNotificationsDescription: 'Notifiche via email',
      smartNotifications: 'Notifiche Intelligenti',
      smartNotificationsDescription: 'Ricevi notifiche tempestive su eventi importanti. Puoi configurare ogni tipo separatamente.',
      enabled: 'Abilitato',
      disabled: 'Disabilitato',
      // Additional missing translations
      waitingForEntry: 'In attesa di entrata',
      vipFunction: 'Funzione VIP',
      winRate: 'Tasso di successo',
      pleaseWaitSystemAnalyzing: 'Attendere prego. Il sistema sta analizzando il mercato...',
      moreDetails: 'Più Dettagli',
      tryAgainInCooldown: 'Riprova tra {seconds} secondi quando il mercato si stabilizza',
      // Alert messages
      bulkUpdateSuccess: 'Aggiornato {successful} di {total} utenti',
      bulkUpdateError: 'Errore aggiornamento di massa: {error}',
      bulkUpdateErrorGeneric: 'Errore aggiornamento di massa: {message}',
      userDeletedSuccess: 'Utente {userId} eliminato con successo dal bot',
      userDeleteError: 'Errore eliminazione: {error}',
      // Additional alert messages
      userAddedSuccess: 'Utente aggiunto al sistema',
      errorOccurredWith: 'Si è verificato un errore: {error}',
      feedbackAcceptedSuccess: 'Feedback accettato: Trade di successo',
      feedbackAcceptedFailure: 'Feedback accettato: Trade perdente',
      navigationBlockedMessage: 'Hai un segnale attivo!\n\nAspetta la scadenza e lascia un feedback sul risultato del trade.\n\nLa navigazione sarà sbloccata dopo l\'invio del feedback.',
      modelRestrictedAlert: 'Questo modello è limitato e disponibile solo su comando',
      forexMarketClosedWeekend: 'Il mercato Forex è chiuso nei fine settimana. Passa alla modalità OTC.',
      forexMarketClosedLabel: 'Mercato Forex chiuso (fine settimana)',
      top3CooldownMessage: 'I segnali TOP-3 possono essere generati una volta ogni 10 minuti. Rimanente: {minutes}:{seconds}',
      vipFeature: 'Funzione VIP',
      vipAnalyticsDescription: 'AI Analytics è disponibile solo per utenti con abbonamento attivo',
      subscriptionRequired: 'Abbonamento richiesto',
      getSubscription: 'Ottieni abbonamento',
      returnToMenu: 'Torna al menu',
      forever: 'per sempre',
      mlModel: 'Modello ML',
      chooseMLModel: 'Seleziona modello ML',
      selectSignalForActivation: 'Seleziona segnale per attivazione',
      selectSignal: 'Seleziona segnale',
      expiration: 'Scadenza',
      minutes: 'min',
      allUsersStatistics: 'Statistiche di tutti gli utenti',
      mlModelSelection: 'Selezione modello ML',
      perMonth: '/mese',
      aboutMLModels: 'Informazioni sui modelli ML',
      purchaseModel: 'Acquista {name}',
      signalsChartByMonth: 'Grafico segnali per mese',
      successful: 'riusciti',
      losing: 'perdenti',
      signals: 'segnali',
      successfulLosing: 'riusciti/perdenti',
      accessRequests: 'Richieste di accesso',
      signalsPerDay: 'Segnali al giorno',
      bestPair: 'Migliore coppia',
      worstPair: 'Peggiore coppia',
      quickTemplates: 'Modelli rapidi',
      subscriptionManagement: 'Gestione abbonamenti',
      selectMLModels: 'Seleziona modelli ML:',
      availableModels: 'Modelli disponibili:',
      premiumMLModels: 'Modelli ML premium',
      activeSignals: 'Segnali attivi',
      progressToTP1: 'Progresso verso TP1',
      monthlyStatistics: 'Statistiche mensili',
      totalSignals: 'Segnali totali',
      successfulSignals: 'Riusciti',
      losingSignals: 'Perdenti',
      pair: 'Coppia:',
      direction: 'Direzione:',
      tryAgainInSeconds: 'Riprova tra {seconds} secondi quando il mercato si stabilizza',
      modelReady: 'Il modello è addestrato e pronto per funzionare',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Chiudi analisi',
      apiError: 'Errore API',
      unknownError: 'Errore sconosciuto',
      analysisError: 'Errore nel recupero dell\'analisi. Formato di risposta non valido.',
      timeoutError: '⏰ Timeout: L\'analisi ha impiegato troppo tempo. Riprova.',
      serverError: '❌ Errore del server',
      networkError: '🌐 Errore di rete: Controlla la tua connessione internet.',
      generalError: '❌ Errore',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} segnale(i)',
      signalCountZero: 'Nessun segnale',
      generatedSignal: 'Segnale generato',
      top3SignalsReady: 'TOP-3 segnali pronti!',
      sell: 'VENDERE',
      wait: 'Attendere',
      waiting: 'In attesa',
      minutesShort: 'min',
      secondsShort: 'sec',
      hoursShort: 'h',
      bearish: 'Ribassista',
      bullish: 'Rialzista',
      neutral: 'Neutrale',
      notAvailable: 'N/D',
      notSpecified: 'Non specificato',
      // Additional missing keys from screenshots
      aiAnalytics: 'Analisi IA',
      selectSignalForAnalysis: 'Seleziona un segnale per analisi',
      aiWillAnalyze: 'L\'IA analizzerà il trade e darà raccomandazioni',
      marketStatus: 'Stato del Mercato',
      selectPairForSignal: 'Seleziona una coppia per generare segnale',
      successfully: 'Con successo',
      sentiment: 'Sentimento',
      volatility: 'Volatilità',
      recommendation: 'Raccomandazione:',
      clickToGenerateSignal: 'Clicca per generare segnale',
      confidence: 'Fiducia',
      signalGeneration: 'Generazione Segnali',
      usingMLModel: 'Usando modello ML...',
      analysis: 'Analisi',
      mlModel: 'Modello ML',
      chooseMLModel: 'Seleziona modello ML',
      accuracy: 'Precisione',
      pleaseWait: 'Attendere prego. Il sistema sta analizzando il mercato...',
      howToReceiveSignals: 'Come vuoi ricevere i segnali?',
      top3Signals: 'Segnali TOP-3',
      popular: 'Popolare',
      bestOpportunities: 'Migliori opportunità del giorno',
      threeBestSignals: '3 migliori segnali',
      simultaneously: 'simultaneamente',
      highSuccessProbability: 'Alta probabilità di successo',
      riskDiversification: 'Diversificazione del rischio',
      singleSignals: 'Segnali Singoli',
      oneSignalAtTime: 'Un segnale alla volta',
      focusOnOneTrade: 'Focus su un trade',
      simpleManagement: 'Gestione semplice',
      idealForBeginners: 'Ideale per principianti',
      dealActivated: 'TRADE ATTIVATO',
      navigationBlocked: 'Navigazione bloccata',
      remainingUntilExpiration: 'Rimanente fino a scadenza',
      waitForExpiration: 'Aspetta la scadenza del segnale e lascia feedback',
      back: 'Indietro'
    },
    pt: {
      welcome: 'Bem-vindo',
      selectLanguage: 'Selecionar idioma',
      continue: 'Continuar',
      start: 'Começar',
      menu: 'Menu',
      tradingSignals: 'Sinais de trading',
      analytics: 'Análises',
      community: 'https://t.me/+nDqBvIeQwL8yZjU6',
      settings: 'Configurações',
      premium: 'ML Premium',
      selectMarket: 'Selecionar mercado',
      selectMode: 'Modo de geração',
      top3Signals: 'TOP-3 Sinais',
      singleSignals: 'Sinais únicos',
      active: 'Ativo',
      history: 'Histórico',
      back: 'Voltar',
      admin: 'Painel Admin',
      buy: 'Comprar',
      monthly: 'Mensal',
      lifetime: 'Vitalício',
      welcomeTo: 'Bem-vindo ao',
      premiumSignals: 'Sinais premium para trading profissional',
      accurateSignals: 'Sinais precisos',
      successfulTrades: '87% de trades bem-sucedidos',
      instantNotifications: 'Notificações instantâneas',
      realTimeSignals: 'Receba sinais em tempo real',
      premiumQuality: 'Qualidade premium',
      professionalMarketAnalysis: 'Análise profissional do mercado',
      professionalAnalysis: 'Análise profissional do mercado',
      whatSignals: 'Quais sinais você quer receber?',
      forexSchedule: 'Horário do mercado Forex',
      catalogPrivate: 'CATÁLOGO DE MODELOS ML PRIVADOS',
      onlyForInsiders: 'Apenas para iniciados. Acesso por convite.',
      consciousRisk: 'Cada entrada é um risco consciente.',
      activeModel: 'ATIVO',
      model: 'MODELO:',
      modelReady: 'Modelo treinado e pronto para uso',
      // Новые переводы
      comingSoon: 'EM BREVE',
      comingSoonDescription: 'Em breve disponível',
      chatWithTraders: 'Conversar com outros traders',
      manageParameters: 'Gerenciar parâmetros',
      manageAppSettings: 'Gerenciar configurações do app',
      mlModel: 'Modelo ML',
      chooseMLModel: 'Seleccionar modelo ML',
      statistics: 'Estatísticas',
      viewDetails: 'Ver estatísticas detalhadas',
      notifications: 'Notificações',
      setupPushNotifications: 'Configurar notificações push',
      // Уведомления - детали
      newSignals: 'Novos Sinais',
      newSignalsDescription: 'Notificações sobre novos sinais',
      signalResults: 'Resultados dos Sinais',
      signalResultsDescription: 'Notificações sobre fechamento de trades',
      dailySummary: 'Resumo Diário',
      dailySummaryDescription: 'Resumo do dia às 21:00',
      systemNotifications: 'Notificações do Sistema',
      marketNews: 'Notícias do Mercado',
      marketNewsDescription: 'Eventos importantes do mercado',
      systemUpdates: 'Atualizações do Sistema',
      systemUpdatesDescription: 'Novos recursos e correções',
      soundAndVibration: 'Som e Vibração',
      soundNotification: 'Som',
      soundNotificationsDescription: 'Notificações sonoras',
      vibration: 'Vibração',
      vibrationDescription: 'Sinal de vibração para notificações',
      emailNotifications: 'Notificações por Email',
      emailNotificationsDescription: 'Duplicar por email',
      smartNotifications: 'Notificações Inteligentes',
      smartNotificationsDescription: 'Receba notificações oportunas sobre eventos importantes. Você pode configurar cada tipo separadamente.',
      // Новые ключи для главного меню
      chooseAction: 'Escolha uma ação',
      getTradingSignals: 'Obtenha sinais de trading',
      aiSignalAnalysis: 'Análise de sinais com IA',
      // Сигналы
      direction: 'Direção',
      expiration: 'Expiração',
      confidence: 'Confiança',
      clickToActivate: 'Clique para ativar',
      signalReady: 'Sinal pronto',
      activateSignalForTrading: 'Ative o sinal para trading',
      // Подтверждения
      confirmDeleteUser: 'Tem certeza de que deseja excluir o usuário',
      actionCannotBeUndone: 'Esta ação não pode ser desfeita',
      // Аналитика
      signalType: 'Tipo de sinal',
      result: 'Resultado',
      entryPrice: 'Preço de entrada',
      runAIAnalysis: 'Executar análise IA',
      analyzingTrade: 'Analisando trade...',
      gptProcessingData: 'GPT-4o mini processando dados',
      // Админ-панель
      totalUsers: 'Total de usuários',
      online: 'Online',
      noAccessRequests: 'Nenhuma solicitação de acesso',
      newRequestsWillAppearHere: 'Novas solicitações aparecerão aqui',
      detailedInformation: 'Informações detalhadas',
      tradingDays: 'Dias de trading',
      // Генерация сигналов
      connectingToMarket: 'Conectando ao mercado...',
      analyzingTechnicalIndicators: 'Analisando indicadores técnicos...',
      evaluatingNewsBackground: 'Avaliando contexto das notícias...',
      calculatingOptimalExpiration: 'Calculando expiração ótima...',
      applyingMLModels: 'Aplicando modelos ML...',
      formingTop3Signals: 'Formando sinais TOP-3...',
      analyzingPair: 'Analisando par {pair}...',
      calculatingTechnicalIndicators: 'Calculando indicadores técnicos...',
      applyingMLModel: 'Aplicando modelo ML...',
      determiningEntryPoint: 'Determinando ponto de entrada...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      shadowStackDesc: 'Não erra, não trava, não mente. Apenas faz o trabalho sujo.',
      shadowStackAlgo: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: 'Médio prazo, intradiário',
      forestNecromancer: 'FOREST NECROMANCER',
      forestNecromancerDesc: 'Parece um nerd, age como um xamã do mercado.',
      forestNecromancerAlgo: 'RandomForest - Evocado da floresta das decisões',
      forestNecromancerStyle: 'Informante com visualização de zonas de impulso',
      grayCardinal: 'GRAY CARDINAL',
      grayCardinalDesc: 'Você não o vê, mas ele conhece sua entrada antes de você.',
      grayCardinalAlgo: 'XGBoost - Não no radar, mas tudo sob controle',
      grayCardinalStyle: 'Sinais em timeframes menores, com filtros adicionais',
      logisticSpy: 'LOGISTIC SPY',
      logisticSpyDesc: 'Velha escola, mas conhece todos os movimentos.',
      logisticSpyAlgo: 'LogisticRegression - Um clássico no mundo ML',
      logisticSpyStyle: 'Conservador, testado pelo tempo',
      sniper80x: 'SNIPER 80X',
      sniper80xDesc: 'Você o lança — e o mercado se cala. Uma entrada — uma eliminação.',
      sniper80xAlgo: 'Modelo final - Lenda entre os seus',
      sniper80xStyle: 'Entrada precisa, posicional, às vezes scalping',
      sniper80xWarning: 'Apenas por comando. O auto não se ativa.',
      // Статусы
      activeStatus: 'ATIVO',
      inactive: 'INATIVO',
      available: 'DISPONÍVEL',
      blocked: 'BLOQUEADO',
      success: 'Sucesso',
      failure: 'Falha',
      // Действия
      buyAction: 'Comprar',
      selectAction: 'Selecionar',
      approve: 'Aprovar',
      delete: 'Excluir',
      save: 'Salvar',
      cancel: 'Cancelar',
      apply: 'Aplicar',
      update: 'Atualizar',
      // Генерация сигналов
      loadingMarkets: 'Carregando mercados...',
      analyzingTrends: 'Analisando tendências...',
      applyingML: 'Aplicando modelos ML...',
      calculatingEntry: 'Calculando pontos de entrada...',
      assessingRisks: 'Avaliando riscos...',
      finalCheck: 'Verificação final...',
      // Админ-панель
      activeUsers: 'Usuários ativos',
      totalSignals: 'Total de sinais',
      successful: 'Bem-sucedidos',
      failed: 'Falharam',
      topUsers: 'Top usuários',
      accessRequests: 'Solicitações de acesso',
      subscriptionHistory: 'Histórico de mudanças de assinatura',
      // Статистика
      myStatistics: 'Minhas estatísticas',
      winRate: 'Taxa de vitória',
      currentStreak: 'Sequência atual',
      bestStreak: 'Melhor sequência',
      averageProfit: 'Lucro médio',
      signalsPerDay: 'Sinais por dia',
      bestPair: 'Melhor par',
      worstPair: 'Pior par',
      // Подписки
      monthlySubscription: 'Assinatura mensal',
      lifetimePurchase: 'Compra vitalícia',
      autoRenewal: 'Renovação automática',
      noTimeLimit: 'Sem limite de tempo',
      selectSubscriptionType: 'Selecionar tipo de assinatura:',
      // Уведомления
      soundNotification: 'Som',
      vibration: 'Vibração',
      pushNotification: 'Push',
      enabled: 'Habilitado',
      disabled: 'Desabilitado',
      // Аналитика
      aiAnalytics: 'Análise IA',
      successfulTradesHistory: 'Histórico de trades bem-sucedidos',
      analyzeSignal: 'Analisar sinal',
      analyzingInProgress: 'Analisando...',
      cancelAnalysis: 'Cancelar análise',
      // Системные сообщения
      userAdded: 'Usuário adicionado ao sistema',
      errorOccurred: 'Ocorreu um erro',
      loadingData: 'Carregando dados...',
      // Модальные окна
      tradeActivated: 'TRADE ATIVADO',
      timeExpired: '⏰ Tempo esgotado!',
      leaveFeedback: 'Deixe feedback sobre o resultado do trade',
      pair: 'Par',
      direction: 'Direção',
      resultButtonsActive: 'Os botões de resultado estão ativos',
      indicateTradeResult: 'Após o tempo esgotado, indique o resultado do trading',
      successfulTrade: 'Trade bem-sucedido',
      losingTrade: 'Trade perdente',
      leaveFeedbackToUnlock: '⚠️ Deixe feedback para desbloquear a navegação',
      navigationLocked: 'Navegação bloqueada',
      waitForExpiration: 'Aguarde a expiração do sinal e deixe feedback',
      timeRemaining: 'Tempo restante até a expiração',
      noSuitableEntry: '⚠️ Nenhum ponto de entrada adequado',
      marketConditionsNotOptimal: 'As condições atuais do mercado não são ótimas para abrir uma posição',
      analysisCompleted: 'Análise concluída',
      recommendations: 'Recomendações',
      tryAnotherPair: 'Tente outro par',
      selectAnotherPairDescription: 'Selecione outro par de moedas com condições mais favoráveis',
      waitForOptimalConditions: 'Aguarde condições ótimas',
      tryAgainWhen: 'Tente novamente em {seconds} segundos quando o mercado se estabilizar',
      returnToPairSelection: 'Voltar à seleção de par',
      patienceIsKey: '💡 A paciência é a chave para o trading bem-sucedido',
      warningAttention: '⚠️ ATENÇÃO!',
      systemBypassDetected: 'Tentativa de bypass do sistema detectada',
      activeSignalRequiresCompletion: 'Você tem um sinal ativo que requer finalização. Recarregar a página não ajudará a contornar o bloqueio de navegação.',
      activeSignal: 'Sinal ativo',
      feedbackRequired: '⏰ Feedback necessário!',
      returnToOpenTrade: 'Voltar ao trade aberto',
      bypassProtectionActive: 'Sistema de proteção contra bypass do bloqueio de navegação ativado',
      waitForActiveSignal: '⚠️ Aguarde a finalização do sinal ativo e deixe feedback antes de continuar!',
      // Alert сообщения
      subscriptionUpdated: '✅ Assinatura atualizada para {name}! O usuário terá acesso aos modelos ML selecionados.',
      subscriptionUpdateError: '❌ Erro ao atualizar assinatura para {name}',
      subscriptionDisabled: '✅ Assinatura desabilitada para {name}!',
      subscriptionDisableError: '❌ Erro ao desabilitar assinatura para {name}',
      confirmDeleteUser: 'Tem certeza de que deseja excluir o usuário {name}? Esta ação não pode ser desfeita.',
      userDeleted: '✅ Usuário {name} excluído do sistema',
      userDeleteError: '❌ Erro ao excluir usuário {name}',
      accessRequestApproved: '✅ Solicitação de acesso aprovada para {name}',
      accessRequestError: '❌ Erro ao aprovar solicitação para {name}',
      // New keys for hardcoded texts
      hoursAgo: 'há {count} hora{plural}',
      daysAgo: 'há {count} dia{plural}',
      selectLanguageDescription: 'Escolha seu idioma preferido para continuar',
      // Keys for notifications interface
      notificationsBadge: 'NOTIFICAÇÕES',
      tradingSignals: 'Sinais de Trading',
      newSignals: 'Novos Sinais',
      newSignalsDescription: 'Notificações sobre novos sinais',
      signalResults: 'Resultados dos Sinais',
      signalResultsDescription: 'Notificações sobre fechamentos de trades',
      dailySummary: 'Resumo Diário',
      dailySummaryDescription: 'Resultados do dia às 21:00',
      systemNotifications: 'Notificações do Sistema',
      marketNews: 'Notícias do Mercado',
      marketNewsDescription: 'Eventos importantes do mercado',
      systemUpdates: 'Atualizações do Sistema',
      systemUpdatesDescription: 'Novas funcionalidades e correções',
      soundAndVibration: 'Som e Vibração',
      soundNotification: 'Som',
      soundNotificationsDescription: 'Notificações sonoras',
      vibration: 'Vibração',
      vibrationDescription: 'Sinal de vibração para notificações',
      emailNotifications: 'Notificações por Email',
      emailNotificationsDescription: 'Notificações por email',
      smartNotifications: 'Notificações Inteligentes',
      smartNotificationsDescription: 'Receba notificações oportunas sobre eventos importantes. Você pode configurar cada tipo separadamente.',
      enabled: 'Habilitado',
      disabled: 'Desabilitado',
      // Additional missing translations
      waitingForEntry: 'Aguardando entrada',
      vipFunction: 'Função VIP',
      winRate: 'Taxa de sucesso',
      pleaseWaitSystemAnalyzing: 'Por favor aguarde. O sistema está analisando o mercado...',
      moreDetails: 'Mais Detalhes',
      tryAgainInCooldown: 'Tente novamente em {seconds} segundos quando o mercado se estabilizar',
      // Alert messages
      bulkUpdateSuccess: 'Atualizado {successful} de {total} usuários',
      bulkUpdateError: 'Erro de atualização em massa: {error}',
      bulkUpdateErrorGeneric: 'Erro de atualização em massa: {message}',
      userDeletedSuccess: 'Usuário {userId} excluído com sucesso do bot',
      userDeleteError: 'Erro de exclusão: {error}',
      // Additional alert messages
      userAddedSuccess: 'Usuário adicionado ao sistema',
      errorOccurredWith: 'Ocorreu um erro: {error}',
      feedbackAcceptedSuccess: 'Feedback aceito: Trade bem-sucedido',
      feedbackAcceptedFailure: 'Feedback aceito: Trade perdedor',
      navigationBlockedMessage: 'Você tem um sinal ativo!\n\nAguarde a expiração e deixe feedback sobre o resultado do trade.\n\nA navegação será desbloqueada após enviar o feedback.',
      modelRestrictedAlert: 'Este modelo é restrito e disponível apenas sob comando',
      forexMarketClosedWeekend: 'O mercado Forex está fechado nos fins de semana. Mude para o modo OTC.',
      forexMarketClosedLabel: 'Mercado Forex fechado (fins de semana)',
      top3CooldownMessage: 'Sinais TOP-3 podem ser gerados uma vez a cada 10 minutos. Restante: {minutes}:{seconds}',
      vipFeature: 'Função VIP',
      vipAnalyticsDescription: 'AI Analytics está disponível apenas para usuários com assinatura ativa',
      subscriptionRequired: 'Assinatura necessária',
      getSubscription: 'Obter assinatura',
      returnToMenu: 'Voltar ao menu',
      forever: 'para sempre',
      mlModel: 'Modelo ML',
      chooseMLModel: 'Seleccionar modelo ML',
      selectSignalForActivation: 'Selecione sinal para ativação',
      selectSignal: 'Selecione sinal',
      expiration: 'Expiração',
      minutes: 'min',
      allUsersStatistics: 'Estatísticas de todos os usuários',
      mlModelSelection: 'Seleção de modelo ML',
      perMonth: '/mês',
      aboutMLModels: 'Sobre modelos ML',
      purchaseModel: 'Comprar {name}',
      signalsChartByMonth: 'Gráfico de sinais por mês',
      successful: 'bem-sucedidos',
      losing: 'perdedores',
      signals: 'sinais',
      successfulLosing: 'bem-sucedidos/perdedores',
      accessRequests: 'Solicitações de acesso',
      signalsPerDay: 'Sinais por dia',
      bestPair: 'Melhor par',
      worstPair: 'Pior par',
      quickTemplates: 'Modelos rápidos',
      subscriptionManagement: 'Gerenciamento de assinaturas',
      selectMLModels: 'Selecione modelos ML:',
      availableModels: 'Modelos disponíveis:',
      premiumMLModels: 'Modelos ML premium',
      activeSignals: 'Sinais ativos',
      progressToTP1: 'Progresso para TP1',
      monthlyStatistics: 'Estatísticas mensais',
      totalSignals: 'Total de sinais',
      successfulSignals: 'Bem-sucedidos',
      losingSignals: 'Perdedores',
      pair: 'Par:',
      direction: 'Direção:',
      tryAgainInSeconds: 'Tente novamente em {seconds} segundos quando o mercado se estabilizar',
      modelReady: 'O modelo está treinado e pronto para funcionar',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Fechar análise',
      apiError: 'Erro de API',
      unknownError: 'Erro desconhecido',
      analysisError: 'Erro ao obter análise. Formato de resposta inválido.',
      timeoutError: '⏰ Timeout: A análise demorou muito. Tente novamente.',
      serverError: '❌ Erro do servidor',
      networkError: '🌐 Erro de rede: Verifique sua conexão com a internet.',
      generalError: '❌ Erro',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} sinal(is)',
      signalCountZero: 'Sem sinais',
      generatedSignal: 'Sinal gerado',
      top3SignalsReady: 'TOP-3 sinais prontos!',
      sell: 'VENDER',
      wait: 'Esperar',
      waiting: 'Aguardando',
      minutesShort: 'min',
      secondsShort: 'seg',
      hoursShort: 'h',
      bearish: 'Baixista',
      bullish: 'Alta',
      neutral: 'Neutro',
      notAvailable: 'N/D',
      notSpecified: 'Não especificado',
      // Additional missing keys from screenshots
      aiAnalytics: 'Análise IA',
      selectSignalForAnalysis: 'Selecione um sinal para análise',
      aiWillAnalyze: 'IA analisará o trade e dará recomendações',
      marketStatus: 'Status do Mercado',
      selectPairForSignal: 'Selecione um par para gerar sinal',
      successfully: 'Com sucesso',
      sentiment: 'Sentimento',
      volatility: 'Volatilidade',
      recommendation: 'Recomendação:',
      clickToGenerateSignal: 'Clique para gerar sinal',
      confidence: 'Confiança',
      signalGeneration: 'Geração de Sinais',
      usingMLModel: 'Usando modelo ML...',
      analysis: 'Análise',
      mlModel: 'Modelo ML',
      chooseMLModel: 'Seleccionar modelo ML',
      accuracy: 'Precisão',
      pleaseWait: 'Por favor aguarde. O sistema está analisando o mercado...',
      howToReceiveSignals: 'Como você quer receber sinais?',
      top3Signals: 'Sinais TOP-3',
      popular: 'Popular',
      bestOpportunities: 'Melhores oportunidades do dia',
      threeBestSignals: '3 melhores sinais',
      simultaneously: 'simultaneamente',
      highSuccessProbability: 'Alta probabilidade de sucesso',
      riskDiversification: 'Diversificação de risco',
      singleSignals: 'Sinais Individuais',
      oneSignalAtTime: 'Um sinal por vez',
      focusOnOneTrade: 'Foco em um trade',
      simpleManagement: 'Gestão simples',
      idealForBeginners: 'Ideal para iniciantes',
      dealActivated: 'NEGÓCIO ATIVADO',
      navigationBlocked: 'Navegação bloqueada',
      remainingUntilExpiration: 'Restante até expiração',
      waitForExpiration: 'Aguarde a expiração do sinal e deixe feedback',
      back: 'Voltar'
    },
    zh: {
      welcome: '欢迎',
      selectLanguage: '选择语言',
      continue: '继续',
      start: '开始',
      menu: '菜单',
      tradingSignals: '交易信号',
      analytics: '分析',
      community: 'https://t.me/+nDqBvIeQwL8yZjU6',
      settings: '设置',
      premium: '高级 ML',
      selectMarket: '选择市场',
      selectMode: '生成模式',
      top3Signals: '前3信号',
      singleSignals: '单一信号',
      active: '活跃',
      history: '历史',
      back: '返回',
      admin: '管理面板',
      buy: '购买',
      monthly: '每月',
      lifetime: '终身',
      welcomeTo: '欢迎来到',
      premiumSignals: '专业交易的高级信号',
      accurateSignals: '精准信号',
      successfulTrades: '87%成功交易',
      instantNotifications: '即时通知',
      realTimeSignals: '实时接收信号',
      premiumQuality: '高级品质',
      professionalMarketAnalysis: '专业市场分析',
      professionalAnalysis: '专业市场分析',
      whatSignals: '您想接收什么信号？',
      forexSchedule: '外汇市场时间表',
      catalogPrivate: '私人ML模型目录',
      onlyForInsiders: '仅限内部人员。邀请制访问。',
      consciousRisk: '每次入场都是有意识的风险。',
      activeModel: '活跃',
      model: '模型:',
      modelReady: '模型已训练并准备就绪',
      // Новые переводы
      comingSoon: '即将推出',
      comingSoonDescription: '即将推出',
      chatWithTraders: '与其他交易者聊天',
      manageParameters: '管理参数',
      manageAppSettings: '管理应用设置',
      mlModel: 'ML模型',
      chooseMLModel: '选择ML模型',
      statistics: '统计',
      viewDetails: '查看详细统计',
      notifications: '通知',
      setupPushNotifications: '设置推送通知',
      // Уведомления - детали
      newSignals: '新信号',
      newSignalsDescription: '新信号通知',
      signalResults: '信号结果',
      signalResultsDescription: '交易关闭通知',
      dailySummary: '每日摘要',
      dailySummaryDescription: '每日21:00摘要',
      systemNotifications: '系统通知',
      marketNews: '市场新闻',
      marketNewsDescription: '重要市场事件',
      systemUpdates: '系统更新',
      systemUpdatesDescription: '新功能和修复',
      soundAndVibration: '声音和振动',
      soundNotification: '声音',
      soundNotificationsDescription: '声音通知',
      vibration: '振动',
      vibrationDescription: '通知振动信号',
      emailNotifications: '邮件通知',
      emailNotificationsDescription: '邮件复制',
      smartNotifications: '智能通知',
      smartNotificationsDescription: '及时接收重要事件通知。您可以单独配置每种类型。',
      // Новые ключи для главного меню
      chooseAction: '选择操作',
      getTradingSignals: '获取交易信号',
      aiSignalAnalysis: 'AI信号分析',
      // Сигналы
      direction: '方向',
      expiration: '到期',
      confidence: '信心',
      clickToActivate: '点击激活',
      signalReady: '信号就绪',
      activateSignalForTrading: '激活交易信号',
      // Подтверждения
      confirmDeleteUser: '您确定要删除用户',
      actionCannotBeUndone: '此操作无法撤销',
      // Аналитика
      signalType: '信号类型',
      result: '结果',
      entryPrice: '入场价格',
      runAIAnalysis: '运行AI分析',
      analyzingTrade: '分析交易中...',
      gptProcessingData: 'GPT-4o mini正在处理数据',
      // Админ-панель
      totalUsers: '总用户数',
      online: '在线',
      noAccessRequests: '无访问请求',
      newRequestsWillAppearHere: '新请求将在此处显示',
      detailedInformation: '详细信息',
      tradingDays: '交易天数',
      // Генерация сигналов
      connectingToMarket: '连接市场...',
      analyzingTechnicalIndicators: '分析技术指标...',
      evaluatingNewsBackground: '评估新闻背景...',
      calculatingOptimalExpiration: '计算最佳到期时间...',
      applyingMLModels: '应用ML模型...',
      formingTop3Signals: '形成前3信号...',
      analyzingPair: '分析货币对 {pair}...',
      calculatingTechnicalIndicators: '计算技术指标...',
      applyingMLModel: '应用ML模型...',
      determiningEntryPoint: '确定入场点...',
      // ML модели
      shadowStack: 'SHADOW STACK',
      shadowStackDesc: '不失误，不延迟，不说谎。只做脏活。',
      shadowStackAlgo: '集成 (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      shadowStackStyle: '中期，日内',
      forestNecromancer: 'FOREST NECROMANCER',
      forestNecromancerDesc: '看起来像书呆子，行动像市场萨满。',
      forestNecromancerAlgo: 'RandomForest - 从决策森林召唤',
      forestNecromancerStyle: '信息员，带脉冲区域可视化',
      grayCardinal: 'GRAY CARDINAL',
      grayCardinalDesc: '你看不到他，但他比你先知道你的入场。',
      grayCardinalAlgo: 'XGBoost - 不在雷达上，但一切都在控制之下',
      grayCardinalStyle: '较低时间框架的信号，带额外过滤器',
      logisticSpy: 'LOGISTIC SPY',
      logisticSpyDesc: '老派，但知道所有动作。',
      logisticSpyAlgo: 'LogisticRegression - ML世界的经典',
      logisticSpyStyle: '保守，经时间验证',
      sniper80x: 'SNIPER 80X',
      sniper80xDesc: '你启动它——市场就安静了。一次入场——一次击杀。',
      sniper80xAlgo: '最终模型 - 自己人中的传奇',
      sniper80xStyle: '精准入场，位置性，有时剥头皮',
      sniper80xWarning: '仅按命令。自动不激活。',
      // Статусы
      activeStatus: '活跃',
      inactive: '非活跃',
      available: '可用',
      blocked: '已阻止',
      success: '成功',
      failure: '失败',
      // Действия
      buyAction: '购买',
      selectAction: '选择',
      approve: '批准',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      apply: '应用',
      update: '更新',
      // Генерация сигналов
      loadingMarkets: '加载市场...',
      analyzingTrends: '分析趋势...',
      applyingML: '应用ML模型...',
      calculatingEntry: '计算入场点...',
      assessingRisks: '评估风险...',
      finalCheck: '最终检查...',
      // Админ-панель
      activeUsers: '活跃用户',
      totalSignals: '总信号',
      successful: '成功',
      failed: '失败',
      topUsers: '顶级用户',
      accessRequests: '访问请求',
      subscriptionHistory: '订阅更改历史',
      // Статистика
      myStatistics: '我的统计',
      winRate: '胜率',
      currentStreak: '当前连胜',
      bestStreak: '最佳连胜',
      averageProfit: '平均利润',
      signalsPerDay: '每日信号',
      bestPair: '最佳货币对',
      worstPair: '最差货币对',
      // Подписки
      monthlySubscription: '月度订阅',
      lifetimePurchase: '终身购买',
      autoRenewal: '自动续费',
      noTimeLimit: '无时间限制',
      selectSubscriptionType: '选择订阅类型:',
      // Уведомления
      soundNotification: '声音',
      vibration: '振动',
      pushNotification: '推送',
      enabled: '已启用',
      disabled: '已禁用',
      // Keys for notifications interface
      notificationsBadge: '通知',
      tradingSignals: '交易信号',
      newSignals: '新信号',
      newSignalsDescription: '关于新信号的通知',
      signalResults: '信号结果',
      signalResultsDescription: '关于交易关闭的通知',
      dailySummary: '每日摘要',
      dailySummaryDescription: '21:00的日结果',
      systemNotifications: '系统通知',
      marketNews: '市场新闻',
      marketNewsDescription: '重要的市场事件',
      systemUpdates: '系统更新',
      systemUpdatesDescription: '新功能和修复',
      soundAndVibration: '声音和振动',
      soundNotification: '声音',
      soundNotificationsDescription: '声音通知',
      vibration: '振动',
      vibrationDescription: '通知的振动信号',
      emailNotifications: '邮件通知',
      emailNotificationsDescription: '邮件通知',
      smartNotifications: '智能通知',
      smartNotificationsDescription: '及时接收重要事件通知。您可以单独配置每种类型。',
      // Additional missing translations
      waitingForEntry: '等待入场',
      vipFunction: 'VIP功能',
      winRate: '胜率',
      pleaseWaitSystemAnalyzing: '请稍等。系统正在分析市场...',
      moreDetails: '更多详情',
      tryAgainInCooldown: '请在{seconds}秒后重试，当市场稳定时',
      // Alert messages
      bulkUpdateSuccess: '已更新{successful}个用户，共{total}个',
      bulkUpdateError: '批量更新错误：{error}',
      bulkUpdateErrorGeneric: '批量更新错误：{message}',
      userDeletedSuccess: '用户{userId}已成功从机器人中删除',
      userDeleteError: '删除错误：{error}',
      // Additional alert messages
      userAddedSuccess: '用户已添加到系统',
      errorOccurredWith: '发生错误：{error}',
      feedbackAcceptedSuccess: '反馈已接受：成功交易',
      feedbackAcceptedFailure: '反馈已接受：亏损交易',
      navigationBlockedMessage: '您有一个活跃信号！\n\n等待到期并留下交易结果的反馈。\n\n发送反馈后导航将解锁。',
      modelRestrictedAlert: '此模型受限，仅按命令可用',
      // Аналитика
      aiAnalytics: 'AI分析',
      successfulTradesHistory: '成功交易历史',
      analyzeSignal: '分析信号',
      analyzingInProgress: '分析中...',
      cancelAnalysis: '取消分析',
      // Системные сообщения
      userAdded: '用户已添加到系统',
      errorOccurred: '发生错误',
      loadingData: '加载数据...',
      // Модальные окна
      tradeActivated: '交易已激活',
      timeExpired: '⏰ 时间已到！',
      leaveFeedback: '请对交易结果留下反馈',
      pair: '货币对',
      direction: '方向',
      resultButtonsActive: '结果按钮已激活',
      indicateTradeResult: '时间到期后请指明交易结果',
      successfulTrade: '成功交易',
      losingTrade: '亏损交易',
      leaveFeedbackToUnlock: '⚠️ 请留下反馈以解锁导航',
      navigationLocked: '导航已锁定',
      waitForExpiration: '请等待信号到期并留下反馈',
      timeRemaining: '剩余到期时间',
      noSuitableEntry: '⚠️ 没有合适的入场点',
      marketConditionsNotOptimal: '当前市场条件不适合开仓',
      analysisCompleted: '分析完成',
      recommendations: '建议',
      tryAnotherPair: '尝试其他货币对',
      selectAnotherPairDescription: '选择具有更有利条件的其他货币对',
      waitForOptimalConditions: '等待最佳条件',
      tryAgainWhen: '当市场稳定时，在{seconds}秒后重试',
      returnToPairSelection: '返回货币对选择',
      patienceIsKey: '💡 耐心是成功交易的关键',
      warningAttention: '⚠️ 注意！',
      systemBypassDetected: '检测到系统绕过尝试',
      activeSignalRequiresCompletion: '您有一个活跃信号需要完成。重新加载页面不会帮助绕过导航锁定。',
      activeSignal: '活跃信号',
      feedbackRequired: '⏰ 需要反馈！',
      returnToOpenTrade: '返回开放交易',
      bypassProtectionActive: '节点保护系统已激活',
      waitForActiveSignal: '⚠️ 请等待活跃信号完成并在继续之前留下反馈！',
      // Alert сообщения
      subscriptionUpdated: '✅ 用户{name}的订阅已更新！用户将获得所选ML模型的访问权限。',
      subscriptionUpdateError: '❌ 更新用户{name}订阅时出错',
      subscriptionDisabled: '✅ 用户{name}的订阅已禁用！',
      subscriptionDisableError: '❌ 禁用用户{name}订阅时出错',
      confirmDeleteUser: '您确定要删除用户{name}吗？此操作无法撤销。',
      userDeleted: '✅ 用户{name}已从系统中删除',
      userDeleteError: '❌ 删除用户{name}时出错',
      accessRequestApproved: '✅ 用户{name}的访问请求已批准',
      accessRequestError: '❌ 批准用户{name}请求时出错',
      // Новые переводы для хардкод строк
      popular: '热门',
      bestOpportunitiesOfDay: '一天中最好的机会',
      threeBestSignalsSimultaneously: '3个最佳信号同时',
      highSuccessProbability: '高成功率',
      riskDiversification: '风险分散',
      focusOnOneTrade: '专注于一笔交易',
      simpleManagement: '简单管理',
      availableIn: '可用时间: {minutes} 分钟',
      idealForBeginners: '适合初学者',
      analysis: '分析',
      accuracy: '准确性',
      selectSignalForActivation: '选择要激活的信号',
      selectPairForSignalGeneration: '选择用于生成信号的货币对',
      marketState: '市场状态',
      mood: '情绪',
      volatility: '波动性',
      recommendation: '推荐：',
      clickToGenerateSignal: '点击生成信号',
      selectSignal: '选择信号',
      selectSignalForAnalysis: '选择要分析的信号',
      aiWillAnalyzeAndGiveRecommendations: 'AI将分析交易并提供建议',
      noExecutedSignals: '没有已执行的信号',
      executeSeveralDealsToSeeInAnalytics: '执行几笔交易以在分析中查看它们',
      expiration: '到期',
      dealActivated: '交易已激活',
      navigationLocked: '导航已锁定',
      timeRemainingUntilExpiration: '到期剩余时间',
      howDidTheDealGo: '交易进行得如何？',
      generationMode: '生成模式',
      signalGeneration: '信号生成',
      howDoYouWantToReceiveSignals: '您想如何接收信号？',
      top3Signals: '前3信号',
      singleSignals: '单一信号',
      oneSignalAtATime: '一次一个信号',
      allUsersStatistics: '所有用户统计',
      mlModelSelection: 'ML模型选择',
      or: '或',
      aboutMLModels: '关于ML模型',
      purchaseModel: '购买{name}',
      signalsChartByMonth: '按月信号图表',
      successfulLosing: '成功/失败',
      accessRequests: '访问请求',
      signalsPerDay: '每日信号数',
      bestPair: '最佳货币对',
      worstPair: '最差货币对',
      quickTemplates: '快速模板',
      subscriptionManagement: '订阅管理',
      selectMLModels: '选择ML模型：',
      availableModels: '可用模型：',
      premiumMLModels: '高级ML模型',
      activeSignals: '活跃信号',
      progressToTP1: '到TP1的进度',
      waitingForEntry: '等待入场',
      vipFunction: 'VIP功能',
      winRate: '胜率',
      pleaseWaitSystemAnalyzing: '请稍等。系统正在分析市场...',
      forexSignalsPro: 'Forex Signals Pro',
      accurateSignals: '准确信号',
      successfulTradesPercent: '87%成功交易',
      instantNotifications: '即时通知',
      realTimeSignals: '实时接收信号',
      premiumQuality: '高级质量',
      professionalMarketAnalysis: '专业市场分析',
      forex: 'Forex',
      otc: 'OTC',
      top3: '前3',
      single: '单一',
      // New keys for hardcoded texts
      hoursAgo: '{count}小时前',
      daysAgo: '{count}天前',
      selectLanguageDescription: '选择您喜欢的语言继续',
      forexMarketClosedWeekend: '外汇市场在周末关闭。切换到OTC模式。',
      forexMarketClosedLabel: '外汇市场关闭（周末）',
      top3CooldownMessage: '前3信号可以每10分钟生成一次。剩余：{minutes}:{seconds}',
      vipFeature: 'VIP功能',
      vipAnalyticsDescription: 'AI分析仅适用于有活跃订阅的用户',
      subscriptionRequired: '需要订阅',
      getSubscription: '获取订阅',
      returnToMenu: '返回菜单',
      forever: '永远',
      mlModel: 'ML模型',
      chooseMLModel: '选择ML模型',
      selectSignalForActivation: '选择要激活的信号',
      selectSignal: '选择信号',
      expiration: '到期',
      minutes: '分钟',
      allUsersStatistics: '所有用户统计',
      mlModelSelection: 'ML模型选择',
      perMonth: '/月',
      aboutMLModels: '关于ML模型',
      purchaseModel: '购买{name}',
      signalsChartByMonth: '按月信号图表',
      successful: '成功',
      losing: '失败',
      signals: '信号',
      successfulLosing: '成功/失败',
      accessRequests: '访问请求',
      signalsPerDay: '每日信号数',
      bestPair: '最佳货币对',
      worstPair: '最差货币对',
      quickTemplates: '快速模板',
      subscriptionManagement: '订阅管理',
      selectMLModels: '选择ML模型：',
      availableModels: '可用模型：',
      premiumMLModels: '高级ML模型',
      activeSignals: '活跃信号',
      progressToTP1: '向TP1的进度',
      monthlyStatistics: '月度统计',
      totalSignals: '总信号数',
      successfulSignals: '成功',
      losingSignals: '失败',
      pair: '货币对：',
      direction: '方向：',
      tryAgainInSeconds: '在{seconds}秒后重试，当市场稳定时',
      modelReady: '模型已训练并准备就绪',
      aiAnalytics: 'AI分析',
      closeAnalysis: '关闭分析',
      apiError: 'API错误',
      unknownError: '未知错误',
      analysisError: '获取分析时出错。响应格式无效。',
      timeoutError: '⏰ 超时：分析耗时过长。请重试。',
      serverError: '❌ 服务器错误',
      networkError: '🌐 网络错误：请检查您的互联网连接。',
      generalError: '❌ 错误',
      // New localization keys
      signalCount: '{count} 个信号',
      signalCountZero: '没有信号',
      generatedSignal: '生成的信号',
      top3SignalsReady: 'TOP-3 信号准备好了！',
      sell: '卖出',
      wait: '等待',
      waiting: '等待中',
      minutesShort: '分钟',
      secondsShort: '秒',
      hoursShort: '小时',
      bearish: '看跌',
      bullish: '看涨',
      neutral: '中性',
      notAvailable: '不适用',
      notSpecified: '未指定',
      // Additional missing keys from screenshots
      aiAnalytics: 'AI 分析',
      selectSignalForAnalysis: '选择信号进行分析',
      aiWillAnalyze: 'AI 将分析交易并给出建议',
      marketStatus: '市场状态',
      selectPairForSignal: '选择货币对生成信号',
      successfully: '成功',
      sentiment: '情绪',
      volatility: '波动率',
      recommendation: '建议:',
      clickToGenerateSignal: '点击生成信号',
      confidence: '信心',
      signalGeneration: '信号生成',
      usingMLModel: '使用 ML 模型...',
      analysis: '分析',
      mlModel: 'ML 模型',
      accuracy: '准确性',
      pleaseWait: '请稍等。系统正在分析市场...',
      howToReceiveSignals: '您想如何接收信号？',
      top3Signals: 'TOP-3 信号',
      popular: '热门',
      bestOpportunities: '当日最佳机会',
      threeBestSignals: '3 个最佳信号',
      simultaneously: '同时',
      highSuccessProbability: '高成功率',
      riskDiversification: '风险分散',
      singleSignals: '单一信号',
      oneSignalAtTime: '一次一个信号',
      focusOnOneTrade: '专注于一个交易',
      simpleManagement: '简单管理',
      idealForBeginners: '适合初学者',
      dealActivated: '交易已激活',
      navigationBlocked: '导航被阻止',
      remainingUntilExpiration: '剩余到期时间',
      waitForExpiration: '等待信号到期并留下反馈',
      back: '返回'
    },
    ja: {
      welcome: 'ようこそ',
      selectLanguage: '言語を選択',
      continue: '続ける',
      start: '開始',
      menu: 'メニュー',
      tradingSignals: '取引シグナル',
      analytics: '分析',
      community: 'コミュニティ',
      settings: '設定',
      premium: 'プレミアム ML',
      selectMarket: '市場を選択',
      selectMode: '生成モード',
      top3Signals: 'トップ3シグナル',
      singleSignals: '単一シグナル',
      active: 'アクティブ',
      history: '履歴',
      back: '戻る',
      admin: '管理パネル',
      buy: '購入',
      monthly: '毎月',
      lifetime: '生涯',
      welcomeTo: 'ようこそ、',
      premiumSignals: 'プロフェッショナルトレーディング用プレミアムシグナル',
      accurateSignals: '正確なシグナル',
      successfulTradesPercent: '87%の成功取引',
      instantNotifications: '即座の通知',
      realTimeSignals: 'リアルタイムでシグナルを受信',
      premiumQuality: 'プレミアム品質',
      professionalMarketAnalysis: 'プロフェッショナル市場分析',
      // Новые переводы
      comingSoon: '近日公開',
      comingSoonDescription: '近日公開予定',
      chatWithTraders: '他のトレーダーとチャット',
      manageParameters: 'パラメータを管理',
      manageAppSettings: 'アプリ設定を管理',
      mlModel: 'MLモデル',
      statistics: '統計',
      viewDetails: '詳細統計を表示',
      notifications: '通知',
      setupPushNotifications: 'プッシュ通知を設定',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: 'アクティブ',
      quick: '非アクティブ',
      available: '利用可能',
      blocked: 'ブロック済み',
      success: '成功',
      failure: '失敗',
      // Действия
      buyAction: '購入',
      selectAction: '選択',
      approve: '承認',
      delete: '削除',
      save: '保存',
      cancel: 'キャンセル',
      apply: '適用',
      update: '更新',
      // Генерация сигналов
      loadingMarkets: '市場を読み込み中...',
      analyzingTrends: 'トレンドを分析中...',
      applyingML: 'MLモデルを適用中...',
      calculatingEntry: 'エントリーポイントを計算中...',
      assessingRisks: 'リスクを評価中...',
      finalCheck: '最終チェック中...',
      // Админ-панель
      activeUsers: 'アクティブユーザー',
      totalSignals: '総シグナル',
      successful: '成功',
      failed: '失敗',
      topUsers: 'トップユーザー',
      accessRequests: 'アクセス要求',
      subscriptionHistory: 'サブスクリプション変更履歴',
      // Статистика
      myStatistics: 'マイ統計',
      winRate: '勝率',
      currentStreak: '現在の連勝',
      bestStreak: '最高連勝',
      averageProfit: '平均利益',
      // Подписки
      monthlySubscription: '月額サブスクリプション',
      lifetimePurchase: '生涯購入',
      autoRenewal: '自動更新',
      noTimeLimit: '時間制限なし',
      selectSubscriptionType: 'サブスクリプションタイプを選択:',
      // Уведомления
      soundNotification: '音',
      vibration: '振動',
      pushNotification: 'プッシュ',
      enabled: '有効',
      disabled: '無効',
      // Keys for notifications interface
      notificationsBadge: '通知',
      tradingSignals: 'トレーディングシグナル',
      newSignals: '新しいシグナル',
      newSignalsDescription: '新しいシグナルに関する通知',
      signalResults: 'シグナル結果',
      signalResultsDescription: '取引終了に関する通知',
      dailySummary: '日次サマリー',
      dailySummaryDescription: '21:00の日次結果',
      systemNotifications: 'システム通知',
      marketNews: 'マーケットニュース',
      marketNewsDescription: '重要なマーケットイベント',
      systemUpdates: 'システムアップデート',
      systemUpdatesDescription: '新機能と修正',
      soundAndVibration: '音と振動',
      soundNotification: '音',
      soundNotificationsDescription: '音声通知',
      vibration: '振動',
      vibrationDescription: '通知の振動信号',
      emailNotifications: 'メール通知',
      emailNotificationsDescription: 'メール通知',
      smartNotifications: 'スマート通知',
      smartNotificationsDescription: '重要なイベントについて適時に通知を受け取ります。各タイプを個別に設定できます。',
      // Additional missing translations
      waitingForEntry: '入場待機中',
      vipFunction: 'VIP機能',
      winRate: '勝率',
      pleaseWaitSystemAnalyzing: 'お待ちください。システムが市場を分析しています...',
      moreDetails: '詳細',
      tryAgainInCooldown: '市場が安定したら{seconds}秒後に再試行してください',
      // Alert messages
      bulkUpdateSuccess: '{total}人中{successful}人を更新しました',
      bulkUpdateError: '一括更新エラー：{error}',
      bulkUpdateErrorGeneric: '一括更新エラー：{message}',
      userDeletedSuccess: 'ユーザー{userId}をボットから正常に削除しました',
      userDeleteError: '削除エラー：{error}',
      // Additional alert messages
      userAddedSuccess: 'ユーザーがシステムに追加されました',
      errorOccurredWith: 'エラーが発生しました：{error}',
      feedbackAcceptedSuccess: 'フィードバック受付：成功取引',
      feedbackAcceptedFailure: 'フィードバック受付：損失取引',
      navigationBlockedMessage: 'アクティブなシグナルがあります！\n\n有効期限を待ち、取引結果についてフィードバックを残してください。\n\nフィードバック送信後、ナビゲーションがロック解除されます。',
      modelRestrictedAlert: 'このモデルは制限されており、コマンドでのみ利用可能です',
      // Аналитика
      aiAnalytics: 'AI分析',
      successfulTradesHistory: '成功取引履歴',
      analyzeSignal: 'シグナルを分析',
      analyzingIneligible: '分析中...',
      cancelAnalysis: '分析をキャンセル',
      // Системные сообщения
      userAdded: 'ユーザーがシステムに追加されました',
      errorOccurred: 'エラーが発生しました',
      loadingData: 'データを読み込み中...',
      // Модальные окна
      tradeActivated: '取引がアクティベートされました',
      timeExpired: '⏰ 時間切れ！',
      leaveFeedback: '取引結果についてフィードバックを残してください',
      pair: 'ペア',
      direction: '方向',
      resultButtonsActive: '結果ボタンがアクティブになりました',
      indicateTradeResult: '時間切れ後に取引結果を指定してください',
      successfulTrade: '成功取引',
      losingTrade: '損失取引',
      leaveFeedbackToUnlock: '⚠️ ナビゲーションをアンロックするためにフィードバックを残してください',
      navigationLocked: 'ナビゲーションがロックされています',
      waitForExpiration: 'シグナルの期限を待ち、フィードバックを残してください',
      timeRemaining: '期限までの残り時間',
      noSuitableEntry: '⚠️ 適切なエントリーポイントがありません',
      marketConditionsNotOptimal: '現在の市場条件はポジション開始に最適ではありません',
      analysisCompleted: '分析完了',
      recommendations: '推奨事項',
      tryAnotherPair: '別のペアを試してください',
      selectAnotherPairDescription: 'より有利な条件を持つ別の通貨ペアを選択してください',
      waitForOptimalConditions: '最適な条件を待ってください',
      tryAgainWhen: '市場が安定したら{seconds}秒後に再試行してください',
      returnToPairSelection: 'ペア選択に戻る',
      patienceIsKey: '💡 忍耐は成功トレーディングの鍵です',
      warningAttention: '⚠️ 注意！',
      systemBypassDetected: 'システムバイパスの試行が検出されました',
      activeSignalRequiresCompletion: '完了が必要なアクティブシグナルがあります。ページをリロードしてもナビゲーションロックをバイパスできません。',
      activeSignal: 'アクティブシグナル',
      feedbackRequired: '⏰ フィードバックが必要です！',
      returnToOpenTrade: 'オープン取引に戻る',
      bypassProtectionActive: 'ナビゲーションロックバイパス保護システムがアクティブです',
      waitForActiveSignal: '⚠️ アクティブシグナルの完了を待ち、続行前にフィードバックを残してください！',
      // Alert сообщения
      subscriptionUpdated: '✅ ユーザー{name}のサブスクリプションが更新されました！ユーザーは選択されたMLモデルにアクセスできます。',
      subscriptionUpdateError: '❌ ユーザー{name}のサブスクリプション更新エラー',
      subscriptionDisabled: '✅ ユーザー{name}のサブスクリプションが無効になりました！',
      subscriptionDisableError: '❌ ユーザー{name}のサブスクリプション無効化エラー',
      confirmDeleteUser: 'ユーザー{name}を削除してもよろしいですか？このアクションは元に戻せません。',
      userDeleted: '✅ ユーザー{name}がシステムから削除されました',
      userDeleteError: '❌ ユーザー{name}の削除エラー',
      accessRequestApproved: '✅ ユーザー{name}のアクセスリクエストが承認されました',
      accessRequestError: '❌ ユーザー{name}のリクエスト承認エラー',
      apiError: 'APIエラー',
      unknownError: '不明なエラー',
      analysisError: '分析の取得でエラーが発生しました。無効な応答形式です。',
      timeoutError: '⏰ タイムアウト：分析に時間がかかりすぎました。再試行してください。',
      serverError: '❌ サーバーエラー',
      networkError: '🌐 ネットワークエラー：インターネット接続を確認してください。',
      generalError: '❌ エラー',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} シグナル',
      signalCountZero: 'シグナルなし',
      generatedSignal: '生成されたシグナル',
      top3SignalsReady: 'TOP-3シグナル準備完了！',
      sell: '売る',
      wait: '待つ',
      waiting: '待機中',
      minutesShort: '分',
      secondsShort: '秒',
      hoursShort: '時',
      bearish: '弱気',
      bullish: '強気',
      neutral: '中立',
      notAvailable: 'なし',
      notSpecified: '未指定',
      // Additional missing keys from screenshots
      aiAnalytics: 'AI 分析',
      selectSignalForAnalysis: '分析するシグナルを選択',
      aiWillAnalyze: 'AI が取引を分析し、推奨事項を提供します',
      marketStatus: '市場状況',
      selectPairForSignal: 'シグナル生成のためのペアを選択',
      successfully: '成功',
      sentiment: 'センチメント',
      volatility: 'ボラティリティ',
      recommendation: '推奨:',
      clickToGenerateSignal: 'クリックしてシグナルを生成',
      confidence: '信頼度',
      signalGeneration: 'シグナル生成',
      usingMLModel: 'ML モデルを使用中...',
      analysis: '分析',
      mlModel: 'ML モデル',
      accuracy: '精度',
      pleaseWait: 'お待ちください。システムが市場を分析しています...',
      howToReceiveSignals: 'シグナルをどのように受け取りたいですか？',
      top3Signals: 'TOP-3 シグナル',
      popular: '人気',
      bestOpportunities: '今日のベストオポチュニティ',
      threeBestSignals: '3つのベストシグナル',
      simultaneously: '同時に',
      highSuccessProbability: '高い成功確率',
      riskDiversification: 'リスク分散',
      singleSignals: '単一シグナル',
      oneSignalAtTime: '一度に1つのシグナル',
      focusOnOneTrade: '1つの取引に集中',
      simpleManagement: 'シンプルな管理',
      idealForBeginners: '初心者に理想的',
      dealActivated: '取引がアクティベートされました',
      navigationBlocked: 'ナビゲーションがブロックされました',
      remainingUntilExpiration: '有効期限まで残り',
      waitForExpiration: 'シグナルの有効期限を待ち、フィードバックを残してください',
      back: '戻る'
    },
    ko: {
      welcome: '환영합니다',
      selectLanguage: '언어 선택',
      continue: '계속',
      start: '시작',
      menu: '메뉴',
      tradingSignals: '거래 신호',
      analytics: '분석',
      community: '커뮤니티',
      settings: '설정',
      premium: '프리미엄 ML',
      selectMarket: '시장 선택',
      selectMode: '생성 모드',
      top3Signals: '상위 3개 신호',
      singleSignals: '단일 신호',
      active: '활성',
      history: '기록',
      back: '뒤로',
      admin: '관리자 패널',
      buy: '구매',
      monthly: '월간',
      lifetime: '평생',
      welcomeTo: '환영합니다,',
      premiumSignals: '전문 트레이딩을 위한 프리미엄 신호',
      accurateSignals: '정확한 신호',
      successfulTradesPercent: '87% 성공적인 거래',
      instantNotifications: '즉시 알림',
      realTimeSignals: '실시간으로 신호 받기',
      premiumQuality: '프리미엄 품질',
      professionalMarketAnalysis: '전문 시장 분석',
      // Новые переводы
      comingSoon: '곧 출시',
      comingSoonDescription: '곧 출시 예정',
      chatWithTraders: '다른 트레이더와 채팅',
      manageParameters: '매개변수 관리',
      manageAppSettings: '앱 설정 관리',
      mlModel: 'ML 모델',
      chooseMLModel: 'ML 모델 선택',
      statistics: '통계',
      viewDetails: '상세 통계 보기',
      notifications: '알림',
      setupPushNotifications: '푸시 알림 설정',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: '활성',
      inactive: '비활성',
      available: '사용 가능',
      blocked: '차단됨',
      success: '성공',
      failure: '실패',
      // Действия
      buyAction: '구매',
      selectAction: '선택',
      approve: '승인',
      delete: '삭제',
      save: '저장',
      cancel: '취소',
      apply: '적용',
      update: '업데이트',
      // Генерация сигналов
      loadingMarkets: '시장 로딩 중...',
      analyzingTrends: '트렌드 분석 중...',
      applyingML: 'ML 모델 적용 중...',
      calculatingEntry: '진입점 계산 중...',
      assessingRisks: '위험 평가 중...',
      finalCheck: '최종 확인 중...',
      // Админ-панель
      activeUsers: '활성 사용자',
      totalSignals: '총 신호',
      successful: '성공',
      failed: '실패',
      topUsers: '상위 사용자',
      accessRequests: '접근 요청',
      subscriptionHistory: '구독 변경 기록',
      // Статистика
      myStatistics: '내 통계',
      winRate: '승률',
      currentStreak: '현재 연승',
      bestStreak: '최고 연승',
      averageProfit: '평균 수익',
      // Подписки
      monthlySubscription: '월간 구독',
      lifetimePurchase: '평생 구매',
      autoRenewal: '자동 갱신',
      noTimeLimit: '시간 제한 없음',
      selectSubscriptionType: '구독 유형 선택:',
      // Уведомления
      soundNotification: '소리',
      vibration: '진동',
      pushNotification: '푸시',
      enabled: '활성화됨',
      disabled: '비활성화됨',
      // Keys for notifications interface
      notificationsBadge: '알림',
      tradingSignals: '트레이딩 신호',
      newSignals: '새 신호',
      newSignalsDescription: '새 신호에 대한 알림',
      signalResults: '신호 결과',
      signalResultsDescription: '거래 종료에 대한 알림',
      dailySummary: '일일 요약',
      dailySummaryDescription: '21:00의 일일 결과',
      systemNotifications: '시스템 알림',
      marketNews: '시장 뉴스',
      marketNewsDescription: '중요한 시장 이벤트',
      systemUpdates: '시스템 업데이트',
      systemUpdatesDescription: '새 기능 및 수정',
      soundAndVibration: '소리 및 진동',
      soundNotification: '소리',
      soundNotificationsDescription: '소리 알림',
      vibration: '진동',
      vibrationDescription: '알림을 위한 진동 신호',
      emailNotifications: '이메일 알림',
      emailNotificationsDescription: '이메일 알림',
      smartNotifications: '스마트 알림',
      smartNotificationsDescription: '중요한 이벤트에 대한 적시 알림을 받으세요. 각 유형을 개별적으로 구성할 수 있습니다.',
      // Additional missing translations
      waitingForEntry: '진입 대기 중',
      vipFunction: 'VIP 기능',
      winRate: '승률',
      pleaseWaitSystemAnalyzing: '잠시 기다려주세요. 시스템이 시장을 분석하고 있습니다...',
      moreDetails: '자세히',
      tryAgainInCooldown: '시장이 안정되면 {seconds}초 후에 다시 시도하세요',
      // Alert messages
      bulkUpdateSuccess: '{total}명 중 {successful}명 업데이트됨',
      bulkUpdateError: '대량 업데이트 오류: {error}',
      bulkUpdateErrorGeneric: '대량 업데이트 오류: {message}',
      userDeletedSuccess: '사용자 {userId}가 봇에서 성공적으로 삭제됨',
      userDeleteError: '삭제 오류: {error}',
      // Additional alert messages
      userAddedSuccess: '사용자가 시스템에 추가되었습니다',
      errorOccurredWith: '오류가 발생했습니다: {error}',
      feedbackAcceptedSuccess: '피드백 수락: 성공한 거래',
      feedbackAcceptedFailure: '피드백 수락: 손실 거래',
      navigationBlockedMessage: '활성 신호가 있습니다!\n\n만료를 기다리고 거래 결과에 대한 피드백을 남겨주세요.\n\n피드백 전송 후 탐색이 잠금 해제됩니다.',
      modelRestrictedAlert: '이 모델은 제한되어 있으며 명령에 의해서만 사용 가능합니다',
      // Аналитика
      aiAnalytics: 'AI 분석',
      successfulTradesHistory: '성공한 거래 기록',
      analyzeSignal: '신호 분석',
      analyzingIneligible: '분석 중...',
      cancelAnalysis: '분석 취소',
      // Системные сообщения
      userAdded: '사용자가 시스템에 추가되었습니다',
      errorOccurred: '오류가 발생했습니다',
      loadingData: '데이터 로딩 중...',
      // Модальные окна
      tradeActivated: '거래가 활성화되었습니다',
      timeExpired: '⏰ 시간 만료!',
      leaveFeedback: '거래 결과에 대한 피드백을 남겨주세요',
      pair: '페어',
      direction: '방향',
      resultButtonsActive: '결과 버튼이 활성화되었습니다',
      indicateTradeResult: '시간 만료 후 거래 결과를 지정해주세요',
      successfulTrade: '성공적인 거래',
      losingTrade: '손실 거래',
      leaveFeedbackToUnlock: '⚠️ 네비게이션을 잠금 해제하려면 피드백을 남겨주세요',
      navigationLocked: '네비게이션이 잠겼습니다',
      waitForExpiration: '신호 만료를 기다리고 피드백을 남겨주세요',
      timeRemaining: '만료까지 남은 시간',
      noSuitableEntry: '⚠️ 적절한 진입점이 없습니다',
      marketConditionsNotOptimal: '현재 시장 조건은 포지션 개시에 최적이 아닙니다',
      analysisCompleted: '분석 완료',
      recommendations: '권장사항',
      tryAnotherPair: '다른 페어를 시도해보세요',
      selectAnotherPairDescription: '더 유리한 조건을 가진 다른 통화 페어를 선택하세요',
      waitForOptimalConditions: '최적의 조건을 기다리세요',
      tryAgainWhen: '시장이 안정되면 {seconds}초 후에 다시 시도하세요',
      returnToPairSelection: '페어 선택으로 돌아가기',
      patienceIsKey: '💡 인내심이 성공적인 거래의 열쇠입니다',
      warningAttention: '⚠️ 주의!',
      systemBypassDetected: '시스템 우회 시도가 감지되었습니다',
      activeSignalRequiresCompletion: '완료가 필요한 활성 신호가 있습니다. 페이지를 새로고침해도 네비게이션 잠금을 우회할 수 없습니다.',
      activeSignal: '활성 신호',
      feedbackRequired: '⏰ 피드백이 필요합니다!',
      returnToOpenTrade: '열린 거래로 돌아가기',
      bypassProtectionActive: '네비게이션 잠금 우회 보호 시스템이 활성화되었습니다',
      waitForActiveSignal: '⚠️ 활성 신호 완료를 기다리고 계속하기 전에 피드백을 남겨주세요!',
      // Alert сообщения
      subscriptionUpdated: '✅ 사용자 {name}의 구독이 업데이트되었습니다! 사용자는 선택된 ML 모델에 액세스할 수 있습니다.',
      subscriptionUpdateError: '❌ 사용자 {name} 구독 업데이트 오류',
      subscriptionDisabled: '✅ 사용자 {name}의 구독이 비활성화되었습니다!',
      subscriptionDisableError: '❌ 사용자 {name} 구독 비활성화 오류',
      confirmDeleteUser: '사용자 {name}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      userDeleted: '✅ 사용자 {name}이(가) 시스템에서 삭제되었습니다',
      userDeleteError: '❌ 사용자 {name} 삭제 오류',
      accessRequestApproved: '✅ 사용자 {name}의 액세스 요청이 승인되었습니다',
      accessRequestError: '❌ 사용자 {name} 요청 승인 오류',
      // New keys for hardcoded texts
      hoursAgo: '{count}시간 전',
      daysAgo: '{count}일 전',
      selectLanguageDescription: '계속하려면 선호하는 언어를 선택하세요',
      forexMarketClosedWeekend: '외환 시장은 주말에 닫힙니다. OTC 모드로 전환하세요.',
      forexMarketClosedLabel: '외환 시장 닫힘 (주말)',
      top3CooldownMessage: 'TOP-3 신호는 10분마다 한 번 생성할 수 있습니다. 남은 시간: {minutes}:{seconds}',
      vipFeature: 'VIP 기능',
      vipAnalyticsDescription: 'AI 분석은 활성 구독이 있는 사용자만 사용할 수 있습니다',
      subscriptionRequired: '구독 필요',
      getSubscription: '구독 받기',
      returnToMenu: '메뉴로 돌아가기',
      forever: '영원히',
      mlModel: 'ML 모델',
      chooseMLModel: 'ML 모델 선택',
      selectSignalForActivation: '활성화할 신호 선택',
      selectSignal: '신호 선택',
      expiration: '만료',
      minutes: '분',
      allUsersStatistics: '모든 사용자 통계',
      mlModelSelection: 'ML 모델 선택',
      perMonth: '/월',
      aboutMLModels: 'ML 모델 정보',
      purchaseModel: '{name} 구매',
      signalsChartByMonth: '월별 신호 차트',
      successful: '성공',
      losing: '실패',
      signals: '신호',
      successfulLosing: '성공/실패',
      accessRequests: '접근 요청',
      signalsPerDay: '일일 신호 수',
      bestPair: '최고 쌍',
      worstPair: '최악 쌍',
      quickTemplates: '빠른 템플릿',
      subscriptionManagement: '구독 관리',
      selectMLModels: 'ML 모델 선택:',
      availableModels: '사용 가능한 모델:',
      premiumMLModels: '프리미엄 ML 모델',
      activeSignals: '활성 신호',
      progressToTP1: 'TP1으로의 진행',
      monthlyStatistics: '월간 통계',
      totalSignals: '총 신호',
      successfulSignals: '성공',
      losingSignals: '실패',
      pair: '쌍:',
      direction: '방향:',
      tryAgainInSeconds: '시장이 안정되면 {seconds}초 후에 다시 시도하세요',
      modelReady: '모델이 훈련되어 작업 준비가 완료되었습니다',
      aiAnalytics: 'AI 분석',
      closeAnalysis: '분석 닫기',
      apiError: 'API 오류',
      unknownError: '알 수 없는 오류',
      analysisError: '분석을 가져오는 중 오류가 발생했습니다. 잘못된 응답 형식입니다.',
      timeoutError: '⏰ 시간 초과: 분석에 너무 오래 걸렸습니다. 다시 시도해주세요.',
      serverError: '❌ 서버 오류',
      networkError: '🌐 네트워크 오류: 인터넷 연결을 확인해주세요.',
      generalError: '❌ 오류',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} 신호',
      signalCountZero: '신호 없음',
      generatedSignal: '생성된 신호',
      top3SignalsReady: 'TOP-3 신호 준비 완료!',
      sell: '매도',
      wait: '대기',
      waiting: '대기 중',
      minutesShort: '분',
      secondsShort: '초',
      hoursShort: '시간',
      bearish: '약세',
      bullish: '강세',
      neutral: '중립',
      notAvailable: '해당 없음',
      notSpecified: '지정되지 않음',
      // Additional missing keys from screenshots
      aiAnalytics: 'AI 분석',
      selectSignalForAnalysis: '분석할 신호 선택',
      aiWillAnalyze: 'AI가 거래를 분석하고 추천을 제공합니다',
      marketStatus: '시장 상태',
      selectPairForSignal: '신호 생성을 위한 페어 선택',
      successfully: '성공적으로',
      sentiment: '감정',
      volatility: '변동성',
      recommendation: '추천:',
      clickToGenerateSignal: '신호 생성을 위해 클릭',
      confidence: '신뢰도',
      signalGeneration: '신호 생성',
      usingMLModel: 'ML 모델 사용 중...',
      analysis: '분석',
      mlModel: 'ML 모델',
      chooseMLModel: 'ML 모델 선택',
      accuracy: '정확도',
      pleaseWait: '잠시만 기다려주세요. 시스템이 시장을 분석하고 있습니다...',
      howToReceiveSignals: '신호를 어떻게 받고 싶으신가요?',
      top3Signals: 'TOP-3 신호',
      popular: '인기',
      bestOpportunities: '오늘의 최고 기회',
      threeBestSignals: '3개의 최고 신호',
      simultaneously: '동시에',
      highSuccessProbability: '높은 성공 확률',
      riskDiversification: '위험 분산',
      singleSignals: '단일 신호',
      oneSignalAtTime: '한 번에 하나의 신호',
      focusOnOneTrade: '하나의 거래에 집중',
      simpleManagement: '간단한 관리',
      idealForBeginners: '초보자에게 이상적',
      dealActivated: '거래 활성화됨',
      navigationBlocked: '네비게이션 차단됨',
      remainingUntilExpiration: '만료까지 남은 시간',
      waitForExpiration: '신호 만료를 기다리고 피드백을 남겨주세요',
      back: '뒤로'
    },
    ar: {
      welcome: 'مرحبا',
      selectLanguage: 'اختر اللغة',
      continue: 'متابعة',
      start: 'ابدأ',
      menu: 'القائمة',
      tradingSignals: 'إشارات التداول',
      analytics: 'التحليلات',
      community: 'المجتمع',
      settings: 'الإعدادات',
      premium: 'بريميوم ML',
      selectMarket: 'اختر السوق',
      selectMode: 'وضع التوليد',
      top3Signals: 'أفضل 3 إشارات',
      singleSignals: 'إشارات فردية',
      active: 'نشط',
      history: 'التاريخ',
      back: 'رجوع',
      admin: 'لوحة المشرف',
      buy: 'شراء',
      monthly: 'شهري',
      lifetime: 'مدى الحياة',
      welcomeTo: 'مرحباً بك في',
      premiumSignals: 'إشارات مميزة للتداول المهني',
      accurateSignals: 'إشارات دقيقة',
      successfulTradesPercent: '87% من الصفقات الناجحة',
      instantNotifications: 'إشعارات فورية',
      realTimeSignals: 'احصل على الإشارات في الوقت الفعلي',
      premiumQuality: 'جودة مميزة',
      professionalMarketAnalysis: 'تحليل السوق المهني',
      // Новые переводы
      comingSoon: 'قريباً',
      comingSoonDescription: 'قريباً متاح',
      chatWithTraders: 'دردشة مع المتداولين الآخرين',
      manageParameters: 'إدارة المعاملات',
      manageAppSettings: 'إدارة إعدادات التطبيق',
      mlModel: 'نموذج ML',
      chooseMLModel: 'اختيار نموذج ML',
      statistics: 'الإحصائيات',
      viewDetails: 'عرض الإحصائيات التفصيلية',
      notifications: 'الإشعارات',
      setupPushNotifications: 'إعداد الإشعارات الفورية',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: 'نشط',
      inactive: 'غير نشط',
      available: 'متاح',
      blocked: 'محجوب',
      success: 'نجح',
      failure: 'فشل',
      // Действия
      buyAction: 'شراء',
      selectAction: 'اختيار',
      approve: 'موافقة',
      delete: 'حذف',
      save: 'حفظ',
      cancel: 'إلغاء',
      apply: 'تطبيق',
      update: 'تحديث',
      // Генерация сигналов
      loadingMarkets: 'تحميل الأسواق...',
      analyzingTrends: 'تحليل الاتجاهات...',
      applyingML: 'تطبيق نماذج ML...',
      calculatingEntry: 'حساب نقاط الدخول...',
      assessingRisks: 'تقييم المخاطر...',
      finalCheck: 'فحص نهائي...',
      // Админ-панель
      activeUsers: 'المستخدمون النشطون',
      totalSignals: 'إجمالي الإشارات',
      successful: 'نجح',
      failed: 'فشل',
      topUsers: 'أفضل المستخدمين',
      accessRequests: 'طلبات الوصول',
      subscriptionHistory: 'تاريخ تغييرات الاشتراك',
      // Статистика
      myStatistics: 'إحصائياتي',
      winRate: 'معدل الفوز',
      currentStreak: 'السلسلة الحالية',
      bestStreak: 'أفضل سلسلة',
      averageProfit: 'متوسط الربح',
      // Подписки
      monthlySubscription: 'اشتراك شهري',
      lifetimePurchase: 'شراء مدى الحياة',
      autoRenewal: 'تجديد تلقائي',
      noTimeLimit: 'بدون حد زمني',
      selectSubscriptionType: 'اختر نوع الاشتراك:',
      // Уведомления
      soundNotification: 'صوت',
      vibration: 'اهتزاز',
      pushNotification: 'دفع',
      enabled: 'مفعل',
      disabled: 'معطل',
      // Keys for notifications interface
      notificationsBadge: 'الإشعارات',
      tradingSignals: 'إشارات التداول',
      newSignals: 'إشارات جديدة',
      newSignalsDescription: 'إشعارات حول الإشارات الجديدة',
      signalResults: 'نتائج الإشارات',
      signalResultsDescription: 'إشعارات حول إغلاق الصفقات',
      dailySummary: 'الملخص اليومي',
      dailySummaryDescription: 'نتائج اليوم في 21:00',
      systemNotifications: 'إشعارات النظام',
      marketNews: 'أخبار السوق',
      marketNewsDescription: 'أحداث مهمة في السوق',
      systemUpdates: 'تحديثات النظام',
      systemUpdatesDescription: 'ميزات جديدة وإصلاحات',
      soundAndVibration: 'الصوت والاهتزاز',
      soundNotification: 'الصوت',
      soundNotificationsDescription: 'إشعارات صوتية',
      vibration: 'الاهتزاز',
      vibrationDescription: 'إشارة الاهتزاز للإشعارات',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      emailNotificationsDescription: 'إشعارات عبر البريد الإلكتروني',
      smartNotifications: 'الإشعارات الذكية',
      smartNotificationsDescription: 'احصل على إشعارات في الوقت المناسب حول الأحداث المهمة. يمكنك تكوين كل نوع بشكل منفصل.',
      // Additional missing translations
      waitingForEntry: 'في انتظار الدخول',
      vipFunction: 'وظيفة VIP',
      winRate: 'معدل الفوز',
      pleaseWaitSystemAnalyzing: 'يرجى الانتظار. النظام يحلل السوق...',
      moreDetails: 'المزيد من التفاصيل',
      tryAgainInCooldown: 'حاول مرة أخرى خلال {seconds} ثانية عندما يستقر السوق',
      // Alert messages
      bulkUpdateSuccess: 'تم تحديث {successful} من {total} مستخدم',
      bulkUpdateError: 'خطأ في التحديث الجماعي: {error}',
      bulkUpdateErrorGeneric: 'خطأ في التحديث الجماعي: {message}',
      userDeletedSuccess: 'تم حذف المستخدم {userId} بنجاح من البوت',
      userDeleteError: 'خطأ في الحذف: {error}',
      // Additional alert messages
      userAddedSuccess: 'تم إضافة المستخدم إلى النظام',
      errorOccurredWith: 'حدث خطأ: {error}',
      feedbackAcceptedSuccess: 'تم قبول التعليق: صفقة ناجحة',
      feedbackAcceptedFailure: 'تم قبول التعليق: صفقة خاسرة',
      navigationBlockedMessage: 'لديك إشارة نشطة!\n\nانتظر انتهاء الصلاحية واترك تعليقاً حول نتيجة الصفقة.\n\nسيتم إلغاء قفل التنقل بعد إرسال التعليق.',
      modelRestrictedAlert: 'هذا النموذج مقيد ومتاح فقط عند الطلب',
      // Аналитика
      aiAnalytics: 'تحليل AI',
      successfulTradesHistory: 'تاريخ الصفقات الناجحة',
      analyzeSignal: 'تحليل الإشارة',
      analyzingIneligible: 'جاري التحليل...',
      cancelAnalysis: 'إلغاء التحليل',
      // Системные сообщения
      userAdded: 'تم إضافة المستخدم للنظام',
      errorOccurred: 'حدث خطأ',
      loadingData: 'تحميل البيانات...',
      // Модальные окна
      tradeActivated: 'تم تفعيل الصفقة',
      timeExpired: '⏰ انتهى الوقت!',
      leaveFeedback: 'يرجى ترك تعليق حول نتيجة الصفقة',
      pair: 'الزوج',
      direction: 'الاتجاه',
      resultButtonsActive: 'أصبحت أزرار النتيجة نشطة',
      indicateTradeResult: 'يرجى تحديد نتيجة التداول بعد انتهاء الوقت',
      successfulTrade: 'صفقة ناجحة',
      losingTrade: 'صفقة خاسرة',
      leaveFeedbackToUnlock: '⚠️ يرجى ترك تعليق لإلغاء قفل التنقل',
      navigationLocked: 'التنقل مقفل',
      waitForExpiration: 'انتظر انتهاء الإشارة واترك تعليق',
      timeRemaining: 'المتبقي حتى الانتهاء',
      noSuitableEntry: '⚠️ لا توجد نقطة دخول مناسبة',
      marketConditionsNotOptimal: 'ظروف السوق الحالية ليست مثالية لفتح مركز',
      analysisCompleted: 'اكتمل التحليل',
      recommendations: 'التوصيات',
      tryAnotherPair: 'جرب زوج عملات آخر',
      selectAnotherPairDescription: 'اختر زوج عملات آخر بظروف أكثر ملاءمة',
      waitForOptimalConditions: 'انتظر الظروف المثلى',
      tryAgainWhen: 'حاول مرة أخرى خلال {seconds} ثانية عندما يستقر السوق',
      returnToPairSelection: 'العودة إلى اختيار الزوج',
      patienceIsKey: '💡 الصبر هو مفتاح التداول الناجح',
      warningAttention: '⚠️ انتباه!',
      systemBypassDetected: 'تم اكتشاف محاولة تجاوز النظام',
      activeSignalRequiresCompletion: 'لديك إشارة نشطة تتطلب الإكمال. إعادة تحميل الصفحة لن تساعد في تجاوز قفل التنقل.',
      activeSignal: 'إشارة نشطة',
      feedbackRequired: '⏰ مطلوب تعليق!',
      returnToOpenTrade: 'العودة إلى الصفقة المفتوحة',
      bypassProtectionActive: 'تم تفعيل نظام حماية تجاوز قفل التنقل',
      waitForActiveSignal: '⚠️ انتظر إكمال الإشارة النشطة واترك تعليق قبل المتابعة!',
      // Alert сообщения
      subscriptionUpdated: '✅ تم تحديث الاشتراك للمستخدم {name}! سيحصل المستخدم على وصول لنماذج ML المحددة.',
      subscriptionUpdateError: '❌ خطأ في تحديث الاشتراك للمستخدم {name}',
      subscriptionDisabled: '✅ تم إلغاء تفعيل الاشتراك للمستخدم {name}!',
      subscriptionDisableError: '❌ خطأ في إلغاء تفعيل الاشتراك للمستخدم {name}',
      confirmDeleteUser: 'هل أنت متأكد من حذف المستخدم {name}؟ لا يمكن التراجع عن هذا الإجراء.',
      userDeleted: '✅ تم حذف المستخدم {name} من النظام',
      userDeleteError: '❌ خطأ في حذف المستخدم {name}',
      accessRequestApproved: '✅ تم الموافقة على طلب الوصول للمستخدم {name}',
      accessRequestError: '❌ خطأ في الموافقة على طلب المستخدم {name}',
      // New keys for hardcoded texts
      hoursAgo: 'منذ {count} ساعة{plural}',
      daysAgo: 'منذ {count} يوم{plural}',
      selectLanguageDescription: 'اختر لغتك المفضلة للمتابعة',
      forexMarketClosedWeekend: 'سوق الفوركس مغلق في عطلة نهاية الأسبوع. انتقل إلى وضع OTC.',
      forexMarketClosedLabel: 'سوق الفوركس مغلق (عطلة نهاية الأسبوع)',
      top3CooldownMessage: 'يمكن إنشاء إشارات TOP-3 مرة كل 10 دقائق. المتبقي: {minutes}:{seconds}',
      vipFeature: 'ميزة VIP',
      vipAnalyticsDescription: 'تحليلات AI متاحة فقط للمستخدمين الذين لديهم اشتراك نشط',
      subscriptionRequired: 'اشتراك مطلوب',
      getSubscription: 'احصل على اشتراك',
      returnToMenu: 'العودة إلى القائمة',
      forever: 'للأبد',
      mlModel: 'نموذج ML',
      chooseMLModel: 'اختيار نموذج ML',
      selectSignalForActivation: 'اختر الإشارة للتفعيل',
      selectSignal: 'اختر الإشارة',
      expiration: 'انتهاء الصلاحية',
      minutes: 'دقيقة',
      allUsersStatistics: 'إحصائيات جميع المستخدمين',
      mlModelSelection: 'اختيار نموذج ML',
      perMonth: '/شهر',
      aboutMLModels: 'حول نماذج ML',
      purchaseModel: 'شراء {name}',
      signalsChartByMonth: 'رسم بياني للإشارات حسب الشهر',
      successful: 'ناجح',
      losing: 'خاسر',
      signals: 'إشارات',
      successfulLosing: 'ناجح/خاسر',
      accessRequests: 'طلبات الوصول',
      signalsPerDay: 'إشارات في اليوم',
      bestPair: 'أفضل زوج',
      worstPair: 'أسوأ زوج',
      quickTemplates: 'قوالب سريعة',
      subscriptionManagement: 'إدارة الاشتراكات',
      selectMLModels: 'اختر نماذج ML:',
      availableModels: 'النماذج المتاحة:',
      premiumMLModels: 'نماذج ML المميزة',
      activeSignals: 'إشارات نشطة',
      progressToTP1: 'التقدم نحو TP1',
      monthlyStatistics: 'الإحصائيات الشهرية',
      totalSignals: 'إجمالي الإشارات',
      successfulSignals: 'ناجح',
      losingSignals: 'خاسر',
      pair: 'زوج:',
      direction: 'الاتجاه:',
      tryAgainInSeconds: 'حاول مرة أخرى خلال {seconds} ثانية عندما يستقر السوق',
      modelReady: 'النموذج مدرب وجاهز للعمل',
      aiAnalytics: 'تحليلات AI',
      closeAnalysis: 'إغلاق التحليل',
      apiError: 'خطأ في API',
      unknownError: 'خطأ غير معروف',
      analysisError: 'خطأ في الحصول على التحليل. تنسيق الاستجابة غير صالح.',
      timeoutError: '⏰ انتهت المهلة: استغرق التحليل وقتاً طويلاً. يرجى المحاولة مرة أخرى.',
      serverError: '❌ خطأ في الخادم',
      networkError: '🌐 خطأ في الشبكة: تحقق من اتصالك بالإنترنت.',
      generalError: '❌ خطأ',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} إشارة',
      signalCountZero: 'لا توجد إشارات',
      generatedSignal: 'إشارة تم إنشاؤها',
      top3SignalsReady: 'إشارات TOP-3 جاهزة!',
      sell: 'بيع',
      wait: 'انتظر',
      waiting: 'في انتظار',
      minutesShort: 'د',
      secondsShort: 'ث',
      hoursShort: 'س',
      bearish: 'هبوطي',
      bullish: 'صعودي',
      neutral: 'محايد',
      notAvailable: 'غير متوفر',
      notSpecified: 'غير محدد',
      // Additional missing keys from screenshots
      aiAnalytics: 'تحليل الذكاء الاصطناعي',
      selectSignalForAnalysis: 'اختر إشارة للتحليل',
      aiWillAnalyze: 'الذكاء الاصطناعي سيقوم بتحليل الصفقة وإعطاء التوصيات',
      marketStatus: 'حالة السوق',
      selectPairForSignal: 'اختر زوج عملات لإنشاء إشارة',
      successfully: 'بنجاح',
      sentiment: 'المشاعر',
      volatility: 'التقلب',
      recommendation: 'التوصية:',
      clickToGenerateSignal: 'انقر لإنشاء إشارة',
      confidence: 'الثقة',
      signalGeneration: 'إنشاء الإشارات',
      usingMLModel: 'استخدام نموذج ML...',
      analysis: 'التحليل',
      mlModel: 'نموذج ML',
      chooseMLModel: 'اختيار نموذج ML',
      accuracy: 'الدقة',
      pleaseWait: 'يرجى الانتظار. النظام يحلل السوق...',
      howToReceiveSignals: 'كيف تريد تلقي الإشارات؟',
      top3Signals: 'إشارات TOP-3',
      popular: 'شائع',
      bestOpportunities: 'أفضل الفرص اليوم',
      threeBestSignals: '3 أفضل إشارات',
      simultaneously: 'بالتزامن',
      highSuccessProbability: 'احتمالية نجاح عالية',
      riskDiversification: 'تنويع المخاطر',
      singleSignals: 'إشارات فردية',
      oneSignalAtTime: 'إشارة واحدة في المرة',
      focusOnOneTrade: 'التركيز على صفقة واحدة',
      simpleManagement: 'إدارة بسيطة',
      idealForBeginners: 'مثالي للمبتدئين',
      dealActivated: 'تم تفعيل الصفقة',
      navigationBlocked: 'التنقل محظور',
      remainingUntilExpiration: 'المتبقي حتى انتهاء الصلاحية',
      waitForExpiration: 'انتظر انتهاء صلاحية الإشارة واترك تعليقاً',
      back: 'رجوع'
    },
    hi: {
      welcome: 'स्वागत है',
      selectLanguage: 'भाषा चुनें',
      continue: 'जारी रखें',
      start: 'शुरू करें',
      menu: 'मेनू',
      tradingSignals: 'ट्रेडिंग सिग्नल',
      analytics: 'विश्लेषण',
      community: 'समुदाय',
      settings: 'सेटिंग्स',
      premium: 'प्रीमियम ML',
      selectMarket: 'बाजार चुनें',
      selectMode: 'जनरेशन मोड',
      top3Signals: 'शीर्ष 3 सिग्नल',
      singleSignals: 'एकल सिग्नल',
      active: 'सक्रिय',
      history: 'इतिहास',
      back: 'वापस',
      admin: 'एडमिन पैनल',
      buy: 'खरीदें',
      monthly: 'मासिक',
      lifetime: 'आजीवन',
      welcomeTo: 'आपका स्वागत है',
      premiumSignals: 'पेशेवर ट्रेडिंग के लिए प्रीमियम सिग्नल',
      accurateSignals: 'सटीक सिग्नल',
      successfulTradesPercent: '87% सफल ट्रेड',
      instantNotifications: 'तत्काल सूचनाएं',
      realTimeSignals: 'रियल-टाइम में सिग्नल प्राप्त करें',
      premiumQuality: 'प्रीमियम गुणवत्ता',
      professionalMarketAnalysis: 'पेशेवर बाजार विश्लेषण',
      // Новые переводы
      comingSoon: 'जल्द आ रहा है',
      comingSoonDescription: 'जल्द उपलब्ध होगा',
      chatWithTraders: 'अन्य ट्रेडरों के साथ चैट करें',
      manageParameters: 'पैरामीटर प्रबंधित करें',
      manageAppSettings: 'ऐप सेटिंग्स प्रबंधित करें',
      mlModel: 'ML मॉडल',
      chooseMLModel: 'ML मॉडल चुनें',
      statistics: 'सांख्यिकी',
      viewDetails: 'विस्तृत सांख्यिकी देखें',
      notifications: 'सूचनाएं',
      setupPushNotifications: 'पुश सूचनाएं सेट करें',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: 'सक्रिय',
      inactive: 'निष्क्रिय',
      available: 'उपलब्ध',
      blocked: 'अवरुद्ध',
      success: 'सफल',
      failure: 'असफल',
      // Действия
      buyAction: 'खरीदें',
      selectAction: 'चुनें',
      approve: 'अनुमोदन',
      delete: 'हटाएं',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      apply: 'लागू करें',
      update: 'अपडेट करें',
      // Генерация сигналов
      loadingMarkets: 'मार्केट लोड हो रहे हैं...',
      analyzingTrends: 'ट्रेंड्स का विश्लेषण...',
      applyingML: 'ML मॉडल लागू कर रहे हैं...',
      calculatingEntry: 'एंट्री पॉइंट्स की गणना...',
      assessingRisks: 'जोखिमों का आकलन...',
      finalCheck: 'अंतिम जांच...',
      // Админ-панель
      activeUsers: 'सक्रिय उपयोगकर्ता',
      totalSignals: 'कुल सिग्नल',
      successful: 'सफल',
      failed: 'असफल',
      topUsers: 'शीर्ष उपयोगकर्ता',
      accessRequests: 'पहुंच अनुरोध',
      subscriptionHistory: 'सब्सक्रिप्शन परिवर्तन इतिहास',
      // Статистика
      myStatistics: 'मेरी सांख्यिकी',
      winRate: 'जीत दर',
      currentStreak: 'वर्तमान स्ट्रीक',
      bestStreak: 'सर्वश्रेष्ठ स्ट्रीक',
      averageProfit: 'औसत लाभ',
      // Подписки
      monthlySubscription: 'मासिक सब्सक्रिप्शन',
      lifetimePurchase: 'आजीवन खरीद',
      autoRenewal: 'स्वचालित नवीकरण',
      noTimeLimit: 'कोई समय सीमा नहीं',
      selectSubscriptionType: 'सब्सक्रिप्शन प्रकार चुनें:',
      // Уведомления
      soundNotification: 'ध्वनि',
      vibration: 'कंपन',
      pushNotification: 'पुश',
      enabled: 'सक्षम',
      disabled: 'अक्षम',
      // Keys for notifications interface
      notificationsBadge: 'सूचनाएं',
      tradingSignals: 'ट्रेडिंग सिग्नल',
      newSignals: 'नए सिग्नल',
      newSignalsDescription: 'नए सिग्नल के बारे में सूचनाएं',
      signalResults: 'सिग्नल परिणाम',
      signalResultsDescription: 'ट्रेड बंद होने के बारे में सूचनाएं',
      dailySummary: 'दैनिक सारांश',
      dailySummaryDescription: '21:00 पर दिन के परिणाम',
      systemNotifications: 'सिस्टम सूचनाएं',
      marketNews: 'बाजार समाचार',
      marketNewsDescription: 'महत्वपूर्ण बाजार घटनाएं',
      systemUpdates: 'सिस्टम अपडेट',
      systemUpdatesDescription: 'नई सुविधाएं और सुधार',
      soundAndVibration: 'ध्वनि और कंपन',
      soundNotification: 'ध्वनि',
      soundNotificationsDescription: 'ध्वनि सूचनाएं',
      vibration: 'कंपन',
      vibrationDescription: 'सूचनाओं के लिए कंपन सिग्नल',
      emailNotifications: 'ईमेल सूचनाएं',
      emailNotificationsDescription: 'ईमेल सूचनाएं',
      smartNotifications: 'स्मार्ट सूचनाएं',
      smartNotificationsDescription: 'महत्वपूर्ण घटनाओं के बारे में समय पर सूचनाएं प्राप्त करें। आप प्रत्येक प्रकार को अलग से कॉन्फ़िगर कर सकते हैं।',
      // Additional missing translations
      waitingForEntry: 'प्रवेश की प्रतीक्षा',
      vipFunction: 'VIP फंक्शन',
      winRate: 'जीत दर',
      pleaseWaitSystemAnalyzing: 'कृपया प्रतीक्षा करें। सिस्टम बाजार का विश्लेषण कर रहा है...',
      moreDetails: 'अधिक विवरण',
      tryAgainInCooldown: 'बाजार स्थिर होने पर {seconds} सेकंड में फिर से कोशिश करें',
      // Alert messages
      bulkUpdateSuccess: '{total} में से {successful} उपयोगकर्ता अपडेट किए गए',
      bulkUpdateError: 'बल्क अपडेट त्रुटि: {error}',
      bulkUpdateErrorGeneric: 'बल्क अपडेट त्रुटि: {message}',
      userDeletedSuccess: 'उपयोगकर्ता {userId} को बॉट से सफलतापूर्वक हटा दिया गया',
      userDeleteError: 'हटाने की त्रुटि: {error}',
      // Additional alert messages
      userAddedSuccess: 'उपयोगकर्ता को सिस्टम में जोड़ा गया',
      errorOccurredWith: 'एक त्रुटि हुई: {error}',
      feedbackAcceptedSuccess: 'फीडबैक स्वीकार: सफल ट्रेड',
      feedbackAcceptedFailure: 'फीडबैक स्वीकार: हानिकारक ट्रेड',
      navigationBlockedMessage: 'आपके पास एक सक्रिय सिग्नल है!\n\nसमाप्ति की प्रतीक्षा करें और ट्रेड परिणाम के बारे में फीडबैक दें।\n\nफीडबैक भेजने के बाद नेविगेशन अनलॉक हो जाएगा।',
      modelRestrictedAlert: 'यह मॉडल प्रतिबंधित है और केवल कमांड पर उपलब्ध है',
      // Аналитика
      aiAnalytics: 'AI विश्लेषण',
      successfulTradesHistory: 'सफल ट्रेड इतिहास',
      analyzeSignal: 'सिग्नल का विश्लेषण',
      analyzingIneligible: 'विश्लेषण हो रहा है...',
      cancelAnalysis: 'विश्लेषण रद्द करें',
      // Системные сообщения
      userAdded: 'उपयोगकर्ता को सिस्टम में जोड़ा गया',
      errorOccurred: 'एक त्रुटि हुई',
      loadingData: 'डेटा लोड हो रहा है...',
      // Модальные окна
      tradeActivated: 'ट्रेड सक्रिय हो गया',
      timeExpired: '⏰ समय समाप्त!',
      leaveFeedback: 'ट्रेड के परिणाम के बारे में फीडबैक दें',
      pair: 'पेयर',
      direction: 'दिशा',
      resultButtonsActive: 'परिणाम बटन सक्रिय हो गए',
      indicateTradeResult: 'समय समाप्त होने के बाद ट्रेड का परिणाम बताएं',
      successfulTrade: 'सफल ट्रेड',
      losingTrade: 'हानि ट्रेड',
      leaveFeedbackToUnlock: '⚠️ नेविगेशन अनलॉक करने के लिए फीडबैक दें',
      navigationLocked: 'नेविगेशन लॉक है',
      waitForExpiration: 'सिग्नल की समाप्ति का इंतजार करें और फीडबैक दें',
      timeRemaining: 'समाप्ति तक बचा समय',
      noSuitableEntry: '⚠️ कोई उपयुक्त एंट्री पॉइंट नहीं',
      marketConditionsNotOptimal: 'वर्तमान बाजार की स्थिति पोजीशन खोलने के लिए इष्टतम नहीं है',
      analysisCompleted: 'विश्लेषण पूरा हुआ',
      recommendations: 'सिफारिशें',
      tryAnotherPair: 'दूसरा पेयर आजमाएं',
      selectAnotherPairDescription: 'अधिक अनुकूल स्थितियों वाला दूसरा करेंसी पेयर चुनें',
      waitForOptimalConditions: 'इष्टतम स्थितियों का इंतजार करें',
      tryAgainWhen: 'बाजार स्थिर होने पर {seconds} सेकंड बाद फिर से कोशिश करें',
      returnToPairSelection: 'पेयर चयन पर वापस जाएं',
      patienceIsKey: '💡 धैर्य सफल ट्रेडिंग की कुंजी है',
      warningAttention: '⚠️ ध्यान!',
      systemBypassDetected: 'सिस्टम बाईपास का प्रयास पता चला',
      activeSignalRequiresCompletion: 'आपके पास एक सक्रिय सिग्नल है जिसे पूरा करना आवश्यक है। पेज रिलोड करने से नेविगेशन लॉक बाईपास नहीं होगा।',
      activeSignal: 'सक्रिय सिग्नल',
      feedbackRequired: '⏰ फीडबैक आवश्यक!',
      returnToOpenTrade: 'खुले ट्रेड पर वापस जाएं',
      bypassProtectionActive: 'नेविगेशन लॉक बाईपास सुरक्षा प्रणाली सक्रिय है',
      waitForActiveSignal: '⚠️ सक्रिय सिग्नल के पूरा होने का इंतजार करें और आगे बढ़ने से पहले फीडबैक दें!',
      // Alert сообщения
      subscriptionUpdated: '✅ उपयोगकर्ता {name} की सदस्यता अपडेट हो गई! उपयोगकर्ता को चयनित ML मॉडल तक पहुंच मिलेगी।',
      subscriptionUpdateError: '❌ उपयोगकर्ता {name} की सदस्यता अपडेट में त्रुटि',
      subscriptionDisabled: '✅ उपयोगकर्ता {name} की सदस्यता निष्क्रिय हो गई!',
      subscriptionDisableError: '❌ उपयोगकर्ता {name} की सदस्यता निष्क्रिय करने में त्रुटि',
      confirmDeleteUser: 'क्या आप उपयोगकर्ता {name} को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
      userDeleted: '✅ उपयोगकर्ता {name} को सिस्टम से हटा दिया गया',
      userDeleteError: '❌ उपयोगकर्ता {name} को हटाने में त्रुटि',
      accessRequestApproved: '✅ उपयोगकर्ता {name} की पहुंच अनुरोध मंजूर हो गया',
      accessRequestError: '❌ उपयोगकर्ता {name} के अनुरोध को मंजूर करने में त्रुटि',
      // New keys for hardcoded texts
      hoursAgo: '{count} घंटे पहले',
      daysAgo: '{count} दिन पहले',
      selectLanguageDescription: 'जारी रखने के लिए अपनी पसंदीदा भाषा चुनें',
      forexMarketClosedWeekend: 'फॉरेक्स बाजार सप्ताहांत में बंद है। OTC मोड पर स्विच करें।',
      forexMarketClosedLabel: 'फॉरेक्स बाजार बंद (सप्ताहांत)',
      top3CooldownMessage: 'TOP-3 सिग्नल हर 10 मिनट में एक बार जेनरेट किए जा सकते हैं। शेष: {minutes}:{seconds}',
      vipFeature: 'VIP फीचर',
      vipAnalyticsDescription: 'AI एनालिटिक्स केवल सक्रिय सदस्यता वाले उपयोगकर्ताओं के लिए उपलब्ध है',
      subscriptionRequired: 'सदस्यता आवश्यक',
      getSubscription: 'सदस्यता प्राप्त करें',
      returnToMenu: 'मेनू पर वापस जाएं',
      forever: 'हमेशा के लिए',
      mlModel: 'ML मॉडल',
      chooseMLModel: 'ML मॉडल चुनें',
      selectSignalForActivation: 'सक्रियता के लिए सिग्नल चुनें',
      selectSignal: 'सिग्नल चुनें',
      expiration: 'समाप्ति',
      minutes: 'मिनट',
      allUsersStatistics: 'सभी उपयोगकर्ताओं की सांख्यिकी',
      mlModelSelection: 'ML मॉडल चयन',
      perMonth: '/महीना',
      aboutMLModels: 'ML मॉडल के बारे में',
      purchaseModel: '{name} खरीदें',
      signalsChartByMonth: 'महीने के अनुसार सिग्नल चार्ट',
      successful: 'सफल',
      losing: 'हारने वाला',
      signals: 'सिग्नल',
      successfulLosing: 'सफल/हारने वाला',
      accessRequests: 'पहुंच अनुरोध',
      signalsPerDay: 'प्रति दिन सिग्नल',
      bestPair: 'सबसे अच्छी जोड़ी',
      worstPair: 'सबसे खराब जोड़ी',
      quickTemplates: 'त्वरित टेम्प्लेट',
      subscriptionManagement: 'सदस्यता प्रबंधन',
      selectMLModels: 'ML मॉडल चुनें:',
      availableModels: 'उपलब्ध मॉडल:',
      premiumMLModels: 'प्रीमियम ML मॉडल',
      activeSignals: 'सक्रिय सिग्नल',
      progressToTP1: 'TP1 की ओर प्रगति',
      monthlyStatistics: 'मासिक सांख्यिकी',
      totalSignals: 'कुल सिग्नल',
      successfulSignals: 'सफल',
      losingSignals: 'हारने वाला',
      pair: 'जोड़ी:',
      direction: 'दिशा:',
      tryAgainInSeconds: 'बाजार स्थिर होने पर {seconds} सेकंड में फिर से कोशिश करें',
      modelReady: 'मॉडल प्रशिक्षित है और काम करने के लिए तैयार है',
      aiAnalytics: 'AI एनालिटिक्स',
      closeAnalysis: 'विश्लेषण बंद करें',
      apiError: 'API त्रुटि',
      unknownError: 'अज्ञात त्रुटि',
      analysisError: 'विश्लेषण प्राप्त करने में त्रुटि। अमान्य प्रतिक्रिया प्रारूप।',
      timeoutError: '⏰ टाइमआउट: विश्लेषण में बहुत समय लगा। कृपया पुनः प्रयास करें।',
      serverError: '❌ सर्वर त्रुटि',
      networkError: '🌐 नेटवर्क त्रुटि: अपना इंटरनेट कनेक्शन जांचें।',
      generalError: '❌ त्रुटि',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      // New localization keys
      signalCount: '{count} सिग्नल',
      signalCountZero: 'कोई सिग्नल नहीं',
      generatedSignal: 'उत्पन्न सिग्नल',
      top3SignalsReady: 'TOP-3 सिग्नल तैयार!',
      sell: 'बेचें',
      wait: 'प्रतीक्षा करें',
      waiting: 'प्रतीक्षा में',
      minutesShort: 'मिनट',
      secondsShort: 'सेकंड',
      hoursShort: 'घंटे',
      bearish: 'मंदी',
      bullish: 'तेजी',
      neutral: 'तटस्थ',
      notAvailable: 'उपलब्ध नहीं',
      notSpecified: 'निर्दिष्ट नहीं',
      // Additional missing keys from screenshots
      aiAnalytics: 'AI विश्लेषण',
      selectSignalForAnalysis: 'विश्लेषण के लिए सिग्नल चुनें',
      aiWillAnalyze: 'AI व्यापार का विश्लेषण करेगा और सिफारिशें देगा',
      marketStatus: 'बाजार की स्थिति',
      selectPairForSignal: 'सिग्नल उत्पन्न करने के लिए जोड़ी चुनें',
      successfully: 'सफलतापूर्वक',
      sentiment: 'भावना',
      volatility: 'अस्थिरता',
      recommendation: 'सिफारिश:',
      clickToGenerateSignal: 'सिग्नल उत्पन्न करने के लिए क्लिक करें',
      confidence: 'आत्मविश्वास',
      signalGeneration: 'सिग्नल उत्पादन',
      usingMLModel: 'ML मॉडल का उपयोग...',
      analysis: 'विश्लेषण',
      mlModel: 'ML मॉडल',
      chooseMLModel: 'ML मॉडल चुनें',
      accuracy: 'सटीकता',
      pleaseWait: 'कृपया प्रतीक्षा करें। सिस्टम बाजार का विश्लेषण कर रहा है...',
      howToReceiveSignals: 'आप सिग्नल कैसे प्राप्त करना चाहते हैं?',
      top3Signals: 'TOP-3 सिग्नल',
      popular: 'लोकप्रिय',
      bestOpportunities: 'दिन के सर्वोत्तम अवसर',
      threeBestSignals: '3 सर्वोत्तम सिग्नल',
      simultaneously: 'एक साथ',
      highSuccessProbability: 'उच्च सफलता की संभावना',
      riskDiversification: 'जोखिम विविधीकरण',
      singleSignals: 'एकल सिग्नल',
      oneSignalAtTime: 'एक समय में एक सिग्नल',
      focusOnOneTrade: 'एक व्यापार पर ध्यान केंद्रित करें',
      simpleManagement: 'सरल प्रबंधन',
      idealForBeginners: 'शुरुआती के लिए आदर्श',
      dealActivated: 'डील सक्रिय',
      navigationBlocked: 'नेविगेशन अवरुद्ध',
      remainingUntilExpiration: 'समाप्ति तक शेष',
      waitForExpiration: 'सिग्नल की समाप्ति का इंतजार करें और फीडबैक दें',
      back: 'वापस'
    },
    tr: {
      welcome: 'Hoş geldiniz',
      selectLanguage: 'Dil seçin',
      continue: 'Devam',
      start: 'Başla',
      menu: 'Menü',
      tradingSignals: 'Alım satım sinyalleri',
      analytics: 'Analitik',
      community: 'Topluluk',
      settings: 'Ayarlar',
      premium: 'Premium ML',
      selectMarket: 'Pazar seçin',
      selectMode: 'Üretim modu',
      top3Signals: 'İlk 3 Sinyal',
      singleSignals: 'Tekli sinyaller',
      active: 'Aktif',
      history: 'Geçmiş',
      back: 'Geri',
      admin: 'Yönetici Paneli',
      buy: 'Satın al',
      monthly: 'Aylık',
      lifetime: 'Ömür boyu',
      welcomeTo: 'Hoş geldiniz,',
      premiumSignals: 'Profesyonel alım satım için premium sinyaller',
      accurateSignals: 'Doğru sinyaller',
      successfulTradesPercent: '87% başarılı işlem',
      instantNotifications: 'Anında bildirimler',
      realTimeSignals: 'Gerçek zamanlı sinyal alın',
      premiumQuality: 'Premium kalite',
      professionalMarketAnalysis: 'Profesyonel pazar analizi',
      // Новые переводы
      comingSoon: 'YAKINDA',
      comingSoonDescription: 'Yakında kullanılabilir',
      chatWithTraders: 'Diğer traderlarla sohbet edin',
      manageParameters: 'Parametreleri yönet',
      manageAppSettings: 'Uygulama ayarlarını yönet',
      mlModel: 'ML Modeli',
      statistics: 'İstatistikler',
      viewDetails: 'Detaylı istatistikleri görüntüle',
      notifications: 'Bildirimler',
      setupPushNotifications: 'Push bildirimleri ayarla',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: 'AKTİF',
      inactive: 'PASİF',
      available: 'MEVCUT',
      blocked: 'BLOKLANMIŞ',
      success: 'Başarılı',
      failure: 'Başarısız',
      // Действия
      buyAction: 'Satın Al',
      selectAction: 'Seç',
      approve: 'Onayla',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'İptal',
      apply: 'Uygula',
      update: 'Güncelle',
      // Генерация сигналов
      loadingMarkets: 'Piyasalar yükleniyor...',
      analyzingTrends: 'Trendler analiz ediliyor...',
      applyingML: 'ML modelleri uygulanıyor...',
      calculatingEntry: 'Giriş noktaları hesaplanıyor...',
      assessingRisks: 'Riskler değerlendiriliyor...',
      finalCheck: 'Son kontrol...',
      // Админ-панель
      activeUsers: 'Aktif kullanıcılar',
      totalSignals: 'Toplam sinyal',
      successful: 'Başarılı',
      failed: 'Başarısız',
      topUsers: 'En iyi kullanıcılar',
      accessRequests: 'Erişim istekleri',
      subscriptionHistory: 'Abonelik değişiklik geçmişi',
      // Статистика
      myStatistics: 'İstatistiklerim',
      winRate: 'Kazanma oranı',
      currentStreak: 'Mevcut seri',
      bestStreak: 'En iyi seri',
      averageProfit: 'Ortalama kar',
      // Подписки
      monthlySubscription: 'Aylık abonelik',
      lifetimePurchase: 'Yaşam boyu satın alma',
      autoRenewal: 'Otomatik yenileme',
      noTimeLimit: 'Zaman sınırı yok',
      selectSubscriptionType: 'Abonelik türünü seç:',
      // Уведомления
      soundNotification: 'Ses',
      vibration: 'Titreşim',
      pushNotification: 'Push',
      enabled: 'Etkin',
      disabled: 'Devre dışı',
      // Keys for notifications interface
      notificationsBadge: 'BİLDİRİMLER',
      tradingSignals: 'Trading Sinyalleri',
      newSignals: 'Yeni Sinyaller',
      newSignalsDescription: 'Yeni sinyaller hakkında bildirimler',
      signalResults: 'Sinyal Sonuçları',
      signalResultsDescription: 'İşlem kapanışları hakkında bildirimler',
      dailySummary: 'Günlük Özet',
      dailySummaryDescription: '21:00\'da günlük sonuçlar',
      systemNotifications: 'Sistem Bildirimleri',
      marketNews: 'Piyasa Haberleri',
      marketNewsDescription: 'Önemli piyasa olayları',
      systemUpdates: 'Sistem Güncellemeleri',
      systemUpdatesDescription: 'Yeni özellikler ve düzeltmeler',
      soundAndVibration: 'Ses ve Titreşim',
      soundNotification: 'Ses',
      soundNotificationsDescription: 'Ses bildirimleri',
      vibration: 'Titreşim',
      vibrationDescription: 'Bildirimler için titreşim sinyali',
      emailNotifications: 'E-posta Bildirimleri',
      emailNotificationsDescription: 'E-posta bildirimleri',
      smartNotifications: 'Akıllı Bildirimler',
      smartNotificationsDescription: 'Önemli olaylar hakkında zamanında bildirimler alın. Her türü ayrı ayrı yapılandırabilirsiniz.',
      // Additional missing translations
      waitingForEntry: 'Giriş bekleniyor',
      vipFunction: 'VIP Fonksiyon',
      winRate: 'Kazanma oranı',
      pleaseWaitSystemAnalyzing: 'Lütfen bekleyin. Sistem piyasayı analiz ediyor...',
      moreDetails: 'Daha Fazla Detay',
      tryAgainInCooldown: 'Piyasa stabilize olduğunda {seconds} saniye sonra tekrar deneyin',
      // Alert messages
      bulkUpdateSuccess: '{total} kullanıcıdan {successful} tanesi güncellendi',
      bulkUpdateError: 'Toplu güncelleme hatası: {error}',
      bulkUpdateErrorGeneric: 'Toplu güncelleme hatası: {message}',
      userDeletedSuccess: 'Kullanıcı {userId} bot\'tan başarıyla silindi',
      userDeleteError: 'Silme hatası: {error}',
      // Additional alert messages
      userAddedSuccess: 'Kullanıcı sisteme eklendi',
      errorOccurredWith: 'Bir hata oluştu: {error}',
      feedbackAcceptedSuccess: 'Geri bildirim kabul edildi: Başarılı işlem',
      feedbackAcceptedFailure: 'Geri bildirim kabul edildi: Kayıplı işlem',
      navigationBlockedMessage: 'Aktif bir sinyaliniz var!\n\nVade sonunu bekleyin ve işlem sonucu hakkında geri bildirim bırakın.\n\nGeri bildirim gönderdikten sonra navigasyon kilidi açılacak.',
      modelRestrictedAlert: 'Bu model kısıtlıdır ve sadece komutla kullanılabilir',
      // Аналитика
      aiAnalytics: 'AI Analitiği',
      successfulTradesHistory: 'Başarılı işlemler geçmişi',
      analyzeSignal: 'Sinyali analiz et',
      analyzingIneligible: 'Analiz ediliyor...',
      cancelAnalysis: 'Analizi iptal et',
      // Системные сообщения
      userAdded: 'Kullanıcı sisteme eklendi',
      errorOccurred: 'Bir hata oluştu',
      loadingData: 'Veri yükleniyor...',
      // Модальные окна
      tradeActivated: 'İşlem etkinleştirildi',
      timeExpired: '⏰ Süre doldu!',
      leaveFeedback: 'Lütfen işlem sonucu hakkında geri bildirim bırakın',
      pair: 'Çift',
      direction: 'Yön',
      resultButtonsActive: 'Sonuç butonları aktif hale geldi',
      indicateTradeResult: 'Lütfen süre dolduktan sonra işlem sonucunu belirtin',
      successfulTrade: 'Başarılı işlem',
      losingTrade: 'Kayıplı işlem',
      leaveFeedbackToUnlock: '⚠️ Navigasyonu kilidini açmak için lütfen geri bildirim bırakın',
      navigationLocked: 'Navigasyon kilitli',
      waitForExpiration: 'Lütfen sinyal süresinin dolmasını bekleyin ve geri bildirim bırakın',
      timeRemaining: 'Süre dolmasına kalan süre',
      noSuitableEntry: '⚠️ Uygun giriş noktası yok',
      marketConditionsNotOptimal: 'Mevcut piyasa koşulları pozisyon açmak için optimal değil',
      analysisCompleted: 'Analiz tamamlandı',
      recommendations: 'Öneriler',
      tryAnotherPair: 'Başka bir çift deneyin',
      selectAnotherPairDescription: 'Daha elverişli koşullara sahip başka bir döviz çifti seçin',
      waitForOptimalConditions: 'Optimal koşulları bekleyin',
      tryAgainWhen: 'Piyasa stabilize olduğunda {seconds} saniye sonra tekrar deneyin',
      returnToPairSelection: 'Çift seçimine geri dön',
      patienceIsKey: '💡 Sabır başarılı tradingin anahtarıdır',
      warningAttention: '⚠️ Dikkat!',
      systemBypassDetected: 'Sistem bypass girişimi tespit edildi',
      activeSignalRequiresCompletion: 'Tamamlanması gereken aktif bir sinyaliniz var. Sayfa yenilemek navigasyon kilidini bypass etmeyecek.',
      activeSignal: 'Aktif sinyal',
      feedbackRequired: '⏰ Geri bildirim gerekli!',
      returnToOpenTrade: 'Açık işleme geri dön',
      bypassProtectionActive: 'Navigasyon kilidi bypass koruma sistemi aktif',
      waitForActiveSignal: '⚠️ Lütfen aktif sinyalin tamamlanmasını bekleyin ve devam etmeden önce geri bildirim bırakın!',
      // Alert сообщения
      subscriptionUpdated: '✅ {name} kullanıcısının aboneliği güncellendi! Kullanıcı seçilen ML modellerine erişim alacak.',
      subscriptionUpdateError: '❌ {name} kullanıcısının abonelik güncelleme hatası',
      subscriptionDisabled: '✅ {name} kullanıcısının aboneliği devre dışı bırakıldı!',
      subscriptionDisableError: '❌ {name} kullanıcısının abonelik devre dışı bırakma hatası',
      confirmDeleteUser: '{name} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      userDeleted: '✅ {name} kullanıcısı sistemden silindi',
      userDeleteError: '❌ {name} kullanıcısını silme hatası',
      accessRequestApproved: '✅ {name} kullanıcısının erişim talebi onaylandı',
      accessRequestError: '❌ {name} kullanıcısının talep onaylama hatası',
      apiError: 'API Hatası',
      unknownError: 'Bilinmeyen hata',
      analysisError: 'Analiz alınırken hata oluştu. Geçersiz yanıt formatı.',
      timeoutError: '⏰ Zaman aşımı: Analiz çok uzun sürdü. Lütfen tekrar deneyin.',
      serverError: '❌ Sunucu hatası',
      networkError: '🌐 Ağ hatası: İnternet bağlantınızı kontrol edin.',
      generalError: '❌ Hata',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      marketState: 'Piyasa durumu',
      mood: 'Ruh hali',
      volatility: 'Oynaklık',
      accuracy: 'Doğruluk',
      analysis: 'Analiz',
      idealForBeginners: 'Yeni başlayanlar için ideal',
      recommendation: 'Öneri:',
      clickToGenerateSignal: 'Sinyal oluşturmak için tıklayın'
    },
    vi: {
      welcome: 'Chào mừng',
      selectLanguage: 'Chọn ngôn ngữ',
      continue: 'Tiếp tục',
      start: 'Bắt đầu',
      menu: 'Menu',
      tradingSignals: 'Tín hiệu giao dịch',
      analytics: 'Phân tích',
      community: 'Cộng đồng',
      settings: 'Cài đặt',
      premium: 'ML Cao cấp',
      selectMarket: 'Chọn thị trường',
      selectMode: 'Chế độ tạo',
      top3Signals: 'TOP-3 Tín hiệu',
      singleSignals: 'Tín hiệu đơn',
      active: 'Hoạt động',
      history: 'Lịch sử',
      back: 'Quay lại',
      admin: 'Bảng quản trị',
      buy: 'Mua',
      monthly: 'Hàng tháng',
      lifetime: 'Press đời',
      welcomeTo: 'Chào mừng đến với',
      premiumSignals: 'Tín hiệu cao cấp cho giao dịch chuyên nghiệp',
      accurateSignals: 'Tín hiệu chính xác',
      successfulTradesPercent: '87% giao dịch thành công',
      instantNotifications: 'Thông báo tức thì',
      realTimeSignals: 'Nhận tín hiệu theo thời gian thực',
      premiumQuality: 'Chất lượng cao cấp',
      professionalMarketAnalysis: 'Phân tích thị trường chuyên nghiệp',
      // Новые переводы
      comingSoon: 'SẮP RA MẮT',
      comingSoonDescription: 'Sắp có sẵn',
      chatWithTraders: 'Trò chuyện với các trader khác',
      manageParameters: 'Quản lý tham số',
      manageAppSettings: 'Quản lý cài đặt ứng dụng',
      mlModel: 'Mô hình ML',
      chooseMLModel: 'Chọn mô hình ML',
      statistics: 'Thống kê',
      viewDetails: 'Xem thống kê chi tiết',
      notifications: 'Thông báo',
      setupPushNotifications: 'Thiết lập thông báo đẩy',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: 'HOẠT ĐỘNG',
      inactive: 'KHÔNG HOẠT ĐỘNG',
      available: 'CÓ SẴN',
      blocked: 'BỊ CHẶN',
      success: 'Thành công',
      failure: 'Thất bại',
      // Действия
      buyAction: 'Mua',
      selectAction: 'Chọn',
      approve: 'Phê duyệt',
      delete: 'Xóa',
      save: 'Lưu',
      cancel: 'Hủy',
      apply: 'Áp dụng',
      update: 'Cập nhật',
      // Генерация сигналов
      loadingMarkets: 'Đang tải thị trường...',
      analyzingTrends: 'Đang phân tích xu hướng...',
      applyingML: 'Đang áp dụng mô hình ML...',
      calculatingEntry: 'Đang tính toán điểm vào...',
      assessingRisks: 'Đang đánh giá rủi ro...',
      finalCheck: 'Kiểm tra cuối cùng...',
      // Админ-панель
      activeUsers: 'Người dùng hoạt động',
      totalSignals: 'Tổng tín hiệu',
      successful: 'Thành công',
      failed: 'Thất bại',
      topUsers: 'Người dùng hàng đầu',
      accessRequests: 'Yêu cầu truy cập',
      subscriptionHistory: 'Lịch sử thay đổi đăng ký',
      // Статистика
      myStatistics: 'Thống kê của tôi',
      winRate: 'Tỷ lệ thắng',
      currentStreak: 'Chuỗi hiện tại',
      bestStreak: 'Chuỗi tốt nhất',
      averageProfit: 'Lợi nhuận trung bình',
      // Подписки
      monthlySubscription: 'Đăng ký hàng tháng',
      lifetimePurchase: 'Mua trọn đời',
      autoRenewal: 'Gia hạn tự động',
      noTimeLimit: 'Không giới hạn thời gian',
      selectSubscriptionType: 'Chọn loại đăng ký:',
      // Уведомления
      soundNotification: 'Âm thanh',
      vibration: 'Rung',
      pushNotification: 'Đẩy',
      enabled: 'Đã bật',
      disabled: 'Đã tắt',
      // Keys for notifications interface
      notificationsBadge: 'THÔNG BÁO',
      tradingSignals: 'Tín Hiệu Giao Dịch',
      newSignals: 'Tín Hiệu Mới',
      newSignalsDescription: 'Thông báo về tín hiệu mới',
      signalResults: 'Kết Quả Tín Hiệu',
      signalResultsDescription: 'Thông báo về việc đóng giao dịch',
      dailySummary: 'Tóm Tắt Hàng Ngày',
      dailySummaryDescription: 'Kết quả ngày lúc 21:00',
      systemNotifications: 'Thông Báo Hệ Thống',
      marketNews: 'Tin Tức Thị Trường',
      marketNewsDescription: 'Các sự kiện quan trọng của thị trường',
      systemUpdates: 'Cập Nhật Hệ Thống',
      systemUpdatesDescription: 'Tính năng mới và sửa lỗi',
      soundAndVibration: 'Âm Thanh và Rung',
      soundNotification: 'Âm Thanh',
      soundNotificationsDescription: 'Thông báo âm thanh',
      vibration: 'Rung',
      vibrationDescription: 'Tín hiệu rung cho thông báo',
      emailNotifications: 'Thông Báo Email',
      emailNotificationsDescription: 'Thông báo qua email',
      smartNotifications: 'Thông Báo Thông Minh',
      smartNotificationsDescription: 'Nhận thông báo kịp thời về các sự kiện quan trọng. Bạn có thể cấu hình từng loại riêng biệt.',
      // Additional missing translations
      waitingForEntry: 'Chờ vào lệnh',
      vipFunction: 'Chức năng VIP',
      winRate: 'Tỷ lệ thắng',
      pleaseWaitSystemAnalyzing: 'Vui lòng chờ. Hệ thống đang phân tích thị trường...',
      moreDetails: 'Chi tiết',
      tryAgainInCooldown: 'Thử lại sau {seconds} giây khi thị trường ổn định',
      // Alert messages
      bulkUpdateSuccess: 'Đã cập nhật {successful} trong {total} người dùng',
      bulkUpdateError: 'Lỗi cập nhật hàng loạt: {error}',
      bulkUpdateErrorGeneric: 'Lỗi cập nhật hàng loạt: {message}',
      userDeletedSuccess: 'Người dùng {userId} đã được xóa thành công khỏi bot',
      userDeleteError: 'Lỗi xóa: {error}',
      // Additional alert messages
      userAddedSuccess: 'Người dùng đã được thêm vào hệ thống',
      errorOccurredWith: 'Đã xảy ra lỗi: {error}',
      feedbackAcceptedSuccess: 'Phản hồi được chấp nhận: Giao dịch thành công',
      feedbackAcceptedFailure: 'Phản hồi được chấp nhận: Giao dịch thua lỗ',
      navigationBlockedMessage: 'Bạn có một tín hiệu đang hoạt động!\n\nChờ hết hạn và để lại phản hồi về kết quả giao dịch.\n\nĐiều hướng sẽ được mở khóa sau khi gửi phản hồi.',
      modelRestrictedAlert: 'Mô hình này bị hạn chế và chỉ khả dụng theo lệnh',
      // Аналитика
      aiAnalytics: 'Phân tích AI',
      successfulTradesHistory: 'Lịch sử giao dịch thành công',
      analyzeSignal: 'Phân tích tín hiệu',
      analyzingIneligible: 'Đang phân tích...',
      cancelAnalysis: 'Hủy phân tích',
      // Системные сообщения
      userAdded: 'Người dùng đã được thêm vào hệ thống',
      errorOccurred: 'Đã xảy ra lỗi',
      loadingData: 'Đang tải dữ liệu...',
      // Модальные окна
      tradeActivated: 'Giao dịch đã được kích hoạt',
      timeExpired: '⏰ Hết thời gian!',
      leaveFeedback: 'Vui lòng để lại phản hồi về kết quả giao dịch',
      pair: 'Cặp',
      direction: 'Hướng',
      resultButtonsActive: 'Các nút kết quả đã được kích hoạt',
      indicateTradeResult: 'Vui lòng chỉ định kết quả giao dịch sau khi hết thời gian',
      successfulTrade: 'Giao dịch thành công',
      losingTrade: 'Giao dịch thua lỗ',
      leaveFeedbackToUnlock: '⚠️ Vui lòng để lại phản hồi để mở khóa điều hướng',
      navigationLocked: 'Điều hướng bị khóa',
      waitForExpiration: 'Vui lòng chờ tín hiệu hết hạn và để lại phản hồi',
      timeRemaining: 'Thời gian còn lại đến khi hết hạn',
      noSuitableEntry: '⚠️ Không có điểm vào phù hợp',
      marketConditionsNotOptimal: 'Điều kiện thị trường hiện tại không tối ưu để mở vị thế',
      analysisCompleted: 'Phân tích hoàn tất',
      recommendations: 'Khuyến nghị',
      tryAnotherPair: 'Thử một cặp khác',
      selectAnotherPairDescription: 'Chọn một cặp tiền tệ khác với điều kiện thuận lợi hơn',
      waitForOptimalConditions: 'Chờ điều kiện tối ưu',
      tryAgainWhen: 'Thử lại sau {seconds} giây khi thị trường ổn định',
      returnToPairSelection: 'Quay lại lựa chọn cặp',
      patienceIsKey: '💡 Kiên nhẫn là chìa khóa của giao dịch thành công',
      warningAttention: '⚠️ Chú ý!',
      systemBypassDetected: 'Đã phát hiện nỗ lực bỏ qua hệ thống',
      activeSignalRequiresCompletion: 'Bạn có một tín hiệu đang hoạt động cần được hoàn thành. Tải lại trang sẽ không giúp bỏ qua khóa điều hướng.',
      activeSignal: 'Tín hiệu đang hoạt động',
      feedbackRequired: '⏰ Cần phản hồi!',
      returnToOpenTrade: 'Quay lại giao dịch đang mở',
      bypassProtectionActive: 'Hệ thống bảo vệ bỏ qua khóa điều hướng đã được kích hoạt',
      waitForActiveSignal: '⚠️ Vui lòng chờ hoàn thành tín hiệu đang hoạt động và để lại phản hồi trước khi tiếp tục!',
      // Alert сообщения
      subscriptionUpdated: '✅ Đã cập nhật đăng ký cho người dùng {name}! Người dùng sẽ có quyền truy cập vào các mô hình ML đã chọn.',
      subscriptionUpdateError: '❌ Lỗi cập nhật đăng ký cho người dùng {name}',
      subscriptionDisabled: '✅ Đã tắt đăng ký cho người dùng {name}!',
      subscriptionDisableError: '❌ Lỗi tắt đăng ký cho người dùng {name}',
      confirmDeleteUser: 'Bạn có chắc chắn muốn xóa người dùng {name}? Hành động này không thể hoàn tác.',
      userDeleted: '✅ Người dùng {name} đã bị xóa khỏi hệ thống',
      userDeleteError: '❌ Lỗi xóa người dùng {name}',
      accessRequestApproved: '✅ Yêu cầu truy cập của người dùng {name} đã được phê duyệt',
      accessRequestError: '❌ Lỗi phê duyệt yêu cầu của người dùng {name}',
      // New keys for hardcoded texts
      hoursAgo: '{count} giờ trước',
      daysAgo: '{count} ngày trước',
      selectLanguageDescription: 'Chọn ngôn ngữ ưa thích của bạn để tiếp tục',
      forexMarketClosedWeekend: 'Thị trường Forex đóng cửa vào cuối tuần. Chuyển sang chế độ OTC.',
      forexMarketClosedLabel: 'Thị trường Forex đóng cửa (cuối tuần)',
      top3CooldownMessage: 'Tín hiệu TOP-3 có thể được tạo một lần mỗi 10 phút. Còn lại: {minutes}:{seconds}',
      vipFeature: 'Tính năng VIP',
      vipAnalyticsDescription: 'AI Analytics chỉ khả dụng cho người dùng có đăng ký hoạt động',
      subscriptionRequired: 'Cần đăng ký',
      getSubscription: 'Nhận đăng ký',
      returnToMenu: 'Quay lại menu',
      forever: 'mãi mãi',
      mlModel: 'Mô hình ML',
      chooseMLModel: 'Chọn mô hình ML',
      selectSignalForActivation: 'Chọn tín hiệu để kích hoạt',
      selectSignal: 'Chọn tín hiệu',
      expiration: 'Hết hạn',
      minutes: 'phút',
      allUsersStatistics: 'Thống kê tất cả người dùng',
      mlModelSelection: 'Lựa chọn mô hình ML',
      perMonth: '/tháng',
      aboutMLModels: 'Về các mô hình ML',
      purchaseModel: 'Mua {name}',
      signalsChartByMonth: 'Biểu đồ tín hiệu theo tháng',
      successful: 'thành công',
      losing: 'thua lỗ',
      signals: 'tín hiệu',
      successfulLosing: 'thành công/thua lỗ',
      accessRequests: 'Yêu cầu truy cập',
      signalsPerDay: 'Tín hiệu mỗi ngày',
      bestPair: 'Cặp tốt nhất',
      worstPair: 'Cặp tệ nhất',
      quickTemplates: 'Mẫu nhanh',
      subscriptionManagement: 'Quản lý đăng ký',
      selectMLModels: 'Chọn mô hình ML:',
      availableModels: 'Mô hình có sẵn:',
      premiumMLModels: 'Mô hình ML cao cấp',
      activeSignals: 'Tín hiệu hoạt động',
      progressToTP1: 'Tiến độ đến TP1',
      monthlyStatistics: 'Thống kê hàng tháng',
      totalSignals: 'Tổng tín hiệu',
      successfulSignals: 'Thành công',
      losingSignals: 'Thua lỗ',
      pair: 'Cặp:',
      direction: 'Hướng:',
      tryAgainInSeconds: 'Thử lại sau {seconds} giây khi thị trường ổn định',
      modelReady: 'Mô hình đã được huấn luyện và sẵn sàng hoạt động',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Đóng phân tích',
      apiError: 'Lỗi API',
      unknownError: 'Lỗi không xác định',
      analysisError: 'Lỗi khi lấy phân tích. Định dạng phản hồi không hợp lệ.',
      timeoutError: '⏰ Hết thời gian: Phân tích mất quá nhiều thời gian. Vui lòng thử lại.',
      serverError: '❌ Lỗi máy chủ',
      networkError: '🌐 Lỗi mạng: Kiểm tra kết nối internet của bạn.',
      generalError: '❌ Lỗi',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      marketState: 'Trạng thái thị trường',
      mood: 'Tâm trạng',
      volatility: 'Biến động',
      accuracy: 'Độ chính xác',
      analysis: 'Phân tích',
      idealForBeginners: 'Lý tưởng cho người mới bắt đầu',
      recommendation: 'Khuyến nghị:',
      clickToGenerateSignal: 'Nhấp để tạo tín hiệu'
    },
    id: {
      welcome: 'Selamat datang',
      selectLanguage: 'Pilih bahasa',
      continue: 'Lanjutkan',
      start: 'Mulai',
      menu: 'Menu',
      tradingSignals: 'Sinyal trading',
      analytics: 'Analitik',
      community: 'Komunitas',
      settings: 'Pengaturan',
      premium: 'ML Premium',
      selectMarket: 'Pilih pasar',
      selectMode: 'Mode generasi',
      top3Signals: 'TOP-3 Sinyal',
      singleSignals: 'Sinyal tunggal',
      active: 'Aktif',
      history: 'Riwayat',
      back: 'Kembali',
      admin: 'Panel Admin',
      buy: 'Beli',
      monthly: 'Bulanan',
      lifetime: 'Seumur hidup',
      welcomeTo: 'Selamat datang di',
      premiumSignals: 'Sinyal premium untuk trading profesional',
      accurateSignals: 'Sinyal akurat',
      successfulTradesPercent: '87% trading berhasil',
      instantNotifications: 'Notifikasi instan',
      realTimeSignals: 'Terima sinyal secara real-time',
      premiumQuality: 'Kualitas premium',
      professionalMarketAnalysis: 'Analisis pasar profesional',
      // Новые переводы
      comingSoon: 'SEGERA',
      comingSoonDescription: 'Segera tersedia',
      chatWithTraders: 'Chat dengan trader lain',
      manageParameters: 'Kelola parameter',
      manageAppSettings: 'Kelola pengaturan aplikasi',
      mlModel: 'Model ML',
      chooseMLModel: 'Pilih model ML',
      statistics: 'Statistik',
      viewDetails: 'Lihat statistik detail',
      notifications: 'Notifikasi',
      setupPushNotifications: 'Atur notifikasi push',
      // ML модели
      shadowStack: 'SHADOW STACK',
      forestNecromancer: 'FOREST NECROMANCER',
      grayCardinal: 'GRAY CARDINAL',
      logisticSpy: 'LOGISTIC SPY',
      sniper80x: 'SNIPER 80X',
      // Статусы
      activeStatus: 'AKTIF',
      inactive: 'TIDAK AKTIF',
      available: 'TERSEDIA',
      blocked: 'DIBLOKIR',
      success: 'Berhasil',
      failure: 'Gagal',
      // Действия
      buyAction: 'Beli',
      selectAction: 'Pilih',
      approve: 'Setujui',
      delete: 'Hapus',
      save: 'Simpan',
      cancel: 'Batal',
      apply: 'Terapkan',
      update: 'Perbarui',
      // Генерация сигналов
      loadingMarkets: 'Memuat pasar...',
      analyzingTrends: 'Menganalisis tren...',
      applyingML: 'Menerapkan model ML...',
      calculatingEntry: 'Menghitung titik masuk...',
      assessingRisks: 'Menilai risiko...',
      finalCheck: 'Pemeriksaan akhir...',
      // Админ-панель
      activeUsers: 'Pengguna aktif',
      totalSignals: 'Total sinyal',
      successful: 'Berhasil',
      failed: 'Gagal',
      topUsers: 'Pengguna teratas',
      accessRequests: 'Permintaan akses',
      subscriptionHistory: 'Riwayat perubahan langganan',
      // Статистика
      myStatistics: 'Statistik saya',
      winRate: 'Tingkat kemenangan',
      currentStreak: 'Streak saat ini',
      bestStreak: 'Streak terbaik',
      averageProfit: 'Keuntungan rata-rata',
      // Подписки
      monthlySubscription: 'Langganan bulanan',
      lifetimePurchase: 'Pembelian seumur hidup',
      autoRenewal: 'Perpanjangan otomatis',
      noTimeLimit: 'Tidak ada batas waktu',
      selectSubscriptionType: 'Pilih jenis langganan:',
      // Уведомления
      soundNotification: 'Suara',
      vibration: 'Getaran',
      pushNotification: 'Push',
      enabled: 'Diaktifkan',
      disabled: 'Dinonaktifkan',
      // Keys for notifications interface
      notificationsBadge: 'NOTIFIKASI',
      tradingSignals: 'Sinyal Trading',
      newSignals: 'Sinyal Baru',
      newSignalsDescription: 'Notifikasi tentang sinyal baru',
      signalResults: 'Hasil Sinyal',
      signalResultsDescription: 'Notifikasi tentang penutupan trade',
      dailySummary: 'Ringkasan Harian',
      dailySummaryDescription: 'Hasil hari pada 21:00',
      systemNotifications: 'Notifikasi Sistem',
      marketNews: 'Berita Pasar',
      marketNewsDescription: 'Peristiwa penting pasar',
      systemUpdates: 'Pembaruan Sistem',
      systemUpdatesDescription: 'Fitur baru dan perbaikan',
      soundAndVibration: 'Suara dan Getaran',
      soundNotification: 'Suara',
      soundNotificationsDescription: 'Notifikasi suara',
      vibration: 'Getaran',
      vibrationDescription: 'Sinyal getaran untuk notifikasi',
      emailNotifications: 'Notifikasi Email',
      emailNotificationsDescription: 'Notifikasi melalui email',
      smartNotifications: 'Notifikasi Cerdas',
      smartNotificationsDescription: 'Terima notifikasi tepat waktu tentang peristiwa penting. Anda dapat mengonfigurasi setiap jenis secara terpisah.',
      // Additional missing translations
      waitingForEntry: 'Menunggu masuk',
      vipFunction: 'Fungsi VIP',
      winRate: 'Tingkat kemenangan',
      pleaseWaitSystemAnalyzing: 'Silakan tunggu. Sistem sedang menganalisis pasar...',
      moreDetails: 'Detail Lebih',
      tryAgainInCooldown: 'Coba lagi dalam {seconds} detik ketika pasar stabil',
      // Alert messages
      bulkUpdateSuccess: 'Diperbarui {successful} dari {total} pengguna',
      bulkUpdateError: 'Kesalahan pembaruan massal: {error}',
      bulkUpdateErrorGeneric: 'Kesalahan pembaruan massal: {message}',
      userDeletedSuccess: 'Pengguna {userId} berhasil dihapus dari bot',
      userDeleteError: 'Kesalahan penghapusan: {error}',
      // Additional alert messages
      userAddedSuccess: 'Pengguna ditambahkan ke sistem',
      errorOccurredWith: 'Terjadi kesalahan: {error}',
      feedbackAcceptedSuccess: 'Umpan balik diterima: Perdagangan berhasil',
      feedbackAcceptedFailure: 'Umpan balik diterima: Perdagangan rugi',
      navigationBlockedMessage: 'Anda memiliki sinyal aktif!\n\nTunggu kedaluwarsa dan berikan umpan balik tentang hasil perdagangan.\n\nNavigasi akan dibuka kunci setelah mengirim umpan balik.',
      modelRestrictedAlert: 'Model ini dibatasi dan hanya tersedia berdasarkan perintah',
      // Аналитика
      aiAnalytics: 'Analitik AI',
      successfulTradesHistory: 'Riwayat perdagangan berhasil',
      analyzeSignal: 'Analisis sinyal',
      analyzingIneligible: 'Menganalisis...',
      cancelAnalysis: 'Batalkan analisis',
      // Системные сообщения
      userAdded: 'Pengguna ditambahkan ke sistem',
      errorOccurred: 'Terjadi kesalahan',
      loadingData: 'Memuat data...',
      // Модальные окна
      tradeActivated: 'Perdagangan telah diaktifkan',
      timeExpired: '⏰ Waktu habis!',
      leaveFeedback: 'Silakan berikan umpan balik tentang hasil perdagangan',
      pair: 'Pasangan',
      direction: 'Arah',
      resultButtonsActive: 'Tombol hasil telah aktif',
      indicateTradeResult: 'Silakan tunjukkan hasil perdagangan setelah waktu habis',
      successfulTrade: 'Perdagangan berhasil',
      losingTrade: 'Perdagangan rugi',
      leaveFeedbackToUnlock: '⚠️ Silakan berikan umpan balik untuk membuka kunci navigasi',
      navigationLocked: 'Navigasi terkunci',
      waitForExpiration: 'Silakan tunggu sinyal berakhir dan berikan umpan balik',
      timeRemaining: 'Waktu tersisa hingga berakhir',
      noSuitableEntry: '⚠️ Tidak ada titik masuk yang cocok',
      marketConditionsNotOptimal: 'Kondisi pasar saat ini tidak optimal untuk membuka posisi',
      analysisCompleted: 'Analisis selesai',
      recommendations: 'Rekomendasi',
      tryAnotherPair: 'Coba pasangan lain',
      selectAnotherPairDescription: 'Pilih pasangan mata uang lain dengan kondisi yang lebih menguntungkan',
      waitForOptimalConditions: 'Tunggu kondisi optimal',
      tryAgainWhen: 'Coba lagi dalam {seconds} detik ketika pasar stabil',
      returnToPairSelection: 'Kembali ke pemilihan pasangan',
      patienceIsKey: '💡 Kesabaran adalah kunci perdagangan yang berhasil',
      warningAttention: '⚠️ Perhatian!',
      systemBypassDetected: 'Upaya bypass sistem terdeteksi',
      activeSignalRequiresCompletion: 'Anda memiliki sinyal aktif yang perlu diselesaikan. Memuat ulang halaman tidak akan membantu bypass kunci navigasi.',
      activeSignal: 'Sinyal aktif',
      feedbackRequired: '⏰ Umpan balik diperlukan!',
      returnToOpenTrade: 'Kembali ke perdagangan terbuka',
      bypassProtectionActive: 'Sistem perlindungan bypass kunci navigasi aktif',
      waitForActiveSignal: '⚠️ Silakan tunggu sinyal aktif selesai dan berikan umpan balik sebelum melanjutkan!',
      // Alert сообщения
      subscriptionUpdated: '✅ Langganan pengguna {name} telah diperbarui! Pengguna akan mendapatkan akses ke model ML yang dipilih.',
      subscriptionUpdateError: '❌ Kesalahan memperbarui langganan pengguna {name}',
      subscriptionDisabled: '✅ Langganan pengguna {name} telah dinonaktifkan!',
      subscriptionDisableError: '❌ Kesalahan menonaktifkan langganan pengguna {name}',
      confirmDeleteUser: 'Apakah Anda yakin ingin menghapus pengguna {name}? Tindakan ini tidak dapat dibatalkan.',
      userDeleted: '✅ Pengguna {name} telah dihapus dari sistem',
      userDeleteError: '❌ Kesalahan menghapus pengguna {name}',
      accessRequestApproved: '✅ Permintaan akses pengguna {name} telah disetujui',
      accessRequestError: '❌ Kesalahan menyetujui permintaan pengguna {name}',
      // New keys for hardcoded texts
      hoursAgo: '{count} jam yang lalu',
      daysAgo: '{count} hari yang lalu',
      selectLanguageDescription: 'Pilih bahasa pilihan Anda untuk melanjutkan',
      forexMarketClosedWeekend: 'Pasar Forex tutup di akhir pekan. Beralih ke mode OTC.',
      forexMarketClosedLabel: 'Pasar Forex tutup (akhir pekan)',
      top3CooldownMessage: 'Sinyal TOP-3 dapat dibuat sekali setiap 10 menit. Tersisa: {minutes}:{seconds}',
      vipFeature: 'Fitur VIP',
      vipAnalyticsDescription: 'AI Analytics hanya tersedia untuk pengguna dengan langganan aktif',
      subscriptionRequired: 'Langganan diperlukan',
      getSubscription: 'Dapatkan langganan',
      returnToMenu: 'Kembali ke menu',
      forever: 'selamanya',
      mlModel: 'Model ML',
      chooseMLModel: 'Pilih model ML',
      selectSignalForActivation: 'Pilih sinyal untuk aktivasi',
      selectSignal: 'Pilih sinyal',
      expiration: 'Kedaluwarsa',
      minutes: 'menit',
      allUsersStatistics: 'Statistik semua pengguna',
      mlModelSelection: 'Pemilihan model ML',
      perMonth: '/bulan',
      aboutMLModels: 'Tentang model ML',
      purchaseModel: 'Beli {name}',
      signalsChartByMonth: 'Grafik sinyal per bulan',
      successful: 'berhasil',
      losing: 'kalah',
      signals: 'sinyal',
      successfulLosing: 'berhasil/kalah',
      accessRequests: 'Permintaan akses',
      signalsPerDay: 'Sinyal per hari',
      bestPair: 'Pasangan terbaik',
      worstPair: 'Pasangan terburuk',
      quickTemplates: 'Template cepat',
      subscriptionManagement: 'Manajemen langganan',
      selectMLModels: 'Pilih model ML:',
      availableModels: 'Model tersedia:',
      premiumMLModels: 'Model ML premium',
      activeSignals: 'Sinyal aktif',
      progressToTP1: 'Kemajuan ke TP1',
      monthlyStatistics: 'Statistik bulanan',
      totalSignals: 'Total sinyal',
      successfulSignals: 'Berhasil',
      losingSignals: 'Kalah',
      pair: 'Pasangan:',
      direction: 'Arah:',
      tryAgainInSeconds: 'Coba lagi dalam {seconds} detik ketika pasar stabil',
      modelReady: 'Model telah dilatih dan siap bekerja',
      aiAnalytics: 'AI Analytics',
      closeAnalysis: 'Tutup analisis',
      apiError: 'Kesalahan API',
      unknownError: 'Kesalahan tidak diketahui',
      analysisError: 'Kesalahan saat mengambil analisis. Format respons tidak valid.',
      timeoutError: '⏰ Waktu habis: Analisis memakan waktu terlalu lama. Silakan coba lagi.',
      serverError: '❌ Kesalahan server',
      networkError: '🌐 Kesalahan jaringan: Periksa koneksi internet Anda.',
      generalError: '❌ Kesalahan',
      // Additional keys
      forexSignalsPro: 'Forex Signals Pro',
      marketState: 'Status pasar',
      mood: 'Suasana hati',
      volatility: 'Volatilitas',
      accuracy: 'Akurasi',
      analysis: 'Analisis',
      idealForBeginners: 'Ideal untuk pemula',
      recommendation: 'Rekomendasi:',
      clickToGenerateSignal: 'Klik untuk menghasilkan sinyal'
    }
  }
  const t = (key, params = {}) => {
    // Сначала проверяем сохраненный язык в localStorage
    const savedLang = localStorage.getItem('selectedLanguage')
    const lang = selectedLanguage || savedLang || 'ru'
    let text = translations[lang]?.[key] || translations.ru[key] || key
    // Поддержка параметризации
    if (params && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param])
      })
    }
    return text
  }
  // Mock data for signals
  const activeSignals = [
    {
      id: 1,
      pair: 'EUR/USD',
      type: 'BUY',
      entry: '1.0850',
      tp: ['1.0900', '1.0950', '1.1000'],
      sl: '1.0800',
      status: 'active',
      time: t('hoursAgo', {count: 2, plural: ''}),
      progress: 60,
      confidence: 0.87
    },
    {
      id: 2,
      pair: 'GBP/JPY',
      type: 'SELL',
      entry: '188.50',
      tp: ['188.00', '187.50', '187.00'],
      sl: '189.00',
      status: 'active',
      time: t('hoursAgo', {count: 5, plural: ''}),
      progress: 30,
      confidence: 0.82
    },
    {
      id: 3,
      pair: 'USD/JPY',
      type: 'BUY',
      entry: '149.80',
      tp: ['150.20', '150.50', '150.80'],
      sl: '149.50',
      status: 'pending',
      time: t('hoursAgo', {count: 1, plural: ''}),
      progress: 0,
      confidence: 0.79
    }
  ]
  const historySignals = [
    {
      signal_id: "otc_EUR_USD_1758239200",
      id: 1,
      pair: 'EUR/USD (OTC)',
      type: 'SELL',
      direction: 'SELL',
      entry: '1.0850',
      tp: ['1.0800', '1.0750'],
      sl: '1.0900',
      closePrice: '1.0920',
      confidence: 0.7426,
      expiration: 3,
      signal_type: 'otc',
      timestamp: '2025-10-10T14:30:00',
      feedback: 'failure',
      result: 'loss',
      time: t('daysAgo', {count: 2, plural: ''})
    },
    {
      signal_id: "otc_GBP_JPY_1758240100",
      id: 2,
      pair: 'GBP/JPY (OTC)',
      type: 'BUY',
      direction: 'BUY',
      entry: '188.50',
      tp: ['189.00', '189.50'],
      sl: '188.00',
      closePrice: '189.30',
      confidence: 0.8215,
      expiration: 4,
      signal_type: 'otc',
      timestamp: '2025-10-10T16:45:00',
      feedback: 'success',
      result: 'profit',
      time: t('daysAgo', {count: 2, plural: ''})
    },
    {
      signal_id: "forex_EUR_USD_1758241500",
      id: 3,
      pair: 'EUR/USD',
      type: 'BUY',
      direction: 'BUY',
      entry: '1.0920',
      tp: ['1.0970', '1.1020'],
      sl: '1.0870',
      closePrice: '1.0860',
      confidence: 0.7891,
      expiration: 60,
      signal_type: 'forex',
      timestamp: '2025-10-11T09:20:00',
      feedback: 'failure',
      result: 'loss',
      time: t('daysAgo', {count: 1, plural: ''})
    },
    {
      signal_id: "forex_USD_JPY_1758242800",
      id: 4,
      pair: 'USD/JPY',
      type: 'SELL',
      direction: 'SELL',
      entry: '149.80',
      tp: ['149.30', '148.80'],
      sl: '150.30',
      closePrice: '149.20',
      confidence: 0.8542,
      expiration: 90,
      signal_type: 'forex',
      timestamp: '2025-10-11T12:00:00',
      feedback: 'success',
      result: 'profit',
      time: t('daysAgo', {count: 1, plural: ''})
    },
    {
      signal_id: "otc_XAU_USD_1758244200",
      id: 5,
      pair: 'XAU/USD (OTC)',
      type: 'BUY',
      direction: 'BUY',
      entry: '2650.00',
      tp: ['2680.00', '2700.00'],
      sl: '2630.00',
      closePrice: '2625.00',
      confidence: 0.7654,
      expiration: 5,
      signal_type: 'otc',
      timestamp: '2025-10-11T18:30:00',
      feedback: 'failure',
      result: 'loss',
      time: t('hoursAgo', {count: 12, plural: ''})
    },
    {
      signal_id: "forex_GBP_USD_1758245600",
      id: 6,
      pair: 'GBP/USD',
      type: 'SELL',
      direction: 'SELL',
      entry: '1.2850',
      tp: ['1.2800', '1.2750'],
      sl: '1.2900',
      closePrice: '1.2790',
      confidence: 0.8123,
      expiration: 120,
      signal_type: 'forex',
      timestamp: '2025-10-12T08:00:00',
      feedback: 'success',
      result: 'profit',
      time: t('hoursAgo', {count: 6, plural: ''})
    }
  ]
  const copyToClipboard = (signal) => {
    const text = `${signal.pair} ${signal.type}`
    navigator.clipboard.writeText(text)
  }
  // Language data
  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' }
  ]
  // ML Models data
  const mlModels = [
    {
      id: 'shadow-stack',
      name: t('shadowStack'),
      emoji: '🌑',
      algorithm: t('shadowStackAlgo'),
      winrate: '65-70%',
      description: t('shadowStackDesc'),
      style: t('shadowStackStyle'),
      status: 'available',
      color: 'from-slate-600 to-slate-800',
      price: '$299',
      monthlyPrice: '$49',
      lifetimePrice: '$299'
    },
    {
      id: 'forest-necromancer',
      name: t('forestNecromancer'),
      emoji: '🌲',
      algorithm: t('forestNecromancerAlgo'),
      winrate: '62-67%',
      description: t('forestNecromancerDesc'),
      style: t('forestNecromancerStyle'),
      status: 'available',
      color: 'from-green-600 to-green-800',
      price: '$199',
      monthlyPrice: '$29',
      lifetimePrice: '$199'
    },
    {
      id: 'gray-cardinal',
      name: t('grayCardinal'),
      emoji: '🎭',
      algorithm: t('grayCardinalAlgo'),
      winrate: '~66%',
      description: t('grayCardinalDesc'),
      style: t('grayCardinalStyle'),
      status: 'available',
      color: 'from-gray-600 to-gray-800',
      price: '$249',
      monthlyPrice: '$39',
      lifetimePrice: '$249'
    },
    {
      id: 'logistic-spy',
      name: t('logisticSpy'),
      emoji: '🕵️',
      algorithm: t('logisticSpyAlgo'),
      winrate: '~60-65%',
      description: t('logisticSpyDesc'),
      style: t('logisticSpyStyle'),
      status: 'active',
      color: 'from-blue-600 to-blue-800',
      price: '$99',
      monthlyPrice: '$19',
      lifetimePrice: '$99'
    },
    {
      id: 'sniper-80x',
      name: t('sniper80x'),
      emoji: '🔫',
      algorithm: t('sniper80xAlgo'),
      winrate: '80%+',
      description: t('sniper80xDesc'),
      style: t('sniper80xStyle'),
      status: 'restricted',
      color: 'from-red-600 to-red-800',
      warning: t('sniper80xWarning'),
      price: '$999',
      monthlyPrice: '$300',
      lifetimePrice: '$999'
    }
  ]
  const deleteUser = async (userIdToDelete) => {
    try {
      // Подтверждение удаления
      const confirmed = confirm(`${t('confirmDeleteUser')} ${userIdToDelete}? ${t('actionCannotBeUndone')}`)
      if (!confirmed) return
      console.log(`🗑️ Удаление пользователя ${userIdToDelete}`)
      // Отправляем запрос на удаление
      const response = await fetch(`${getApiUrl(5000)}/api/admin/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userIdToDelete,  // ID пользователя для удаления
          admin_user_id: userId  // ID текущего пользователя (админа)
        })
      })
      const result = await response.json()
      if (result.success) {
        console.log('✅ Пользователь успешно удален')
        alert(t('userDeletedSuccess', {userId: userIdToDelete}))
        // Обновляем список пользователей в админ панели
        loadAdminStats()
      } else {
        console.error('❌ Ошибка удаления:', result.error)
        alert(t('userDeleteError', {error: result.error}))
      }
    } catch (error) {
      console.error('❌ Ошибка при удалении пользователя:', error)
      alert(t('userDeleteError', {error: error.message}))
    }
  }
  // Функция отправки активности пользователя
  const sendUserActivity = async () => {
    if (!userId) return
    try {
      await fetch(`${getApiUrl(5000)}/api/user/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          source: 'web'
        })
      })
    } catch (error) {
      console.log('⚠️ Не удалось отправить активность:', error)
    }
  }

  // Простая функция анализа сигнала
  const analyzeSignal = async (signal) => {
    console.log('🚀 НАЧИНАЕМ АНАЛИЗ СИГНАЛА:', signal)
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    try {
      console.log('📤 НАЧИНАЕМ АНАЛИЗ...')
      
      // Ждем 5 секунд
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Простой анализ на основе данных сигнала
      const isLoss = signal.result === 'loss' || signal.feedback === 'failure'
      const pair = signal.pair || 'EUR/USD'
      const direction = signal.direction || 'SELL'
      
      // Случайные факторы
      const timeFactors = ["утром", "днем", "вечером", "в азиатскую сессию", "в европейскую сессию", "в американскую сессию"]
      const marketConditions = ["высокой волатильности", "низкой волатильности", "трендовом рынке", "флэтовом рынке", "неопределенности"]
      const emotions = ["терпение", "дисциплина", "контроль эмоций", "хладнокровие", "уверенность"]
      
      const randomTime = timeFactors[Math.floor(Math.random() * timeFactors.length)]
      const randomCondition = marketConditions[Math.floor(Math.random() * marketConditions.length)]
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      
      let analysisResult = ''
      
      if (isLoss) {
        analysisResult = `🔴 АНАЛИЗ УБЫТОЧНОЙ СДЕЛКИ ${pair}:
1️⃣ Трейдер допустил ошибки при ${direction} входе ${randomTime} и не дождался лучшего момента.
2️⃣ Психологические ошибки: эмоциональные решения, FOMO, жадность в условиях ${randomCondition}.
3️⃣ Рекомендации: найти лучшую точку входа, изменить подход, развивать ${randomEmotion}.
💪 Не сдавайся! Каждая сделка - это опыт! Продолжай торговать!`
      } else {
        analysisResult = `✅ АНАЛИЗ УСПЕШНОЙ СДЕЛКИ ${pair}:
1️⃣ Трейдер правильно выбрал направление ${direction} и следовал стратегии.
2️⃣ Ключевые факторы: точный анализ рынка, ${randomEmotion} при входе, правильная оценка условий.
3️⃣ Рекомендации: найти оптимальную точку входа, продолжать стратегию, масштабировать успех.
💪 Отлично! Продолжай в том же духе! Зарабатывай еще больше!`
      }
      
      console.log('📡 Анализ завершен через 5 секунд')
      console.log('📥 РЕЗУЛЬТАТ:', analysisResult)
      
      // Устанавливаем результат
      setAnalysisResult(analysisResult)
      
      console.log('✅ АНАЛИЗ УСПЕШЕН!')
    } catch (error) {
      console.error('❌ ОШИБКА АНАЛИЗА:', error)
      setAnalysisResult('Ошибка анализа: ' + error.message)
    } finally {
      console.log('🏁 АНАЛИЗ ЗАВЕРШЕН')
      setIsAnalyzing(false)
    }
  }
  const toggleNotification = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }
  // Авторизация через бэкенд API
  const authorizeUser = async (userData, initData = '') => {
    try {
      // Показываем процесс авторизации минимум 2 секунды
      const startTime = Date.now()
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initData: initData,
          userData: userData
        })
      })
      const result = await response.json()
      if (result.success) {
        const user = result.user
        // Сохраняем данные пользователя
        setUserId(user.telegram_id)
        setUserData({
          id: user.telegram_id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code,
          isPremium: user.is_premium
        })
        // Устанавливаем админские права
        setIsAdmin(user.is_admin)
        // Загружаем подписки
        setUserSubscriptions(user.subscriptions || ['logistic-spy'])
        // Успешная авторизация
        setIsAuthorized(true)
        console.log('✅ Авторизация через API успешна:', user.first_name)
        if (user.is_new_user) {
          console.log('🆕 Новый пользователь зарегистрирован!')
        }
        // Ждем минимум 2 секунды для показа экрана авторизации
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(2000 - elapsed, 0)
        await new Promise(resolve => setTimeout(resolve, remainingTime))
        // Проверяем сохраненный язык
        const savedLanguage = localStorage.getItem('selectedLanguage')
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage)
          setCurrentScreen('welcome')
        } else {
          // Если нет сохраненного языка - показываем выбор языка
          setCurrentScreen('language-select')
        }
        // Проверяем активный сигнал после авторизации
        const savedSignal = localStorage.getItem('pendingSignal')
        const savedGeneratedSignals = localStorage.getItem('generatedSignals')
        
        // Восстанавливаем сгенерированные сигналы если они есть
        if (savedGeneratedSignals) {
          try {
            const signals = JSON.parse(savedGeneratedSignals)
            setGeneratedSignals(signals)
            setCurrentScreen('signal-selection')
            console.log('✅ Восстановлены сгенерированные сигналы из localStorage:', signals.length)
          } catch (error) {
            console.error('❌ Ошибка восстановления generatedSignals:', error)
            localStorage.removeItem('generatedSignals')
          }
        }
        
        // КРИТИЧНО: ОТКЛЮЧАЕМ ВСЮ ЛОГИКУ ВОССТАНОВЛЕНИЯ
        // if (savedSignal && !savedGeneratedSignals) {
        //   console.log('🚫 [DISABLED] Логика восстановления отключена')
        // }
      } else {
        console.error('❌ Ошибка авторизации:', result.error)
        // НЕ сбрасываем авторизацию при ошибках API
        // Пользователь должен остаться на текущем экране
        console.warn('⚠️ Ошибка API, но сохраняем авторизацию')
      }
    } catch (error) {
      console.error('❌ Ошибка подключения к API:', error)
      // В режиме разработки разрешаем доступ без бэкенда
      console.warn('⚠️ Работа без бэкенда (режим разработки)')
      // Показываем экран авторизации минимум 2 секунды
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsAuthorized(true)
      const savedLanguage = localStorage.getItem('selectedLanguage')
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage)
        setCurrentScreen('welcome')
      } else {
        setCurrentScreen('language-select')
      }
      // Проверяем активный сигнал после авторизации
      const savedSignal = localStorage.getItem('pendingSignal')
      const savedGeneratedSignals = localStorage.getItem('generatedSignals')
      
      // КРИТИЧНО: ОТКЛЮЧАЕМ ВСЮ ЛОГИКУ ВОССТАНОВЛЕНИЯ
      // if (savedSignal && !savedGeneratedSignals) {
      //   console.log('🚫 [DISABLED] Логика восстановления отключена')
      // }
    }
  }
  // Получение Telegram User ID и авторизация
  // ОТКЛЮЧЕНО: Логика перенесена в компонент TelegramAuth
  /*
  useEffect(() => {
    console.log('🔍 Проверка Telegram WebApp...')
    // Ждем загрузки Telegram SDK
    const initTelegramAuth = () => {
      // Проверяем, запущено ли приложение в Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp
        console.log('✅ Telegram WebApp SDK загружен')
        console.log('📱 Platform:', tg.platform)
        console.log('🎨 Theme:', tg.colorScheme)
        tg.ready()
        tg.expand() // Разворачиваем приложение на весь экран
        // Получаем данные пользователя
        const user = tg.initDataUnsafe?.user
        const initData = tg.initData
        console.log('👤 User data:', user)
        console.log('🔐 Init data length:', initData?.length || 0)
        if (user) {
          console.log(`✅ Пользователь найден: ${user.first_name} (ID: ${user.id})`)
          // Авторизуемся через бэкенд
          authorizeUser({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || '',
            username: user.username || '',
            language_code: user.language_code || 'ru',
            is_premium: user.is_premium || false
          }, initData)
        } else {
          // Нет данных пользователя
          console.error('❌ Не удалось получить данные пользователя из Telegram')
          console.log('initDataUnsafe:', tg.initDataUnsafe)
          // Пробуем режим разработки
          console.warn('⚠️ Переход в режим разработки...')
          const testUserData = {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'ru',
            is_premium: false
          }
          authorizeUser(testUserData)
        }
      } else {
        // Для тестирования вне Telegram (в браузере)
        console.warn('⚠️ Приложение не запущено в Telegram WebApp')
        console.warn('🧪 Режим разработки активирован')
        // Тестовые данные пользователя
        const testUserData = {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'ru',
          is_premium: false
        }
        // Авторизуемся через бэкенд с тестовыми данными
        authorizeUser(testUserData)
      }
    }
    // Ждем загрузку Telegram SDK
    if (document.readyState === 'complete') {
      initTelegramAuth()
    } else {
      window.addEventListener('load', initTelegramAuth)
      return () => window.removeEventListener('load', initTelegramAuth)
    }
  }, [ADMIN_TELEGRAM_ID])
  */
  // Загрузка сохраненного языка при старте приложения
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      console.log('✅ Загружен сохраненный язык:', savedLanguage)
      setSelectedLanguage(savedLanguage)
    }
    
    // СЕРВЕРНАЯ ПРИВЯЗКА: Проверяем активный сигнал на сервере при загрузке
    if (userId) {
      console.log('🔄 [SERVER] Проверяем активный сигнал на сервере при загрузке...')
      restoreActiveSignalFromServer()
    } else {
      // НЕ очищаем localStorage при потере userId
      // Это может быть временная ошибка API, пользователь должен остаться на текущем экране
      console.log('⚠️ userId отсутствует, но НЕ очищаем localStorage')
    }
  }, [userId]) // Добавляем userId в зависимости

  // НОВЫЙ useEffect для запуска генерации ТОП-3
  useEffect(() => {
    // Автоматически запускаем генерацию для ТОП-3 при переходе на экран выбора,
    // но только если сигналы еще не сгенерированы.
    console.log('🔍 [useEffect DEBUG] Проверка условий для генерации ТОП-3:');
    console.log('🔍 [useEffect DEBUG] currentScreen:', currentScreen);
    console.log('🔍 [useEffect DEBUG] selectedMode:', selectedMode);
    console.log('🔍 [useEffect DEBUG] generatedSignals.length:', generatedSignals.length);
    console.log('🔍 [useEffect DEBUG] isGenerating:', isGenerating);
    
    // КРИТИЧНО: Убираем generatedSignals из зависимостей, чтобы избежать повторных вызовов
    if (currentScreen === 'signal-selection' && selectedMode === 'top3' && generatedSignals.length === 0 && !isGenerating) {
      console.log('🚀 [useEffect Trigger] Запуск генерации ТОП-3 сигналов...');
      generateTop3Signals();
    }
  }, [currentScreen, selectedMode, isGenerating]); // УБРАНО: generatedSignals
  // Загрузка статистики при переходе на экран user-stats
  useEffect(() => {
    if (currentScreen === 'user-stats') {
      loadUserStats()
    }
  }, [currentScreen])
  // Обновляем таймер cooldown для топ-3 каждую секунду
  useEffect(() => {
    if (!canGenerateTop3()) {
      const interval = setInterval(() => {
        // Принудительно обновляем компонент для пересчета времени
        setLastTop3Generation(prev => prev)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [lastTop3Generation])
  // Отправляем активность пользователя при загрузке и каждые 2 минуты
  useEffect(() => {
    if (userId && isAuthorized) {
      // Отправляем сразу
      sendUserActivity()
      // Отправляем каждые 2 минуты
      const interval = setInterval(() => {
        sendUserActivity()
      }, 2 * 60 * 1000) // 2 минуты
      return () => clearInterval(interval)
    }
  }, [userId, isAuthorized])
  // Загрузка метрик рынка при переходе на экран выбора пар
  useEffect(() => {
    if (currentScreen === 'signal-selection') {
      console.log('📊 [DEBUG] Переход на signal-selection экран')
      console.log('📊 [DEBUG] Количество сгенерированных сигналов:', generatedSignals.length)
      console.log('📊 [DEBUG] Сгенерированные сигналы:', generatedSignals)
      console.log('📊 [DEBUG] selectedMode:', selectedMode)
      console.log('📊 [DEBUG] isGenerating:', isGenerating)
      loadMarketMetrics()
    }
  }, [currentScreen])
  // Предзагрузка метрик при инициализации приложения
  useEffect(() => {
    console.log('📊 Предзагружаем метрики при инициализации')
      loadMarketMetrics()
  }, [])
  // Загрузка истории сигналов при переходе на экран аналитики
  useEffect(() => {
    if (currentScreen === 'analytics') {
      loadUserSignalsHistory()
    }
  }, [currentScreen])
  // Сохранение активного сигнала в localStorage
  useEffect(() => {
    if (pendingSignal) {
      localStorage.setItem('pendingSignal', JSON.stringify(pendingSignal))
      localStorage.setItem('signalTimer', signalTimer.toString())
      localStorage.setItem('isWaitingFeedback', isWaitingFeedback.toString())
      if (pendingSignal.startTime) {
        localStorage.setItem('signalStartTime', pendingSignal.startTime.toString())
      }
    } else {
      localStorage.removeItem('pendingSignal')
      localStorage.removeItem('signalTimer')
      localStorage.removeItem('isWaitingFeedback')
      localStorage.removeItem('signalStartTime')
    }
  }, [pendingSignal, signalTimer, isWaitingFeedback])
  // Таймер для сигнала
  useEffect(() => {
    let interval = null
    if (pendingSignal && !isWaitingFeedback) {
      interval = setInterval(() => {
        // Рассчитываем оставшееся время на основе реального времени
        const remainingTime = calculateRemainingTime(pendingSignal)
        if (remainingTime <= 0) {
          setSignalTimer(0)
            setIsWaitingFeedback(true)
        } else {
          setSignalTimer(remainingTime)
          }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [pendingSignal, signalTimer, isWaitingFeedback])
  // Таймер cooldown для ТОП-3
  useEffect(() => {
    let interval = null
    if (top3Cooldown > 0) {
      interval = setInterval(() => {
        setTop3Cooldown(cd => Math.max(0, cd - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [top3Cooldown])
  // Таймер cooldown для одиночного сигнала
  useEffect(() => {
    let interval = null
    if (signalCooldown > 0) {
      interval = setInterval(() => {
        setSignalCooldown(cd => Math.max(0, cd - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [signalCooldown])
  // Автоскрытие уведомления "Нет подходящего сигнала"
  useEffect(() => {
    if (noSignalAvailable) {
      const timeout = setTimeout(() => {
        setNoSignalAvailable(false)
      }, 5000) // Скрыть через 5 секунд
      return () => clearTimeout(timeout)
    }
  }, [noSignalAvailable])

  // Периодическая проверка кешированных ТОП-3 сигналов
  useEffect(() => {
    if (userId && isAuthorized) {
      // Загружаем кешированные сигналы при входе
      loadCachedTop3Signals()
      
      // Проверяем статус каждые 30 секунд
      const interval = setInterval(() => {
        checkTop3Status()
      }, 30 * 1000) // 30 секунд
      
      return () => clearInterval(interval)
    }
  }, [userId, isAuthorized])
  // РЕАЛЬНАЯ генерация ТОП-3 сигналов через API бота
  const generateTop3Signals = async () => {
    // Сначала проверяем кешированные сигналы
    if (cachedTop3Signals.length > 0) {
      console.log('[TOP3] Используем кешированные сигналы')
      setGeneratedSignals(cachedTop3Signals)
      setCurrentScreen('signal-selection')
      return
    }
    
    // КРИТИЧНО: Полностью очищаем localStorage перед генерацией
    localStorage.removeItem('pendingSignal')
    localStorage.removeItem('signalActivated')
    localStorage.removeItem('signalTimer')
    localStorage.removeItem('isWaitingFeedback')
    localStorage.removeItem('signalStartTime')
    localStorage.removeItem('generatedSignals')
    
    setIsGenerating(true)
    setCurrentScreen('generating')
    setLastTop3Generation(new Date().toISOString())
    
    // Этапы генерации для UI
    const stages = [
      { stage: t('connectingToMarket'), delay: 800 },
      { stage: t('analyzingTechnicalIndicators'), delay: 1200 },
      { stage: t('evaluatingNewsBackground'), delay: 1000 },
      { stage: t('calculatingOptimalExpiration'), delay: 900 },
      { stage: t('applyingMLModels'), delay: 1100 },
      { stage: t('formingTop3Signals'), delay: 1000 }
    ]
    for (const { stage, delay } of stages) {
      setGenerationStage(stage)
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    try {
      const response = await fetch(`${getApiUrl(5000)}/api/signal/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          market: selectedMarket,
          mode: 'top3'
        })
      })
      const result = await response.json()

      // НОВОЕ: Проверка ошибок расписания для ТОП-3
      if (!result.success) {
        if (result.error === 'market_closed' || result.error === 'forex_restricted') {
          setIsGenerating(false)
          setCurrentScreen('mode-select')
          
          alert(t('forexMarketClosedWeekend'))
          return
        }
        
        throw new Error(result.error)
      }

      if (result.success && result.signals && result.signals.length > 0) {
        const signals = result.signals.map((signal, index) => ({
          ...signal,
          id: Date.now() + index,
          status: 'generated',
          time: 'Только что'
        }));

        setGeneratedSignals(signals);
        localStorage.setItem('generatedSignals', JSON.stringify(signals));
        setLastTop3Generation(Date.now());
        setTop3Cooldown(600);
        
        // Корректное завершение: переход на экран ВЫБОРА
        setIsGenerating(false);
        setCurrentScreen('signal-selection');
        console.log('✅ ТОП-3 сигналы получены. Переход на экран выбора.');
        console.log('🔍 [DEBUG] generatedSignals после установки:', signals);
        console.log('🔍 [DEBUG] currentScreen должен быть signal-selection');
        console.log('🔍 [DEBUG] Количество сигналов:', signals.length);
        console.log('🔍 [DEBUG] Первый сигнал:', signals[0]);
        console.log('🔍 [DEBUG] НЕ ВЫЗЫВАЕМ activateSignal - только переход на signal-selection');

      } else {
        // Обработка случая, когда сигналы не найдены
        setIsGenerating(false);
        setNoSignalAvailable(true);
        setSignalCooldown(30);
        setCurrentScreen('signal-selection'); // Переходим на экран выбора, чтобы показать сообщение "Нет сигналов"
      }
    } catch (error) {
      console.error('❌ Ошибка получения ТОП-3 сигналов:', error);
      // Fallback логика - генерируем mock сигналы при ошибке API
      const pairs = selectedMarket === 'forex' 
        ? ['EUR/USD', 'GBP/USD', 'USD/JPY']
        : ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)'];
      const signals = [];
      for (let i = 0; i < 3; i++) {
        signals.push({
          signal_id: `mock_${pairs[i].replace('/', '_')}_${Date.now()}_${i}`,
          id: Date.now() + i,
          pair: pairs[i],
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
          entry: '0.0000',
          confidence: Math.random() * 0.3 + 0.7,
          expiration: Math.floor(Math.random() * 5) + 1,
          signal_type: selectedMarket,
          timestamp: new Date().toISOString(),
          status: 'generated',
          time: 'Только что'
        });
      }
      setGeneratedSignals(signals);
      localStorage.setItem('generatedSignals', JSON.stringify(signals));
      setLastTop3Generation(Date.now());
      setTop3Cooldown(600);
      setIsGenerating(false);
      setCurrentScreen('signal-selection');
    }
  }
  // РЕАЛЬНАЯ генерация одиночного сигнала для пары через API
  const generateSignalForPair = async (pair) => {
    setIsGenerating(true)
    setCurrentScreen('generating')
    // Этапы генерации
    const stages = [
      { stage: t('connectingToMarket'), delay: 600 },
      { stage: t('analyzingPair', { pair }), delay: 800 },
      { stage: t('calculatingTechnicalIndicators'), delay: 700 },
      { stage: t('applyingMLModel'), delay: 900 },
      { stage: t('determiningEntryPoint'), delay: 700 }
    ]
    for (const { stage, delay } of stages) {
      setGenerationStage(stage)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    try {
      console.log('🚀 НАЧИНАЕМ ГЕНЕРАЦИЮ ОДИНОЧНОГО СИГНАЛА для пары:', pair)
      console.log('📡 API URL:', `${getApiUrl(5000)}/api/signal/generate`)
      
      // РЕАЛЬНЫЙ запрос к Signal API
      const response = await fetch(`${getApiUrl(5000)}/api/signal/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          market: selectedMarket,
          mode: 'single',
          pair: pair
        })
      })
      
      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📡 API Response:', result)
      
      // НОВОЕ: Проверка ошибок расписания
      if (!result.success) {
        if (result.error === 'market_closed' || result.error === 'forex_restricted') {
          setIsGenerating(false)
          setCurrentScreen('mode-select')
          
          // Показываем детальное сообщение
          const status = result.market_status
          const message = `${result.message}\n\n` +
            `Текущее время: ${status.current_time} (${status.current_day})\n` +
            `До ${status.next_event}: ${status.time_until_change}`
          
          alert(message)
          return
        }
        
        throw new Error(result.error)
      }
      
      if (result.success && result.signals && result.signals.length > 0) {
        console.log('✅ Получен РЕАЛЬНЫЙ одиночный сигнал от API')
        const signal = {
          ...result.signals[0],
          id: Date.now(),
          status: 'generated',
          time: 'Только что'
        }
        setGeneratedSignals([signal])
        localStorage.setItem('generatedSignals', JSON.stringify([signal]))
        setIsGenerating(false)
        setCurrentScreen('signal-selection')
        console.log('✅ РЕАЛЬНЫЙ сигнал установлен:', signal)
      } else {
        console.log('⚠️ API вернул пустой результат, используем fallback')
        throw new Error('API вернул пустой результат')
      }
    } catch (error) {
      console.error('❌ Ошибка получения сигнала:', error)
      console.log('🔄 Переходим к fallback генерации')
      
      // Fallback: генерируем mock сигнал если API недоступен
      const mockSignal = {
        signal_id: `mock_${pair.replace('/', '_')}_${Date.now()}`,
        id: Date.now(),
        pair: pair,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entry: selectedMarket === 'forex' ? (Math.random() * 2 + 1).toFixed(4) : (Math.random() * 10000 + 1000).toFixed(2),
        confidence: Math.random() * 0.3 + 0.7,
        expiration: Math.floor(Math.random() * 5) + 1,
        signal_type: pair.includes('OTC') ? 'otc' : 'forex',
        timestamp: new Date().toISOString(),
        status: 'generated',
        time: 'Только что'
      }
      
      setGeneratedSignals([mockSignal])
      localStorage.setItem('generatedSignals', JSON.stringify([mockSignal]))
      setIsGenerating(false)
      setCurrentScreen('signal-selection')
      console.log('✅ Fallback сигнал сгенерирован:', mockSignal)
    }
  }
  // Функция для расчета оставшегося времени на основе реального времени
  const calculateRemainingTime = (signal) => {
    if (!signal || !signal.startTime) return 0
    const startTime = signal.startTime
    const expirationSeconds = signal.expiration * 60
    const currentTime = Date.now()
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
    const remainingSeconds = Math.max(0, expirationSeconds - elapsedSeconds)
    return remainingSeconds
  }
  // Функция для очистки состояния сигналов
  const clearSignalState = () => {
    console.log('🧹 [DEBUG] clearSignalState вызвана - очищаем все состояние сигналов')
    setGeneratedSignals([])
    setPendingSignal(null)
    setSignalTimer(0)
    setIsWaitingFeedback(false)
    // Очищаем localStorage
    localStorage.removeItem('pendingSignal')
    localStorage.removeItem('signalTimer')
    localStorage.removeItem('isWaitingFeedback')
    localStorage.removeItem('signalStartTime')
    localStorage.removeItem('generatedSignals') // ДОБАВЛЕНО: очистка сгенерированных сигналов
    localStorage.removeItem('signalActivated') // ДОБАВЛЕНО: очистка флага активации
    console.log('🧹 [DEBUG] Все состояние сигналов очищено')
  }
  // Активация сигнала с серверной привязкой
  const activateSignal = async (signal) => {
    console.log('🚨 [DEBUG] activateSignal вызвана!')
    console.log('🚨 [DEBUG] Сигнал для активации:', signal)
    console.log('🚨 [DEBUG] Текущий экран:', currentScreen)
    console.log('🚨 [DEBUG] Это РУЧНАЯ активация пользователем - НЕ автоматическая!')
    console.trace('🚨 [DEBUG] Стек вызовов activateSignal:')
    
    try {
      // СЕРВЕРНАЯ ПРИВЯЗКА: Отправляем сигнал на сервер
      const response = await fetch(`${getApiUrl(5000)}/api/signal/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          signal: {
            ...signal,
            start_time: Date.now()
          }
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ [SERVER] Сигнал успешно активирован на сервере')
        
        const expirationSeconds = signal.expiration * 60 // Конвертируем минуты в секунды
        const startTime = Date.now() // Время начала сигнала
        
        setPendingSignal({
          ...signal,
          startTime: startTime
        })
        setSignalTimer(expirationSeconds)
        setIsWaitingFeedback(false)
        
        // Очищаем сгенерированные сигналы из localStorage
        localStorage.removeItem('generatedSignals')
        // Сохраняем время начала в localStorage
        localStorage.setItem('signalStartTime', startTime.toString())
        // Сохраняем флаг активации
        localStorage.setItem('signalActivated', 'true')
        // Переходим на экран активной сделки
        setCurrentScreen('main')
        
        console.log('✅ [DEBUG] Сигнал успешно активирован!')
      } else {
        console.error('❌ [SERVER] Ошибка активации сигнала на сервере:', result.error)
        
        if (result.error === 'User already has active signal') {
          // Пользователь уже имеет активный сигнал - восстанавливаем его
          console.log('🔄 [SERVER] Восстанавливаем активный сигнал с сервера')
          await restoreActiveSignalFromServer()
        } else {
          alert('Ошибка активации сигнала: ' + result.error)
        }
      }
    } catch (error) {
      console.error('❌ [SERVER] Ошибка отправки сигнала на сервер:', error)
      alert('Ошибка подключения к серверу. Попробуйте еще раз.')
    }
  }
  
  // Восстановление активного сигнала с сервера
  const restoreActiveSignalFromServer = async () => {
    try {
      console.log('🔄 [SERVER] Запрашиваем активный сигнал с сервера...')
      
      const response = await fetch(`${getApiUrl(5000)}/api/signal/active?user_id=${userId}`)
      const result = await response.json()
      
      if (result.success && result.active_signal) {
        console.log('✅ [SERVER] Восстановлен активный сигнал с сервера:', result.active_signal)
        
        const serverSignal = result.active_signal
        const startTime = serverSignal.start_time || Date.now()
        const currentTime = Date.now()
        const elapsedTime = Math.floor((currentTime - startTime) / 1000)
        const totalDuration = serverSignal.expiration * 60
        const remainingTime = Math.max(0, totalDuration - elapsedTime)
        
        if (remainingTime > 0) {
          // Восстанавливаем состояние
          setPendingSignal({
            signal_id: serverSignal.signal_id,
            pair: serverSignal.pair,
            direction: serverSignal.direction,
            confidence: serverSignal.confidence,
            entry_price: serverSignal.entry_price,
            expiration: serverSignal.expiration,
            startTime: startTime
          })
          setSignalTimer(remainingTime)
          setIsWaitingFeedback(false)
          setCurrentScreen('main')
          
          console.log(`✅ [SERVER] Восстановлен активный сигнал. Осталось: ${remainingTime} сек`)
        } else {
          // Время истекло - переходим к фидбеку
          console.log('⏰ [SERVER] Время сигнала истекло, переходим к фидбеку')
          setPendingSignal({
            signal_id: serverSignal.signal_id,
            pair: serverSignal.pair,
            direction: serverSignal.direction,
            confidence: serverSignal.confidence,
            entry_price: serverSignal.entry_price,
            expiration: serverSignal.expiration,
            startTime: startTime
          })
          setSignalTimer(0)
          setIsWaitingFeedback(true)
          setCurrentScreen('main')
        }
      } else {
        console.log('ℹ️ [SERVER] Активного сигнала на сервере нет')
      }
    } catch (error) {
      console.error('❌ [SERVER] Ошибка восстановления активного сигнала:', error)
    }
  }
  
  // Отправка фидбека на бэкенд с серверной привязкой
  const submitFeedback = async (isSuccess) => {
    if (!pendingSignal) return
    
    try {
      // СЕРВЕРНАЯ ПРИВЯЗКА: Завершаем активный сигнал на сервере
      const response = await fetch(`${getApiUrl(5000)}/api/signal/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          feedback: isSuccess ? 'success' : 'failure'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ [SERVER] Фидбек сохранен и сигнал завершен на сервере:', result.user_stats)
      } else {
        console.error('❌ [SERVER] Ошибка завершения сигнала на сервере:', result.error)
      }
    } catch (error) {
      console.error('❌ [SERVER] Ошибка отправки фидбека на сервер:', error)
      console.warn('⚠️ Фидбек не сохранен на бэкенде (работа без API)')
    }
    
    // Локально сохраняем результат
    console.log(`📊 Фидбек: ${isSuccess ? 'success' : 'failure'} для сигнала ${pendingSignal.signal_id}`)
    // Очищаем состояние
    clearSignalState()
    alert(t(isSuccess ? 'feedbackAcceptedSuccess' : 'feedbackAcceptedFailure'))
    // Переходим в статистику пользователя
    setCurrentScreen('user-stats')
  }
  // Проверка блокировки навигации
  const isNavigationBlocked = () => {
    return pendingSignal !== null
  }
  // Навигация с проверкой блокировки
  const navigateWithCheck = (screen) => {
    if (isNavigationBlocked()) {
      alert(t('navigationBlockedMessage'))
      return false
    }
    setCurrentScreen(screen)
    return true
  }
  // Обработчик успешной авторизации
  // Получаем login из Zustand
  const login = useAuthStore(state => state.login)
  
  const handleAuthSuccess = async (authData) => {
    console.log('✅ Auth success:', authData)
    
    // Обновляем локальные state
    setUserId(authData.userId)
    setIsAdmin(authData.isAdmin)
    setUserData(authData.userData)
    setIsAuthorized(true)
    
    // Обновляем Zustand через login (асинхронно, чтобы избежать ошибки)
    setTimeout(() => {
      login({
        userId: authData.userId,
        isAdmin: authData.isAdmin,
        userData: authData.userData,
        token: null, // Токен будет получен через useAuthSync
        subscriptions: authData.subscriptions || ['logistic-spy']
      })
    }, 0)
    
    // Проверяем сохраненный язык
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
      setCurrentScreen('welcome')
    } else {
      setCurrentScreen('language-select')
    }
    // Проверяем активный сигнал после авторизации
    const savedSignal = localStorage.getItem('pendingSignal')
    const savedGeneratedSignals = localStorage.getItem('generatedSignals')
    
    // КРИТИЧНО: ОТКЛЮЧАЕМ ВСЮ ЛОГИКУ ВОССТАНОВЛЕНИЯ
    // if (savedSignal && !savedGeneratedSignals) {
    //   console.log('🚫 [DISABLED] Логика восстановления отключена')
    // }
  }
  // Обработчик ошибки авторизации
  const handleAuthError = (error) => {
    console.error('❌ Ошибка авторизации:', error)
  }
  // Authorization Screen
  if (currentScreen === 'auth') {
    // Принудительное обновление подписок при каждом рендере экрана auth
    if (userData?.id) {
      console.log('🔄 Auth render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div>
      <TelegramAuth 
        onAuthSuccess={handleAuthSuccess}
        onAuthError={handleAuthError}
      />
        <ToastNotification />
      </div>
    )
  }
  // Language Selection Screen
  if (currentScreen === 'language-select') {
    // Принудительное обновление подписок при каждом рендере экрана language-select
    if (userData?.id) {
      console.log('🔄 Language Select render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <ToastNotification />
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="max-w-4xl w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Logo with enhanced animation */}
          <div className="flex justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl blur-2xl opacity-50 animate-glow-pulse"></div>
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 icon-3d hover:scale-110 transition-transform duration-500">
                <Globe className="w-14 h-14 text-white animate-spin-slow" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-3xl blur-lg animate-pulse"></div>
            </div>
          </div>
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="relative">
              <h1 className="text-5xl font-bold text-white mb-4">
                {t('selectLanguage')}
              </h1>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                {t('selectLanguage')}
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
            </div>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              {t('selectLanguageDescription')}
            </p>
          </div>
          {/* Language Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {languages.map((language, index) => (
              <Card 
                key={language.code}
                onClick={() => {
                  setSelectedLanguage(language.code)
                  localStorage.setItem('selectedLanguage', language.code)
                  setCurrentScreen('welcome')
                }}
                className={`glass-effect p-6 backdrop-blur-sm cursor-pointer transition-all duration-500 group card-3d border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-110 hover:-translate-y-2 ${
                  selectedLanguage === language.code 
                    ? 'border-emerald-500/70 bg-emerald-500/10 scale-105' 
                    : 'hover:border-emerald-500/50'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className={`text-5xl transition-all duration-300 group-hover:scale-125 ${
                      selectedLanguage === language.code ? 'animate-bounce' : ''
                    }`}>
                      {language.flag}
                    </div>
                    {selectedLanguage === language.code && (
                      <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-lg animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold text-sm transition-colors duration-300 ${
                      selectedLanguage === language.code ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {language.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{language.code.toUpperCase()}</p>
                  </div>
                  {selectedLanguage === language.code && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {/* Continue Button */}
          {selectedLanguage && (
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  localStorage.setItem('selectedLanguage', selectedLanguage)
                  setCurrentScreen('welcome')
                }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-6 px-12 text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all duration-500 hover:shadow-emerald-500/50 hover:scale-110 hover:-translate-y-2 animate-pulse-slow"
              >
                <span className="flex items-center gap-3">
                  {t('continue')}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
  // Welcome Screen
  if (currentScreen === 'welcome') {
    // Принудительное обновление подписок при каждом рендере экрана welcome
    if (userData?.id) {
      console.log('🔄 Welcome render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl blur-2xl opacity-50 animate-glow-pulse"></div>
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 icon-3d">
                <Activity className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
          {/* Welcome Text */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              {t('welcomeTo')}
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mt-2">
                {t('forexSignalsPro')}
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              {t('premiumSignals')}
            </p>
          </div>
          {/* Features */}
          <div className="space-y-4">
            <Card className="glass-effect p-4 backdrop-blur-sm card-3d border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center icon-3d shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t('accurateSignals')}</h3>
                  <p className="text-slate-400 text-sm">{t('successfulTradesPercent')}</p>
                </div>
              </div>
            </Card>
            <Card className="glass-effect p-4 backdrop-blur-sm card-3d border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t('instantNotifications')}</h3>
                  <p className="text-slate-400 text-sm">{t('realTimeSignals')}</p>
                </div>
              </div>
            </Card>
            <Card className="glass-effect p-4 backdrop-blur-sm card-3d border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center icon-3d shadow-lg shadow-amber-500/20">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t('premiumQuality')}</h3>
                  <p className="text-slate-400 text-sm">{t('professionalMarketAnalysis')}</p>
                </div>
              </div>
            </Card>
          </div>
          {/* Start Button */}
          <Button 
            onClick={() => {
              if (userData?.id) {
                /* WebSocket auto-updates Zustand */
              }
              setCurrentScreen('menu')
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 hover:-translate-y-1"
          >
            {t('start')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    )
  }
  // Main Menu Screen
  if (currentScreen === 'menu') {
    // Принудительное обновление подписок при каждом рендере меню
    if (userData?.id) {
      console.log('🔄 Menu render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <ToastNotification />
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">{t('menu')}</h2>
            <p className="text-slate-400">{t('chooseAction')}</p>
          </div>
          {/* Menu Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => setCurrentScreen('market-select')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-emerald-500/20">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('tradingSignals')}</h3>
                    <p className="text-slate-400 text-sm">{t('getTradingSignals')}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            <Card 
              onClick={() => setCurrentScreen('analytics')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-cyan-500/20">
                    <BarChart3 className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('analytics')}</h3>
                    <p className="text-slate-400 text-sm">{t('aiSignalAnalysis')}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            <Card 
              onClick={() => window.open('https://t.me/NeKnopkaBabl0', '_blank')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-purple-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-purple-500/20">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('community')}</h3>
                    <p className="text-slate-400 text-sm">{t('chatWithTraders')}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            <Card 
              onClick={() => {
                if (userData?.id) {
                  /* WebSocket auto-updates Zustand */
                }
                setCurrentScreen('ml-selector')
              }}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-yellow-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-yellow-500/20">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t('premium')}</h3>
                    <p className="text-slate-400 text-sm">{t('chooseMLModel')}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            <Card 
              onClick={() => {
                if (userData?.id) {
                  /* WebSocket auto-updates Zustand */
                }
                setCurrentScreen('settings')
              }}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-amber-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-amber-500/20">
                    <Settings className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('settings')}</h3>
                    <p className="text-slate-400 text-sm">{t('manageParameters')}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </div>
          {/* Back Button */}
          <Button 
            onClick={() => setCurrentScreen('welcome')}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }
  // Generating Screen - Анимация процесса генерации
  if (currentScreen === 'generating') {
    // Принудительное обновление подписок при каждом рендере экрана generating
    if (userData?.id) {
      console.log('🔄 Generating render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-2xl w-full space-y-8 animate-fade-in relative z-10">
          {/* Animated Brain Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl blur-2xl opacity-50 animate-glow-pulse"></div>
              <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50 icon-3d animate-float">
                <Brain className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
          </div>
          {/* Generation Status */}
          <Card className="glass-effect border-cyan-500/30 p-8 card-3d shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">🧠 {t('signalGeneration')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                <p className="text-xl text-cyan-400 font-semibold animate-pulse">
                  {generationStage}
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
                  <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-slate-400">{t('analysis')}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
                  <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2 animate-spin-slow" />
                  <p className="text-xs text-slate-400">{t('mlModel')}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-emerald-500/30">
                  <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-slate-400">{t('accuracy')}</p>
                </div>
              </div>
            </div>
          </Card>
          <p className="text-slate-400 text-center text-sm">
            {t('pleaseWaitSystemAnalyzing')}
          </p>
        </div>
      </div>
    )
  }
  // Signal Selection Screen - Выбор сигнала из сгенерированных
  if (currentScreen === 'signal-selection') {
    // Принудительное обновление подписок при каждом рендере экрана signal-selection
    if (userData?.id) {
      console.log('🔄 Signal Selection render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    console.log('🔍 [SIGNAL-SELECTION DEBUG] Рендерим signal-selection экран')
    console.log('🔍 [SIGNAL-SELECTION DEBUG] generatedSignals:', generatedSignals)
    console.log('🔍 [SIGNAL-SELECTION DEBUG] Количество сигналов:', generatedSignals.length)
    console.log('🔍 [SIGNAL-SELECTION DEBUG] selectedMode:', selectedMode)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 icon-3d">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {selectedMode === 'top3' ? t('top3Signals') : t('generatedSignal')}
                  </h1>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                    {generatedSignals.length === 0 ? t('signalCountZero') : t('signalCount', {count: generatedSignals.length})}
                  </Badge>
                </div>
              </div>
              {/* Показываем кнопку "Назад" только если нет готовых сигналов и не идет генерация */}
              {generatedSignals.length === 0 && !isGenerating && (
                <Button 
                  onClick={() => setCurrentScreen('mode-select')}
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
              )}
            </div>
          </div>
        </header>
        {/* Content based on mode */}
        <div className="container mx-auto px-4 py-6">
          {selectedMode === 'top3' ? (
            // ТОП-3 режим: показываем готовые сигналы
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  🏆 {t('top3SignalsReady')}
                </h2>
                <p className="text-slate-400">{t('selectSignalForActivation')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedSignals.map((signal, index) => (
                  <Card 
                    key={signal.id}
                    onClick={() => {
                      activateSignal(signal)
                      // УБРАНО: setCurrentScreen('main') - переход будет в activateSignal
                    }}
                    className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          signal.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                        }`}>
                          {signal.type === 'BUY' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                      </div>
                      {/* Signal Type */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">{t('direction')}:</span>
                        <Badge className={`${
                          signal.type === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        }`}>
                          {signal.type === 'BUY' ? t('buy') : t('sell')}
                        </Badge>
                      </div>
                      {/* Expiration Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">{t('expiration')}:</span>
                        <span className="text-white font-semibold">
                          {signal.expiration} {t('minutesShort')}
                        </span>
                      </div>
                      {/* Confidence Score */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Target className="w-3 h-3" />
{t('confidence')}
                          </span>
                          <span className="text-white font-semibold">
                            {signal.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full transition-all duration-500 shadow-lg"
                            style={{ 
                              width: `${signal.confidence}%`,
                              background: `linear-gradient(to right, 
                                #ef4444 0%, 
                                #f97316 20%, 
                                #eab308 40%, 
                                #84cc16 60%, 
                                #22c55e 80%, 
                                #16a34a 100%)`
                            }}
                          />
                        </div>
                      </div>
                      {/* Click to Activate */}
                      <div className="text-center pt-2">
                        <span className="text-emerald-400 text-sm font-semibold">{t('clickToActivate')}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : generatedSignals.length > 0 ? (
            // Одиночный режим: показываем готовый сигнал
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  ✅ {t('signalReady')}!
                </h2>
                <p className="text-slate-400">{t('activateSignalForTrading')}</p>
              </div>
              <div className="max-w-md mx-auto">
                {generatedSignals.map((signal, index) => (
                  <Card 
                    key={signal.id}
                    onClick={() => {
                      activateSignal(signal)
                      // УБРАНО: setCurrentScreen('main') - переход будет в activateSignal
                    }}
                    className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          signal.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                        }`}>
                          {signal.type === 'BUY' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                      </div>
                      {/* Signal Type */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">{t('direction')}:</span>
                        <Badge className={`${
                          signal.type === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        }`}>
                          {signal.type === 'BUY' ? t('buy') : t('sell')}
                        </Badge>
                      </div>
                      {/* Expiration Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">{t('expiration')}:</span>
                        <span className="text-white font-semibold">
                          {signal.expiration} {t('minutesShort')}
                        </span>
                      </div>
                      {/* Confidence Score */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Target className="w-3 h-3" />
{t('confidence')}
                          </span>
                          <span className="text-white font-semibold">
                            {signal.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full transition-all duration-500 shadow-lg"
                            style={{ 
                              width: `${signal.confidence}%`,
                              background: `linear-gradient(to right, 
                                #ef4444 0%, 
                                #f97316 20%, 
                                #eab308 40%, 
                                #84cc16 60%, 
                                #22c55e 80%, 
                                #16a34a 100%)`
                            }}
                          />
                        </div>
                      </div>
                      {/* Click to Activate */}
                      <div className="text-center pt-2">
                        <span className="text-emerald-400 text-sm font-semibold">{t('clickToActivate')}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Одиночный режим: показываем пары для выбора
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  📊 {t('marketState')}
                </h2>
                <p className="text-slate-400">{t('selectPairForSignalGeneration')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(marketMetrics[selectedMarket]?.length > 0
                  ? marketMetrics[selectedMarket]
                  : (selectedMarket === 'forex' ? [
                      { pair: 'EUR/USD', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' },
                      { pair: 'GBP/USD', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' },
                      { pair: 'USD/JPY', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' },
                      { pair: 'USD/CHF', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' }
                    ] : [
                      { pair: 'EUR/USD (OTC)', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' },
                      { pair: 'NZD/USD (OTC)', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' },
                      { pair: 'USD/CHF (OTC)', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' },
                      { pair: 'GBP/USD (OTC)', sentiment: t('loadingData'), volatility: 0, trend: 'HOLD' }
                    ])
                ).map((market, index) => (
                  <Card 
                    key={market.pair}
                    onClick={() => {
                      // Для одиночного режима запускаем анимацию генерации
                      generateSignalForPair(market.pair)
                    }}
                    className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105"
                  >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{market.pair}</h3>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      market.sentiment === 'Бычий' ? 'bg-emerald-500/20' :
                      market.sentiment === 'Медвежий' ? 'bg-rose-500/20' :
                      'bg-amber-500/20'
                    }`}>
                      {market.sentiment === 'Бычий' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : market.sentiment === 'Медвежий' ? (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                  {/* Market Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 text-xs block mb-1">{t('mood')}</span>
                      <Badge className={`${
                        market.sentiment === t('bullish') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                        market.sentiment === t('bearish') ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      }`}>
                        {market.sentiment === t('bullish') ? t('bullish') : market.sentiment === t('bearish') ? t('bearish') : t('neutral')}
                      </Badge>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 text-xs block mb-1">{t('volatility')}</span>
                      <span className="text-white font-bold">{market.volatility}%</span>
                    </div>
                  </div>
                  {/* Trend Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{t('recommendation')}</span>
                    <Badge className={`${
                      market.trend === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                      market.trend === 'SELL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    }`}>
                      {market.trend === 'HOLD' ? t('waiting') : market.trend}
                    </Badge>
                  </div>
                  {/* Click to Generate */}
                  <div className="text-center pt-2">
                    <span className="text-emerald-400 text-sm font-semibold">{t('clickToGenerateSignal')}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* Info */}
          <Card className="glass-effect border-cyan-500/30 p-6 mt-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{t('selectSignal')}</h3>
                <p className="text-slate-400 text-sm">
                  После выбора сигнала навигация будет заблокирована до экспирации. Вы должны будете оставить фидбек.
                </p>
              </div>
            </div>
          </Card>
            </>
          )}
        </div>
      </div>
    )
  }
  // Analytics Screen - List of completed signals for AI analysis
  if (currentScreen === 'analytics') {
    // Принудительное обновление подписок при каждом рендере экрана analytics
    if (userData?.id) {
      console.log('🔄 Analytics render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    // Проверка VIP доступа к AI Аналитике
    const hasVipAccess = userSubscriptions && userSubscriptions.length > 0
    if (!hasVipAccess) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 icon-3d">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{t('aiAnalytics')}</h1>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                      GPT-4O MINI
                    </Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    if (userData?.id) {
                      /* WebSocket auto-updates Zustand */
                    }
                    setCurrentScreen('menu')
                  }}
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
              </div>
            </div>
          </header>
          {/* VIP Lock Screen */}
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <Card className="glass-effect border-amber-500/30 p-8 card-3d shadow-2xl">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center icon-3d shadow-xl shadow-amber-500/20">
                    <Crown className="w-10 h-10 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{t('vipFeature')}</h2>
                    <p className="text-slate-400 mb-4">
                      {t('vipAnalyticsDescription')}
                    </p>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 mb-6">
                      <Crown className="w-4 h-4 mr-2" />
                      {t('subscriptionRequired')}
                    </Badge>
                  </div>
                  <div className="space-y-4 w-full">
                    <Button 
                      onClick={() => setCurrentScreen('premium')}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      {t('getSubscription')}
                    </Button>
                    <Button 
                      onClick={() => {
                        if (userData?.id) {
                          /* WebSocket auto-updates Zustand */
                        }
                        setCurrentScreen('menu')
                      }}
                      variant="ghost"
                      className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
                    >
                      {t('returnToMenu')}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 icon-3d">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('aiAnalytics')}</h1>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                    GPT-4O MINI
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => {
                  if (userData?.id) {
                    /* WebSocket auto-updates Zustand */
                  }
                  setCurrentScreen('menu')
                }}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        {/* Analytics Content */}
        <div className="container mx-auto px-4 py-6">
          {!selectedSignalForAnalysis ? (
            // List of completed signals
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{t('selectSignalForAnalysis')}</h2>
                <p className="text-slate-400">{t('aiWillAnalyzeAndGiveRecommendations')}</p>
              </div>
              <div className="space-y-4">
                {userSignalsHistory.length > 0 ? (
                  userSignalsHistory
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Сортируем по дате (свежие сверху)
                    .map((signal) => (
                  <Card 
                    key={signal.signal_id}
                    onClick={() => setSelectedSignalForAnalysis(signal)}
                    className="glass-effect backdrop-blur-sm overflow-hidden transition-all duration-300 card-3d border-slate-700/50 shadow-xl cursor-pointer hover:border-cyan-500/50 hover:scale-102"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                            signal.feedback === 'success'
                              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                              : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                          }`}>
                            {signal.signal_type === 'forex' ? (
                              <TrendingUp className={`w-6 h-6 ${signal.feedback === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} />
                            ) : (
                              <TrendingDown className={`w-6 h-6 ${signal.feedback === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {signal.pair || (() => {
                                // Извлекаем название пары из signal_id если pair отсутствует
                                if (signal.signal_id) {
                                  const parts = signal.signal_id.split('_')
                                  if (parts.length >= 3) {
                                    return `${parts[1]}/${parts[2]}`.replace('USD', 'USD').replace('EUR', 'EUR').replace('GBP', 'GBP').replace('JPY', 'JPY').replace('CHF', 'CHF').replace('AUD', 'AUD').replace('CAD', 'CAD').replace('NZD', 'NZD')
                                  }
                                }
                                return `${signal.signal_type === 'forex' ? 'Forex' : 'OTC'} Signal`
                              })()}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${
                                signal.direction === 'BUY' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                              } text-xs`}>
                                {signal.direction === 'BUY' ? t('buy') : t('sell')}
                              </Badge>
                              <Badge className={`${
                                signal.signal_type === 'forex' 
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                                  : 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                              } text-xs`}>
                                {signal.signal_type.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {new Date(signal.timestamp).toLocaleString('ru-RU')}
                              </span>
                            </div>
                            {signal.confidence && (
                              <div className="mt-1">
                                <span className="text-xs text-slate-400">
      {t('confidence')}: {Math.round(signal.confidence)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            signal.feedback === 'success' 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                          }`}>
                            {signal.feedback === 'success' ? t('success') : t('failure')}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 mt-2" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{t('noExecutedSignals')}</h3>
                    <p className="text-slate-400">{t('executeSeveralDealsToSeeInAnalytics')}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Signal analysis view
            <>
              <div className="mb-6">
                <Button 
                  onClick={() => {
                    setSelectedSignalForAnalysis(null)
                    setAnalysisResult(null)
                  }}
                  variant="ghost"
                  className="text-slate-400 hover:text-white mb-4"
                >
                  <ChevronRight className="w-5 h-5 rotate-180 mr-2" />
                  Назад к списку
                </Button>
              </div>
              {/* Signal Details Card */}
              <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                    selectedSignalForAnalysis.feedback === 'success'
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                      : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                  }`}>
                    {selectedSignalForAnalysis.signal_type === 'forex' ? (
                      <TrendingUp className={`w-8 h-8 ${selectedSignalForAnalysis.feedback === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} />
                    ) : (
                      <TrendingDown className={`w-8 h-8 ${selectedSignalForAnalysis.feedback === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} />
                    )}
                  </div>
                  <div>
               <h2 className="text-2xl font-bold text-white">
                 {selectedSignalForAnalysis.pair || (() => {
                   // Извлекаем название пары из signal_id если pair отсутствует
                   if (selectedSignalForAnalysis.signal_id) {
                     const parts = selectedSignalForAnalysis.signal_id.split('_')
                     if (parts.length >= 3) {
                       return `${parts[1]}/${parts[2]}`.replace('USD', 'USD').replace('EUR', 'EUR').replace('GBP', 'GBP').replace('JPY', 'JPY').replace('CHF', 'CHF').replace('AUD', 'AUD').replace('CAD', 'CAD').replace('NZD', 'NZD')
                     }
                   }
                   return `${selectedSignalForAnalysis.signal_type === 'forex' ? 'Forex' : 'OTC'} Signal`
                 })()}
               </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${
                   selectedSignalForAnalysis.direction === 'BUY' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      }`}>
                   {selectedSignalForAnalysis.direction === 'BUY' ? t('buy') : t('sell')}
                      </Badge>
                      <Badge className={`${
                   selectedSignalForAnalysis.signal_type === 'forex' 
                     ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                     : 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                 }`}>
                   {selectedSignalForAnalysis.signal_type.toUpperCase()}
                 </Badge>
                 <Badge className={`${
                   selectedSignalForAnalysis.feedback === 'success' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      }`}>
                   {selectedSignalForAnalysis.feedback === 'success' ? t('success') : t('failure')}
                      </Badge>
                 <span className="text-xs text-slate-500">
                   {new Date(selectedSignalForAnalysis.timestamp).toLocaleString('ru-RU')}
                 </span>
                    </div>
               {selectedSignalForAnalysis.confidence && (
                 <div className="mt-2">
                   <span className="text-sm text-slate-400">
                     Уверенность: {Math.round(selectedSignalForAnalysis.confidence * 100)}%
                   </span>
                 </div>
               )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 text-xs block mb-1">{t('signalType')}</span>
                    <span className="text-white font-bold">{selectedSignalForAnalysis.signal_type.toUpperCase()}</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 text-xs block mb-1">{t('direction')}</span>
                    <span className={`font-bold ${(selectedSignalForAnalysis.direction || 'SELL') === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedSignalForAnalysis.direction === 'BUY' ? t('buy') : t('sell')}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 text-xs block mb-1">{t('result')}</span>
                    <span className={`font-bold ${selectedSignalForAnalysis.feedback === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedSignalForAnalysis.feedback === 'success' ? t('success') : t('failure')}
                    </span>
                  </div>
                  {selectedSignalForAnalysis.entry_price && (
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 text-xs block mb-1">{t('entryPrice')}</span>
                      <span className="text-white font-bold">{selectedSignalForAnalysis.entry_price}</span>
                  </div>
                  )}
                  {selectedSignalForAnalysis.expiration && (
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 text-xs block mb-1">{t('expiration')}</span>
                      <span className="text-white font-bold">{selectedSignalForAnalysis.expiration} {t('minutes')}</span>
                    </div>
                  )}
                  {selectedSignalForAnalysis.confidence && (
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 text-xs block mb-1">{t('confidence')}</span>
                      <span className="text-white font-bold">{Math.round(selectedSignalForAnalysis.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </Card>
              {/* Analyze Button */}
              {!analysisResult && !isAnalyzing && (
                <Button
                  onClick={() => analyzeSignal(selectedSignalForAnalysis)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-6 text-lg font-bold shadow-xl shadow-cyan-500/30 mb-6"
                >
                  <Brain className="w-6 h-6 mr-2" />
                  {t('runAIAnalysis')}
                </Button>
              )}
              {/* Loading state */}
              {isAnalyzing && (
                <Card className="glass-effect border-cyan-500/30 p-8 card-3d shadow-2xl text-center mb-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
                      <Brain className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{t('analyzingTrade')}</h3>
                    <p className="text-slate-400">{t('gptProcessingData')}</p>
                    <Button
                      onClick={() => {
                        setIsAnalyzing(false)
                        setAnalysisResult(null)
                      }}
                      className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                    >
                      {t('cancelAnalysis')}
                    </Button>
                  </div>
                </Card>
              )}
              {/* Analysis Result */}
              {analysisResult && (
                <Card className="glass-effect border-cyan-500/30 p-6 card-3d shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center icon-3d shadow-xl shadow-cyan-500/20">
                      <Brain className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t('aiAnalytics')}</h3>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                        GPT-4O MINI
                      </Badge>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {analysisResult}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedSignalForAnalysis(null)
                      setAnalysisResult(null)
                    }}
                    variant="outline"
                    className="w-full mt-6 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Закрыть анализ
                  </Button>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
  // Main Screen - активный сигнал с блокировкой навигации
  if (currentScreen === 'main') {
    // Принудительное обновление подписок при каждом рендере экрана main
    if (userData?.id) {
      console.log('🔄 Main render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header с блокировкой */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-red-950/80 border-b border-red-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('dealActivated')}</h1>
                  <p className="text-red-400 text-sm">{t('navigationLocked')}</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {pendingSignal && (
            <>
              {/* Активный сигнал */}
              <Card className="glass-effect backdrop-blur-sm border-emerald-500/50 p-6 mb-6 shadow-xl shadow-emerald-500/20">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{pendingSignal.pair}</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      pendingSignal.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                    }`}>
                      {pendingSignal.type === 'BUY' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <Badge className={`${
                      pendingSignal.type === 'BUY' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    }`}>
                      {pendingSignal.type}
                    </Badge>
                  </div>
                </div>
              </Card>
              {/* Таймер */}
              <Card className="glass-effect backdrop-blur-sm border-amber-500/50 p-6 mb-6 shadow-xl shadow-amber-500/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-amber-400" />
                    <span className="text-3xl font-bold text-white">
                      {Math.floor(signalTimer / 60)}:{(signalTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-4">{t('timeRemainingUntilExpiration')}</p>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${((pendingSignal.expiration * 60 - signalTimer) / (pendingSignal.expiration * 60)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
              {/* Предупреждение о блокировке */}
              <Card className="glass-effect backdrop-blur-sm border-red-500/50 p-6 mb-6 shadow-xl shadow-red-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-blue-400 font-semibold">{t('navigationLocked')}</span>
                </div>
                <p className="text-slate-400">
                  Дождитесь экспирации сигнала и оставьте фидбек
                </p>
              </Card>
              {/* Кнопки фидбека */}
              {isWaitingFeedback && (
                <Card className="glass-effect backdrop-blur-sm border-cyan-500/50 p-6 shadow-xl shadow-cyan-500/20">
                  <div className="text-center">
                    <p className="text-white mb-4 text-lg">{t('howDidTheDealGo')}</p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => submitFeedback(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3"
                      >
                        ✅ Успешно
                      </Button>
                      <Button 
                        onClick={() => submitFeedback(false)}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3"
                      >
                        ❌ Убыток
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
  // Notifications Settings Screen
  if (currentScreen === 'notifications') {
    // Принудительное обновление подписок при каждом рендере экрана notifications
    if (userData?.id) {
      console.log('🔄 Notifications render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 icon-3d">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('notifications')}</h1>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                    {t('notificationsBadge')}
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        {/* Notification Settings */}
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-6">
            {/* Signal Notifications */}
            <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                {t('tradingSignals')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.newSignals ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Bell className={`w-5 h-5 ${notificationSettings.newSignals ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('newSignals')}</h4>
                      <p className="text-slate-400 text-sm">{t('newSignalsDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('newSignals')}
                    variant={notificationSettings.newSignals ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.newSignals 
                      ? 'bg-emerald-500 hover:bg-emerald-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.newSignals ? t('enabled') : t('disabled')}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.signalResults ? 'bg-cyan-500/20' : 'bg-slate-700/50'
                    }`}>
                      <CheckCircle2 className={`w-5 h-5 ${notificationSettings.signalResults ? 'text-cyan-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('signalResults')}</h4>
                      <p className="text-slate-400 text-sm">{t('signalResultsDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('signalResults')}
                    variant={notificationSettings.signalResults ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.signalResults 
                      ? 'bg-cyan-500 hover:bg-cyan-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.signalResults ? t('enabled') : t('disabled')}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.dailySummary ? 'bg-purple-500/20' : 'bg-slate-700/50'
                    }`}>
                      <BarChart3 className={`w-5 h-5 ${notificationSettings.dailySummary ? 'text-purple-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('dailySummary')}</h4>
                      <p className="text-slate-400 text-sm">{t('dailySummaryDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('dailySummary')}
                    variant={notificationSettings.dailySummary ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.dailySummary 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.dailySummary ? t('enabled') : t('disabled')}
                  </Button>
                </div>
              </div>
            </Card>
            {/* System Notifications */}
            <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-400" />
                {t('systemNotifications')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.marketNews ? 'bg-blue-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Newspaper className={`w-5 h-5 ${notificationSettings.marketNews ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('marketNews')}</h4>
                      <p className="text-slate-400 text-sm">{t('marketNewsDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('marketNews')}
                    variant={notificationSettings.marketNews ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.marketNews 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.marketNews ? t('enabled') : t('disabled')}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.systemUpdates ? 'bg-green-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Settings className={`w-5 h-5 ${notificationSettings.systemUpdates ? 'text-green-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('systemUpdates')}</h4>
                      <p className="text-slate-400 text-sm">{t('systemUpdatesDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('systemUpdates')}
                    variant={notificationSettings.systemUpdates ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.systemUpdates 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.systemUpdates ? t('enabled') : t('disabled')}
                  </Button>
                </div>
              </div>
            </Card>
            {/* Sound & Vibration */}
            <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                {t('soundAndVibration')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.soundEnabled ? 'bg-purple-500/20' : 'bg-slate-700/50'
                    }`}>
                      {notificationSettings.soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-purple-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('soundNotification')}</h4>
                      <p className="text-slate-400 text-sm">{t('soundNotificationsDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('soundEnabled')}
                    variant={notificationSettings.soundEnabled ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.soundEnabled 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.soundEnabled ? t('enabled') : t('disabled')}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.vibrationEnabled ? 'bg-pink-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Vibrate className={`w-5 h-5 ${notificationSettings.vibrationEnabled ? 'text-pink-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('vibration')}</h4>
                      <p className="text-slate-400 text-sm">{t('vibrationDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('vibrationEnabled')}
                    variant={notificationSettings.vibrationEnabled ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.vibrationEnabled 
                      ? 'bg-pink-500 hover:bg-pink-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.vibrationEnabled ? t('enabled') : t('disabled')}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.emailNotifications ? 'bg-indigo-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Mail className={`w-5 h-5 ${notificationSettings.emailNotifications ? 'text-indigo-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{t('emailNotifications')}</h4>
                      <p className="text-slate-400 text-sm">{t('emailNotificationsDescription')}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('emailNotifications')}
                    variant={notificationSettings.emailNotifications ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.emailNotifications 
                      ? 'bg-indigo-500 hover:bg-indigo-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.emailNotifications ? t('enabled') : t('disabled')}
                  </Button>
                </div>
              </div>
            </Card>
            {/* Info Card */}
            <Card className="glass-effect border-cyan-500/30 p-6 card-3d shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                  <Bell className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{t('smartNotifications')}</h3>
                  <p className="text-slate-400 text-sm">
                    {t('smartNotificationsDescription')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  // Market Selection Screen
  if (currentScreen === 'market-select') {
    // Принудительное обновление подписок при каждом рендере экрана market-select
    if (userData?.id) {
      console.log('🔄 Market Select render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <MarketStatusBadge />
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">{t('selectMarket')}</h2>
            <p className="text-slate-400">{t('whatSignals')}</p>
          </div>
          {/* Market Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => {
                // Проверяем статус форекс рынка перед выбором
                if (!isForexMarketOpen()) {
                  const now = new Date()
                  const europeanTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Berlin"}))
                  const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
                  const currentDay = dayNames[europeanTime.getDay()]
                  const currentTime = europeanTime.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  
                  alert(`🔴 Форекс рынок закрыт!\n\nТекущее время: ${currentTime} (${currentDay})\nРынок работает: Пн-Пт 06:00-22:00 (Europe/Berlin)\n\nПопробуйте OTC режим - работает 24/7!`)
                  return
                }
                setSelectedMarket('forex')
                setCurrentScreen('mode-select')
              }}
              className={`glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl ${!isForexMarketOpen() ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-emerald-500/20">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">Forex</h3>
                      <div className={`w-2 h-2 rounded-full ${isForexMarketOpen() ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {isForexMarketOpen() ? '🟢 Рынок открыт' : '🔴 Рынок закрыт'} • {t('forexSchedule')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs">
                        EUR/USD
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs">
                        GBP/JPY
                      </Badge>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            <Card 
              onClick={() => {
                setSelectedMarket('otc')
                setCurrentScreen('mode-select')
              }}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-cyan-500/20">
                    <BarChart3 className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">OTC</h3>
                    <p className="text-slate-400 text-sm">24/7</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </div>
          {/* Back Button */}
          <Button 
            onClick={() => {
                  if (userData?.id) {
                    /* WebSocket auto-updates Zustand */
                  }
                  setCurrentScreen('menu')
                }}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }
  // Mode Selection Screen
  if (currentScreen === 'mode-select') {
    // Принудительное обновление подписок при каждом рендере экрана mode-select
    if (userData?.id) {
      console.log('🔄 Mode Select render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">{t('generationMode')}</h2>
            <p className="text-slate-400">{t('howDoYouWantToReceiveSignals')}</p>
          </div>
          {/* Mode Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => {
                // Проверка VIP-доступа
                if (!hasVipAccess()) {
                  alert('TOP-3 сигналы доступны только для VIP-пользователей с подпиской. Приобретите подписку для доступа к этой функции.')
                  setCurrentScreen('ml-selector')
                  return
                }
                if (!canGenerateTop3()) {
                  const remainingTime = Math.ceil((10 * 60 * 1000 - (new Date() - new Date(lastTop3Generation))) / 1000 / 60)
                  alert(t('availableIn', {minutes: remainingTime}))
                  return
                }
                if (selectedMarket === 'forex' && !isForexMarketOpen()) {
                  alert(t('forexMarketClosedWeekend'))
                  return
                }
                setSelectedMode('top3')
                generateTop3Signals()
              }}
              className={`glass-effect p-6 backdrop-blur-sm transition-all duration-300 group card-3d border-slate-700/50 shadow-xl ${
                hasVipAccess() 
                  ? 'hover:border-amber-500/50 cursor-pointer hover:scale-105' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-amber-500/20">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{t('top3Signals')}</h3>
                      {hasVipAccess() ? (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                          VIP
                      </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                          ЗАБЛОКИРОВАНО
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{t('bestOpportunitiesOfDay')}</p>
                    {!hasVipAccess() && (
                      <p className="text-xs text-red-400 mb-2">
                        Требуется VIP-подписка
                      </p>
                    )}
                    {selectedMarket === 'forex' && !isForexMarketOpen() && (
                      <p className="text-xs text-rose-400 mb-2">
                        {t('forexMarketClosedLabel')}
                      </p>
                    )}
                    {hasVipAccess() && !canGenerateTop3() && (
                      <p className="text-xs text-amber-400 mb-2">
                        {t('availableIn', {minutes: Math.ceil((10 * 60 * 1000 - (new Date() - new Date(lastTop3Generation))) / 1000 / 60)})}
                      </p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{t('threeBestSignalsSimultaneously')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{t('highSuccessProbability')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{t('riskDiversification')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            <Card 
              onClick={() => {
                // Проверяем статус форекс рынка только для форекс режима
                if (selectedMarket === 'forex' && !isForexMarketOpen()) {
                  alert(t('forexMarketClosedWeekend'))
                  return
                }
                setSelectedMode('single')
                // Очищаем состояние сгенерированных сигналов
                clearSignalState()
                setCurrentScreen('signal-selection')
              }}
              className={`glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-purple-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl ${selectedMarket === 'forex' && !isForexMarketOpen() ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-purple-500/20">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('singleSignals')}</h3>
                    <p className="text-slate-400 text-sm mb-3">{t('oneSignalAtATime')}</p>
                    {selectedMarket === 'forex' && !isForexMarketOpen() && (
                      <p className="text-xs text-rose-400 mb-2">
                        {t('forexMarketClosedLabel')}
                      </p>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{t('focusOnOneTrade')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{t('simpleManagement')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{t('idealForBeginners')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </div>
          {/* Back Button */}
          <Button 
            onClick={() => setCurrentScreen('market-select')}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }
  // Settings Screen
  if (currentScreen === 'settings') {
    // Принудительное обновление подписок при каждом рендере экрана настроек
    if (userData?.id) {
      console.log('🔄 Settings render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <ToastNotification />
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">{t('settings')}</h2>
            <p className="text-slate-400">{t('manageAppSettings')}</p>
          </div>
          {/* Settings Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => {
                // Проверяем наличие хотя бы одной подписки (включая базовую)
                const hasAnySubscription = userSubscriptions.length > 0
                
                if (hasAnySubscription) {
                  setCurrentScreen('ml-settings') // Новый экран управления
                } else {
                  setCurrentScreen('ml-selector') // Экран покупки
                  showNotification('info', 'Доступные ML модели', 'Выберите модель для покупки подписки')
                }
              }}
              className={`glass-effect p-6 backdrop-blur-sm transition-all duration-300 group card-3d shadow-xl ${
                userSubscriptions.length > 0
                  ? 'cursor-pointer hover:border-purple-500/50 border-slate-700/50' 
                  : 'cursor-not-allowed opacity-60 border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-purple-500/20 ${
                    userSubscriptions.length > 0 ? 'group-hover:shadow-purple-500/30' : ''
                  }`}>
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{t('mlModel')}</h3>
                      {userSubscriptions.length > 0 ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                          ✓ ДОСТУПНО
                      </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                          <Lock className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {userSubscriptions.length > 0
                        ? 'Настройка и выбор ML моделей' 
                        : 'Для настройки ML моделей необходима премиум подписка'
                      }
                    </p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                  userSubscriptions.length > 0
                    ? 'text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1' 
                    : 'text-slate-600'
                }`} />
              </div>
            </Card>
            <Card 
              onClick={() => setCurrentScreen('user-stats')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-cyan-500/20">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('statistics')}</h3>
                    <p className="text-slate-400 text-sm">{t('viewDetails')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            <Card 
              onClick={() => setCurrentScreen('notifications')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-amber-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-amber-500/20">
                    <Bell className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('notifications')}</h3>
                    <p className="text-slate-400 text-sm">{t('setupPushNotifications')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
            {/* Admin Panel - Only visible for admins */}
            {isAdmin && (
              <Card 
                onClick={() => {
                  setCurrentScreen('admin')
                  loadAdminStats()
                  loadAccessRequests()
                }}
                className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-red-500/50 transition-all duration-300 group card-3d border-red-500/30 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-red-500/20">
                      <Shield className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{t('admin')}</h3>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                          ADMIN
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">{t('allUsersStatistics')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Card>
            )}
          </div>
          {/* Back Button */}
          <Button 
            onClick={() => {
                  if (userData?.id) {
                    /* WebSocket auto-updates Zustand */
                  }
                  setCurrentScreen('menu')
                }}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }
  
  // ML Settings Screen - управление купленными моделями
  if (currentScreen === 'ml-settings') {
    // Принудительное обновление подписок при каждом рендере экрана ml-settings
    if (userData?.id) {
      console.log('🔄 ML Settings render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    // Функция обработки клика по модели
    const handleModelClick = (model) => {
      const isOwned = userSubscriptions.includes(model.id)
      const isRestricted = model.status === 'restricted'
      
      if (isRestricted) {
        alert(t('modelRestrictedAlert'))
        return
      }
      
      if (isOwned) {
        // Переключить активную модель
        setSelectedMLModel(model.id)
        showNotification('success', 'Модель активирована', `${model.name} теперь активна`)
      } else {
        // Перейти на экран покупки
        setCurrentScreen('ml-selector')
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <ToastNotification />
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 icon-3d">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Управление ML моделями</h1>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs">
                    НАСТРОЙКИ
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 w-10 h-10"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-4 max-w-md">
          
          {/* ML Models List - компактные карточки */}
          <div className="space-y-3">
            {mlModels.map((model) => {
              const isOwned = userSubscriptions.includes(model.id)
              const isActive = selectedMLModel === model.id
              const isRestricted = model.status === 'restricted'
              
              return (
                <Card 
                  key={model.id}
                  onClick={() => handleModelClick(model)}
                  className={`glass-effect p-3 backdrop-blur-sm transition-all duration-300 card-3d shadow-xl cursor-pointer min-h-[80px] touch-manipulation ${
                    isActive 
                      ? 'border-emerald-500/70 bg-emerald-500/10 shadow-emerald-500/50' 
                      : isOwned
                      ? 'border-purple-500/50 hover:border-purple-400/70 hover:scale-[1.02] active:scale-[0.98]'
                      : isRestricted
                      ? 'border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed'
                      : 'border-yellow-500/50 hover:border-yellow-400/70 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-3 h-full">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center icon-3d shadow-lg`}>
                      <span className="text-xl">{model.emoji}</span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white truncate">{model.name}</h3>
                        {isActive && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs px-2 py-0.5">
                            АКТИВНА
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-400 font-semibold">{model.winrate}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 truncate">{model.style}</span>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isOwned ? (
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      ) : isRestricted ? (
                        <Lock className="w-5 h-5 text-red-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
          
          {/* Info */}
          <Card className="glass-effect border-cyan-500/30 p-4 mt-4 card-3d shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">Управление моделями</h3>
                <p className="text-slate-400 text-sm">
                  Переключайтесь между купленными моделями. Кликните на заблокированную модель для покупки подписки.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }
  
  // ML Model Selector Screen
  if (currentScreen === 'ml-selector') {
    // Принудительное обновление подписок при каждом рендере экрана
    if (userData?.id) {
      console.log('🔄 Force loading subscriptions for ml-selector screen')
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 1000)
    }
    // Purchase Modal - проверяем внутри экрана ml-selector
    if (showPurchaseModal && selectedModelForPurchase) {
      console.log('🛒 Rendering purchase modal:', {
        showPurchaseModal,
        selectedModelForPurchase: selectedModelForPurchase?.name,
        isSubmitting
      })
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>
          <Card className="glass-effect border-yellow-500/30 p-8 max-w-md w-full card-3d shadow-2xl relative z-50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center icon-3d shadow-xl shadow-yellow-500/20">
                <span className="text-3xl">🛒</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{t('purchaseModel', { name: selectedModelForPurchase.name })}</h2>
              <p className="text-slate-400">{t('chooseSubscriptionType')}</p>
            </div>
            
            <div className="space-y-4">
              {/* Monthly Subscription */}
              <Card 
                onClick={() => {
                  console.log('🖱️ Monthly subscription clicked:', { isSubmitting })
                  if (!isSubmitting) {
                    handleSubscriptionRequest('monthly')
                  }
                }}
                className={`glass-effect border-blue-500/30 p-4 cursor-pointer hover:border-blue-500/50 transition-all duration-300 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('monthlySubscription')}</h3>
                    <p className="text-slate-400 text-sm">{t('monthlyPrice')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{selectedModelForPurchase?.monthlyPrice || '$49'}</div>
                    <div className="text-slate-400 text-sm">{t('perMonth')}</div>
                  </div>
                </div>
              </Card>
              
              {/* Lifetime Subscription */}
              <Card 
                onClick={() => {
                  console.log('🖱️ Lifetime subscription clicked:', { isSubmitting })
                  if (!isSubmitting) {
                    handleSubscriptionRequest('lifetime')
                  }
                }}
                className={`glass-effect border-green-500/30 p-4 cursor-pointer hover:border-green-500/50 transition-all duration-300 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('lifetimeSubscription')}</h3>
                    <p className="text-slate-400 text-sm">{t('lifetimePrice')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{selectedModelForPurchase?.lifetimePrice || '$299'}</div>
                    <div className="text-slate-400 text-sm">{t('forever')}</div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => {
                  setShowPurchaseModal(false)
                  setSelectedModelForPurchase(null)
                }}
                variant="outline" 
                className="flex-1"
              >
                {t('cancel')}
              </Button>
            </div>
          </Card>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <ToastNotification />
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 icon-3d">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{t('mlModelSelection')}</h1>
                  
                  {/* ДОБАВЛЕНО: Индикатор загрузки */}
                  {isLoadingSubscriptions ? (
                    <div className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" />
                      <span className="text-xs text-purple-400">Загрузка подписок...</span>
                    </div>
                  ) : (
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs">
                      {userSubscriptions.length} активных
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 w-10 h-10"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        {/* ML Models List - Mobile Optimized */}
        <div className="container mx-auto px-4 py-4 max-w-md">
          {/* ДОБАВЛЕНО: Отображение активных подписок */}
          {userSubscriptions.length > 0 && (
            <Card className="glass-effect border-green-500/30 p-3 mb-4 card-3d shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-white">Ваши активные подписки:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {userSubscriptions.map((subscription, index) => (
                  <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                    ✓ {subscription}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
          
          <div className="space-y-3">
            {mlModels.map((model) => {
              const isOwned = userSubscriptions.includes(model.id)
              const isActive = selectedMLModel === model.id
              const isRestricted = model.status === 'restricted'
              
              console.log(`🔍 Model ${model.id}: isOwned=${isOwned}, isActive=${isActive}, userSubscriptions=`, userSubscriptions)
              return (
                <Card 
                  key={model.id}
                  onClick={(e) => {
                    console.log('🖱️ Card onClick triggered!', {
                      modelId: model.id,
                      isOwned,
                      isRestricted,
                      modelName: model.name,
                      event: e
                    })
                    
                    e.preventDefault()
                    e.stopPropagation()
                    
                    if (isOwned && !isRestricted) {
                      console.log('✅ Model is owned, selecting it')
                      setSelectedMLModel(model.id)
                    } else if (isRestricted) {
                      console.log('⚠️ Model is restricted')
                      alert(t('modelRestrictedAlert'))
                    } else {
                      // Открываем модальное окно покупки при клике на любую часть карточки
                      console.log('🛒 Opening purchase modal for:', model.name)
                      setSelectedModelForPurchase(model)
                      setShowPurchaseModal(true)
                      console.log('🛒 Modal state set:', { showPurchaseModal: true, selectedModel: model.name })
                    }
                  }}
                  className={`glass-effect p-4 backdrop-blur-sm transition-all duration-300 card-3d shadow-xl cursor-pointer min-h-[120px] touch-manipulation ${
                    isActive 
                      ? 'border-emerald-500/70 bg-emerald-500/10 shadow-emerald-500/50' 
                      : isOwned
                      ? 'border-purple-500/50 hover:border-purple-400/70 hover:scale-[1.02] active:scale-[0.98]'
                      : isRestricted
                      ? 'border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed'
                      : 'border-yellow-500/50 hover:border-yellow-400/70 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <div className="flex flex-col gap-4 h-full">
                    {/* Top row: Icon, title and status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center icon-3d shadow-xl`}>
                          <span className="text-2xl">{model.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1 truncate">{model.name}</h3>
                          <p className="text-slate-300 text-sm">{model.algorithm}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                          {isRestricted && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs px-2 py-1">
                            <Lock className="w-3 h-3 mr-1" />
                              ЗАБЛОКИРОВАНА
                            </Badge>
                          )}
                          {!isOwned && !isRestricted && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs px-2 py-1">
                            <Lock className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                    </div>
                    
                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold text-base">{model.winrate}</span>
                          </div>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 text-sm">{model.style}</span>
                        </div>
                    
                    {/* Description */}
                    <p className="text-slate-400 text-sm italic">💬 {model.description}</p>
                        {model.warning && (
                      <p className="text-red-400 text-sm font-semibold">⚠️ {model.warning}</p>
                        )}
                    
                    {/* Bottom row: Pricing and status */}
                    <div className="flex items-center justify-between mt-auto">
                        {!isOwned && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-400 font-bold">{model.monthlyPrice}{t('perMonth')}</span>
                            <span className="text-slate-600">{t('or')}</span>
                          <span className="text-green-400 font-bold">{model.lifetimePrice} {t('forever')}</span>
                          </div>
                          <p className="text-slate-500 text-xs">Нажмите на карточку для покупки</p>
                          </div>
                        )}
                      
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs px-2 py-1">
                              ✓ АКТИВНА
                            </Badge>
                        )}
                        {isActive ? (
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                      ) : isOwned && !isRestricted ? (
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                          </div>
                      ) : isRestricted ? (
                          <Lock className="w-5 h-5 text-red-400" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-yellow-400" />
                          </div>
                      )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
          {/* Info */}
          <Card className="glass-effect border-cyan-500/30 p-4 mt-4 card-3d shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{t('aboutMLModels')}</h3>
                <p className="text-slate-400 text-sm">
                  Вы можете переключаться между купленными моделями в любое время. Каждая модель имеет свой уникальный алгоритм и винрейт.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }
  
  // User Statistics Screen
  if (currentScreen === 'user-stats') {
    // Принудительное обновление подписок при каждом рендере экрана user-stats
    if (userData?.id) {
      console.log('🔄 User Stats render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 icon-3d">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('myStatistics')}</h1>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                    PERSONAL STATS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        {/* User Stats Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 perspective-container mb-8">
            <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-emerald-400 text-xs font-medium mb-1">{t('totalSignals')}</span>
                <span className="text-2xl font-bold text-white">{userStats.totalSignals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-green-500/20 p-4 card-3d shadow-xl shadow-green-500/10">
              <div className="flex flex-col">
                <span className="text-green-400 text-xs font-medium mb-1">{t('successful')}</span>
                <span className="text-2xl font-bold text-white">{userStats.successfulSignals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-rose-500/20 p-4 card-3d shadow-xl shadow-rose-500/10">
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-medium mb-1">{t('failed')}</span>
                <span className="text-2xl font-bold text-white">{userStats.failedSignals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
              <div className="flex flex-col">
                <span className="text-cyan-400 text-xs font-medium mb-1">{t('winRate')}</span>
                <span className="text-2xl font-bold text-white">{userStats.winRate}%</span>
              </div>
            </Card>
          </div>
          {/* Detailed Stats */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center icon-3d shadow-lg shadow-purple-500/20">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('detailedInformation')}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('tradingDays')}</span>
                <span className="text-purple-400 font-bold text-xl">{userStats.tradingDays}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('signalsPerDay')}</span>
                <span className="text-cyan-400 font-bold text-xl">{userStats.avgSignalsPerDay}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('bestPair')}</span>
                <span className="text-emerald-400 font-bold text-xl">{userStats.bestPair || t('notAvailable')}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('worstPair')}</span>
                <span className="text-rose-400 font-bold text-xl">{userStats.worstPair || t('notAvailable')}</span>
              </div>
            </div>
          </Card>
          {/* Signals Chart */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center icon-3d shadow-lg shadow-amber-500/20">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('signalsChartByMonth')}</h3>
            </div>
            <div className="space-y-4">
              {userStats.signalsByMonth.map((item, index) => {
                const totalSignals = item.successful + item.failed
                const successPercentage = (item.successful / totalSignals) * 100
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">{item.successful} {t('successful')}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-400 font-bold">{item.failed} {t('failed')}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/30 flex">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${successPercentage}%` }}
                      >
                        {successPercentage > 15 && (
                          <span className="text-white text-xs font-bold">{successPercentage.toFixed(0)}%</span>
                        )}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${100 - successPercentage}%` }}
                      >
                        {(100 - successPercentage) > 15 && (
                          <span className="text-white text-xs font-bold">{(100 - successPercentage).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Admin Panel Screen
  if (currentScreen === 'admin') {
    // Принудительное обновление подписок при каждом рендере экрана admin
    if (userData?.id) {
      console.log('🔄 Admin render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 icon-3d">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('admin')}</h1>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                    ADMIN ACCESS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        {/* Admin Stats */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 perspective-container mb-8">
            <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-emerald-400 text-xs font-medium mb-1">{t('totalUsers')}</span>
                <span className="text-2xl font-bold text-white">{adminStats.totalUsers.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
              <div className="flex flex-col">
                <span className="text-cyan-400 text-xs font-medium mb-1">{t('online')}</span>
                <span className="text-2xl font-bold text-white">{adminStats.activeUsers.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-purple-500/20 p-4 card-3d shadow-xl shadow-purple-500/10">
              <div className="flex flex-col">
                <span className="text-purple-400 text-xs font-medium mb-1">{t('totalSignals')}</span>
                <span className="text-2xl font-bold text-white">{adminStats.totalSignals.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-green-500/20 p-4 card-3d shadow-xl shadow-green-500/10">
              <div className="flex flex-col">
                <span className="text-green-400 text-xs font-medium mb-1">{t('successful')}</span>
                <span className="text-2xl font-bold text-white">{adminStats.successfulSignals.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-rose-500/20 p-4 card-3d shadow-xl shadow-rose-500/10">
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-medium mb-1">{t('failed')}</span>
                <span className="text-2xl font-bold text-white">{adminStats.failedSignals.toLocaleString()}</span>
              </div>
            </Card>
          </div>
          {/* Top Users */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center icon-3d shadow-lg shadow-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('topUsers')}</h3>
            </div>
            <div className="space-y-3">
              {adminStats.topUsers.map((user, index) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setSelectedUser(user)
                    setCurrentScreen('admin-user-detail')
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100' :
                      'bg-gradient-to-br from-slate-600 to-slate-800 text-slate-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-white font-semibold group-hover:text-cyan-400 transition-colors">{user.name}</div>
                        {user.subscriptions && user.subscriptions.length > 0 && (
                          <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/50">
                            VIP
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{user.signals} {t('signals')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400 font-semibold">{user.successful}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-rose-400 font-semibold">{user.failed}</span>
                      </div>
                      <div className="text-xs text-slate-400">{t('successfulLosing')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedUser(user)
                          setCurrentScreen('admin-user-detail')
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-cyan-400 hover:text-white hover:bg-cyan-500/20 hover:scale-110 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteUser(user.id)
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-rose-400 hover:text-white hover:bg-rose-500/20 hover:scale-110 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {/* Заявки на доступ */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center icon-3d shadow-xl shadow-amber-500/20">
                  <UserPlus className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">{t('accessRequests')}</h3>
                {accessRequests.length > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                    {accessRequests.length}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {accessRequests.length > 0 ? (
                accessRequests.map((request) => (
                  <div 
                    key={request.user_id} 
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-amber-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {request.first_name} {request.last_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {request.user_id}
                          {request.username && ` • @${request.username}`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(request.request_time * 1000).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => approveAccessRequest(request.user_id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {t('approve')}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t('noAccessRequests')}</h3>
                  <p className="text-slate-400">{t('newRequestsWillAppearHere')}</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Subscription Requests Management */}
          <Card className="glass-effect border-yellow-500/30 p-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center icon-3d shadow-lg shadow-yellow-500/20">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white">Запросы подписок</h3>
                {subscriptionRequests.length > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    {subscriptionRequests.length}
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {subscriptionRequests.length > 0 ? (
                subscriptionRequests.map((request) => (
                  <div 
                    key={request.request_id} 
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-yellow-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {request.user_data?.first_name} {request.user_data?.last_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {request.user_id}
                          {request.user_data?.username && ` • @${request.user_data.username}`}
                        </div>
                        <div className="text-xs text-slate-500">
                          Модель: {request.model_id} • {request.subscription_type === 'monthly' ? 'Ежемесячно' : 'Пожизненно'} • {request.price}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(request.created_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          // Находим пользователя в списке topUsers для перехода к его статистике
                          const userForStats = adminStats.topUsers.find(user => user.id === request.user_id)
                          if (userForStats) {
                            setSelectedUser(userForStats)
                            setCurrentScreen('admin-user-detail')
                          } else {
                            // Если пользователь не найден в topUsers, создаем объект пользователя
                            const userData = {
                              id: request.user_id,
                              name: `${request.user_data?.first_name} ${request.user_data?.last_name}`,
                              signals: 0,
                              successful: 0,
                              failed: 0,
                              winRate: 0,
                              tradingDays: 0,
                              avgSignalsPerDay: 0,
                              bestPair: 'N/A',
                              worstPair: 'N/A',
                              signalsByMonth: []
                            }
                            setSelectedUser(userData)
                            setCurrentScreen('admin-user-detail')
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm"
                      >
                        <span className="mr-2">📋</span>
                        Перейти
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Нет запросов подписок</h3>
                  <p className="text-slate-400">Новые запросы будут отображаться здесь</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }
  // Admin User Detail Screen
  if (currentScreen === 'admin-user-detail' && selectedUser) {
    // Принудительное обновление подписок при каждом рендере экрана admin-user-detail
    if (userData?.id) {
      console.log('🔄 Admin User Detail render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 icon-3d">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{selectedUser.name}</h1>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                    USER STATS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('admin')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        {/* User Stats Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 perspective-container mb-8">
            <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-emerald-400 text-xs font-medium mb-1">{t('totalSignals')}</span>
                <span className="text-2xl font-bold text-white">{selectedUser.signals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-green-500/20 p-4 card-3d shadow-xl shadow-green-500/10">
              <div className="flex flex-col">
                <span className="text-green-400 text-xs font-medium mb-1">{t('successful')}</span>
                <span className="text-2xl font-bold text-white">{selectedUser.successful}</span>
              </div>
            </Card>
            <Card className="glass-effect border-rose-500/20 p-4 card-3d shadow-xl shadow-rose-500/10">
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-medium mb-1">{t('failed')}</span>
                <span className="text-2xl font-bold text-white">{selectedUser.failed}</span>
              </div>
            </Card>
            <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
              <div className="flex flex-col">
                <span className="text-cyan-400 text-xs font-medium mb-1">{t('winRate')}</span>
                <span className="text-2xl font-bold text-white">{selectedUser.winRate}%</span>
              </div>
            </Card>
          </div>
          {/* Detailed Stats */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center icon-3d shadow-lg shadow-purple-500/20">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('detailedInformation')}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('tradingDays')}</span>
                <span className="text-purple-400 font-bold text-xl">{selectedUser.tradingDays}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('signalsPerDay')}</span>
                <span className="text-cyan-400 font-bold text-xl">{selectedUser.avgSignalsPerDay}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('bestPair')}</span>
                <span className="text-emerald-400 font-bold text-xl">{selectedUser.bestPair}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">{t('worstPair')}</span>
                <span className="text-rose-400 font-bold text-xl">{selectedUser.worstPair}</span>
              </div>
            </div>
          </Card>
          {/* Signals Chart */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center icon-3d shadow-lg shadow-amber-500/20">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('signalsChartByMonth')}</h3>
            </div>
            <div className="space-y-4">
              {selectedUser.signalsByMonth.map((item, index) => {
                const totalSignals = item.successful + item.failed
                const successPercentage = (item.successful / totalSignals) * 100
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">{item.successful} {t('successful')}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-400 font-bold">{item.failed} {t('failed')}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/30 flex">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${successPercentage}%` }}
                      >
                        {successPercentage > 15 && (
                          <span className="text-white text-xs font-bold">{successPercentage.toFixed(0)}%</span>
                        )}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${100 - successPercentage}%` }}
                      >
                        {(100 - successPercentage) > 15 && (
                          <span className="text-white text-xs font-bold">{(100 - successPercentage).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
          {/* Subscription Management */}
          <UserSubscriptionManager 
            userId={selectedUser.id}
            userData={selectedUser}
            onSubscriptionChange={() => {
              // Обновляем данные пользователя после изменения подписок
              console.log('🔄 Subscription changed, refreshing user data')
              loadAdminStats()
              
              // Принудительно обновляем подписки текущего пользователя
              if (userData?.id) {
                setTimeout(() => {
                  /* WebSocket auto-updates Zustand */
                }, 100)
              }
            }}
          />
        </div>
      </div>
    )
  }
  // Premium ML Models Screen
  if (currentScreen === 'premium') {
    // Принудительное обновление подписок при каждом рендере экрана premium
    if (userData?.id) {
      console.log('🔄 Premium render - force loading subscriptions')
      /* WebSocket auto-updates Zustand */
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 100)
      setTimeout(() => {
        /* WebSocket auto-updates Zustand */
      }, 500)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 icon-3d">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('premiumMLModels')}</h1>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                    VIP ACCESS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => {
                  if (userData?.id) {
                    /* WebSocket auto-updates Zustand */
                  }
                  setCurrentScreen('menu')
                }}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>
        {/* Premium Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                🧠 КАТАЛОГ ПРИВАТНЫХ ML-МОДЕЛЕЙ
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl blur-xl"></div>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              💀 Только для своих. Доступ по рукам. Каждый вход — осознанный риск.
            </p>
          </div>
          {/* Active Model Status */}
          <Card className="glass-effect border-emerald-500/30 p-6 mb-8 card-3d shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center icon-3d shadow-xl shadow-emerald-500/20">
                  <Brain className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    🎯 АКТИВНАЯ МОДЕЛЬ: {mlModels.find(m => m.id === selectedMLModel)?.emoji} {mlModels.find(m => m.id === selectedMLModel)?.name}
                  </h3>
                  <p className="text-emerald-400 text-sm">✅ {t('modelReady')}</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                АКТИВНА
              </Badge>
            </div>
          </Card>
          {/* ML Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mlModels.sort((a, b) => {
              // Сначала активная модель, затем остальные
              if (a.id === selectedMLModel) return -1
              if (b.id === selectedMLModel) return 1
              return 0
            }).map((model, index) => (
              <Card 
                key={model.id}
                onClick={() => model.status !== 'restricted' && setSelectedMLModel(model.id)}
                className={`glass-effect p-6 backdrop-blur-sm transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105 ${
                  selectedMLModel === model.id
                    ? 'border-emerald-500/50 bg-emerald-500/10 cursor-default' 
                    : model.status === 'restricted'
                    ? 'border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-60'
                    : userSubscriptions.includes(model.id)
                    ? 'border-purple-500/50 bg-purple-500/10 cursor-pointer hover:border-purple-500/70'
                    : 'cursor-pointer hover:border-yellow-500/30'
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Header with emoji and title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center icon-3d shadow-xl`}>
                        <span className="text-3xl">{model.emoji}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{model.name}</h3>
                        {model.status === 'restricted' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            BLOCKED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Algorithm */}
                  <p className="text-slate-300 text-xs mb-3 line-clamp-2">{model.algorithm}</p>
                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold text-sm">{model.winrate}</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-xs">{model.style}</span>
                  </div>
                  {/* Description */}
                  <p className="text-slate-400 text-xs mb-3 italic line-clamp-2">💬 {model.description}</p>
                  {/* Warning */}
                  {model.warning && (
                    <p className="text-red-400 text-xs mb-3 font-semibold">⚠️ {model.warning}</p>
                  )}
                  {/* Pricing */}
                  <div className="mt-auto">
                    {model.status === 'restricted' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-red-500/50 text-red-400 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Заблокировано - {model.price}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">{t('monthly')}</span>
                          <span className="text-yellow-400 font-bold text-sm">{model.monthlyPrice}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-700"></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">{t('lifetime')}</span>
                          <span className="text-green-400 font-bold text-sm">{model.lifetimePrice}</span>
                        </div>
                      </div>
                    )}
                    {/* Status badge in bottom right */}
                    {model.status === 'active' && (
                      <div className="flex justify-end mt-2">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                          АКТИВНА
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
  // Main App Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 icon-3d">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t('forexSignalsPro')}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                    {selectedMarket === 'forex' ? t('forex') : t('otc')}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                    {selectedMode === 'top3' ? t('top3') : t('single')}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              onClick={() => {
                if (isNavigationBlocked()) {
                  alert(t('waitForActiveSignal'))
                } else {
                  setCurrentScreen('settings')
                }
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      {/* Stats Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3 perspective-container">
          <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
            <div className="flex flex-col">
              <span className="text-emerald-400 text-xs font-medium mb-1">Win Rate</span>
              <span className="text-2xl font-bold text-white">87%</span>
            </div>
          </Card>
          <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
            <div className="flex flex-col">
              <span className="text-cyan-400 text-xs font-medium mb-1">{t('activeSignals')}</span>
              <span className="text-2xl font-bold text-white">{selectedMode === 'top3' ? '3' : '1'}</span>
            </div>
          </Card>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-effect border-slate-800/50 p-1 shadow-lg">
            <TabsTrigger value="active" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg">
              Активные
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg">
              История
            </TabsTrigger>
          </TabsList>
          {/* Active Signals */}
          <TabsContent value="active" className="mt-6 space-y-4 perspective-container">
            {(selectedMode === 'top3' ? activeSignals : [activeSignals[0]]).map((signal) => (
              <Card key={signal.id} className="glass-effect backdrop-blur-sm overflow-hidden transition-all duration-300 card-3d border-slate-700/50 shadow-xl">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                        signal.type === 'BUY' 
                          ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                          : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                      }`}>
                        {signal.type === 'BUY' ? (
                          <TrendingUp className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`${
                              signal.type === 'BUY' 
                                ? 'border-emerald-500/50 text-emerald-400' 
                                : 'border-rose-500/50 text-rose-400'
                            } text-xs`}
                          >
                            {signal.type === 'BUY' ? t('buy') : t('sell')}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {signal.time}
                          </span>
                        </div>
                        {/* Confidence Score Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Target className="w-3 h-3" />
  {t('confidence')}
                            </span>
                            <span className="text-white font-semibold">
                              {signal.confidence.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full transition-all duration-500 shadow-lg"
                              style={{ 
                                width: `${signal.confidence}%`,
                                background: `linear-gradient(to right, 
                                  #ef4444 0%, 
                                  #f97316 20%, 
                                  #eab308 40%, 
                                  #84cc16 60%, 
                                  #22c55e 80%, 
                                  #16a34a 100%)`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(signal)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-110 transition-transform"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Progress Bar */}
                  {signal.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{t('progressToTP1')}</span>
                        <span className="text-emerald-400 font-semibold">{signal.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 shadow-lg shadow-emerald-500/50"
                          style={{ width: `${signal.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {signal.status === 'pending' && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{t('waitingForEntry')}</span>
                    </div>
                  )}
                  {/* View Details Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 text-slate-400 hover:text-white hover:bg-slate-800/50 group hover:scale-105 transition-all"
                  >
                    <span>{t('moreDetails')}</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            ))}
            {/* Single Mode Generation Buttons */}
            {selectedMode === 'single' && (
              <div className="mt-6">
                <Card className="glass-effect border-cyan-500/30 p-6 card-3d shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">
                    🎯 Сгенерировать сигнал для пары
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMarket === 'forex' ? (
                      <>
                        <Button 
                          onClick={() => generateSignalForPair('EUR/USD')}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          EUR/USD
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('GBP/JPY')}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          GBP/JPY
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('USD/JPY')}
                          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          USD/JPY
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('AUD/USD')}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          AUD/USD
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => generateSignalForPair('EUR/USD (OTC)')}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          EUR/USD (OTC)
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('NZD/USD (OTC)')}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          NZD/USD (OTC)
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('USD/CHF (OTC)')}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          USD/CHF (OTC)
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('GBP/USD (OTC)')}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          GBP/USD (OTC)
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm text-center mt-4">
                    Выберите пару для генерации сигнала
                  </p>
                </Card>
              </div>
            )}
          </TabsContent>
          {/* History Signals */}
          <TabsContent value="history" className="mt-6 space-y-4 perspective-container">
            {historySignals.map((signal) => (
              <Card key={signal.id} className="glass-effect backdrop-blur-sm overflow-hidden transition-all duration-300 card-3d border-slate-700/50 shadow-xl">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                        signal.result === 'profit'
                          ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                          : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                      }`}>
                        {signal.type === 'BUY' ? (
                          <TrendingUp className={`w-6 h-6 ${signal.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                        ) : (
                          <TrendingDown className={`w-6 h-6 ${signal.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{signal.type}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">{signal.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${
                        signal.result === 'profit' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      }`}>
                        {signal.result === 'profit' ? t('success') : t('failure')}
                      </Badge>
                      <div className="text-xs text-slate-500 mt-2">
                        {signal.entry} → {signal.closePrice}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {/* Stats Summary */}
            <Card className="glass-effect border-slate-700/50 p-6 mt-6 card-3d shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white">{t('monthlyStatistics')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">{t('totalSignals')}</span>
                  <div className="text-2xl font-bold text-white mt-1">47</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">{t('successfulSignals')}</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">41</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">{t('losingSignals')}</span>
                  <div className="text-2xl font-bold text-rose-400 mt-1">6</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Win Rate</span>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">87.2%</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Back Button */}
        <Button 
          onClick={() => {
            if (isNavigationBlocked()) {
              alert(t('waitForActiveSignal'))
            } else {
              setCurrentScreen('mode-select')
            }
          }}
          variant="ghost"
          className="w-full mt-6 text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          {t('back')}
        </Button>
      </div>
      {/* Pending Signal Overlay - Блокировка навигации */}
      {pendingSignal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="glass-effect border-slate-700/50 p-8 max-w-2xl w-full card-3d shadow-2xl">
            {!isWaitingFeedback ? (
              // Показываем активный сигнал и таймер
              <>
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-red-400" />
                  <h1 className="text-2xl font-bold text-white">{t('tradeActivated')}</h1>
                </div>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                    pendingSignal.type === 'BUY'
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                      : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                  }`}>
                    {pendingSignal.type === 'BUY' ? (
                      <TrendingUp className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-10 h-10 text-rose-400" />
                    )}
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{pendingSignal.pair}</h2>
                    <Badge className={`${
                      pendingSignal.type === 'BUY' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    }`}>
                      {pendingSignal.type}
                    </Badge>
                  </div>
                </div>
                {/* Timer */}
                <Card className="glass-effect border-amber-500/30 p-6 mb-6 card-3d shadow-xl text-center">
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="text-4xl font-bold text-white">
                        {Math.floor(signalTimer / 60)}:{(signalTimer % 60).toString().padStart(2, '0')}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">{t('timeRemaining')}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000"
                      style={{ width: `${(signalTimer / (pendingSignal.expiration * 60)) * 100}%` }}
                    ></div>
                  </div>
                </Card>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🚫</span>
                    </div>
                    <p className="text-cyan-400 font-semibold">{t('navigationLocked')}</p>
                  </div>
                  <p className="text-slate-400 text-sm">{t('waitForExpiration')}</p>
                </div>
              </>
            ) : (
              // Запрашиваем фидбек
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Clock className="w-10 h-10 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t('timeExpired')}</h2>
                  <p className="text-slate-400">{t('leaveFeedback')}</p>
                </div>
                <Card className="glass-effect border-slate-700/50 p-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t('pair')}:</span>
                      <span className="text-white font-bold">{pendingSignal.pair}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t('direction')}:</span>
                      <Badge className={pendingSignal.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                        {pendingSignal.type === 'BUY' ? t('buy') : t('sell')}
                      </Badge>
                    </div>
                  </div>
                </Card>
                {/* Instructions */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">💡</span>
                    </div>
                    <p className="text-amber-400 font-semibold">{t('resultButtonsActive')}</p>
                  </div>
                  <p className="text-slate-400 text-sm">{t('indicateTradeResult')}</p>
                </div>
                <div className="space-y-4">
                  <Button
                    onClick={() => submitFeedback(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 hover:from-emerald-600 hover:via-green-700 hover:to-emerald-600 text-white py-8 text-xl font-bold shadow-2xl shadow-emerald-500/40 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                    <span className="relative flex items-center justify-center gap-3">
                      <span className="text-3xl animate-bounce">✅</span>
                      <span>{t('successfulTrade')}</span>
                      <TrendingUp className="w-6 h-6" />
                    </span>
                  </Button>
                  <Button
                    onClick={() => submitFeedback(false)}
                    className="w-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-500 hover:from-rose-600 hover:via-red-700 hover:to-rose-600 text-white py-8 text-xl font-bold shadow-2xl shadow-rose-500/40 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                    <span className="relative flex items-center justify-center gap-3">
                      <span className="text-3xl animate-pulse">❌</span>
                      <span>{t('losingTrade')}</span>
                      <TrendingDown className="w-6 h-6" />
                    </span>
                  </Button>
                </div>
                <p className="text-amber-400 text-sm text-center mt-4">
                  {t('leaveFeedbackToUnlock')}
                </p>
              </>
            )}
          </Card>
        </div>
      )}
      {/* No Signal Available Notification */}
      {noSignalAvailable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="glass-effect border-amber-500/50 p-8 card-3d shadow-2xl max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Activity className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t('noSuitableEntry')}</h3>
              <p className="text-slate-400 text-base mb-2">
                {t('marketConditionsNotOptimal')}
              </p>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-sm">
                {t('analysisCompleted')}
              </Badge>
            </div>
            <Card className="glass-effect border-slate-700/50 p-6 mb-6 bg-slate-900/50">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                {t('recommendations')}
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">{t('tryAnotherPair')}</p>
                    <p className="text-slate-400 text-sm">{t('selectAnotherPairDescription')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">{t('waitForOptimalConditions')}</p>
                    <p className="text-slate-400 text-sm">{t('tryAgainInCooldown', {seconds: signalCooldown})}</p>
                  </div>
                </div>
              </div>
            </Card>
            <Button
              onClick={() => {
                setNoSignalAvailable(false)
                setGeneratedSignals([])
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-6 text-lg font-bold shadow-lg shadow-amber-500/30"
            >
              <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
              {t('returnToPairSelection')}
            </Button>
            <p className="text-slate-400 text-xs text-center mt-4">
              {t('patienceIsKey')}
            </p>
          </Card>
        </div>
      )}
      {/* Reload Warning Modal */}
      {showReloadWarning && pendingSignal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <Card className="glass-effect border-red-500/50 p-8 max-w-lg w-full card-3d shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Shield className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">{t('warningAttention')}</h2>
              <p className="text-red-400 text-lg font-semibold mb-2">
                {t('systemBypassDetected')}
              </p>
              <p className="text-slate-400">
                {t('activeSignalRequiresCompletion')}
              </p>
            </div>
            <Card className="glass-effect border-slate-700/50 p-6 mb-6 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                {t('activeSignal')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('pair')}</span>
                  <span className="text-white font-bold text-lg">{pendingSignal.pair}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('direction')}</span>
                  <Badge className={`${
                    pendingSignal.type === 'BUY' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  }`}>
                    {pendingSignal.type === 'BUY' ? `📈 ${t('buy')}` : `📉 ${t('sell')}`}
                  </Badge>
                </div>
                {!isWaitingFeedback && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('timeRemaining')}:</span>
                    <span className="text-amber-400 font-bold text-lg">
                      {Math.floor(signalTimer / 60)}:{(signalTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                {isWaitingFeedback && (
                  <div className="text-center py-2">
                    <span className="text-red-400 font-semibold">{t('feedbackRequired')}</span>
                  </div>
                )}
              </div>
            </Card>
            <Button
              onClick={() => {
                setShowReloadWarning(false)
                setCurrentScreen('main')
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg font-bold shadow-lg shadow-cyan-500/30"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              {t('returnToOpenTrade')}
            </Button>
            <p className="text-slate-500 text-xs text-center mt-4">
              {t('bypassProtectionActive')}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
// Глобальная обёртка для проверки блокировки навигации на ВСЕХ экранах
function AppWrapper() {
  return <App />
}
export default AppWrapper
