import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore'
import apiClient from '../services/apiClient'

/**
 * Функция для запроса данных пользователя
 */
const fetchUser = async () => {
  const { data } = await apiClient.get('/api/auth/me')
  return data
}

/**
 * Хук для синхронизации аутентификации
 * Использует React Query для "самолечения" и Zustand как единый источник правды
 */
export const useAuthSync = () => {
  // Берем функции и данные из "мозга" (Zustand)
  const { login, logout, token, userData } = useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    token: state.token,
    userData: state.userData
  }))
  
  const queryClient = useQueryClient()

  // Запускаем React Query для загрузки пользователя
  const { data: userDataFromQuery, isError, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: !!token, // Запускаем только если есть токен
    retry: 1,
    refetchOnWindowFocus: true, // <-- "Самолечение" при возврате на вкладку
    refetchOnReconnect: true, // <-- "Самолечение" при восстановлении соединения
    staleTime: 5 * 60 * 1000, // 5 минут
  })

  // Синхронизируем React Query -> Zustand
  useEffect(() => {
    if (userDataFromQuery) {
      console.log('✅ React Query загрузил пользователя, обновляю Zustand')
      login({
        userId: userDataFromQuery.id,
        isAdmin: userDataFromQuery.is_admin || false,
        userData: userDataFromQuery,
        token: token
      })
    }
    
    if (isError) {
      console.log('❌ Ошибка загрузки пользователя, разлогиниваем')
      logout()
    }
  }, [userDataFromQuery, isError, login, logout, token])

  return {
    user: userData,
    isLoading,
    isError
  }
}

/**
 * Хук для управления WebSocket подключением
 */
export const useWebSocketManager = (onNotification) => {
  const { userData, updateUserSubscriptions } = useAuthStore((state) => ({
    userData: state.userData,
    updateUserSubscriptions: state.updateUserSubscriptions
  }))
  
  const queryClient = useQueryClient()

  const handleSubscriptionUpdate = (data) => {
    console.log('📥 WEBSOCKET: Получены подписки:', data.subscriptions)
    
    // Шаг 1: Мгновенно обновляем "мозг" (Zustand)
    // Все меню сразу перерисуются
    updateUserSubscriptions(data.subscriptions)

    // Шаг 2: Обновляем кэш React Query
    // Чтобы "самолечение" знало об изменениях
    queryClient.setQueryData(['user'], (oldData) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        subscriptions: data.subscriptions
      }
    })

    // Уведомление если требуется
    if (onNotification) {
      onNotification('success', 'Подписки обновлены', 'Ваши подписки были обновлены')
    }
  }

  return {
    userId: userData?.id,
    onSubscriptionUpdate: handleSubscriptionUpdate
  }
}
