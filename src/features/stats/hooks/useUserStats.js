import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/services/userApi'

export const useUserStats = (userId) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: () => userApi.getStats(userId),
    enabled: !!userId,
    staleTime: 60000
  })
}
