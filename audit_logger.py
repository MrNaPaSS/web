import json
import os
from datetime import datetime

class AuditLogger:
    def __init__(self, audit_file="admin_audit.json"):
        self.ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__)))
        self.audit_file = os.path.join(self.ROOT_DIR, audit_file)

    def _log(self, entry):
        try:
            entries = []
            if os.path.exists(self.audit_file):
                with open(self.audit_file, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        entries = json.loads(content)
                        if not isinstance(entries, list):
                            entries = []
            
            entries.append(entry)
            
            with open(self.audit_file, "w", encoding="utf-8") as f:
                json.dump(entries, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[AUDIT ERROR] {e}")

    def log_subscription_change(self, user_id, admin_id, old_subs, new_subs, ip_address):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": "subscription_change",
            "user_id": user_id,
            "admin_id": admin_id,
            "old_subscriptions": old_subs,
            "new_subscriptions": new_subs,
            "ip_address": ip_address
        }
        self._log(entry)

    def log_bulk_operation(self, admin_id, user_ids, subscriptions, ip_address):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": "bulk_subscription_update",
            "admin_id": admin_id,
            "user_ids": user_ids,
            "subscriptions": subscriptions,
            "ip_address": ip_address
        }
        self._log(entry)

audit_logger = AuditLogger()
