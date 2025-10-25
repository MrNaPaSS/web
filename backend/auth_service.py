"""
Сервис авторизации пользователей через Telegram WebApp
ИНТЕГРАЦИЯ С ОСНОВНЫМ БОТОМ - использует те же файлы данных!
"""
import json
from datetime import datetime
from typing import Optional, Dict, Any
import hashlib
import hmac
from urllib.parse import parse_qs
import os

class AuthService:
    def __init__(self, bot_dir='e:/TelegramBot_RDP'):
        """
        Инициализация с путями к файлам основного бота
        """
        self.bot_dir = bot_dir
        
        # Пути к файлам данных основного бота
        self.authorized_users_file = os.path.join(bot_dir, 'authorized_users.json')
        self.user_languages_file = os.path.join(bot_dir, 'user_languages.json')
        self.signal_stats_file = os.path.join(bot_dir, 'signal_stats.json')
        
        self.init_files()
    
    def init_files(self):
        """Инициализация файлов если не существуют"""
        import sys
        import io
        
        # Фикс кодировки для Windows
        if sys.platform == 'win32':
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        
        # Создаем authorized_users.json если нет
        if not os.path.exists(self.authorized_users_file):
            with open(self.authorized_users_file, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)
            print(f'[OK] Создан файл: {self.authorized_users_file}')
        
        # Создаем user_languages.json если нет
        if not os.path.exists(self.user_languages_file):
            with open(self.user_languages_file, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)
            print(f'[OK] Создан файл: {self.user_languages_file}')
        
        # Создаем signal_stats.json если нет
        if not os.path.exists(self.signal_stats_file):
            with open(self.signal_stats_file, 'w', encoding='utf-8') as f:
                json.dump({}, f, ensure_ascii=False, indent=2)
            print(f'[OK] Создан файл: {self.signal_stats_file}')
        
        print('[OK] Файлы данных бота проверены')
    
    def load_authorized_users(self) -> Dict:
        """Загрузка авторизованных пользователей из файла бота"""
        try:
            with open(self.authorized_users_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f'[ERROR] Ошибка загрузки пользователей: {e}')
            return {}
    
    def save_authorized_users(self, users: Dict):
        """Сохранение авторизованных пользователей в файл бота"""
        try:
            with open(self.authorized_users_file, 'w', encoding='utf-8') as f:
                json.dump(users, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f'[ERROR] Ошибка сохранения пользователей: {e}')
    
    def load_user_languages(self) -> Dict:
        """Загрузка языков пользователей"""
        try:
            with open(self.user_languages_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f'[ERROR] Ошибка загрузки языков: {e}')
            return {}
    
    def save_user_languages(self, languages: Dict):
        """Сохранение языков пользователей"""
        try:
            with open(self.user_languages_file, 'w', encoding='utf-8') as f:
                json.dump(languages, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f'[ERROR] Ошибка сохранения языков: {e}')
    
    def load_signal_stats(self) -> Dict:
        """Загрузка статистики сигналов"""
        try:
            with open(self.signal_stats_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f'[ERROR] Ошибка загрузки статистики: {e}')
            return {}
    
    def verify_telegram_webapp_data(self, init_data: str, bot_token: str) -> bool:
        """
        Проверка подлинности данных от Telegram WebApp
        https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        """
        try:
            # Парсим init_data
            parsed = parse_qs(init_data)
            hash_value = parsed.get('hash', [''])[0]
            
            if not hash_value:
                return False
            
            # Удаляем hash из данных
            data_check_string = '\n'.join([
                f'{k}={v[0]}' 
                for k, v in sorted(parsed.items()) 
                if k != 'hash'
            ])
            
            # Создаем секретный ключ
            secret_key = hmac.new(
                b"WebAppData",
                bot_token.encode(),
                hashlib.sha256
            ).digest()
            
            # Вычисляем hash
            calculated_hash = hmac.new(
                secret_key,
                data_check_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Сравниваем
            return hmac.compare_digest(calculated_hash, hash_value)
        except Exception as e:
            print(f'[ERROR] Ошибка проверки данных Telegram: {e}')
            return False
    
    def register_or_update_user(self, user_data: Dict[str, Any], admin_id: str) -> Dict[str, Any]:
        """
        Регистрация нового пользователя или обновление существующего
        СИНХРОНИЗАЦИЯ С ДАННЫМИ ОСНОВНОГО БОТА
        """
        telegram_id = str(user_data.get('id'))
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        username = user_data.get('username', '')
        language_code = user_data.get('language_code', 'ru')
        is_premium = user_data.get('is_premium', False)
        is_admin = telegram_id == admin_id
        
        # Загружаем текущих пользователей
        users = self.load_authorized_users()
        
        # Проверяем, существует ли пользователь
        is_new_user = telegram_id not in users
        
        now = datetime.now().isoformat()
        
        # Создаем/обновляем данные пользователя
        user_info = {
            'telegram_id': telegram_id,
            'first_name': first_name,
            'last_name': last_name,
            'username': username,
            'language_code': language_code,
            'is_premium': is_premium,
            'is_admin': is_admin,
            'last_login': now,
            'subscriptions': ['logistic-spy']  # Базовая модель по умолчанию
        }
        
        if is_new_user:
            user_info['created_at'] = now
            print(f'[NEW] Новый пользователь: {first_name} ({telegram_id})')
        else:
            # Сохраняем дату создания и подписки
            user_info['created_at'] = users[telegram_id].get('created_at', now)
            user_info['subscriptions'] = users[telegram_id].get('subscriptions', ['logistic-spy'])
            print(f'[UPDATE] Пользователь обновлен: {first_name} ({telegram_id})')
        
        # Сохраняем в файл
        users[telegram_id] = user_info
        self.save_authorized_users(users)
        
        # Сохраняем язык пользователя
        languages = self.load_user_languages()
        languages[telegram_id] = language_code
        self.save_user_languages(languages)
        
        user_info['is_new_user'] = is_new_user
        return user_info
    
    def get_user(self, telegram_id: str) -> Optional[Dict[str, Any]]:
        """Получение данных пользователя из файла бота"""
        users = self.load_authorized_users()
        return users.get(telegram_id)
    
    def update_subscriptions(self, telegram_id: str, subscriptions: list) -> bool:
        """Обновление подписок пользователя"""
        try:
            users = self.load_authorized_users()
            
            if telegram_id in users:
                users[telegram_id]['subscriptions'] = subscriptions
                self.save_authorized_users(users)
                return True
            
            return False
        except Exception as e:
            print(f'[ERROR] Ошибка обновления подписок: {e}')
            return False
    
    def get_all_users(self) -> list:
        """Получение всех пользователей (для админ-панели)"""
        users = self.load_authorized_users()
        return list(users.values())
    
    def delete_user(self, telegram_id: str) -> bool:
        """Удаление пользователя"""
        try:
            users = self.load_authorized_users()
            
            if telegram_id in users:
                del users[telegram_id]
                self.save_authorized_users(users)
                
                # Удаляем язык
                languages = self.load_user_languages()
                if telegram_id in languages:
                    del languages[telegram_id]
                    self.save_user_languages(languages)
                
                print(f'[DELETE] Пользователь {telegram_id} удален')
                return True
            
            return False
        except Exception as e:
            print(f'[ERROR] Ошибка удаления пользователя: {e}')
            return False
    
    def get_user_stats(self, telegram_id: str) -> Optional[Dict]:
        """Получение статистики пользователя из файла бота"""
        stats = self.load_signal_stats()
        return stats.get(telegram_id)
    
    def get_user_subscriptions(self, telegram_id: str) -> list:
        """Получение подписок пользователя"""
        try:
            users = self.load_authorized_users()
            user = users.get(telegram_id)
            if user:
                return user.get('subscriptions', ['logistic-spy'])
            return ['logistic-spy']  # Базовая подписка по умолчанию
        except Exception as e:
            print(f'[ERROR] Ошибка получения подписок: {e}')
            return ['logistic-spy']
    
    def grant_subscription(self, telegram_id: str, model_id: str, admin_id: str) -> bool:
        """Назначить подписку на модель пользователю"""
        try:
            users = self.load_authorized_users()
            
            if telegram_id in users:
                user = users[telegram_id]
                subscriptions = user.get('subscriptions', ['logistic-spy'])
                
                if model_id not in subscriptions:
                    subscriptions.append(model_id)
                    user['subscriptions'] = subscriptions
                    self.save_authorized_users(users)
                    
                    # ДОБАВЛЕНО: Синхронизация с user_subscriptions.json
                    self._sync_user_subscriptions(telegram_id, subscriptions)
                    
                    # Логируем в историю
                    self.log_subscription_change(telegram_id, admin_id, 
                                               user.get('subscriptions', []), 
                                               subscriptions, 
                                               f'Granted {model_id}')
                    
                    print(f'[GRANT] Пользователь {telegram_id} получил подписку {model_id}')
                    return True
                else:
                    print(f'[WARN] Пользователь {telegram_id} уже имеет подписку {model_id}')
                    return True  # Уже есть подписка
            
            return False
        except Exception as e:
            print(f'[ERROR] Ошибка назначения подписки: {e}')
            return False
    
    def revoke_subscription(self, telegram_id: str, model_id: str, admin_id: str) -> bool:
        """Отменить подписку на модель у пользователя"""
        try:
            users = self.load_authorized_users()
            
            if telegram_id in users:
                user = users[telegram_id]
                subscriptions = user.get('subscriptions', ['logistic-spy'])
                old_subscriptions = subscriptions.copy()
                
                if model_id in subscriptions:
                    subscriptions.remove(model_id)
                    # Убеждаемся что остается базовая подписка
                    if 'logistic-spy' not in subscriptions:
                        subscriptions.insert(0, 'logistic-spy')
                    
                    user['subscriptions'] = subscriptions
                    self.save_authorized_users(users)
                    
                    # ДОБАВЛЕНО: Синхронизация с user_subscriptions.json
                    self._sync_user_subscriptions(telegram_id, subscriptions)
                    
                    # Логируем в историю
                    self.log_subscription_change(telegram_id, admin_id, 
                                               old_subscriptions, 
                                               subscriptions, 
                                               f'Revoked {model_id}')
                    
                    print(f'[REVOKE] У пользователя {telegram_id} отменена подписка {model_id}')
                    return True
                else:
                    print(f'[WARN] У пользователя {telegram_id} нет подписки {model_id}')
                    return True  # Уже нет подписки
            
            return False
        except Exception as e:
            print(f'[ERROR] Ошибка отмены подписки: {e}')
            return False
    
    def log_subscription_change(self, user_id: str, admin_id: str, 
                               old_subscriptions: list, new_subscriptions: list, 
                               reason: str):
        """Логирование изменений подписок"""
        try:
            # Создаем простой лог файл для истории подписок
            log_file = os.path.join(self.bot_dir, 'subscription_history.json')
            
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            else:
                history = []
            
            log_entry = {
                'timestamp': datetime.now().isoformat(),
                'user_id': user_id,
                'admin_id': admin_id,
                'old_subscriptions': old_subscriptions,
                'new_subscriptions': new_subscriptions,
                'reason': reason,
                'ip_address': '127.0.0.1'  # Для локальной разработки
            }
            
            history.append(log_entry)
            
            # Ограничиваем историю последними 1000 записями
            if len(history) > 1000:
                history = history[-1000:]
            
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f'[ERROR] Ошибка логирования подписки: {e}')
    
    def _sync_user_subscriptions(self, telegram_id: str, subscriptions: list):
        """Синхронизация подписок в user_subscriptions.json"""
        try:
            subscriptions_file = os.path.join(self.bot_dir, 'user_subscriptions.json')
            
            if os.path.exists(subscriptions_file):
                with open(subscriptions_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = {}
            
            data[telegram_id] = subscriptions
            
            with open(subscriptions_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
            print(f'[SYNC] Синхронизированы подписки для {telegram_id}: {subscriptions}')
        except Exception as e:
            print(f'[ERROR] Ошибка синхронизации подписок: {e}')


if __name__ == '__main__':
    import sys
    import io
    
    # Фикс кодировки для Windows
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    # Тест
    auth = AuthService()
    print('[OK] Сервис авторизации готов к работе')
    print(f'[DIR] Директория бота: {auth.bot_dir}')
    print(f'[FILE] Файл пользователей: {auth.authorized_users_file}')
    
    # Показываем текущих пользователей
    users = auth.load_authorized_users()
    print(f'[USERS] Авторизованных пользователей: {len(users)}')
