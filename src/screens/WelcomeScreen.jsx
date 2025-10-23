import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/useUIStore'
import { Sparkles, ArrowRight } from 'lucide-react'

export const WelcomeScreen = () => {
  const { navigateTo } = useUIStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
      <Card className="glass-effect backdrop-blur-xl border-slate-700/50 p-8">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Добро пожаловать в Forex Signals Pro
          </h1>
          
          <p className="text-slate-400 text-lg mb-8">
            Профессиональные торговые сигналы с использованием ИИ
          </p>
          
          <Button 
            onClick={() => navigateTo('menu')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-3 text-lg"
          >
            Начать работу
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
