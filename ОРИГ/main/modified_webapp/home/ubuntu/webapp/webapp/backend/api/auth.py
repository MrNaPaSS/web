
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Authentication API - Simplified for direct access
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import jwt
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# JWT настройки
SECRET_KEY = "your-secret-key-change-in-production"  # ВАЖНО: изменить в продакшене
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 дней

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

# Новая функция для создания токена без проверки Telegram
@router.post("/create_token")
async def create_token_manual(user_id: int, telegram_id: int):
    """
    Создает JWT токен для пользователя напрямую.
    Предназначено для использования, когда авторизация уже подтверждена вне веб-приложения.
    """
    access_token = create_access_token(user_id, telegram_id)
    return {"access_token": access_token, "token_type": "bearer"}

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

