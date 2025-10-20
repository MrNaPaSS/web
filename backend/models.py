from sqlalchemy import Column, String, Integer, Boolean, JSON, DateTime, ForeignKey, BIGINT
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
    is_admin = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    subscriptions = Column(JSON, default=['logistic-spy'])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)

class SubscriptionHistory(Base):
    __tablename__ = "subscription_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    admin_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
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





