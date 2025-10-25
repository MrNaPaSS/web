from sqlalchemy import Column, String, Integer, Boolean, JSON, DateTime, ForeignKey, BIGINT, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telegram_id = Column(BIGINT, unique=True, nullable=False, index=True)
    username = Column(String(255))
    first_name = Column(String(255))
    last_name = Column(String(255))
    language_code = Column(String(10), default='en')
    role = Column(String(20), default='user')  # 'user' или 'admin'
    is_premium = Column(Boolean, default=False)
    subscription_version = Column(Integer, default=1, index=True)  # Версия подписок для оптимизации
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)

class SubscriptionModel(Base):
    __tablename__ = "subscription_models"
    
    id = Column(String(50), primary_key=True)  # 'logistic-spy', 'shadow-stack', etc.
    name = Column(String(100), nullable=False)
    description = Column(Text)
    accuracy_range = Column(String(50))  # '60-65%', '70-75%', etc.
    is_free = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BIGINT, ForeignKey('users.telegram_id'), nullable=False, index=True)
    model_id = Column(String(50), ForeignKey('subscription_models.id'), nullable=False)
    granted_by = Column(BIGINT, nullable=True)  # ID админа, выдавшего подписку
    created_at = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)  # NULL = пожизненно
    is_active = Column(Boolean, default=True, index=True)

class SubscriptionHistory(Base):
    __tablename__ = "subscription_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BIGINT, nullable=False, index=True)
    admin_id = Column(BIGINT, nullable=False)
    old_subscriptions = Column(JSON)
    new_subscriptions = Column(JSON, nullable=False)
    reason = Column(String(500))
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class SubscriptionTemplate(Base):
    __tablename__ = "subscription_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(String(500))
    subscriptions = Column(JSON, nullable=False)
    is_premium = Column(Boolean, default=False)
    color_scheme = Column(String(50))
    icon = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)





