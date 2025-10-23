import axios from 'axios'

export const API_BASE_URL = 'https://bot.nomoneynohoney.online'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor для добавления userId ко всем запросам
api.interceptors.request.use((config) => {
  // Получаем userId из Zustand store
  const authData = localStorage.getItem('auth-storage')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      const userId = parsed.state?.userId
      if (userId) {
        config.params = { ...config.params, user_id: userId }
      }
    } catch (error) {
      console.warn('Ошибка парсинга auth-storage:', error)
    }
  }
  return config
})

// Обработка ошибок
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    
    // Обработка ошибок авторизации
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('🚫 Ошибка авторизации, но НЕ сбрасываем сессию')
      // НЕ сбрасываем авторизацию автоматически
      // Пользователь должен остаться на текущем экране
    }
    
    return Promise.reject(error)
  }
)