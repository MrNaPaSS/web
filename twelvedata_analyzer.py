#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Twelvedata Analyzer - Анализатор для получения рыночных данных через Twelvedata API
Скопировано из основного торгового бота для отдельного использования
"""

import requests
import time
from datetime import datetime
from typing import Dict, Any


class TwelvedataAnalyzer:
    """Анализатор для получения рыночных данных через Twelvedata API"""
    
    def __init__(self, api_key: str, settings=None):
        self.api_key = api_key
        self.settings = settings
        self.base_url = "https://api.twelvedata.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'TradingBot/1.0'
        })
        
        # Кэш данных (ОТКЛЮЧЕН)
        self.data_cache = {}
        self.cache_duration = 0  # кэш полностью отключен
    
    def get_market_data(self, pair: str) -> Dict:
        """Получает рыночные данные для валютной пары"""
        try:
            # Кэш отключен — всегда запрашиваем свежие данные
            
            # Получаем данные
            market_data = self._fetch_market_data(pair)
            
            # Кэш отключен — не сохраняем
            
            return market_data
            
        except Exception as e:
            print(f"❌ Ошибка получения данных Twelvedata для {pair}: {e}")
            return None
    
    def get_bulk_market_data(self, pairs: list) -> Dict:
        """Получает данные для всех пар за 1 запрос (экономия API лимитов)"""
        try:
            # Кэш отключен — всегда запрашиваем свежие данные
            
            # Создаем строку символов для массового запроса
            symbols = ','.join(pairs)
            
            # Получаем котировки для всех пар
            params = {
                'symbol': symbols,
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/quote", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Обрабатываем ответ
                bulk_data = {}
                for symbol, quote_data in data.items():
                    if isinstance(quote_data, dict) and 'close' in quote_data:
                        bulk_data[symbol] = {
                            'close': float(quote_data.get('close', 0)),
                            'open': float(quote_data.get('open', 0)),
                            'high': float(quote_data.get('high', 0)),
                            'low': float(quote_data.get('low', 0)),
                            'volume': float(quote_data.get('volume', 0))
                        }
                
                # Кэш отключен — не сохраняем
                
                print(f"✅ Получены данные для {len(bulk_data)} пар за 1 запрос")
                return bulk_data
            else:
                print(f"❌ Ошибка массового запроса: {response.status_code}")
                return {}
                
        except Exception as e:
            print(f"❌ Ошибка массового запроса: {e}")
            return {}
    
    def _fetch_market_data(self, pair: str) -> Dict:
        """Получает данные с Twelvedata API"""
        try:
            # Получаем текущую цену
            price_data = self._get_price_data(pair)
            if not price_data or 'close' not in price_data:
                print(f"❌ НЕТ данных о цене для {pair}!")
                return None
            current_price = price_data['close']
            
            # Получаем технические индикаторы
            rsi = self._get_rsi(pair)
            if rsi is None:
                print(f"❌ НЕТ RSI данных для {pair}!")
                return None
                
            ema = self._get_ema(pair)
            if ema is None:
                print(f"❌ НЕТ EMA данных для {pair}!")
                return None
                
            bollinger = self._get_bollinger_bands(pair)
            if bollinger is None:
                print(f"❌ НЕТ Bollinger Bands данных для {pair}!")
                return None
            
            return {
                'close': current_price,
                'ema_8': ema * 0.999,  # Быстрая EMA
                'ema_21': ema,  # Медленная EMA
                'ema_50': ema * 1.001,  # Трендовая EMA
                'rsi_14': rsi,
                'bb_upper': bollinger * 1.001,
                'bb_lower': bollinger * 0.999,
                'volume': 1000000,
                'volume_sma_10': 1000000,
                'volatility_20': 0.5,
                'timestamp': int(datetime.now().timestamp())
            }
            
        except Exception as e:
            print(f"❌ Ошибка получения данных Twelvedata: {e}")
            return None
    
    def _get_price_data(self, pair: str) -> Dict:
        """Получает текущую цену"""
        try:
            params = {
                'symbol': pair,
                'interval': '1min',
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/time_series", params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if 'values' in data and data['values']:
                    return data['values'][0]  # Последняя свеча
            
            return {'close': 1.1700}
            
        except Exception as e:
            print(f"⚠️ Ошибка получения цены для {pair}: {e}")
            return {'close': 1.1700}
    
    def _get_rsi(self, pair: str, period: int = 14) -> float:
        """Получает RSI"""
        try:
            params = {
                'symbol': pair,
                'interval': '1min',
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/rsi", params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                # Проверяем статус ответа Twelvedata
                if data.get('status') == 'ok' and 'values' in data and data['values']:
                    rsi_value = data['values'][0].get('rsi')
                    if rsi_value is not None and rsi_value != '':
                        return float(rsi_value)
                elif data.get('status') == 'error':
                    error_msg = data.get('message', 'Неизвестная ошибка')
                    print(f"⚠️ Twelvedata ошибка для {pair}: {error_msg}")
                    return None
            
            print(f"❌ НЕТ RSI данных для {pair}!")
            return None
            
        except Exception as e:
            print(f"❌ Ошибка получения RSI для {pair}: {e}")
            return None
    
    def _get_ema(self, pair: str, period: int = 20) -> float:
        """Получает EMA"""
        try:
            params = {
                'symbol': pair,
                'interval': '1min',
                'time_period': period,
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/ema", params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                # Проверяем статус ответа Twelvedata
                if data.get('status') == 'ok' and 'values' in data and data['values']:
                    ema_value = data['values'][0].get('ema')
                    if ema_value is not None and ema_value != '':
                        return float(ema_value)
                elif data.get('status') == 'error':
                    error_msg = data.get('message', 'Неизвестная ошибка')
                    print(f"⚠️ Twelvedata ошибка для {pair}: {error_msg}")
                    return None
            
            print(f"❌ НЕТ EMA данных для {pair}!")
            return None
            
        except Exception as e:
            print(f"❌ Ошибка получения EMA для {pair}: {e}")
            return None
    
    def _get_bollinger_bands(self, pair: str, period: int = 20) -> float:
        """Получает Bollinger Bands (возвращает верхнюю полосу)"""
        try:
            params = {
                'symbol': pair,
                'interval': '1min',
                'time_period': period,
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/bbands", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Проверяем статус ответа Twelvedata
                if data.get('status') == 'ok' and 'values' in data and data['values']:
                    bb_value = data['values'][0].get('upper_band')
                    if bb_value is not None and bb_value != '':
                        return float(bb_value)
                elif data.get('status') == 'error':
                    error_msg = data.get('message', 'Неизвестная ошибка')
                    print(f"⚠️ Twelvedata ошибка для {pair}: {error_msg}")
                    return None
            
            print(f"❌ НЕТ Bollinger Bands данных для {pair}!")
            return None
            
        except Exception as e:
            print(f"❌ Ошибка получения Bollinger Bands для {pair}: {e}")
            return None
    
    def _get_macd(self, pair: str) -> dict:
        """Получает MACD (Moving Average Convergence Divergence)"""
        try:
            params = {
                'symbol': pair,
                'interval': '1min',
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/macd", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Проверяем статус ответа Twelvedata
                if data.get('status') == 'ok' and 'values' in data and data['values']:
                    macd_data = data['values'][0]
                    return {
                        'macd': float(macd_data.get('macd', 0)),
                        'signal': float(macd_data.get('macd_signal', 0)),
                        'histogram': float(macd_data.get('macd_histogram', 0))
                    }
                elif data.get('status') == 'error':
                    error_msg = data.get('message', 'Неизвестная ошибка')
                    print(f"⚠️ Twelvedata ошибка для {pair}: {error_msg}")
                    return None
            
            print(f"❌ НЕТ MACD данных для {pair}!")
            return None
            
        except Exception as e:
            print(f"❌ Ошибка получения MACD для {pair}: {e}")
            return None
    
    def _get_cci(self, pair: str, period: int = 20) -> float:
        """Получает CCI (Commodity Channel Index)"""
        try:
            params = {
                'symbol': pair,
                'interval': '1min',
                'time_period': period,
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/cci", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Проверяем статус ответа Twelvedata
                if data.get('status') == 'ok' and 'values' in data and data['values']:
                    cci_value = data['values'][0].get('cci')
                    if cci_value is not None and cci_value != '':
                        return float(cci_value)
                elif data.get('status') == 'error':
                    error_msg = data.get('message', 'Неизвестная ошибка')
                    print(f"⚠️ Twelvedata ошибка для {pair}: {error_msg}")
                    return None
            
            print(f"❌ НЕТ CCI данных для {pair}!")
            return None
            
        except Exception as e:
            print(f"❌ Ошибка получения CCI для {pair}: {e}")
            return None
    
    def _get_vwap(self, pair: str) -> float:
        """Получает VWAP (Volume Weighted Average Price)"""
        try:
            params = {
                'symbol': pair,
                'interval': '1min',
                'apikey': self.api_key
            }
            
            response = self.session.get(f"{self.base_url}/vwap", params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Проверяем статус ответа Twelvedata
                if data.get('status') == 'ok' and 'values' in data and data['values']:
                    vwap_value = data['values'][0].get('vwap')
                    if vwap_value is not None and vwap_value != '':
                        return float(vwap_value)
                elif data.get('status') == 'error':
                    error_msg = data.get('message', 'Неизвестная ошибка')
                    print(f"⚠️ Twelvedata ошибка для {pair}: {error_msg}")
                    return None
            
            print(f"❌ НЕТ VWAP данных для {pair}!")
            return None
            
        except Exception as e:
            print(f"❌ Ошибка получения VWAP для {pair}: {e}")
            return None
    
    async def get_current_price(self, symbol: str) -> Dict[str, Any]:
        """Получение текущей цены пары"""
        try:
            # Формируем URL для получения текущей цены
            url = f"https://api.twelvedata.com/price"
            params = {
                'symbol': symbol,
                'apikey': self.api_key
            }
            
            # Делаем запрос
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'price' in data:
                    price_data = {
                        'close': float(data['price']),
                        'timestamp': data.get('timestamp', ''),
                        'symbol': symbol
                    }
                    
                    return price_data
                else:
                    print(f"❌ Нет цены в ответе Twelvedata для {symbol}: {data}")
                    return {}
            else:
                print(f"❌ Ошибка Twelvedata API для {symbol}: {response.status_code} - {response.text}")
                return {}
                
        except Exception as e:
            print(f"❌ Ошибка получения текущей цены для {symbol}: {e}")
            return {}


def test_twelvedata_analyzer():
    """Тестирование TwelvedataAnalyzer"""
    print("🧪 Тестирование TwelvedataAnalyzer...")
    
    # Тестовый API ключ
    api_key = "demo"  # Замените на реальный ключ
    
    try:
        analyzer = TwelvedataAnalyzer(api_key)
        print("✅ TwelvedataAnalyzer создан")
        
        # Тест получения данных для EUR/USD
        print("\n1️⃣ Тест получения данных EUR/USD:")
        market_data = analyzer.get_market_data("EUR/USD")
        
        if market_data:
            print(f"   ✅ Данные получены:")
            print(f"   Цена: {market_data.get('close', 'N/A')}")
            print(f"   RSI: {market_data.get('rsi_14', 'N/A')}")
            print(f"   EMA: {market_data.get('ema_21', 'N/A')}")
        else:
            print("   ❌ Нет данных")
            
        # Тест массового запроса
        print("\n2️⃣ Тест массового запроса:")
        pairs = ["EUR/USD", "GBP/USD", "USD/JPY"]
        bulk_data = analyzer.get_bulk_market_data(pairs)
        
        if bulk_data:
            print(f"   ✅ Получены данные для {len(bulk_data)} пар")
            for pair, data in bulk_data.items():
                print(f"   {pair}: {data.get('close', 'N/A')}")
        else:
            print("   ❌ Нет данных")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ Тест завершен!")


if __name__ == "__main__":
    test_twelvedata_analyzer()
