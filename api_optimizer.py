#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API Optimizer - Оптимизация запросов к API
- Управление лимитами всех API
- Кэширование и ротация запросов
- Максимальная эффективность без превышения лимитов

Скопировано из основного торгового бота для отдельного использования
"""

import time
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class APILimit:
    """Лимиты API"""
    requests_per_minute: int
    requests_per_day: int
    current_minute_requests: int = 0
    current_day_requests: int = 0
    last_minute_reset: float = 0
    last_day_reset: float = 0

class APIOptimizer:
    """Оптимизатор API запросов с ротацией ключей"""
    
    def __init__(self, api_keys: List[str] = None):
        # Ключи для ротации
        self.api_keys = api_keys or []
        self.current_key_index = 0
        # Лимиты API (обновленные приоритеты)
        self.limits = {
            'finnhub': APILimit(
                requests_per_minute=60,  # ОСНОВНОЙ источник данных
                requests_per_day=10000
            ),
            'twelvedata': APILimit(
                requests_per_minute=8,   # Только для специальных данных
                requests_per_day=1000
            ),
            'taapi': APILimit(
                requests_per_minute=10,
                requests_per_day=100
            ),
            'newsapi': APILimit(
                requests_per_minute=100,
                requests_per_day=1000
            ),
            'myfxbook': APILimit(
                requests_per_minute=1000,  # Без лимитов
                requests_per_day=10000
            )
        }
        
        # Кэш данных (обновленные приоритеты)
        self.cache = {}
        self.cache_duration = {
            'finnhub': 300,     # 5 минут - ОСНОВНОЙ источник
            'twelvedata': 600,  # 10 минут - реже используем
            'taapi': 900,       # 15 минут (ротация каждые 3 цикла)
            'newsapi': 300,     # 5 минут
            'myfxbook': 300     # 5 минут
        }
        
        # Ротация для TAAPI.IO
        self.taapi_rotation = {
            'cycle': 0,
            'indicators': ['rsi', 'macd', 'bollinger', 'cci', 'adx'],
            'current_indicator': 0
        }
        
        # API ключи (замените на реальные)
        self.api_keys = {
            'twelvedata': 'demo',
            'taapi': 'your_taapi_key',
            'newsapi': 'your_newsapi_key',
            'myfxbook': {
                'email': 'your_email',
                'password': 'your_password'
            },
            'finnhub': 'your_finnhub_key'
        }
    
    def can_make_request(self, api_name: str) -> bool:
        """Проверяет, можно ли сделать запрос к API"""
        if api_name not in self.limits:
            return True
            
        limit = self.limits[api_name]
        current_time = time.time()
        
        # Сброс счетчиков
        if current_time - limit.last_minute_reset >= 60:
            limit.current_minute_requests = 0
            limit.last_minute_reset = current_time
            
        if current_time - limit.last_day_reset >= 86400:  # 24 часа
            limit.current_day_requests = 0
            limit.last_day_reset = current_time
        
        # Проверяем лимиты
        if limit.current_minute_requests >= limit.requests_per_minute:
            return False
        if limit.current_day_requests >= limit.requests_per_day:
            return False
            
        return True
    
    def record_request(self, api_name: str):
        """Записывает сделанный запрос"""
        if api_name in self.limits:
            self.limits[api_name].current_minute_requests += 1
            self.limits[api_name].current_day_requests += 1
    
    def get_cached_data(self, api_name: str, key: str) -> Optional[Any]:
        """Получает данные из кэша"""
        cache_key = f"{api_name}_{key}"
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_duration.get(api_name, 300):
                return data
            else:
                del self.cache[cache_key]
        return None
    
    def set_cached_data(self, api_name: str, key: str, data: Any):
        """Сохраняет данные в кэш"""
        cache_key = f"{api_name}_{key}"
        self.cache[cache_key] = (data, time.time())
    
    async def get_finnhub_bulk(self, pairs: List[str]) -> Dict:
        """Получает данные Finnhub для всех пар за 1 запрос (ОСНОВНОЙ источник)"""
        try:
            # Проверяем кэш
            cache_key = f"bulk_{','.join(pairs)}"
            cached_data = self.get_cached_data('finnhub', cache_key)
            if cached_data:
                logger.info("📦 Используем кэшированные данные Finnhub")
                return cached_data
            
            # Проверяем лимиты
            if not self.can_make_request('finnhub'):
                logger.warning("⚠️ Лимит Finnhub исчерпан, используем кэш")
                return {}
            
            # Делаем запросы к Finnhub для каждой пары
            bulk_data = {}
            async with aiohttp.ClientSession() as session:
                for pair in pairs:
                    # Конвертируем пару для Finnhub (EUR/USD -> OANDA:EUR_USD)
                    finnhub_symbol = f"OANDA:{pair.replace('/', '_')}"
                    
                    params = {
                        'symbol': finnhub_symbol,
                        'token': self.api_keys['finnhub']
                    }
                    
                    async with session.get('https://finnhub.io/api/v1/quote', params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            if 'c' in data:  # 'c' = current price
                                bulk_data[pair] = {
                                    'close': data['c'],
                                    'high': data.get('h', data['c']),
                                    'low': data.get('l', data['c']),
                                    'open': data.get('o', data['c']),
                                    'volume': data.get('v', 1000000)
                                }
            
            if bulk_data:
                self.record_request('finnhub')
                self.set_cached_data('finnhub', cache_key, bulk_data)
                logger.info(f"✅ Получены данные Finnhub для {len(bulk_data)} пар")
                return bulk_data
            else:
                logger.warning("⚠️ Не удалось получить данные Finnhub")
                return {}
            
        except Exception as e:
            logger.warning(f"⚠️ Не удалось получить данные Finnhub: {e}")
            return {}
    
    async def get_twelvedata_special(self, symbol: str, data_type: str = "economic") -> Dict:
        """Получает специальные данные Twelvedata (только то, чего нет в Finnhub)"""
        try:
            # Проверяем кэш
            cache_key = f"special_{symbol}_{data_type}"
            cached_data = self.get_cached_data('twelvedata', cache_key)
            if cached_data:
                logger.info(f"📦 Используем кэшированные специальные данные Twelvedata для {symbol}")
                return cached_data
            
            # Проверяем лимиты
            if not self.can_make_request('twelvedata'):
                logger.warning("⚠️ Лимит Twelvedata исчерпан")
                return {}
            
            # Делаем запрос только для специальных данных
            params = {
                'symbol': symbol,
                'apikey': self.api_keys['twelvedata']
            }
            
            # Выбираем endpoint в зависимости от типа данных
            if data_type == "economic":
                url = 'https://api.twelvedata.com/economic_indicators'
            else:
                url = 'https://api.twelvedata.com/quote'
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.record_request('twelvedata')
                        self.set_cached_data('twelvedata', cache_key, data)
                        logger.info(f"✅ Получены специальные данные Twelvedata для {symbol}")
                        return data
                    else:
                        logger.error(f"❌ Ошибка Twelvedata: {response.status}")
                        return {}
            
        except Exception as e:
            logger.error(f"❌ Ошибка получения специальных данных Twelvedata: {e}")
            return {}
    
    def get_next_taapi_indicator(self) -> str:
        """Получает следующий индикатор для ротации TAAPI.IO"""
        indicator = self.taapi_rotation['indicators'][self.taapi_rotation['current_indicator']]
        self.taapi_rotation['current_indicator'] = (self.taapi_rotation['current_indicator'] + 1) % len(self.taapi_rotation['indicators'])
        return indicator
    
    def should_use_taapi(self) -> bool:
        """Определяет, нужно ли использовать TAAPI.IO в этом цикле"""
        self.taapi_rotation['cycle'] += 1
        return self.taapi_rotation['cycle'] % 3 == 0  # Каждый 3-й цикл
    
    def get_api_status(self) -> Dict:
        """Возвращает статус всех API"""
        status = {}
        for api_name, limit in self.limits.items():
            status[api_name] = {
                'minute_requests': f"{limit.current_minute_requests}/{limit.requests_per_minute}",
                'day_requests': f"{limit.current_day_requests}/{limit.requests_per_day}",
                'can_request': self.can_make_request(api_name)
            }
        return status
    
    def get_current_api_key(self) -> str:
        """Получает текущий API ключ для запросов"""
        if not self.api_keys:
            return ""
        return self.api_keys[self.current_key_index]
    
    def rotate_api_key(self) -> str:
        """Переключается на следующий API ключ"""
        if len(self.api_keys) <= 1:
            return self.get_current_api_key()
        
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        new_key = self.get_current_api_key()
        logger.info(f"🔄 Переключились на API ключ #{self.current_key_index + 1}")
        return new_key


def test_api_optimizer():
    """Тестирование APIOptimizer"""
    print("🧪 Тестирование APIOptimizer...")
    
    try:
        optimizer = APIOptimizer()
        print("✅ APIOptimizer создан")
        
        # Тест проверки лимитов
        print("\n1️⃣ Тест проверки лимитов:")
        for api_name in ['twelvedata', 'finnhub']:
            can_request = optimizer.can_make_request(api_name)
            print(f"   {api_name}: можно делать запрос = {can_request}")
        
        # Тест записи запроса
        print("\n2️⃣ Тест записи запроса:")
        optimizer.record_request('twelvedata')
        print("   ✅ Запрос записан")
        
        # Тест кэша
        print("\n3️⃣ Тест кэша:")
        test_data = {'test': 'data'}
        optimizer.set_cached_data('test_api', 'test_key', test_data)
        cached = optimizer.get_cached_data('test_api', 'test_key')
        print(f"   Кэш работает: {cached == test_data}")
        
        # Тест статуса API
        print("\n4️⃣ Тест статуса API:")
        status = optimizer.get_api_status()
        for api_name, api_status in status.items():
            print(f"   {api_name}: {api_status['minute_requests']} запросов в минуту")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ Тест завершен!")


if __name__ == "__main__":
    test_api_optimizer()
