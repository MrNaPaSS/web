import React, { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'

export const SignalCard = memo(({ signal, onAccept, onReject }) => {
  const isUpTrend = signal.direction === 'BUY'
  
  return (
    <Card className="glass-effect p-6 border-slate-700/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
          <p className="text-slate-400 text-sm flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {signal.time}
          </p>
        </div>
        
        <Badge className={isUpTrend ? 'bg-emerald-500' : 'bg-rose-500'}>
          {isUpTrend ? (
            <><TrendingUp className="w-4 h-4 mr-1" /> BUY</>
          ) : (
            <><TrendingDown className="w-4 h-4 mr-1" /> SELL</>
          )}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-slate-400 text-sm">Точка входа</p>
          <p className="text-white font-semibold">{signal.entry}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Уверенность</p>
          <p className="text-emerald-400 font-semibold">
            {(signal.confidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => onAccept(signal.id)}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
        >
          Успех
        </Button>
        <Button 
          onClick={() => onReject(signal.id)}
          variant="outline"
          className="flex-1"
        >
          Неудача
        </Button>
      </div>
    </Card>
  )
})
