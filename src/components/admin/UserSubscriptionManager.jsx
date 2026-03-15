import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle2, Lock, Crown, Brain, Target, AlertCircle } from 'lucide-react'

const UserSubscriptionManager = ({ userId, userData, onSubscriptionChange }) => {
  const [userSubscriptions, setUserSubscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  // ML модели для отображения
  const mlModels = [
    {
      id: 'shadow-stack',
      name: 'Shadow Stack',
      emoji: '🌑',
      algorithm: 'Neural Network Stack',
      winrate: '65-70%',
      color: 'from-slate-600 to-slate-800'
    },
    {
      id: 'forest-necromancer',
      name: 'Forest Necromancer',
      emoji: '🌲',
      algorithm: 'Random Forest Ensemble',
      winrate: '62-67%',
      color: 'from-green-600 to-green-800'
    },
    {
      id: 'gray-cardinal',
      name: 'Gray Cardinal',
      emoji: '🎭',
      algorithm: 'Gradient Boosting',
      winrate: '~66%',
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 'logistic-spy',
      name: 'Logistic Spy',
      emoji: '🕵️',
      algorithm: 'Logistic Regression',
      winrate: '~60-65%',
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 'sniper-80x',
      name: 'Sniper 80X',
      emoji: '🔫',
      algorithm: 'Deep Learning CNN',
      winrate: '80%+',
      color: 'from-red-600 to-red-800'
    }
  ]

  // Загрузка подписок пользователя
  const loadUserSubscriptions = async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      const apiUrl = window.location.hostname === 'app.nomoneynohoney.online' 
        ? 'https://bot.nomoneynohoney.online'
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'http://localhost:5000')
      const response = await fetch(`${apiUrl}/api/user/subscriptions?user_id=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setUserSubscriptions(data.subscriptions || [])
        console.log('📥 User subscriptions loaded:', data.subscriptions)
      } else {
        console.error('❌ Error loading subscriptions:', data.error)
      }
    } catch (error) {
      console.error('❌ Error loading subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Назначить подписку
  const grantSubscription = async (modelId) => {
    try {
      setIsLoading(true)
      const apiUrl = window.location.hostname === 'app.nomoneynohoney.online' 
        ? 'https://bot.nomoneynohoney.online'
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'http://localhost:5000')
      const response = await fetch(`${apiUrl}/api/admin/user/${userId}/subscription/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admin_id: '511442168' // Admin ID
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: `Подписка ${modelId} назначена пользователю`
        })
        await loadUserSubscriptions()
        if (onSubscriptionChange) {
          onSubscriptionChange()
        }
      } else {
        setNotification({
          type: 'error',
          message: `Ошибка назначения подписки: ${data.error}`
        })
      }
    } catch (error) {
      console.error('❌ Error granting subscription:', error)
      setNotification({
        type: 'error',
        message: `Ошибка назначения подписки: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Отменить подписку
  const revokeSubscription = async (modelId) => {
    try {
      setIsLoading(true)
      const apiUrl = window.location.hostname === 'app.nomoneynohoney.online' 
        ? 'https://bot.nomoneynohoney.online'
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '' : 'http://localhost:5000')
      const response = await fetch(`${apiUrl}/api/admin/user/${userId}/subscription/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admin_id: '511442168' // Admin ID
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setNotification({
          type: 'success',
          message: `Подписка ${modelId} отменена у пользователя`
        })
        await loadUserSubscriptions()
        if (onSubscriptionChange) {
          onSubscriptionChange()
        }
      } else {
        setNotification({
          type: 'error',
          message: `Ошибка отмены подписки: ${data.error}`
        })
      }
    } catch (error) {
      console.error('❌ Error revoking subscription:', error)
      setNotification({
        type: 'error',
        message: `Ошибка отмены подписки: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserSubscriptions()
  }, [userId])

  // Скрыть уведомление через 3 секунды
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  if (!userId) {
    return (
      <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-xl">
        <div className="text-center text-slate-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>Выберите пользователя для управления подписками</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Уведомления */}
      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Заголовок */}
      <Card className="glass-effect border-slate-700/50 p-4 card-3d shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center icon-3d shadow-lg shadow-purple-500/20">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Управление подписками</h3>
            <p className="text-slate-400 text-sm">
              {userData?.first_name} {userData?.last_name} ({userId})
            </p>
          </div>
        </div>
      </Card>

      {/* Список ML моделей */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mlModels.map((model) => {
          const isOwned = userSubscriptions.includes(model.id)
          const isRestricted = model.id === 'sniper-80x' // Sniper 80X ограничен
          
          return (
            <Card 
              key={model.id}
              className={`glass-effect p-4 backdrop-blur-sm transition-all duration-300 card-3d shadow-xl ${
                isOwned 
                  ? 'border-emerald-500/50 bg-emerald-500/10' 
                  : isRestricted
                  ? 'border-red-500/30 bg-red-500/5 opacity-60'
                  : 'border-slate-700/50'
              }`}
            >
              <div className="flex flex-col gap-4 h-full">
                {/* Заголовок модели */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center icon-3d shadow-xl`}>
                      <span className="text-2xl">{model.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-white mb-1 truncate">{model.name}</h4>
                      <p className="text-slate-300 text-sm">{model.algorithm}</p>
                    </div>
                  </div>
                  
                  {/* Статус */}
                  <div className="flex flex-col items-end gap-1">
                    {isOwned && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs px-2 py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        АКТИВНА
                      </Badge>
                    )}
                    {isRestricted && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs px-2 py-1">
                        <Lock className="w-3 h-3 mr-1" />
                        ОГРАНИЧЕНА
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Статистика */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-base">{model.winrate}</span>
                  </div>
                </div>
                
                {/* Кнопки управления */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    {isOwned ? (
                      <Button
                        onClick={() => revokeSubscription(model.id)}
                        disabled={isLoading || isRestricted}
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400/70"
                      >
                        Отменить
                      </Button>
                    ) : (
                      <Button
                        onClick={() => grantSubscription(model.id)}
                        disabled={isLoading || isRestricted}
                        variant="outline"
                        size="sm"
                        className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/70"
                      >
                        Назначить
                      </Button>
                    )}
                  </div>
                  
                  {/* Иконка статуса */}
                  <div className="flex items-center gap-2">
                    {isOwned ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : isRestricted ? (
                      <Lock className="w-5 h-5 text-red-400" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Информация */}
      <Card className="glass-effect border-cyan-500/30 p-4 card-3d shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1">Информация</h4>
            <p className="text-slate-400 text-sm">
              Назначенные подписки активируются мгновенно. Пользователь получит уведомление об изменении статуса.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default UserSubscriptionManager
