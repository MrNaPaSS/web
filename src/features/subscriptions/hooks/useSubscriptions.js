import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/services/userApi'

export const useSubscriptions = (userId) => {
  return useQuery({
    queryKey: ['user-subscriptions', userId],
    queryFn: () => userApi.getSubscriptions(userId),
    enabled: !!userId,
    staleTime: 30000
  })
}

export const useUpdateSubscriptions = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, subscriptions }) =>
      userApi.updateSubscriptions(userId, subscriptions),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['user-subscriptions', variables.userId])
    }
  })
}
