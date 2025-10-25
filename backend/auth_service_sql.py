#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сервис авторизации пользователей через Telegram WebApp
ВЕРСИЯ С SQL БАЗОЙ ДАННЫХ
"""
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import hashlib
import hmac
from urllib.parse import parse_qs
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv('config.env')

# Импортируем SQL модели
from models import User, SubscriptionModel, UserSubscription, SubscriptionHistory
from database import SessionLocal

class AuthServiceSQL:
    def __init__(self):
        """Инициализация сервиса авторизации с SQL"""
        self.jwt_secret = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
        self.bot_token = os.getenv('BOT_TOKEN', '')
        self.admin_telegram_id = int(os.getenv('ADMIN_TELEGRAM_ID', '511442168'))
    
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
    
    def get_user_by_telegram_id(self, telegram_id: str) -> Optional[User]:
        """Получение пользователя по Telegram ID"""
        try:
            db = SessionLocal()
            user = db.query(User).filter(User.telegram_id == int(telegram_id)).first()
            db.close()
            return user
        except Exception as e:
            print(f'[ERROR] Ошибка получения пользователя: {e}')
            return None
    
    def get_user_subscriptions(self, telegram_id: str) -> List[str]:
        """Получение активных подписок пользователя"""
        try:
            db = SessionLocal()
            
            # Находим активные подписки (не истёкшие)
            active_subs = db.query(UserSubscription).filter(
                UserSubscription.user_id == int(telegram_id),
                UserSubscription.is_active == True,
                (UserSubscription.expiry_date == None) | (UserSubscription.expiry_date > datetime.utcnow())
            ).all()
            
            subscriptions = [sub.model_id for sub in active_subs]
            db.close()
            
            return subscriptions
        except Exception as e:
            print(f'[ERROR] Ошибка получения подписок: {e}')
            return ['logistic-spy']  # Базовая подписка по умолчанию
    
    def create_access_token(self, telegram_id: str) -> str:
        """Создание JWT токена с подписками и версией"""
        try:
            user = self.get_user_by_telegram_id(telegram_id)
            subscriptions = self.get_user_subscriptions(telegram_id)
            
            payload = {
                "user_id": telegram_id,
                "role": user.role if user else 'user',
                "subscriptions": subscriptions,
                "is_premium": user.is_premium if user else False,
                "sub_version": user.subscription_version if user else 1,  # Версия подписок
                "exp": datetime.utcnow() + timedelta(days=7)
            }
            
            return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
        except Exception as e:
            print(f'[ERROR] Ошибка создания токена: {e}')
            return None
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """Проверка JWT токена"""
        try:
            return jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        except Exception as e:
            print(f'[ERROR] Ошибка проверки токена: {e}')
            return None
    
    def register_or_update_user(self, user_data: Dict[str, Any], admin_id: str) -> Dict[str, Any]:
        """Регистрация или обновление пользователя в SQL"""
        try:
            telegram_id = str(user_data.get('id'))
            first_name = user_data.get('first_name', '')
            last_name = user_data.get('last_name', '')
            username = user_data.get('username', '')
            language_code = user_data.get('language_code', 'ru')
            is_premium = user_data.get('is_premium', False)
            is_admin = telegram_id == admin_id
            
            db = SessionLocal()
            
            # Проверяем существование пользователя
            user = db.query(User).filter(User.telegram_id == int(telegram_id)).first()
            is_new_user = user is None
            
            now = datetime.utcnow()
            
            if is_new_user:
                # Создаем нового пользователя
                user = User(
                    telegram_id=int(telegram_id),
                    first_name=first_name,
                    last_name=last_name,
                    username=username,
                    language_code=language_code,
                    role='admin' if is_admin else 'user',
                    is_premium=is_premium,
                    created_at=now,
                    last_active=now
                )
                db.add(user)
                db.commit()
                
                # Выдаем базовую подписку
                basic_subscription = UserSubscription(
                    user_id=int(telegram_id),
                    model_id='logistic-spy',
                    granted_by=int(admin_id) if is_admin else None,
                    is_active=True
                )
                db.add(basic_subscription)
                db.commit()
                
                print(f'[NEW] Новый пользователь: {first_name} ({telegram_id})')
            else:
                # Обновляем существующего пользователя
                user.first_name = first_name
                user.last_name = last_name
                user.username = username
                user.language_code = language_code
                user.is_premium = is_premium
                user.last_active = now
                user.updated_at = now
                
                db.commit()
                print(f'[UPDATE] Пользователь обновлен: {first_name} ({telegram_id})')
            
            # Получаем подписки
            subscriptions = self.get_user_subscriptions(telegram_id)
            
            user_info = {
                'telegram_id': telegram_id,
                'first_name': first_name,
                'last_name': last_name,
                'username': username,
                'language_code': language_code,
                'is_premium': is_premium,
                'role': user.role,
                'subscriptions': subscriptions,
                'is_new_user': is_new_user,
                'created_at': user.created_at.isoformat() if is_new_user else None,
                'last_login': now.isoformat()
            }
            
            db.close()
            return user_info
            
        except Exception as e:
            print(f'[ERROR] Ошибка регистрации пользователя: {e}')
            return None
    
    def grant_subscription(self, telegram_id: str, model_id: str, admin_id: str, expiry_days: Optional[int] = None) -> bool:
        """Выдача подписки пользователю с инкрементом версии"""
        try:
            db = SessionLocal()
            
            # Проверяем существующую подписку
            existing = db.query(UserSubscription).filter(
                UserSubscription.user_id == int(telegram_id),
                UserSubscription.model_id == model_id,
                UserSubscription.is_active == True
            ).first()
            
            if existing:
                print(f'[WARN] Пользователь {telegram_id} уже имеет подписку {model_id}')
                db.close()
                return True  # Уже есть подписка
            
            # Создаем новую подписку
            expiry_date = datetime.utcnow() + timedelta(days=expiry_days) if expiry_days else None
            
            new_subscription = UserSubscription(
                user_id=int(telegram_id),
                model_id=model_id,
                granted_by=int(admin_id),
                expiry_date=expiry_date,
                is_active=True
            )
            
            db.add(new_subscription)
            
            # ИНКРЕМЕНТИРУЕМ ВЕРСИЮ ПОДПИСОК
            user = db.query(User).filter(User.telegram_id == int(telegram_id)).first()
            if user:
                user.subscription_version += 1
                print(f'[VERSION] User {telegram_id} subscription version: {user.subscription_version}')
            
            db.commit()
            
            # Логируем изменение
            self._log_subscription_change(
                db, telegram_id, admin_id, 
                'grant', model_id, expiry_days
            )
            
            db.close()
            
            print(f'[GRANT] Пользователь {telegram_id} получил подписку {model_id}')
            return True
            
        except Exception as e:
            print(f'[ERROR] Ошибка выдачи подписки: {e}')
            return False
    
    def revoke_subscription(self, telegram_id: str, model_id: str, admin_id: str) -> bool:
        """Отзыв подписки у пользователя"""
        try:
            db = SessionLocal()
            
            # Находим активную подписку
            subscription = db.query(UserSubscription).filter(
                UserSubscription.user_id == int(telegram_id),
                UserSubscription.model_id == model_id,
                UserSubscription.is_active == True
            ).first()
            
            if not subscription:
                print(f'[WARN] У пользователя {telegram_id} нет активной подписки {model_id}')
                db.close()
                return True  # Уже нет подписки
            
            # Деактивируем подписку
            subscription.is_active = False
            db.commit()
            
            # Логируем изменение
            self._log_subscription_change(
                db, telegram_id, admin_id, 
                'revoke', model_id
            )
            
            db.close()
            
            print(f'[REVOKE] У пользователя {telegram_id} отозвана подписка {model_id}')
            return True
            
        except Exception as e:
            print(f'[ERROR] Ошибка отзыва подписки: {e}')
            return False
    
    def _log_subscription_change(self, db, user_id: str, admin_id: str, action: str, model_id: str, expiry_days: Optional[int] = None):
        """Логирование изменений подписок"""
        try:
            # Получаем текущие подписки
            current_subs = self.get_user_subscriptions(user_id)
            
            # Создаем запись в истории
            history_entry = SubscriptionHistory(
                user_id=int(user_id),
                admin_id=int(admin_id),
                old_subscriptions=current_subs.copy(),
                new_subscriptions=current_subs.copy(),  # Будет обновлено после изменения
                reason=f'{action} {model_id}' + (f' (expires in {expiry_days} days)' if expiry_days else ''),
                ip_address='127.0.0.1'  # Для локальной разработки
            )
            
            db.add(history_entry)
            db.commit()
            
        except Exception as e:
            print(f'[ERROR] Ошибка логирования подписки: {e}')
    
    def get_all_users(self) -> List[Dict]:
        """Получение всех пользователей для админ-панели"""
        try:
            db = SessionLocal()
            users = db.query(User).all()
            
            result = []
            for user in users:
                subscriptions = self.get_user_subscriptions(str(user.telegram_id))
                result.append({
                    'telegram_id': str(user.telegram_id),
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'username': user.username,
                    'role': user.role,
                    'is_premium': user.is_premium,
                    'subscriptions': subscriptions,
                    'created_at': user.created_at.isoformat(),
                    'last_active': user.last_active.isoformat()
                })
            
            db.close()
            return result
            
        except Exception as e:
            print(f'[ERROR] Ошибка получения пользователей: {e}')
            return []
    
    def delete_user(self, telegram_id: str) -> bool:
        """Удаление пользователя"""
        try:
            db = SessionLocal()
            
            user = db.query(User).filter(User.telegram_id == int(telegram_id)).first()
            if not user:
                db.close()
                return False
            
            # Удаляем подписки пользователя
            db.query(UserSubscription).filter(UserSubscription.user_id == int(telegram_id)).delete()
            
            # Удаляем пользователя
            db.delete(user)
            db.commit()
            db.close()
            
            print(f'[DELETE] Пользователь {telegram_id} удален')
            return True
            
        except Exception as e:
            print(f'[ERROR] Ошибка удаления пользователя: {e}')
            return False


if __name__ == '__main__':
    import sys
    import io
    
    # Фикс кодировки для Windows
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    # Тест
    auth = AuthServiceSQL()
    print('[OK] SQL Auth Service готов к работе')
    print(f'[JWT] Secret key loaded: {bool(auth.jwt_secret)}')
    print(f'[BOT] Token loaded: {bool(auth.bot_token)}')
    print(f'[ADMIN] Admin ID: {auth.admin_telegram_id}')
