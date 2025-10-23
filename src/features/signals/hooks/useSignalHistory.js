import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/services/userApi'

export const useSignalHistory = (userId) => {
  return useQuery({
    queryKey: ['signal-history', userId],
    queryFn: () => userApi.getSignalsHistory(userId),
    enabled: !!userId,
    staleTime: 30000
  })
}
