#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Finnhub OTC API для получения данных по внебиржевым акциям
Интегрируется в систему анализа аналогично форекс API
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
import logging

logger = logging.getLogger(__name__)

class FinnhubOTCAPI:
    """API для получения OTC данных через Finnhub"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or "d31clt1r01qsprr0c0lgd31clt1r01qsprr0c0m0"
        self.base_url = "https://finnhub.io/api/v1"
        self.rate_limit_delay = 1.1  # 60 запросов/минуту
        self.request_count = 0
        self.last_request_time = datetime.now()
        
        # OTC акции для анализа
        self.otc_stocks = [
            'AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX',
            'AMD', 'INTC', 'ORCL', 'CRM', 'ADBE', 'PYPL', 'UBER', 'LYFT'
        ]
        
        print(f"FinnhubOTCAPI инициализирован с ключом: {self.api_key[:10]}...")
    
    def _check_rate_limit(self):
        """Проверка и соблюдение rate limits"""
        now = datetime.now()
        if now - self.last_request_time < timedelta(seconds=self.rate_limit_delay):
            sleep_time = self.rate_limit_delay - (now - self.last_request_time).total_seconds()
            time.sleep(sleep_time)
        
        self.last_request_time = datetime.now()
        self.request_count += 1
    
    def get_stock_quote(self, symbol: str) -> Dict:
        """Получение котировки акции"""
        try:
            self._check_rate_limit()
            
            url = f"{self.base_url}/quote"
            params = {
                'symbol': symbol,
                'token': self.api_key
            }
            
            logger.info(f"🔍 Получение котировки {symbol}")
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('c'):  # current price
                    return {
                        'symbol': symbol,
                        'current_price': data.get('c'),
                        'open_price': data.get('o'),
                        'high_price': data.get('h'),
                        'low_price': data.get('l'),
                        'previous_close': data.get('pc'),
                        'timestamp': data.get('t'),
                        'status': 'success'
                    }
                else:
                    return {
                        'symbol': symbol,
                        'status': 'error',
                        'error': f'Нет данных для {symbol}'
                    }
            else:
                return {
                    'symbol': symbol,
                    'status': 'error',
                    'error': f'HTTP {response.status_code}: {response.text}'
                }
                
        except Exception as e:
            return {
                'symbol': symbol,
                'status': 'error',
                'error': f'Exception: {str(e)}'
            }
    
    def get_stock_candles(self, symbol: str, resolution: str = "1", count: int = 100) -> Dict:
        """Получение свечных данных для акции"""
        try:
            self._check_rate_limit()
            
            url = f"{self.base_url}/candle"
            params = {
                'symbol': symbol,
                'resolution': resolution,
                'count': count,
                'token': self.api_key
            }
            
            logger.info(f"📊 Получение свечей {symbol} ({resolution}, {count})")
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('s') == 'ok' and data.get('c'):
                    return {
                        'symbol': symbol,
                        'status': 'success',
                        'candles': {
                            'close': data.get('c', []),
                            'high': data.get('h', []),
                            'low': data.get('l', []),
                            'open': data.get('o', []),
                            'volume': data.get('v', []),
                            'timestamps': data.get('t', [])
                        },
                        'count': len(data.get('c', [])),
                        'resolution': resolution
                    }
                else:
                    return {
                        'symbol': symbol,
                        'status': 'error',
                        'error': f'Нет данных: {data.get("s", "unknown")}'
                    }
            else:
                return {
                    'symbol': symbol,
                    'status': 'error',
                    'error': f'HTTP {response.status_code}: {response.text}'
                }
                
        except Exception as e:
            return {
                'symbol': symbol,
                'status': 'error',
                'error': f'Exception: {str(e)}'
            }
    
    def get_company_profile(self, symbol: str) -> Dict:
        """Получение профиля компании"""
        try:
            self._check_rate_limit()
            
            url = f"{self.base_url}/stock/profile2"
            params = {
                'symbol': symbol,
                'token': self.api_key
            }
            
            logger.info(f"🏢 Получение профиля {symbol}")
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('name'):
                    return {
                        'symbol': symbol,
                        'name': data.get('name'),
                        'country': data.get('country'),
                        'industry': data.get('finnhubIndustry'),
                        'exchange': data.get('exchange'),
                        'market_cap': data.get('marketCapitalization'),
                        'status': 'success'
                    }
                else:
                    return {
                        'symbol': symbol,
                        'status': 'error',
                        'error': f'Нет данных для {symbol}'
                    }
            else:
                return {
                    'symbol': symbol,
                    'status': 'error',
                    'error': f'HTTP {response.status_code}: {response.text}'
                }
                
        except Exception as e:
            return {
                'symbol': symbol,
                'status': 'error',
                'error': f'Exception: {str(e)}'
            }
    
    def get_bulk_otc_data(self, symbols: List[str] = None) -> Dict[str, Dict]:
        """Получение данных по всем OTC акциям"""
        if symbols is None:
            symbols = self.otc_stocks
        
        logger.info(f"📊 Получение OTC данных для {len(symbols)} акций")
        
        results = {}
        successful = 0
        failed = 0
        
        for symbol in symbols:
            try:
                # Получаем котировку
                quote_result = self.get_stock_quote(symbol)
                
                if quote_result['status'] == 'success':
                    # Получаем свечи
                    candles_result = self.get_stock_candles(symbol, resolution="1", count=50)
                    
                    results[symbol] = {
                        'quote': quote_result,
                        'candles': candles_result,
                        'status': 'success' if candles_result['status'] == 'success' else 'partial'
                    }
                    
                    if candles_result['status'] == 'success':
                        successful += 1
                    else:
                        failed += 1
                else:
                    results[symbol] = {
                        'quote': quote_result,
                        'candles': {'status': 'error', 'error': 'No quote data'},
                        'status': 'error'
                    }
                    failed += 1
                
                # Небольшая задержка между акциями
                time.sleep(0.1)
                
            except Exception as e:
                results[symbol] = {
                    'quote': {'status': 'error', 'error': str(e)},
                    'candles': {'status': 'error', 'error': str(e)},
                    'status': 'error'
                }
                failed += 1
        
        logger.info(f"✅ OTC данные получены: {successful} успешно, {failed} неудачно")
        return results
    
    def convert_to_dataframe(self, otc_data: Dict[str, Dict]) -> pd.DataFrame:
        """Конвертация OTC данных в DataFrame для анализа"""
        try:
            data_list = []
            
            for symbol, data in otc_data.items():
                if data['status'] == 'success' and data['candles']['status'] == 'success':
                    quote = data['quote']
                    candles = data['candles']['candles']
                    
                    # Создаем DataFrame для каждой акции
                    df = pd.DataFrame({
                        'timestamp': [datetime.fromtimestamp(ts) for ts in candles['timestamps']],
                        'open': candles['open'],
                        'high': candles['high'],
                        'low': candles['low'],
                        'close': candles['close'],
                        'volume': candles['volume']
                    })
                    
                    df['symbol'] = symbol
                    df['current_price'] = quote['current_price']
                    df['change'] = df['close'].pct_change()
                    df['volatility'] = df['change'].rolling(window=10).std()
                    
                    data_list.append(df)
            
            if data_list:
                combined_df = pd.concat(data_list, ignore_index=True)
                return combined_df
            else:
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"❌ Ошибка конвертации в DataFrame: {e}")
            return pd.DataFrame()
    
    def get_technical_indicators(self, symbol: str, candles_data: Dict) -> Dict:
        """Вычисление технических индикаторов для OTC акции"""
        try:
            if candles_data['status'] != 'success':
                return {'status': 'error', 'error': 'No candles data'}
            
            candles = candles_data['candles']
            closes = np.array(candles['close'])
            highs = np.array(candles['high'])
            lows = np.array(candles['low'])
            volumes = np.array(candles['volume'])
            
            if len(closes) < 20:
                return {'status': 'error', 'error': 'Insufficient data for indicators'}
            
            # RSI
            rsi = self._calculate_rsi(closes)
            
            # MACD
            macd, macd_signal, macd_hist = self._calculate_macd(closes)
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = self._calculate_bollinger_bands(closes)
            
            # Moving Averages
            sma_20 = self._calculate_sma(closes, 20)
            sma_50 = self._calculate_sma(closes, 50)
            
            # Volume analysis
            volume_sma = self._calculate_sma(volumes, 20)
            volume_ratio = volumes[-1] / volume_sma[-1] if volume_sma[-1] > 0 else 1
            
            return {
                'symbol': symbol,
                'status': 'success',
                'indicators': {
                    'rsi': rsi[-1] if len(rsi) > 0 else 50,
                    'macd': macd[-1] if len(macd) > 0 else 0,
                    'macd_signal': macd_signal[-1] if len(macd_signal) > 0 else 0,
                    'macd_histogram': macd_hist[-1] if len(macd_hist) > 0 else 0,
                    'bb_upper': bb_upper[-1] if len(bb_upper) > 0 else closes[-1],
                    'bb_middle': bb_middle[-1] if len(bb_middle) > 0 else closes[-1],
                    'bb_lower': bb_lower[-1] if len(bb_lower) > 0 else closes[-1],
                    'sma_20': sma_20[-1] if len(sma_20) > 0 else closes[-1],
                    'sma_50': sma_50[-1] if len(sma_50) > 0 else closes[-1],
                    'volume_ratio': volume_ratio,
                    'current_price': closes[-1],
                    'price_change': (closes[-1] - closes[-2]) / closes[-2] * 100 if len(closes) > 1 else 0
                }
            }
            
        except Exception as e:
            return {'status': 'error', 'error': f'Exception: {str(e)}'}
    
    def _calculate_rsi(self, prices: np.ndarray, period: int = 14) -> np.ndarray:
        """Вычисление RSI"""
        try:
            deltas = np.diff(prices)
            gains = np.where(deltas > 0, deltas, 0)
            losses = np.where(deltas < 0, -deltas, 0)
            
            avg_gains = pd.Series(gains).rolling(window=period).mean()
            avg_losses = pd.Series(losses).rolling(window=period).mean()
            
            rs = avg_gains / avg_losses
            rsi = 100 - (100 / (1 + rs))
            
            return rsi.values
        except:
            return np.array([])
    
    def _calculate_macd(self, prices: np.ndarray, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Вычисление MACD"""
        try:
            ema_fast = pd.Series(prices).ewm(span=fast).mean()
            ema_slow = pd.Series(prices).ewm(span=slow).mean()
            
            macd = ema_fast - ema_slow
            macd_signal = macd.ewm(span=signal).mean()
            macd_histogram = macd - macd_signal
            
            return macd.values, macd_signal.values, macd_histogram.values
        except:
            return np.array([]), np.array([]), np.array([])
    
    def _calculate_bollinger_bands(self, prices: np.ndarray, period: int = 20, std_dev: int = 2) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Вычисление Bollinger Bands"""
        try:
            sma = pd.Series(prices).rolling(window=period).mean()
            std = pd.Series(prices).rolling(window=period).std()
            
            upper = sma + (std * std_dev)
            lower = sma - (std * std_dev)
            
            return upper.values, sma.values, lower.values
        except:
            return np.array([]), np.array([]), np.array([])
    
    def _calculate_sma(self, prices: np.ndarray, period: int) -> np.ndarray:
        """Вычисление Simple Moving Average"""
        try:
            return pd.Series(prices).rolling(window=period).mean().values
        except:
            return np.array([])

# Импорт time для задержек
import time
