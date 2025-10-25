import json
import os
from datetime import datetime

class AuditLogger:
    def __init__(self, log_file='admin_audit.json'):
        self.log_file = log_file
    
    def log_action(self, admin_id, action, target_user_id, details, ip_address):
        """Логирование действия администратора"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'admin_id': str(admin_id),
            'action': action,
            'target_user_id': str(target_user_id),
            'details': details,
            'ip_address': ip_address
        }
        
        # Загружаем существующий лог
        if os.path.exists(self.log_file):
            with open(self.log_file, 'r') as f:
                logs = json.load(f)
        else:
            logs = []
        
        logs.append(log_entry)
        
        # Храним последние 10000 записей
        if len(logs) > 10000:
            logs = logs[-10000:]
        
        with open(self.log_file, 'w') as f:
            json.dump(logs, f, indent=2)
    
    def log_subscription_change(self, user_id, admin_id, old_subs, new_subs, ip_address):
        """Логирование изменения подписки"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'admin_id': str(admin_id),
            'action': 'subscription_change',
            'target_user_id': str(user_id),
            'details': {
                'old_subscriptions': old_subs,
                'new_subscriptions': new_subs
            },
            'ip_address': ip_address
        }
        
        # Загружаем существующий лог
        if os.path.exists(self.log_file):
            with open(self.log_file, 'r') as f:
                logs = json.load(f)
        else:
            logs = []
        
        logs.append(log_entry)
        
        # Храним последние 10000 записей
        if len(logs) > 10000:
            logs = logs[-10000:]
        
        with open(self.log_file, 'w') as f:
            json.dump(logs, f, indent=2)
    
    def get_logs(self, admin_id=None, limit=100):
        """Получение логов"""
        if not os.path.exists(self.log_file):
            return []
        
        with open(self.log_file, 'r') as f:
            logs = json.load(f)
        
        if admin_id:
            logs = [log for log in logs if log['admin_id'] == str(admin_id)]
        
        return logs[-limit:]

audit_logger = AuditLogger()