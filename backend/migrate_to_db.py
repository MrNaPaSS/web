import json
import os
from database import engine, SessionLocal
from models import Base, User
from sqlalchemy.orm import Session

def migrate_from_json():
    """Миграция данных из JSON в PostgreSQL"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Загрузка данных из JSON
        bot_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
        
        with open(os.path.join(bot_dir, 'authorized_users.json'), 'r') as f:
            authorized_users = json.load(f)
        
        with open(os.path.join(bot_dir, 'user_subscriptions.json'), 'r') as f:
            user_subscriptions = json.load(f)
        
        # Миграция пользователей
        for telegram_id, user_data in authorized_users.items():
            subscriptions = user_subscriptions.get(telegram_id, ['logistic-spy'])
            
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
        
        db.commit()
        print(f"✅ Migrated {len(authorized_users)} users successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    migrate_from_json()


