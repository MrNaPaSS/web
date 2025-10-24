import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { Clock, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react'

export const MainScreen = () => {
  const { userId } = useAuthStore()
  const { navigateTo } = useUIStore()
  const [pendingSignal, setPendingSignal] = useState(null)
  const [signalTimer, setSignalTimer] = useState(0)
  const [isWaitingFeedback, setIsWaitingFeedback] = useState(false)

  useEffect(() => {
    // Загружаем активный сигнал из localStorage
    const savedSignal = localStorage.getItem('pendingSignal')
    if (savedSignal) {
      try {
        const signal = JSON.parse(savedSignal)
        setPendingSignal(signal)
        
        // Восстанавливаем таймер
        const startTime = signal.startTime || Date.now()
        const expiration = signal.expiration * 60 // минуты в секунды
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = Math.max(0, expiration - elapsed)
        
        if (remaining > 0) {
          setSignalTimer(remaining)
          setIsWaitingFeedback(false)
        } else {
          setSignalTimer(0)
          setIsWaitingFeedback(true)
        }
      } catch (error) {
        console.error('Ошибка восстановления сигнала:', error)
        localStorage.removeItem('pendingSignal')
      }
    }
  }, [])

  useEffect(() => {
    if (signalTimer > 0) {
      const interval = setInterval(() => {
        setSignalTimer(prev => {
          if (prev <= 1) {
            setIsWaitingFeedback(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [signalTimer])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const submitFeedback = async (isSuccess) => {
    if (!pendingSignal) return
    
    try {
      // Отправляем фидбек на сервер
      const response = await fetch('https://bot.nomoneynohoney.online/api/signal/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          signal_id: pendingSignal.signal_id,
          result: isSuccess ? 'success' : 'failure'
        })
      })
      
      const result = await response.json()
      if (result.success) {
        console.log('✅ Фидбек отправлен успешно')
        // Очищаем localStorage
        localStorage.removeItem('pendingSignal')
        localStorage.removeItem('signalStartTime')
        localStorage.removeItem('signalActivated')
        // Переходим в меню
        navigateTo('menu')
      } else {
        console.error('❌ Ошибка отправки фидбека:', result.error)
        alert('Ошибка отправки фидбека. Попробуйте еще раз.')
      }
    } catch (error) {
      console.error('❌ Ошибка отправки фидбека:', error)
      alert('Ошибка подключения к серверу. Попробуйте еще раз.')
    }
  }

  if (!pendingSignal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
        <Card className="glass-effect backdrop-blur-xl border-slate-700/50 p-6">
          <h1 className="text-3xl font-bold text-white mb-6">Нет активного сигнала</h1>
          <Button onClick={() => navigateTo('menu')} className="w-full">
            Вернуться в меню
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
      <Card className="glass-effect backdrop-blur-xl border-slate-700/50 p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Активный сигнал</h1>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {pendingSignal.pair}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {pendingSignal.direction}
            </div>
            <div className="text-sm text-slate-400">Направление</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {pendingSignal.entry_price}
            </div>
            <div className="text-sm text-slate-400">Цена входа</div>
          </div>
        </div>

        {!isWaitingFeedback ? (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-blue-400 mr-2" />
              <span className="text-3xl font-bold text-white">
                {formatTime(signalTimer)}
              </span>
            </div>
            <div className="text-slate-400">Осталось времени</div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-orange-400 mb-2">
              Время истекло
            </div>
            <div className="text-slate-400">Оставьте фидбек о результате</div>
          </div>
        )}

        {isWaitingFeedback && (
          <div className="space-y-4">
            <div className="text-center text-white mb-4">
              Результат сигнала:
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => submitFeedback(true)}
                className="h-16 text-lg bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2" />
                Успех
              </Button>
              <Button
                onClick={() => submitFeedback(false)}
                className="h-16 text-lg bg-red-600 hover:bg-red-700"
              >
                <XCircle className="mr-2" />
                Неудача
              </Button>
            </div>
          </div>
        )}

        {!isWaitingFeedback && (
          <div className="text-center">
            <Button
              onClick={() => navigateTo('menu')}
              variant="outline"
              className="w-full"
            >
              Вернуться в меню
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
