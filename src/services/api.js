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
  const userId = localStorage.getItem('userId')
  if (userId) {
    config.params = { ...config.params, user_id: userId }
  }
  return config
})

// Обработка ошибок
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
