import { api } from './api'

export const signalApi = {
  generate: (userId, market, mode, pair = null) =>
    api.post('/api/signal/generate', { user_id: userId, market, mode, pair }),
  
  submitFeedback: (userId, signalId, feedback, signal) =>
    api.post('/api/signal/feedback', { 
      user_id: userId, 
      signal_id: signalId, 
      feedback,
      pair: signal.pair,
      direction: signal.direction,
      confidence: signal.confidence
    }),
  
  getMarketMetrics: () =>
    api.get('/api/signal/market-metrics'),
    
  getStats: () =>
    api.get('/api/signal/stats')
}
