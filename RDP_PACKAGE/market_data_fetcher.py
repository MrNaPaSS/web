#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Market Data Fetcher - Получение реальных рыночных данных для анализа
Использует различные API для получения OHLC данных

Скопировано из основного торгового бота для отдельного использования
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import json
from typing import Dict, List, Optional
import warnings
warnings.filterwarnings('ignore')

class MarketDataFetcher:
    def __init__(self):
        self.api_keys = {
            'twelvedata': 'demo',  # Замените на реальный ключ
            'finnhub': 'your_finnhub_key',  # Нужно добавить
            'alpha_vantage': 'your_alpha_vantage_key'  # Нужно добавить
        }
        
    def fetch_twelvedata(self, symbol: str, interval: str = '1min', 
                        start_date: str = None, end_date: str = None) -> Optional[pd.DataFrame]:
        """Получает данные от TwelveData API"""
        print(f"📊 Получаем данные {symbol} от TwelveData...")
        
        try:
            url = "https://api.twelvedata.com/time_series"
            params = {
                'symbol': symbol,
                'interval': interval,
                'apikey': self.api_keys['twelvedata'],
                'outputsize': 5000,
                'format': 'JSON'
            }
            
            if start_date:
                params['start_date'] = start_date
            if end_date:
                params['end_date'] = end_date
            
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'values' in data:
                    df = pd.DataFrame(data['values'])
                    df['datetime'] = pd.to_datetime(df['datetime'])
                    df = df.sort_values('datetime')
                    df.set_index('datetime', inplace=True)
                    
                    # Конвертируем в числовые типы
                    for col in ['open', 'high', 'low', 'close', 'volume']:
                        if col in df.columns:
                            df[col] = pd.to_numeric(df[col], errors='coerce')
                    
                    print(f"✅ Получено {len(df)} свечей для {symbol}")
                    return df
                else:
                    print(f"❌ Ошибка API: {data}")
                    return None
            else:
                print(f"❌ HTTP ошибка: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка получения данных: {e}")
            return None
    
    def fetch_finnhub(self, symbol: str, resolution: str = '1', 
                     start_time: int = None, end_time: int = None) -> Optional[pd.DataFrame]:
        """Получает данные от Finnhub API"""
        print(f"📊 Получаем данные {symbol} от Finnhub...")
        
        try:
            url = "https://finnhub.io/api/v1/stock/candle"
            params = {
                'symbol': symbol,
                'resolution': resolution,
                'token': self.api_keys['finnhub']
            }
            
            if start_time:
                params['from'] = start_time
            if end_time:
                params['to'] = end_time
            
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('s') == 'ok':
                    df = pd.DataFrame({
                        'datetime': pd.to_datetime(data['t'], unit='s'),
                        'open': data['o'],
                        'high': data['h'],
                        'low': data['l'],
                        'close': data['c'],
                        'volume': data['v']
                    })
                    df.set_index('datetime', inplace=True)
                    
                    print(f"✅ Получено {len(df)} свечей для {symbol}")
                    return df
                else:
                    print(f"❌ Ошибка API: {data}")
                    return None
            else:
                print(f"❌ HTTP ошибка: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка получения данных: {e}")
            return None
    
    def generate_synthetic_data(self, symbol: str, start_time: datetime, 
                               end_time: datetime, interval_minutes: int = 1) -> pd.DataFrame:
        """Генерирует синтетические рыночные данные"""
        print(f"📊 Генерируем синтетические данные для {symbol}...")
        
        # Создаем временной ряд
        time_range = pd.date_range(start=start_time, end=end_time, freq=f'{interval_minutes}min')
        
        # Базовые параметры в зависимости от символа
        if 'EUR' in symbol:
            base_price = 1.1000
            volatility = 0.0005
        elif 'JPY' in symbol:
            base_price = 110.0
            volatility = 0.5
        elif 'GBP' in symbol:
            base_price = 1.3000
            volatility = 0.0008
        elif 'AUD' in symbol:
            base_price = 0.7500
            volatility = 0.0006
        elif 'CAD' in symbol:
            base_price = 1.3500
            volatility = 0.0004
        elif 'CHF' in symbol:
            base_price = 0.9200
            volatility = 0.0003
        else:
            base_price = 1.0000
            volatility = 0.0005
        
        # Генерируем случайное блуждание
        np.random.seed(hash(symbol) % 2**32)  # Воспроизводимость
        n_points = len(time_range)
        
        # Создаем тренд (небольшой восходящий)
        trend = np.linspace(0, 0.01, n_points)
        
        # Создаем волатильность
        random_walk = np.cumsum(np.random.normal(0, volatility, n_points))
        
        # Генерируем цены
        prices = base_price + trend + random_walk
        
        # Создаем OHLC данные
        ohlc_data = []
        for i, (timestamp, price) in enumerate(zip(time_range, prices)):
            # Генерируем реалистичные OHLC
            price_change = np.random.normal(0, volatility * 0.5)
            open_price = price + price_change
            
            high_low_range = np.random.uniform(0.5, 2.0) * volatility
            high = max(open_price, price) + np.random.uniform(0, high_low_range)
            low = min(open_price, price) - np.random.uniform(0, high_low_range)
            
            close_price = price + np.random.normal(0, volatility * 0.3)
            
            # Объем
            volume = np.random.randint(100, 1000)
            
            ohlc_data.append({
                'datetime': timestamp,
                'open': open_price,
                'high': high,
                'low': low,
                'close': close_price,
                'volume': volume
            })
        
        df = pd.DataFrame(ohlc_data)
        df.set_index('datetime', inplace=True)
        
        print(f"✅ Сгенерировано {len(df)} свечей для {symbol}")
        return df
    
    def add_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Добавляет технические индикаторы"""
        # SMA
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        df['bb_middle'] = df['close'].rolling(window=20).mean()
        bb_std = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        
        # MACD
        exp1 = df['close'].ewm(span=12).mean()
        exp2 = df['close'].ewm(span=26).mean()
        df['macd'] = exp1 - exp2
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        # Stochastic
        low_14 = df['low'].rolling(window=14).min()
        high_14 = df['high'].rolling(window=14).max()
        df['stoch_k'] = 100 * ((df['close'] - low_14) / (high_14 - low_14))
        df['stoch_d'] = df['stoch_k'].rolling(window=3).mean()
        
        return df
    
    def fetch_data_for_pairs(self, pairs: List[str], start_date: str = None, end_date: str = None) -> Dict[str, pd.DataFrame]:
        """Получает рыночные данные для списка пар"""
        print(f"\n📊 ПОЛУЧЕНИЕ РЫНОЧНЫХ ДАННЫХ:")
        print("=" * 50)
        
        print(f"Пары для обработки: {pairs}")
        
        if not start_date:
            start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        print(f"Временной диапазон: {start_date} - {end_date}")
        
        market_data = {}
        
        for pair in pairs:
            print(f"\n📈 Обрабатываем {pair}...")
            
            # Пытаемся получить реальные данные
            df_real = self.fetch_twelvedata(pair, '1min', start_date, end_date)
            
            if df_real is not None and len(df_real) > 0:
                print(f"✅ Получены реальные данные для {pair}")
                market_data[pair] = self.add_technical_indicators(df_real)
            else:
                print(f"⚠️  Генерируем синтетические данные для {pair}")
                start_time = datetime.strptime(start_date, '%Y-%m-%d')
                end_time = datetime.strptime(end_date, '%Y-%m-%d')
                df_synthetic = self.generate_synthetic_data(pair, start_time, end_time)
                market_data[pair] = self.add_technical_indicators(df_synthetic)
            
            # Небольшая задержка между запросами
            time.sleep(0.5)
        
        print(f"\n✅ Получены данные для {len(market_data)} пар")
        return market_data
    
    def save_market_data(self, market_data: Dict[str, pd.DataFrame], 
                        filename: str = "market_data.json"):
        """Сохраняет рыночные данные в файл"""
        print(f"\n💾 СОХРАНЕНИЕ РЫНОЧНЫХ ДАННЫХ:")
        print("=" * 50)
        
        try:
            # Конвертируем DataFrames в словари для JSON
            data_to_save = {}
            for pair, df in market_data.items():
                data_to_save[pair] = {
                    'data': df.reset_index().to_dict('records'),
                    'columns': list(df.columns),
                    'index_name': df.index.name
                }
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data_to_save, f, default=str, ensure_ascii=False, indent=2)
            
            print(f"✅ Рыночные данные сохранены в {filename}")
            
            return True
            
        except Exception as e:
            print(f"❌ Ошибка сохранения: {e}")
            return False


def test_market_data_fetcher():
    """Тестирование MarketDataFetcher"""
    print("🧪 Тестирование MarketDataFetcher...")
    
    try:
        fetcher = MarketDataFetcher()
        print("✅ MarketDataFetcher создан")
        
        # Тест получения данных для EUR/USD
        print("\n1️⃣ Тест получения данных EUR/USD:")
        df = fetcher.fetch_twelvedata("EUR/USD", "5min")
        
        if df is not None and not df.empty:
            print(f"   ✅ Данные получены: {len(df)} свечей")
            print(f"   Последняя цена: {df.iloc[-1]['close']:.5f}")
            
            # Добавляем индикаторы
            df_with_indicators = fetcher.add_technical_indicators(df)
            print(f"   ✅ Добавлены технические индикаторы")
            
        else:
            print("   ❌ Нет данных, генерируем синтетические")
            start_time = datetime.now() - timedelta(days=1)
            end_time = datetime.now()
            df_synthetic = fetcher.generate_synthetic_data("EUR/USD", start_time, end_time)
            print(f"   ✅ Синтетические данные: {len(df_synthetic)} свечей")
            
        # Тест получения данных для нескольких пар
        print("\n2️⃣ Тест получения данных для нескольких пар:")
        pairs = ["EUR/USD", "GBP/USD"]
        market_data = fetcher.fetch_data_for_pairs(pairs)
        
        if market_data:
            print(f"   ✅ Получены данные для {len(market_data)} пар")
            for pair, data in market_data.items():
                print(f"   {pair}: {len(data)} свечей")
        else:
            print("   ❌ Нет данных")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ Тест завершен!")


if __name__ == "__main__":
    test_market_data_fetcher()
