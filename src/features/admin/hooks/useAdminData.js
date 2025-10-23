import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/adminApi'

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getAllUsers,
    staleTime: 30000
  })
}

export const useAccessRequests = () => {
  return useQuery({
    queryKey: ['access-requests'],
    queryFn: adminApi.getAccessRequests,
    staleTime: 30000
  })
}

export const useSubscriptionTemplates = () => {
  return useQuery({
    queryKey: ['subscription-templates'],
    queryFn: adminApi.getTemplates,
    staleTime: 300000 // 5 минут
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ adminId, userId }) =>
      adminApi.deleteUser(adminId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
    }
  })
}

export const useApproveAccess = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ adminId, userId }) =>
      adminApi.approveAccess(adminId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['access-requests'])
      queryClient.invalidateQueries(['admin-users'])
    }
  })
}

export const useBulkUpdateSubscriptions = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ adminId, userIds, subscriptions }) =>
      adminApi.bulkUpdateSubscriptions(adminId, userIds, subscriptions),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
    }
  })
}
