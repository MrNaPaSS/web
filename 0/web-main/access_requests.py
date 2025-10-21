#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль управления запросами на доступ к боту
"""

import json
import time
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

@dataclass
class AccessRequest:
    """Запрос на доступ"""
    user_id: int
    username: str
    first_name: str
    last_name: str
    request_time: float
    status: str = "pending"  # pending, approved, rejected
    admin_response_time: Optional[float] = None
    
    def to_dict(self) -> Dict:
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict):
        return cls(**data)
    
    def get_user_display_name(self) -> str:
        """Возвращает отображаемое имя пользователя"""
        parts = []
        if self.first_name:
            parts.append(self.first_name)
        if self.last_name:
            parts.append(self.last_name)
        
        name = " ".join(parts) if parts else "Без имени"
        
        if self.username:
            return f"{name} (@{self.username})"
        else:
            return name
    
    def get_request_time_str(self) -> str:
        """Возвращает время запроса в читаемом формате"""
        dt = datetime.fromtimestamp(self.request_time)
        return dt.strftime('%Y-%m-%d %H:%M:%S')

class AccessRequestManager:
    """Менеджер запросов на доступ"""
    
    def __init__(self, storage_file: str = "access_requests.json"):
        self.storage_file = storage_file
        self.requests = {}  # {user_id: AccessRequest}
        self.load_requests()
    
    def load_requests(self):
        """Загружает запросы из файла"""
        try:
            with open(self.storage_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.requests = {
                    int(user_id): AccessRequest.from_dict(req_data)
                    for user_id, req_data in data.items()
                }
        except FileNotFoundError:
            self.requests = {}
        except Exception as e:
            print(f"❌ Ошибка загрузки запросов: {e}")
            self.requests = {}
    
    def save_requests(self):
        """Сохраняет запросы в файл"""
        try:
            data = {
                str(user_id): request.to_dict()
                for user_id, request in self.requests.items()
            }
            with open(self.storage_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"❌ Ошибка сохранения запросов: {e}")
    
    def add_request(self, user_id: int, username: str, first_name: str, last_name: str) -> bool:
        """Добавляет новый запрос на доступ"""
        # Проверяем, нет ли уже запроса от этого пользователя
        if user_id in self.requests:
            existing_request = self.requests[user_id]
            if existing_request.status == "pending":
                return False  # Запрос уже существует
        
        # Создаем новый запрос
        request = AccessRequest(
            user_id=user_id,
            username=username or "",
            first_name=first_name or "",
            last_name=last_name or "",
            request_time=time.time()
        )
        
        self.requests[user_id] = request
        self.save_requests()
        return True
    
    def get_pending_requests(self) -> List[AccessRequest]:
        """Возвращает список ожидающих запросов"""
        return [
            request for request in self.requests.values()
            if request.status == "pending"
        ]
    
    def approve_request(self, user_id: int) -> bool:
        """Одобряет запрос"""
        if user_id in self.requests:
            self.requests[user_id].status = "approved"
            self.requests[user_id].admin_response_time = time.time()
            self.save_requests()
            return True
        return False
    
    def reject_request(self, user_id: int) -> bool:
        """Отклоняет запрос"""
        if user_id in self.requests:
            self.requests[user_id].status = "rejected"
            self.requests[user_id].admin_response_time = time.time()
            self.save_requests()
            return True
        return False
    
    def get_request(self, user_id: int) -> Optional[AccessRequest]:
        """Возвращает запрос пользователя"""
        return self.requests.get(user_id)
    
    def get_statistics(self) -> Dict:
        """Возвращает статистику запросов"""
        total = len(self.requests)
        pending = len([r for r in self.requests.values() if r.status == "pending"])
        approved = len([r for r in self.requests.values() if r.status == "approved"])
        rejected = len([r for r in self.requests.values() if r.status == "rejected"])
        
        return {
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected
        }

# Глобальный экземпляр менеджера
access_manager = AccessRequestManager()
