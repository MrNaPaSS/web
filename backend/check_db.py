#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт проверки состояния базы данных
"""
import sys
import os
from sqlalchemy import text
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv('config.env')

from database import engine, SessionLocal
from models import User, SubscriptionModel, UserSubscription, SubscriptionHistory

def check_database():
    """Проверка состояния базы данных"""
    try:
        print("🔍 Проверка подключения к PostgreSQL...")
        
        # Проверка подключения
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ PostgreSQL подключение успешно")
        
        # Проверка таблиц
        db = SessionLocal()
        
        try:
            user_count = db.query(User).count()
            model_count = db.query(SubscriptionModel).count()
            sub_count = db.query(UserSubscription).count()
            history_count = db.query(SubscriptionHistory).count()
            
            print(f"✅ Пользователей: {user_count}")
            print(f"✅ ML моделей: {model_count}")
            print(f"✅ Активных подписок: {sub_count}")
            print(f"✅ Записей истории: {history_count}")
            
            # Проверяем админа
            admin = db.query(User).filter(User.telegram_id == 511442168).first()
            if admin:
                print(f"✅ Админ найден: {admin.first_name} (role: {admin.role})")
                
                # Проверяем подписки админа
                admin_subs = db.query(UserSubscription).filter(
                    UserSubscription.user_id == 511442168,
                    UserSubscription.is_active == True
                ).all()
                print(f"✅ Подписок у админа: {len(admin_subs)}")
            else:
                print("❌ Админ не найден")
                return False
            
            # Проверяем ML модели
            models = db.query(SubscriptionModel).all()
            print(f"✅ ML модели:")
            for model in models:
                print(f"   - {model.id}: {model.name} ({'бесплатная' if model.is_free else 'премиум'})")
            
            db.close()
            return True
            
        except Exception as e:
            print(f"❌ Ошибка проверки таблиц: {e}")
            db.close()
            return False
            
    except Exception as e:
        print(f"❌ Ошибка подключения к БД: {e}")
        print("💡 Убедитесь, что PostgreSQL запущен и настроен правильно")
        return False

def check_environment():
    """Проверка переменных окружения"""
    print("🔍 Проверка переменных окружения...")
    
    required_vars = [
        'DATABASE_URL',
        'JWT_SECRET_KEY',
        'BOT_TOKEN',
        'ADMIN_TELEGRAM_ID'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Отсутствуют переменные окружения: {', '.join(missing_vars)}")
        print("💡 Убедитесь, что файл config.env существует и содержит все необходимые переменные")
        return False
    else:
        print("✅ Все переменные окружения настроены")
        return True

def main():
    """Основная функция проверки"""
    print("=" * 60)
    print("🔍 ПРОВЕРКА СОСТОЯНИЯ БАЗЫ ДАННЫХ")
    print("=" * 60)
    
    # Проверка переменных окружения
    if not check_environment():
        return False
    
    # Проверка базы данных
    if not check_database():
        return False
    
    print("=" * 60)
    print("🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!")
    print("=" * 60)
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
