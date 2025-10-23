import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signalApi } from '@/services/signalApi'
import { useSignalStore } from '@/store/useSignalStore'

export const useSignalGeneration = () => {
  const queryClient = useQueryClient()
  const { setGenerating, addSignals } = useSignalStore()
  
  return useMutation({
    mutationFn: ({ userId, market, mode, pair }) => 
      signalApi.generate(userId, market, mode, pair),
    
    onMutate: () => {
      setGenerating(true, 'Подключение к рынку...')
    },
    
    onSuccess: (data) => {
      addSignals(data.signals)
      queryClient.invalidateQueries(['user-stats'])
      setGenerating(false)
    },
    
    onError: (error) => {
      console.error('Signal generation error:', error)
      setGenerating(false)
    }
  })
}
