import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { ArrowLeft, Bell, BellOff, Volume2, VolumeX, Vibrate, Mail } from 'lucide-react'

export const SettingsScreen = () => {
  const { navigateTo } = useUIStore()
  const { notificationSettings, updateNotificationSetting } = useSettingsStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigateTo('menu')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Настройки</h1>
        </div>
        
        <Card className="glass-effect backdrop-blur-xl border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Уведомления</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-blue-400 mr-3" />
                <div>
                  <p className="text-white font-medium">Новые сигналы</p>
                  <p className="text-slate-400 text-sm">Уведомления о новых торговых сигналах</p>
                </div>
              </div>
              <Switch 
                checked={notificationSettings.newSignals}
                onCheckedChange={(checked) => updateNotificationSetting('newSignals', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-emerald-400 mr-3" />
                <div>
                  <p className="text-white font-medium">Результаты сделок</p>
                  <p className="text-slate-400 text-sm">Уведомления о результатах ваших сделок</p>
                </div>
              </div>
              <Switch 
                checked={notificationSettings.signalResults}
                onCheckedChange={(checked) => updateNotificationSetting('signalResults', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="w-5 h-5 text-purple-400 mr-3" />
                <div>
                  <p className="text-white font-medium">Звуковые уведомления</p>
                  <p className="text-slate-400 text-sm">Воспроизведение звука при уведомлениях</p>
                </div>
              </div>
              <Switch 
                checked={notificationSettings.soundEnabled}
                onCheckedChange={(checked) => updateNotificationSetting('soundEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Vibrate className="w-5 h-5 text-orange-400 mr-3" />
                <div>
                  <p className="text-white font-medium">Вибрация</p>
                  <p className="text-slate-400 text-sm">Вибрация при получении уведомлений</p>
                </div>
              </div>
              <Switch 
                checked={notificationSettings.vibrationEnabled}
                onCheckedChange={(checked) => updateNotificationSetting('vibrationEnabled', checked)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
