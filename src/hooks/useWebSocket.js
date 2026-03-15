import { useEffect, useRef, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { syncService } from '../services/syncService';

export const useWebSocket = (userId, onSubscriptionUpdate, onNotification) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 10;

  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      // Определяем URL WebSocket сервера
      const wsUrl = (window.location.hostname === 'app.nomoneynohoney.online' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? `wss://bot.nomoneynohoney.online/ws/${userId}`
        : `ws://localhost:8001/ws/${userId}`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📥 WebSocket message received:', data);
          
          if (data.type === 'subscription_update') {
            console.log('📥 Получено обновление подписки:', data.subscriptions);
            
            // Создаем новый массив для принудительного обновления
            const newSubscriptions = [...data.subscriptions];
            
            // Обновляем subscriptionService
            subscriptionService.currentSubscriptions = newSubscriptions;
            subscriptionService.cacheSubscriptions(newSubscriptions);
            subscriptionService.notify();
            
            // Синхронизируем между вкладками
            syncService.broadcastSubscriptionUpdate(newSubscriptions);
            
            // Вызываем callback для обратной совместимости
            onSubscriptionUpdate(newSubscriptions);
            
          } else if (data.type === 'subscription_approved') {
            console.log('✅ Подписка одобрена:', data);
            if (onNotification) {
              onNotification('success', 'Подписка активирована!', `Модель ${data.model_id} теперь доступна для использования.`)
            }
            onSubscriptionUpdate([...data.subscriptions]);
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
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Автопереподключение с экспоненциальной задержкой
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Максимум 30 секунд
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
        } else {
          console.log('❌ Max reconnection attempts reached');
        }
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

  return { isConnected, reconnectAttempts };
};





