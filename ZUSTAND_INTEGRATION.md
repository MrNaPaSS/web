# 🧠 Zustand + React Query + WebSocket Integration

## Обзор

Эта система использует **единый источник правды** (Zustand) + **автоматическое "самолечение"** (React Query) + **мгновенные обновления** (WebSocket).

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE                        │
│              (Единый "мозг" приложения)                 │
│  • userData                                            │
│  • userSubscriptions                                   │
│  • isAdmin                                            │
│  • token                                              │
│                                                        │
│  Функции:                                             │
│  • login() - вход                                     │
│  • logout() - выход                                   │
│  • updateUserSubscriptions() - обновление подписок    │
└─────────────────────────────────────────────────────────┘
                    ▲                │
                    │                │
        ┌───────────┴────────────┐   │
        │                        │   │
┌───────▼─────────┐    ┌─────────▼───▼──────┐
│  React Query    │    │   WebSocket        │
│  ("Самолечение")│    │  (Мгновенные       │
│                 │    │   обновления)      │
│  • fetchUser()  │    │                    │
│  • Auto refresh │    │  • subscription_   │
│  • Cache        │    │    update          │
│                 │    │  • subscription_   │
│                 │    │    approved        │
└─────────────────┘    └────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   UI Components       │
                    │                       │
                    │  useAuthStore hook    │
                    │  (автоматически       │
                    │   перерисовываются)   │
                    └───────────────────────┘
```

## 📋 Шаги интеграции

### 1. Zustand Store (`src/store/useAuthStore.js`)

```javascript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '../services/apiClient'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      userData: null,
      userSubscriptions: [],
      isAdmin: false,
      token: null,
      
      // Вход в систему
      login: (data) => {
        const token = data.token || localStorage.getItem('auth_token')
        if (token) apiClient.setToken(token)
        
        set({
          userData: data.userData,
          userSubscriptions: data.userData?.subscriptions || [],
          isAdmin: data.isAdmin,
          token: token
        })
      },
      
      // КЛЮЧЕВАЯ ФУНКЦИЯ для обновления подписок
      updateUserSubscriptions: (newSubscriptions) => {
        console.log('🔄 ZUSTAND: Обновляю подписки:', newSubscriptions)
        set({
          userSubscriptions: newSubscriptions,
          userData: get().userData ? {
            ...get().userData,
            subscriptions: newSubscriptions
          } : null
        })
      },
      
      logout: () => {
        apiClient.removeToken()
        set({
          userData: null,
          userSubscriptions: [],
          isAdmin: false,
          token: null
        })
      }
    }),
    { name: 'auth-storage' }
  )
)
```

### 2. React Query синхронизация (`src/hooks/useAuthSync.js`)

```javascript
import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore'
import apiClient from '../services/apiClient'

export const useAuthSync = () => {
  const { login, logout, token, userData } = useAuthStore()
  const queryClient = useQueryClient()

  // React Query для загрузки пользователя
  const { data: userDataFromQuery, isError } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get('/api/auth/me'),
    enabled: !!token,
    retry: 1,
    refetchOnWindowFocus: true, // <-- "Самолечение"
    refetchOnReconnect: true,   // <-- "Самолечение"
    staleTime: 5 * 60 * 1000
  })

  // Синхронизация React Query -> Zustand
  useEffect(() => {
    if (userDataFromQuery) {
      login({
        userData: userDataFromQuery,
        isAdmin: userDataFromQuery.is_admin
      })
    }
    if (isError) logout()
  }, [userDataFromQuery, isError])
}
```

### 3. WebSocket интеграция (`src/hooks/useWebSocket.js`)

```javascript
import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export const useWebSocket = (userId, onNotification) => {
  const updateUserSubscriptions = useAuthStore(
    state => state.updateUserSubscriptions
  )
  const queryClient = useQueryClient()

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8001/ws/${userId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'subscription_update') {
        // ШАГ 1: Обновляем Zustand (все меню перерисуются)
        updateUserSubscriptions(data.subscriptions)
        
        // ШАГ 2: Обновляем React Query cache
        queryClient.setQueryData(['user'], old => ({
          ...old,
          subscriptions: data.subscriptions
        }))
      }
    }
    
    return () => ws.close()
  }, [userId, updateUserSubscriptions])
}
```

### 4. Использование в компонентах

```javascript
import { useAuthStore } from '../store/useAuthStore'

export const MenuComponent = () => {
  // Берем данные из Zustand
  const userSubscriptions = useAuthStore(state => state.userSubscriptions)
  const isAdmin = useAuthStore(state => state.isAdmin)
  
  // Проверяем подписку
  const hasVipAccess = userSubscriptions?.includes('shadow-stack')
  
  return (
    <nav>
      <a href="/">Главная</a>
      
      {/* VIP меню - показывается только с подпиской */}
      {hasVipAccess && (
        <a href="/vip" style={{ color: 'gold' }}>VIP</a>
      )}
      
      {/* Админ меню */}
      {isAdmin && (
        <a href="/admin" style={{ color: 'red' }}>Админ</a>
      )}
    </nav>
  )
}
```

## ✅ Преимущества

### 1. **Единый источник правды**
- Все меню смотрят в одно место (`useAuthStore`)
- Нет конфликтов между разными источниками данных

### 2. **Автоматическое "самолечение"**
- React Query автоматически обновляет данные при фокусе вкладки
- Нужно отключить `refetchOnWindowFocus: true` чтобы выключить

### 3. **Мгновенные обновления**
- WebSocket мгновенно обновляет Zustand
- Все компоненты автоматически перерисовываются

### 4. **Простота использования**
```javascript
// В любом компоненте просто используй:
const subscriptions = useAuthStore(state => state.userSubscriptions)
```

### 5. **Автоматическая синхронизация**
- Zustand ↔ React Query ↔ WebSocket
- Все три системы работают вместе

## 🔄 Поток данных

1. **Пользователь заходит** → React Query загружает данные → Zustand обновляется
2. **WebSocket получает обновление** → Zustand обновляется → Все меню перерисовываются
3. **Пользователь возвращается на вкладку** → React Query обновляет данные → Zustand обновляется

## 🎯 Результат

- ✅ Все меню всегда синхронизированы
- ✅ Нет гонок между разными источниками данных
- ✅ Автоматическое "самолечение" при возврате на вкладку
- ✅ Мгновенные обновления через WebSocket
- ✅ Простая интеграция в любой компонент

