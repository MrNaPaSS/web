const STORAGE_KEY = 'user_subscriptions_cache'
const CACHE_EXPIRY_KEY = 'subscriptions_cache_expiry'
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

class SubscriptionService {
  constructor() {
    this.subscribers = new Set()
    this.currentSubscriptions = []
    this.isLoading = false
    this.retryAttempts = 0
    this.maxRetries = 5
    this.pollingInterval = null
  }

  // Подписка на изменения
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // Уведомление всех подписчиков
  notify() {
    this.subscribers.forEach(callback => {
      try {
        callback([...this.currentSubscriptions])
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  // Загрузка с кэшем
  async loadSubscriptions(userId, forceRefresh = false) {
    if (!userId) return []

    console.log('🔄 loadSubscriptions called:', { userId, forceRefresh })

    // Проверка кэша
    if (!forceRefresh) {
      const cached = this.getCachedSubscriptions()
      if (cached) {
        console.log('📦 Using cached subscriptions:', cached)
        this.currentSubscriptions = cached
        this.notify()
        return cached
      }
    }

    // Загрузка с retry механизмом
    return this.loadWithRetry(userId)
  }

  async loadWithRetry(userId, attempt = 0) {
    try {
      this.isLoading = true
      const apiUrl = window.location.hostname === 'app.nomoneynohoney.online'
        ? 'https://bot.nomoneynohoney.online'
        : 'http://localhost:5000'

      const response = await fetch(`${apiUrl}/api/user/subscriptions?user_id=${userId}`)
      const data = await response.json()

      if (data.success) {
        let subscriptions = data.subscriptions || ['logistic-spy']
        subscriptions = [...new Set(subscriptions)]

        console.log('📥 Raw subscriptions from API:', subscriptions)

        // Удаляем базовую если есть премиум
        const hasPremium = subscriptions.some(sub => 
          sub !== 'logistic-spy' && sub !== 'basic' && sub !== 'free'
        )
        if (hasPremium) {
          subscriptions = subscriptions.filter(sub => sub !== 'logistic-spy')
        }

        console.log('✅ Filtered subscriptions:', subscriptions)

        this.currentSubscriptions = subscriptions
        this.cacheSubscriptions(subscriptions)
        this.retryAttempts = 0
        this.notify()
        console.log('✅ Subscriptions loaded:', subscriptions)
        
        // Принудительно обновляем состояние в App.jsx
        if (window.updateUserSubscriptions) {
          console.log('🔄 Calling window.updateUserSubscriptions with:', subscriptions)
          window.updateUserSubscriptions(subscriptions)
        }
        
        return subscriptions
      }
    } catch (error) {
      console.error('❌ Failed to load subscriptions:', error)
      
      // Exponential backoff retry
      if (attempt < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        console.log(`🔄 Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.loadWithRetry(userId, attempt + 1)
      }
      
      // Используем кэш как fallback
      const cached = this.getCachedSubscriptions()
      if (cached) {
        console.warn('⚠️ Using stale cache as fallback')
        return cached
      }
      
      return ['logistic-spy']
    } finally {
      this.isLoading = false
    }
  }

  // Кэширование в localStorage
  cacheSubscriptions(subscriptions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions))
      localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + CACHE_DURATION)
    } catch (error) {
      console.error('Failed to cache subscriptions:', error)
    }
  }

  getCachedSubscriptions() {
    try {
      const expiry = parseInt(localStorage.getItem(CACHE_EXPIRY_KEY) || '0')
      if (Date.now() < expiry) {
        const cached = localStorage.getItem(STORAGE_KEY)
        return cached ? JSON.parse(cached) : null
      }
      this.clearCache()
      return null
    } catch (error) {
      console.error('Failed to get cached subscriptions:', error)
      return null
    }
  }

  clearCache() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CACHE_EXPIRY_KEY)
  }

  // Polling как fallback для WebSocket
  startPolling(userId, interval = 30000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    this.pollingInterval = setInterval(() => {
      console.log('🔄 Polling subscriptions...')
      this.loadSubscriptions(userId, true)
    }, interval)
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  getCurrentSubscriptions() {
    return [...this.currentSubscriptions]
  }
}

export const subscriptionService = new SubscriptionService()
