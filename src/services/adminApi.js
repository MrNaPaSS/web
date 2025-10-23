import { api } from './api'

export const adminApi = {
  getAllUsers: () =>
    api.get('/api/users/all'),
  
  deleteUser: (adminId, userId) =>
    api.post('/api/admin/delete-user', { 
      admin_user_id: adminId, 
      user_id: userId 
    }),
  
  getAccessRequests: () =>
    api.get('/api/admin/access-requests'),
  
  approveAccess: (adminId, userId) =>
    api.post('/api/admin/approve-access', { 
      admin_user_id: adminId, 
      user_id: userId 
    }),
    
  getTemplates: () =>
    api.get('/api/admin/subscription-templates'),
    
  bulkUpdateSubscriptions: (adminId, userIds, subscriptions) =>
    api.post('/api/admin/bulk-subscription-update', {
      admin_user_id: adminId,
      user_ids: userIds,
      subscriptions
    })
}
