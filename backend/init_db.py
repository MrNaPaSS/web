#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт инициализации базы данных PostgreSQL
Создает таблицы, индексы и seed данные
"""
import os
import sys
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv('config.env')

# Импортируем модели
from models import Base, User, SubscriptionModel, UserSubscription, SubscriptionHistory, SubscriptionTemplate
from database import engine, SessionLocal

def check_database_connection():
    """Проверка подключения к PostgreSQL"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ PostgreSQL подключение успешно")
            return True
    except Exception as e:
        print(f"❌ Ошибка подключения к PostgreSQL: {e}")
        return False

def create_tables():
    """Создание всех таблиц"""
    try:
        print("📋 Создание таблиц...")
        Base.metadata.create_all(bind=engine)
        print("✅ Таблицы созданы успешно")
        return True
    except Exception as e:
        print(f"❌ Ошибка создания таблиц: {e}")
        return False

def execute_migration_sql():
    """Выполнение SQL миграции"""
    try:
        print("📋 Выполнение SQL миграции...")
        
        # Читаем SQL файл
        migration_file = os.path.join(os.path.dirname(__file__), 'migrations', '001_create_tables.sql')
        
        if not os.path.exists(migration_file):
            print(f"❌ Файл миграции не найден: {migration_file}")
            return False
        
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Выполняем SQL
        with engine.connect() as conn:
            # Разбиваем на отдельные команды
            sql_commands = [cmd.strip() for cmd in sql_content.split(';') if cmd.strip()]
            
            for command in sql_commands:
                if command:
                    conn.execute(text(command))
            
            conn.commit()
        
        print("✅ SQL миграция выполнена успешно")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка выполнения миграции: {e}")
        return False

def seed_data():
    """Заполнение базовых данных"""
    try:
        print("🌱 Заполнение seed данных...")
        
        db = SessionLocal()
        
        # Проверяем, есть ли уже данные
        model_count = db.query(SubscriptionModel).count()
        if model_count > 0:
            print("✅ Seed данные уже существуют")
            db.close()
            return True
        
        # Создаем ML модели
        models_data = [
            {
                'id': 'logistic-spy',
                'name': 'Logistic Regression Spy',
                'description': 'Базовая модель логистической регрессии для анализа трендов',
                'accuracy_range': '60-65%',
                'is_free': True
            },
            {
                'id': 'shadow-stack',
                'name': 'Shadow Stack',
                'description': 'Продвинутая модель стекинга с теневой архитектурой',
                'accuracy_range': '70-75%',
                'is_free': False
            },
            {
                'id': 'forest-necromancer',
                'name': 'Forest Necromancer',
                'description': 'Ансамбль случайных лесов с глубоким обучением',
                'accuracy_range': '65-70%',
                'is_free': False
            },
            {
                'id': 'gray-cardinal',
                'name': 'Gray Cardinal',
                'description': 'Скрытая модель с машинным обучением',
                'accuracy_range': '68-72%',
                'is_free': False
            },
            {
                'id': 'sniper-80x',
                'name': 'Sniper 80x',
                'description': 'Премиум модель с высокой точностью',
                'accuracy_range': '75-80%',
                'is_free': False
            }
        ]
        
        for model_data in models_data:
            model = SubscriptionModel(**model_data)
            db.add(model)
        
        # Создаем админа
        admin_user = User(
            telegram_id=511442168,
            first_name='Admin',
            last_name='',
            username='',
            role='admin',
            is_premium=True
        )
        db.add(admin_user)
        
        db.commit()
        
        # Выдаем базовую подписку админу
        admin_subscription = UserSubscription(
            user_id=511442168,
            model_id='logistic-spy',
            granted_by=511442168,
            is_active=True
        )
        db.add(admin_subscription)
        
        db.commit()
        db.close()
        
        print("✅ Seed данные созданы успешно")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка создания seed данных: {e}")
        return False

def verify_database():
    """Проверка состояния базы данных"""
    try:
        print("🔍 Проверка состояния БД...")
        
        db = SessionLocal()
        
        # Подсчет записей
        user_count = db.query(User).count()
        model_count = db.query(SubscriptionModel).count()
        sub_count = db.query(UserSubscription).count()
        
        print(f"✅ Пользователей: {user_count}")
        print(f"✅ ML моделей: {model_count}")
        print(f"✅ Активных подписок: {sub_count}")
        
        # Проверяем админа
        admin = db.query(User).filter(User.telegram_id == 511442168).first()
        if admin:
            print(f"✅ Админ найден: {admin.first_name} (role: {admin.role})")
        else:
            print("❌ Админ не найден")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Ошибка проверки БД: {e}")
        return False

def main():
    """Основная функция инициализации"""
    print("=" * 60)
    print("🚀 ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ")
    print("=" * 60)
    
    # Проверка подключения
    if not check_database_connection():
        print("❌ Не удалось подключиться к PostgreSQL")
        print("💡 Убедитесь, что PostgreSQL запущен и настроен правильно")
        return False
    
    # Создание таблиц
    if not create_tables():
        return False
    
    # Выполнение миграции
    if not execute_migration_sql():
        return False
    
    # Заполнение данных
    if not seed_data():
        return False
    
    # Проверка результата
    if not verify_database():
        return False
    
    print("=" * 60)
    print("🎉 ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
    print("=" * 60)
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
