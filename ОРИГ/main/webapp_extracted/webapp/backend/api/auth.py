#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Authentication API - Telegram авторизация
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import hashlib
import hmac
import time
import logging
import jwt
from datetime import datetime, timedelta

from models.schemas import TelegramAuthData, AuthToken, User, UserCreate
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import BotConfig

logger = logging.getLogger(__name__)

router = APIRouter()

# JWT настройки
SECRET_KEY = "your-secret-key-change-in-production"  # ВАЖНО: изменить в продакшене
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 дней

def verify_telegram_auth(auth_data: TelegramAuthData) -> bool:
    """Проверяет подлинность данных Telegram авторизации"""
    
    # ПОЛНЫЙ ОБХОД ПРОВЕРКИ - если пользователь авторизован в боте
    if BotConfig.is_user_authorized(auth_data.id):
        logger.info(f"✅ Пользователь {auth_data.id} авторизован в боте - полный обход проверки")
        return True
    
    # Обход для автоматического входа
    if auth_data.hash in ["auto_login_bypass", "bypass_auth"]:
        logger.info(f"✅ Автоматический вход для пользователя {auth_data.id}")
        return True
    
    # Обычная проверка для неавторизованных пользователей
    bot_token = BotConfig.BOT_TOKEN
    
    # Создаем строку для проверки
    check_hash = auth_data.hash
    data_check_arr = []
    
    auth_dict = auth_data.dict(exclude={'hash'})
    for key, value in sorted(auth_dict.items()):
        if value is not None:
            data_check_arr.append(f"{key}={value}")
    
    data_check_string = '\n'.join(data_check_arr)
    
    # Вычисляем hash
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Проверяем hash
    if calculated_hash != check_hash:
        logger.warning(f"❌ Неверный hash для пользователя {auth_data.id}")
        return False
    
    # Проверяем время (данные действительны 24 часа)
    current_time = int(time.time())
    if current_time - auth_data.auth_date > 86400:
        logger.warning(f"⏰ Истекшее время авторизации для пользователя {auth_data.id}")
        return False
    
    return True

def create_access_token(user_id: int, telegram_id: int) -> str:
    """Создает JWT токен"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "user_id": user_id,
        "telegram_id": telegram_id,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Проверяет JWT токен"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("⏰ Токен истек")
        return None
    except jwt.JWTError as e:
        logger.warning(f"❌ Ошибка JWT: {e}")
        return None

async def get_current_user(authorization: str = Header(None)) -> dict:
    """Зависимость для получения текущего пользователя"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Неверный токен")
    
    return payload

@router.post("/telegram", response_model=AuthToken)
async def telegram_auth(auth_data: TelegramAuthData):
    """
    Авторизация через Telegram
    
    Проверяет подлинность данных от Telegram Login Widget
    и создает JWT токен для дальнейшей работы
    """
    # Проверяем подлинность данных
    if not verify_telegram_auth(auth_data):
        raise HTTPException(status_code=401, detail="Неверные данные авторизации")
    
    # Проверяем, авторизован ли пользователь
    if not BotConfig.is_user_authorized(auth_data.id):
        logger.warning(f"❌ Неавторизованная попытка входа: {auth_data.id}")
        raise HTTPException(
            status_code=403, 
            detail="У вас нет доступа. Обратитесь к @kaktotakxm"
        )
    
    # Получаем или создаем пользователя в базе данных
    from main import db_manager
    
    user = await db_manager.get_user_by_telegram_id(auth_data.id)
    
    if not user:
        # Создаем нового пользователя
        user_id = await db_manager.create_user(
            telegram_id=auth_data.id,
            username=auth_data.username,
            first_name=auth_data.first_name,
            last_name=auth_data.last_name,
            language_code='en'
        )
        user = await db_manager.get_user_by_telegram_id(auth_data.id)
        logger.info(f"✅ Создан новый пользователь: {auth_data.id}")
    else:
        # Обновляем активность
        await db_manager.update_user_activity(auth_data.id)
        logger.info(f"✅ Авторизован существующий пользователь: {auth_data.id}")
    
    # Создаем JWT токен
    access_token = create_access_token(user['id'], auth_data.id)
    
    return AuthToken(
        access_token=access_token,
        user=User(**user)
    )

@router.get("/verify")
async def verify_auth(current_user: dict = Depends(get_current_user)):
    """Проверяет валидность токена"""
    return {
        "valid": True,
        "user_id": current_user['user_id'],
        "telegram_id": current_user['telegram_id']
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Выход из системы (клиент должен удалить токен)"""
    logger.info(f"🚪 Пользователь {current_user['telegram_id']} вышел")
    return {"success": True, "message": "Успешный выход"}

