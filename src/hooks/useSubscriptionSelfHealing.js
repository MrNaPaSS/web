/**
 * Хук для "самолечения" подписок
 * Автоматически проверяет актуальность подписок при возвращении в сеть
 */
import { useEffect, useCallback } from 'react'
import apiClient from '../services/apiClient'

export const useSubscriptionSelfHealing = (setUserSubscriptions, showNotification) => {
  
  /**
   * Функция для "тихой" проверки подписок
   */
  const fetchMySubscriptions = useCallback(async () => {
    try {
      console.log('🔄 Re-syncing subscriptions...')
      
      const subscriptions = await apiClient.getMySubscriptions()
      
      // Обновляем стейт подписок
      setUserSubscriptions(subscriptions)
      
      console.log('✅ Subscriptions re-synced:', subscriptions)
      
      // Показываем уведомление о синхронизации
      if (showNotification) {
        showNotification({
          type: 'info',
          message: 'Подписки синхронизированы с сервером'
        })
      }
      
    } catch (error) {
      console.error('❌ Failed to re-sync subscriptions:', error)
      
      // Показываем уведомление об ошибке
      if (showNotification) {
        showNotification({
          type: 'error',
          message: 'Ошибка синхронизации подписок'
        })
      }
    }
  }, [setUserSubscriptions, showNotification])

  useEffect(() => {
    // 1. Пользователь вернулся на вкладку
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, re-syncing subscriptions...')
        fetchMySubscriptions()
      }
    }

    // 2. Пользователь восстановил интернет-соединение
    const handleOnline = () => {
      console.log('🌐 Network connection restored, re-syncing subscriptions...')
      fetchMySubscriptions()
    }

    // 3. Пользователь вернулся из спящего режима (focus на окне)
    const handleFocus = () => {
      console.log('🎯 Window focused, re-syncing subscriptions...')
      fetchMySubscriptions()
    }

    // 4. Периодическая проверка (каждые 5 минут)
    const intervalId = setInterval(() => {
      console.log('⏰ Periodic subscription check...')
      fetchMySubscriptions()
    }, 5 * 60 * 1000) // 5 минут

    // Добавляем слушатели событий
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)
    window.addEventListener('focus', handleFocus)

    // Очистка при размонтировании
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, [fetchMySubscriptions])

  // Возвращаем функцию для ручной синхронизации
  return {
    reSyncSubscriptions: fetchMySubscriptions
  }
}

export default useSubscriptionSelfHealing
