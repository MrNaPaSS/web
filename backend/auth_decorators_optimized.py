#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Оптимизированные декораторы с версионированием подписок
Быстрая проверка через сравнение версий
"""
from functools import wraps
from flask import request, jsonify
import jwt
from datetime import datetime
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv('config.env')

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default_secret_key')

def extract_token_from_request():
    """Извлечение JWT токена из заголовка Authorization"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    return auth_header.split(' ')[1]

def verify_jwt_token(token):
    """Проверка JWT токена"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None

def login_required(f):
    """Декоратор для проверки аутентификации"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_token_from_request()
        if not token:
            return jsonify({
                "success": False,
                "error": "Authentication required",
                "message": "Требуется авторизация"
            }), 401
        
        token_data = verify_jwt_token(token)
        if not token_data:
            return jsonify({
                "success": False,
                "error": "Invalid or expired token",
                "message": "Недействительный или истёкший токен"
            }), 401
        
        # Добавляем данные пользователя в request
        request.user_data = token_data
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Декоратор для проверки админских прав"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token_data = getattr(request, 'user_data', None)
        if not token_data:
            return jsonify({
                "success": False,
                "error": "Authentication required",
                "message": "Требуется авторизация"
            }), 401
        
        if token_data.get('role') != 'admin':
            return jsonify({
                "success": False,
                "error": "Admin access required",
                "message": "Требуются права администратора"
            }), 403
        
        return f(*args, **kwargs)
    return decorated

def subscription_required_optimized(model_id):
    """Оптимизированный декоратор с проверкой версий подписок"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # 1. Аутентификация: кто этот пользователь?
            token_data = getattr(request, 'user_data', None)
            if not token_data or 'user_id' not in token_data:
                return jsonify({
                    "success": False,
                    "error": "Authentication required",
                    "message": "Требуется авторизация"
                }), 401
            
            user_id = token_data['user_id']
            token_version = token_data.get('sub_version', 1)
            
            # 2. СВЕРХБЫСТРАЯ проверка версии подписок
            try:
                from database import SessionLocal
                from models import User
                
                db = SessionLocal()
                
                # Получаем текущую версию из SQL
                user = db.query(User).filter(User.telegram_id == int(user_id)).first()
                current_version = user.subscription_version if user else 1
                
                db.close()
                
                # Если версии не совпадают - токен устарел
                if token_version != current_version:
                    print(f'[VERSION] Token version {token_version} != DB version {current_version}')
                    return jsonify({
                        "success": False,
                        "error": "Token outdated",
                        "message": "Токен устарел, требуется обновление",
                        "requires_refresh": True
                    }), 401
                
                # Если версии совпадают - доверяем JWT (быстро!)
                user_subs = token_data.get('subscriptions', [])
                if model_id not in user_subs:
                    return jsonify({
                        "success": False,
                        "error": f"Subscription to {model_id} required",
                        "message": f"Требуется подписка на модель {model_id}",
                        "model_id": model_id
                    }), 403
                
                # 3. Разрешение: передаем user_id в эндпоинт
                kwargs['current_user_id'] = user_id
                return f(*args, **kwargs)
                
            except Exception as e:
                print(f'[ERROR] Optimized subscription check failed: {e}')
                # Fallback к полной проверке SQL
                return _full_sql_check(user_id, model_id, f, args, kwargs)
                
        return decorated
    return decorator

def _full_sql_check(user_id, model_id, f, args, kwargs):
    """Fallback к полной проверке SQL"""
    try:
        from database import SessionLocal
        from models import UserSubscription
        from datetime import datetime
        
        db = SessionLocal()
        
        # Полная проверка подписки в SQL
        has_subscription = db.query(UserSubscription).filter(
            UserSubscription.user_id == int(user_id),
            UserSubscription.model_id == model_id,
            UserSubscription.is_active == True,
            (UserSubscription.expiry_date == None) | (UserSubscription.expiry_date > datetime.utcnow())
        ).first()
        
        db.close()
        
        if not has_subscription:
            return jsonify({
                "success": False,
                "error": f"Subscription to {model_id} required",
                "message": f"Требуется подписка на модель {model_id}",
                "model_id": model_id
            }), 403
        
        # Разрешение
        kwargs['current_user_id'] = user_id
        return f(*args, **kwargs)
        
    except Exception as e:
        print(f'[ERROR] Full SQL check failed: {e}')
        return jsonify({
            "success": False,
            "error": "Database error",
            "message": "Ошибка проверки подписки"
        }), 500

def get_current_user():
    """Получение данных текущего пользователя из токена"""
    token_data = getattr(request, 'user_data', None)
    if not token_data:
        return None
    
    return {
        'user_id': token_data.get('user_id'),
        'role': token_data.get('role'),
        'subscriptions': token_data.get('subscriptions', []),
        'is_premium': token_data.get('is_premium', False),
        'sub_version': token_data.get('sub_version', 1)
    }

def log_api_access(user_id, endpoint, method):
    """Логирование доступа к API"""
    try:
        print(f"📊 API Access: {method} {endpoint} by user {user_id}")
    except Exception as e:
        print(f"❌ Error logging API access: {e}")
