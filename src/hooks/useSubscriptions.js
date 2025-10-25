import { useState, useEffect } from 'react'
import { subscriptionService } from '../services/subscriptionService'

export const useSubscriptions = (userId) => {
  const [subscriptions, setSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    // Подписка на изменения
    const unsubscribe = subscriptionService.subscribe((newSubscriptions) => {
      console.log('🔔 Subscriptions updated:', newSubscriptions)
      setSubscriptions(newSubscriptions)
    })

    // Начальная загрузка
    setIsLoading(true)
    subscriptionService.loadSubscriptions(userId)
      .then(subs => {
        setSubscriptions(subs)
        setError(null)
      })
      .catch(err => {
        console.error('Failed to load subscriptions:', err)
        setError(err.message)
      })
      .finally(() => setIsLoading(false))

    return unsubscribe
  }, [userId])

  const refreshSubscriptions = () => {
    if (!userId) return Promise.resolve([])
    return subscriptionService.loadSubscriptions(userId, true)
  }

  return { subscriptions, isLoading, error, refreshSubscriptions }
}
