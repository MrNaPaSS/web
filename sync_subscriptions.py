import json
import os

def sync_subscription_files():
    """Синхронизация authorized_users.json и user_subscriptions.json"""
    
    print('🔄 Начинаем синхронизацию файлов подписок...')
    
    # Читаем authorized_users.json
    try:
        with open('authorized_users.json', 'r', encoding='utf-8') as f:
            authorized_users = json.load(f)
        print('✅ Прочитан authorized_users.json')
    except Exception as e:
        print(f'❌ Ошибка чтения authorized_users.json: {e}')
        return
    
    # Создаем новый словарь для user_subscriptions.json
    user_subscriptions = {}
    
    for user_id, user_data in authorized_users.items():
        if user_id not in ['authorized_users', 'last_updated'] and isinstance(user_data, dict):
            subscriptions = user_data.get('subscriptions', ['logistic-spy'])
            user_subscriptions[user_id] = subscriptions
            print(f'📝 Пользователь {user_id}: {subscriptions}')
    
    # Сохраняем в user_subscriptions.json
    try:
        with open('user_subscriptions.json', 'w', encoding='utf-8') as f:
            json.dump(user_subscriptions, f, ensure_ascii=False, indent=2)
        print('✅ Сохранен user_subscriptions.json')
    except Exception as e:
        print(f'❌ Ошибка сохранения user_subscriptions.json: {e}')
        return
    
    print('✅ Синхронизация завершена')
    print(f'📊 Обработано пользователей: {len(user_subscriptions)}')
    
    # Показываем результат
    for user_id, subscriptions in user_subscriptions.items():
        print(f'   {user_id}: {subscriptions}')

if __name__ == '__main__':
    sync_subscription_files()
