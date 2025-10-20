#!/usr/bin/env python3
"""
Скрипт для миграции данных из JSON файлов в PostgreSQL
Используйте этот скрипт для переноса существующих данных
"""

import json
import os
import sys
from pathlib import Path

# Добавляем путь к модулям
sys.path.append(os.path.dirname(__file__))

def migrate_json_to_postgres():
    """Миграция данных из JSON в PostgreSQL"""
    print("🔄 Начинаем миграцию данных...")
    
    try:
        # Импортируем модули базы данных
        from database import engine, SessionLocal
        from models import Base, User
        from seed_templates import seed_default_templates
        
        # Создаем таблицы
        print("📋 Создаем таблицы в базе данных...")
        Base.metadata.create_all(bind=engine)
        
        # Подключаемся к базе данных
        db = SessionLocal()
        
        try:
            # Загружаем данные из JSON файлов
            bot_dir = Path(__file__).parent.parent.parent.parent
            
            authorized_users_file = bot_dir / 'authorized_users.json'
            subscriptions_file = bot_dir / 'user_subscriptions.json'
            
            if not authorized_users_file.exists():
                print("⚠️ Файл authorized_users.json не найден")
                return False
                
            with open(authorized_users_file, 'r', encoding='utf-8') as f:
                authorized_users = json.load(f)
            
            user_subscriptions = {}
            if subscriptions_file.exists():
                with open(subscriptions_file, 'r', encoding='utf-8') as f:
                    user_subscriptions = json.load(f)
            
            print(f"📊 Найдено {len(authorized_users)} пользователей для миграции")
            
            # Мигрируем пользователей
            migrated_count = 0
            for telegram_id, user_data in authorized_users.items():
                try:
                    subscriptions = user_subscriptions.get(telegram_id, ['logistic-spy'])
                    
                    # Проверяем, не существует ли уже пользователь
                    existing_user = db.query(User).filter(User.telegram_id == int(telegram_id)).first()
                    if existing_user:
                        print(f"⏭️ Пользователь {telegram_id} уже существует, пропускаем")
                        continue
                    
                    user = User(
                        telegram_id=int(telegram_id),
                        username=user_data.get('username'),
                        first_name=user_data.get('first_name'),
                        last_name=user_data.get('last_name'),
                        language_code=user_data.get('language_code', 'en'),
                        is_admin=user_data.get('is_admin', False),
                        is_premium=user_data.get('is_premium', False),
                        subscriptions=subscriptions
                    )
                    db.add(user)
                    migrated_count += 1
                    
                except Exception as e:
                    print(f"❌ Ошибка миграции пользователя {telegram_id}: {e}")
                    continue
            
            # Сохраняем изменения
            db.commit()
            print(f"✅ Успешно мигрировано {migrated_count} пользователей")
            
            # Создаем шаблоны подписок
            print("🎨 Создаем шаблоны подписок...")
            seed_default_templates()
            
            print("🎉 Миграция завершена успешно!")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка во время миграции: {e}")
            db.rollback()
            return False
            
        finally:
            db.close()
            
    except ImportError as e:
        print(f"❌ Ошибка импорта модулей: {e}")
        print("💡 Убедитесь, что установлены все зависимости: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("ENTERPRISE SUBSCRIPTION SYSTEM - MIGRATION")
    print("=" * 50)
    
    success = migrate_json_to_postgres()
    
    if success:
        print("\n✅ Миграция завершена успешно!")
        print("🚀 Теперь можно запустить систему: python signal_api.py")
    else:
        print("\n❌ Миграция завершилась с ошибками")
        print("🔧 Проверьте логи выше и исправьте проблемы")
        sys.exit(1)





