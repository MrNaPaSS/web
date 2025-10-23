import { api } from './api'

export const userApi = {
  getStats: (userId) =>
    api.get('/api/user/stats', { params: { user_id: userId } }),
  
  getSignalsHistory: (userId) =>
    api.get('/api/user/signals-history', { params: { user_id: userId } }),
  
  getSubscriptions: (userId) =>
    api.get('/api/user/subscriptions', { params: { user_id: userId } }),
  
  updateSubscriptions: (userId, subscriptions) =>
    api.post('/api/user/subscriptions', { user_id: userId, subscriptions }),
    
  updateActivity: (userId, source = 'web') =>
    api.post('/api/user/activity', { user_id: userId, source })
}
