import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSubscriptionTemplates } from '../hooks/useAdminData'

export const SubscriptionTemplates = () => {
  const [editingTemplate, setEditingTemplate] = useState(null)
  
  const { data: templates } = useSubscriptionTemplates()
  
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Шаблоны подписок</h3>
      
      <div className="grid gap-4">
        {templates?.templates.map(template => (
          <Card key={template.id} className="p-4 border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{template.icon} {template.name}</h4>
                <p className="text-sm text-slate-400">{template.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Модели: {template.subscriptions.join(', ')}
                </p>
              </div>
              <Button size="sm" onClick={() => setEditingTemplate(template)}>
                Редактировать
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Button className="w-full mt-4">
        Создать новый шаблон
      </Button>
    </Card>
  )
}
