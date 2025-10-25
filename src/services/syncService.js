class SyncService {
  constructor() {
    this.channel = null
    this.init()
  }

  init() {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('subscription_sync')
      
      this.channel.onmessage = (event) => {
        console.log('📡 Received sync message:', event.data)
        
        if (event.data.type === 'subscription_update') {
          // Обновить подписки во всех вкладках
          import('./subscriptionService').then(({ subscriptionService }) => {
            subscriptionService.currentSubscriptions = event.data.subscriptions
            subscriptionService.notify()
          })
        }
      }
      
      console.log('✅ BroadcastChannel initialized')
    } else {
      console.warn('⚠️ BroadcastChannel not supported')
    }
  }

  broadcastSubscriptionUpdate(subscriptions) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'subscription_update',
        subscriptions,
        timestamp: Date.now()
      })
    }
  }

  close() {
    if (this.channel) {
      this.channel.close()
    }
  }
}

export const syncService = new SyncService()
