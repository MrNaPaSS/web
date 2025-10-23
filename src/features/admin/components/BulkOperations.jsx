import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useBulkUpdateSubscriptions } from '../hooks/useAdminData'

export const BulkOperations = ({ users }) => {
  const [selectedUsers, setSelectedUsers] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  const bulkUpdateMutation = useBulkUpdateSubscriptions()
  
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
  }
  
  const handleApplyTemplate = () => {
    if (!selectedTemplate || selectedUsers.length === 0) return
    
    bulkUpdateMutation.mutate({
      adminId: '511442168', // TODO: Получать из auth store
      userIds: selectedUsers,
      subscriptions: selectedTemplate.subscriptions
    })
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Массовые операции</h3>
      
      <Button onClick={handleSelectAll} className="mb-4">
        {selectedUsers.length === users.length ? 'Снять выделение' : 'Выбрать всех'}
      </Button>
      
      <p className="text-slate-400 mb-4">
        Выбрано пользователей: {selectedUsers.length}
      </p>
      
      {/* Список шаблонов для применения */}
      <div className="space-y-2">
        {/* Template selector here */}
      </div>
      
      <Button 
        onClick={handleApplyTemplate}
        disabled={selectedUsers.length === 0 || !selectedTemplate}
        className="w-full mt-4"
      >
        Применить шаблон к выбранным
      </Button>
    </Card>
  )
}
