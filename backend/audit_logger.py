import logging
import json
from datetime import datetime
import os

class AuditLogger:
    def __init__(self):
        self.logger = logging.getLogger('audit')
        
        # Создаем директорию для логов если её нет
        log_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        # Настраиваем файловый обработчик
        handler = logging.FileHandler(os.path.join(log_dir, 'audit.log'))
        handler.setFormatter(logging.Formatter('%(message)s'))
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        
        # Также добавляем обработчик в консоль для отладки
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
        self.logger.addHandler(console_handler)
    
    def log_subscription_change(self, user_id, admin_id, old_subs, new_subs, ip_address=None):
        """Логирование изменения подписки"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event': 'subscription_updated',
            'user_id': str(user_id),
            'admin_id': str(admin_id),
            'old_subscriptions': old_subs,
            'new_subscriptions': new_subs,
            'ip_address': ip_address
        }
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))
    
    def log_bulk_operation(self, admin_id, user_ids, subscriptions, ip_address=None):
        """Логирование массовой операции"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event': 'bulk_subscription_update',
            'admin_id': str(admin_id),
            'user_ids': [str(uid) for uid in user_ids],
            'subscriptions': subscriptions,
            'total_users': len(user_ids),
            'ip_address': ip_address
        }
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))
    
    def log_admin_access(self, admin_id, action, ip_address=None):
        """Логирование доступа администратора"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event': 'admin_access',
            'admin_id': str(admin_id),
            'action': action,
            'ip_address': ip_address
        }
        self.logger.info(json.dumps(log_entry, ensure_ascii=False))

# Создаем глобальный экземпляр логгера
audit_logger = AuditLogger()





