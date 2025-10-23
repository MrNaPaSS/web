import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { Activity, Settings, Crown, Users } from 'lucide-react'

export const MenuScreen = () => {
  const { isAdmin } = useAuthStore()
  const { navigateTo } = useUIStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
      <Card className="glass-effect backdrop-blur-xl border-slate-700/50 p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Меню</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigateTo('market-select')}
            className="w-full h-16 text-lg"
          >
            <Activity className="mr-2" />
            Генерация сигналов
          </Button>
          
          <Button 
            onClick={() => navigateTo('settings')}
            variant="outline"
            className="w-full h-16 text-lg"
          >
            <Settings className="mr-2" />
            Настройки
          </Button>
          
          {isAdmin && (
            <Button 
              onClick={() => navigateTo('admin')}
              className="w-full h-16 text-lg bg-purple-600"
            >
              <Users className="mr-2" />
              Админ-панель
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
