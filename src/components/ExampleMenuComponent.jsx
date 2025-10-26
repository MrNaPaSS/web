import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Пример компонента меню, который использует Zustand store
 * Этот компонент автоматически перерисовывается при изменении подписок
 */
export const ExampleMenuComponent = () => {
  // Берем подписки из Zustand store
  const userSubscriptions = useAuthStore(state => state.userSubscriptions)
  const userData = useAuthStore(state => state.userData)
  const isAdmin = useAuthStore(state => state.isAdmin)

  // Проверяем наличие VIP подписки
  const hasVipAccess = userSubscriptions?.includes('shadow-stack') || 
                       userSubscriptions?.includes('sniper-80x')

  return (
    <nav className="flex flex-col gap-2 p-4">
      <h3 className="font-bold">Меню</h3>
      
      {/* Базовые пункты меню */}
      <a href="/" className="text-blue-400 hover:text-blue-300">
        Главная
      </a>
      
      <a href="/signals" className="text-blue-400 hover:text-blue-300">
        Сигналы
      </a>

      {/* VIP пункты меню (показываются только с VIP подпиской) */}
      {hasVipAccess && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <p className="text-yellow-400 font-semibold mb-2">VIP Зона</p>
          <a href="/vip-lounge" className="text-yellow-400 hover:text-yellow-300 block">
            VIP Зал
          </a>
          <a href="/premium-tools" className="text-yellow-400 hover:text-yellow-300 block">
            Премиум инструменты
          </a>
        </div>
      )}

      {/* Админ пункты (показываются только админу) */}
      {isAdmin && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <p className="text-red-400 font-semibold mb-2">Админ</p>
          <a href="/admin" className="text-red-400 hover:text-red-300 block">
            Админ-панель
          </a>
        </div>
      )}

      {/* Информация о подписках */}
      <div className="mt-4 border-t border-gray-700 pt-4 text-xs text-gray-400">
        <p>Активные подписки:</p>
        <ul className="list-disc list-inside mt-1">
          {userSubscriptions && userSubscriptions.length > 0 ? (
            userSubscriptions.map(sub => (
              <li key={sub}>{sub}</li>
            ))
          ) : (
            <li>Нет подписок</li>
          )}
        </ul>
      </div>
    </nav>
  )
}

/**
 * Пример компонента, который использует DIFFERENT подписку
 */
export const AnotherMenuComponent = () => {
  // Берем подписки из ТОГО ЖЕ Zustand store
  const userSubscriptions = useAuthStore(state => state.userSubscriptions)

  // Проверяем ДРУГУЮ подписку
  const hasPremiumTools = userSubscriptions?.includes('sniper-80x')

  return (
    <aside className="p-4 bg-gray-800 rounded-lg">
      <h3 className="font-bold mb-4">Инструменты</h3>
      
      <div className="space-y-2">
        <div className="p-2 bg-gray-700 rounded">
          Обычный инструмент
        </div>
        
        {hasPremiumTools && (
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded text-white">
            🔥 Премиум инструмент
          </div>
        )}
      </div>
    </aside>
  )
}
