/**
 * API Client для автоматической отправки JWT токенов
 * Обрабатывает аутентификацию и ошибки
 */

const API_BASE_URL = window.location.hostname === 'app.nomoneynohoney.online' 
  ? 'https://bot.nomoneynohoney.online' 
  : 'http://localhost:5000'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * Получение JWT токена из localStorage
   */
  getToken() {
    return localStorage.getItem('auth_token')
  }

  /**
   * Установка JWT токена
   */
  setToken(token) {
    localStorage.setItem('auth_token', token)
  }

  /**
   * Удаление JWT токена
   */
  removeToken() {
    localStorage.removeItem('auth_token')
  }

  /**
   * Проверка наличия токена
   */
  hasToken() {
    return !!this.getToken()
  }

  /**
   * Обработка ошибок аутентификации
   */
  handleAuthError(response) {
    if (response.status === 401) {
      console.log('🔐 Token expired or invalid, logging out...')
      this.removeToken()
      
      // Показываем уведомление пользователю
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          message: 'Сессия истекла. Пожалуйста, войдите снова.'
        })
      }
      
      // Перезагружаем страницу для повторной авторизации
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
      return true
    }
    return false
  }

  /**
   * Основной метод для API запросов
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // Добавляем JWT токен если есть
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const config = {
      ...options,
      headers
    }
    
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      
      // Обрабатываем ошибки аутентификации
      if (this.handleAuthError(response)) {
        throw new Error('Authentication failed')
      }
      
      // Логируем ответ
      console.log(`📡 API Response: ${response.status} ${response.statusText}`)
      
      return response
      
    } catch (error) {
      console.error(`❌ API Error: ${error.message}`)
      throw error
    }
  }

  /**
   * GET запрос
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    })
  }

  /**
   * POST запрос
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }

  /**
   * PUT запрос
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    })
  }

  /**
   * DELETE запрос
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    })
  }

  /**
   * Авторизация пользователя
   */
  async login(userData, initData) {
    try {
      const response = await this.post('/api/auth/login', {
        userData,
        initData
      })
      
      const data = await response.json()
      
      if (data.success && data.token) {
        this.setToken(data.token)
        console.log('✅ Login successful, token saved')
        return data
      } else {
        throw new Error(data.error || 'Login failed')
      }
      
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    }
  }

  /**
   * Получение подписок пользователя
   */
  async getUserSubscriptions(userId) {
    try {
      const response = await this.get(`/api/user/subscriptions?user_id=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        return data.subscriptions
      } else {
        throw new Error(data.error || 'Failed to get subscriptions')
      }
      
    } catch (error) {
      console.error('❌ Get subscriptions error:', error)
      throw error
    }
  }

  /**
   * Обновление подписок пользователя (только для админа)
   */
  async updateUserSubscriptions(userId, subscriptions) {
    try {
      const response = await this.post('/api/user/subscriptions', {
        user_id: userId,
        subscriptions
      })
      
      const data = await response.json()
      
      if (data.success) {
        return true
      } else {
        throw new Error(data.error || 'Failed to update subscriptions')
      }
      
    } catch (error) {
      console.error('❌ Update subscriptions error:', error)
      throw error
    }
  }

  /**
   * Выдача подписки пользователю (только для админа)
   */
  async grantSubscription(userId, modelId, expiryDays = null) {
    try {
      const response = await this.post(`/api/admin/user/${userId}/subscription/${modelId}`, {
        expiry_days: expiryDays
      })
      
      const data = await response.json()
      
      if (data.success) {
        return true
      } else {
        throw new Error(data.error || 'Failed to grant subscription')
      }
      
    } catch (error) {
      console.error('❌ Grant subscription error:', error)
      throw error
    }
  }

  /**
   * Отзыв подписки у пользователя (только для админа)
   */
  async revokeSubscription(userId, modelId) {
    try {
      const response = await this.delete(`/api/admin/user/${userId}/subscription/${modelId}`)
      
      const data = await response.json()
      
      if (data.success) {
        return true
      } else {
        throw new Error(data.error || 'Failed to revoke subscription')
      }
      
    } catch (error) {
      console.error('❌ Revoke subscription error:', error)
      throw error
    }
  }

  /**
   * Получение всех пользователей (только для админа)
   */
  async getAllUsers() {
    try {
      const response = await this.get('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        return data.users
      } else {
        throw new Error(data.error || 'Failed to get users')
      }
      
    } catch (error) {
      console.error('❌ Get users error:', error)
      throw error
    }
  }

  /**
   * Удаление пользователя (только для админа)
   */
  async deleteUser(telegramId) {
    try {
      const response = await this.delete(`/api/admin/user/${telegramId}`)
      const data = await response.json()
      
      if (data.success) {
        return true
      } else {
        throw new Error(data.error || 'Failed to delete user')
      }
      
    } catch (error) {
      console.error('❌ Delete user error:', error)
      throw error
    }
  }

  /**
   * Получение подписок текущего пользователя (для самолечения)
   */
  async getMySubscriptions() {
    try {
      const response = await this.get('/api/auth/my-subscriptions')
      const data = await response.json()
      
      if (data.success) {
        return data.subscriptions
      } else {
        throw new Error(data.error || 'Failed to get subscriptions')
      }
      
    } catch (error) {
      console.error('❌ Get my subscriptions error:', error)
      throw error
    }
  }

  /**
   * Проверка состояния API
   */
  async healthCheck() {
    try {
      const response = await this.get('/api/health')
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('❌ Health check failed:', error)
      return false
    }
  }
}

// Создаем единственный экземпляр
const apiClient = new ApiClient()

// Экспортируем для использования в других модулях
export default apiClient

// Также экспортируем класс для создания новых экземпляров
export { ApiClient }
