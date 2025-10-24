import { useEffect, useRef } from 'react';

export const useWebSocket = (userId, onSubscriptionUpdate, onNotification) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`wss://bot.nomoneynohoney.online/ws/${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'subscription_update') {
          console.log('📥 Получено обновление подписки:', data.subscriptions);
          onSubscriptionUpdate(data.subscriptions);
        } else if (data.type === 'subscription_approved') {
          console.log('✅ Подписка одобрена:', data);
          if (onNotification) {
            onNotification('success', 'Подписка активирована!', `Модель ${data.model_id} теперь доступна для использования.`)
          }
          // Обновляем подписки
          onSubscriptionUpdate(data.subscriptions);
        } else if (data.type === 'subscription_rejected') {
          console.log('❌ Подписка отклонена:', data);
          if (onNotification) {
            onNotification('error', 'Запрос отклонен', `Ваш запрос на подписку был отклонен. Причина: ${data.reason || 'Не указана'}`)
          }
        } else if (data.type === 'admin_subscription_request') {
          console.log('🔔 Новый запрос подписки для админа:', data);
          if (onNotification) {
            onNotification('info', 'Новый запрос подписки', `Пользователь ${data.user_name} запросил подписку на модель ${data.model_id}`)
          }
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected, reconnecting in 5s...');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, onSubscriptionUpdate, onNotification]);
};





