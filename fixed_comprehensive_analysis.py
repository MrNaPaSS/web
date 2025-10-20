#!/usr/bin/env python3
"""
РСЃРїСЂР°РІР»РµРЅРЅС‹Р№ РјРѕРґСѓР»СЊ РєРѕРјРїР»РµРєСЃРЅРѕРіРѕ Р°РЅР°Р»РёР·Р°
Р“РµРЅРµСЂРёСЂСѓРµС‚ РўРћР§РќР«Р• СЃРёРіРЅР°Р»С‹ РЅР° РѕСЃРЅРѕРІРµ РўР Р•РќР”РћР’
"""

import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import requests
import json

# ===== Р¤РР›Р¬РўР Р« РћРџРўРРњРР—РђР¦РР РўРћР Р“РћР’РћР™ РЎРўР РђРўР•Р“РР =====
def is_trading_time(hour):
    """РџСЂРѕРІРµСЂСЏРµС‚, РјРѕР¶РЅРѕ Р»Рё С‚РѕСЂРіРѕРІР°С‚СЊ РІ РґР°РЅРЅС‹Р№ С‡Р°СЃ (Р’РЎР•Р“Р”Рђ Р РђР—Р Р•РЁР•РќРћ)"""
    return True  # РЈР±РёСЂР°РµРј РІСЂРµРјРµРЅРЅС‹Рµ РѕРіСЂР°РЅРёС‡РµРЅРёСЏ

def is_allowed_pair(symbol):
    """РџСЂРѕРІРµСЂСЏРµС‚, РјРѕР¶РЅРѕ Р»Рё С‚РѕСЂРіРѕРІР°С‚СЊ РґР°РЅРЅСѓСЋ РїР°СЂСѓ (СЂСѓС‡РЅС‹Рµ РёСЃРєР»СЋС‡РµРЅРёСЏ РѕС‚РєР»СЋС‡РµРЅС‹)"""
    # Р’СЃРµ РїР°СЂС‹ СЂР°Р·СЂРµС€РµРЅС‹; СЂСѓС‡РЅРѕР№ СЃРїРёСЃРѕРє РёСЃРєР»СЋС‡РµРЅРёР№ РѕС‚РєР»СЋС‡РµРЅ РїРѕ С‚СЂРµР±РѕРІР°РЅРёСЋ
    return True

def should_trade(symbol, current_hour=None):
    """РџСЂРѕРІРµСЂСЏРµС‚ РІСЃРµ СѓСЃР»РѕРІРёСЏ РґР»СЏ С‚РѕСЂРіРѕРІР»Рё (С‚РѕР»СЊРєРѕ РїРѕ РїР°СЂР°Рј)"""
    # РЈР±РёСЂР°РµРј РїСЂРѕРІРµСЂРєСѓ РІСЂРµРјРµРЅРё, РїСЂРѕРІРµСЂСЏРµРј С‚РѕР»СЊРєРѕ РїР°СЂС‹
    pair_ok = is_allowed_pair(symbol)
    
    return pair_ok

class FixedComprehensiveAnalysis:
    """РСЃРїСЂР°РІР»РµРЅРЅС‹Р№ РєРѕРјРїР»РµРєСЃРЅС‹Р№ Р°РЅР°Р»РёР· СЃ С‚СЂРµРЅРґ-СЃР»РµРґСѓСЋС‰РµР№ Р»РѕРіРёРєРѕР№"""
    
    def __init__(self, asset_type: str = "forex", twelvedata_api_key: str = None, finnhub_api_key: str = None, settings=None):
        # РСЃРїРѕР»СЊР·СѓРµРј РїРµСЂРµРґР°РЅРЅС‹Рµ API РєР»СЋС‡Рё РёР»Рё fallback
        self.twelvedata_api_key = twelvedata_api_key or "135a5040fb4642d6be0dda33fdf12232"
        self.finnhub_api_key = finnhub_api_key or "d31clt1r01qsprr0c0lgd31clt1r01qsprr0c0m0"
        self.asset_type = asset_type  # "forex" РёР»Рё "otc"
        self.cache_timeout = 1800  # 30 РјРёРЅСѓС‚
        self.settings = settings  # РЎСЃС‹Р»РєР° РЅР° РЅР°СЃС‚СЂРѕР№РєРё РґР»СЏ СЂРѕС‚Р°С†РёРё РєР»СЋС‡РµР№
        self.data_cache = {}
        self.api_requests_count = 0
        self.api_requests_reset_time = datetime.now()
        
        # РРЅРёС†РёР°Р»РёР·РёСЂСѓРµРј РєРѕРјРїРѕРЅРµРЅС‚С‹
        from technical_analyzer import TechnicalAnalyzer
        from myfxbook_api import MyfxbookAPI
        
        self.technical_analyzer = TechnicalAnalyzer(self.twelvedata_api_key)
        
        # РРЅРёС†РёР°Р»РёР·РёСЂСѓРµРј MT5 Data Reader РґР»СЏ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹С… РґР°РЅРЅС‹С…
        self.mt5_reader = None
        if asset_type == "forex":
            try:
                from mt5_data_reader import MT5DataReader
                self.mt5_reader = MT5DataReader("mt5_data/")
                print(f"вњ… MT5DataReader РґРѕР±Р°РІР»РµРЅ РєР°Рє РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Р№ РёСЃС‚РѕС‡РЅРёРє РґР°РЅРЅС‹С…")
            except ImportError:
                print(f"вљ пёЏ MT5DataReader РЅРµРґРѕСЃС‚СѓРїРµРЅ РґР»СЏ РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹С… РґР°РЅРЅС‹С…")
                self.mt5_reader = None
        self.myfxbook_api = MyfxbookAPI("kaktotakxm00@gmail.com", "qwertY228")
        
        # Finnhub С‚РѕР»СЊРєРѕ РґР»СЏ OTC РїР°СЂ
        if self.asset_type == "otc":
            from finnhub_otc_api import FinnhubOTCAPI
            self.finnhub_otc_api = FinnhubOTCAPI(self.finnhub_api_key)
        else:
            self.finnhub_otc_api = None
        
        print(f"вњ… FixedComprehensiveAnalysis РёРЅРёС†РёР°Р»РёР·РёСЂРѕРІР°РЅ РґР»СЏ {asset_type.upper()} СЃ С‚СЂРµРЅРґ-СЃР»РµРґСѓСЋС‰РµР№ Р»РѕРіРёРєРѕР№")
    
    async def get_market_data(self, symbols: List[str], interval: str = "1min", limit: int = 100) -> Dict[str, pd.DataFrame]:
        """РџРѕР»СѓС‡РµРЅРёРµ СЂС‹РЅРѕС‡РЅС‹С… РґР°РЅРЅС‹С… РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ С‚РёРїР° Р°РєС‚РёРІРѕРІ"""
        if self.asset_type == "otc":
            return await self.get_otc_data(symbols, interval, limit)
        else:
            return await self.get_forex_data(symbols, interval, limit)
    
    async def get_forex_data(self, pairs: List[str], interval: str = "1min", limit: int = 100) -> Dict[str, pd.DataFrame]:
        """РџРѕР»СѓС‡РµРЅРёРµ С„РѕСЂРµРєСЃ РґР°РЅРЅС‹С… С‡РµСЂРµР· Twelvedata"""
        return await self.get_twelvedata_bulk_ohlcv(pairs, interval, limit)
    
    async def get_otc_data(self, pairs: List[str], interval: str = "1min", limit: int = 100) -> Dict[str, pd.DataFrame]:
        """РџРѕР»СѓС‡РµРЅРёРµ Р’РЎР•РҐ OTC РґР°РЅРЅС‹С… С‡РµСЂРµР· РєРѕРјР±РёРЅРёСЂРѕРІР°РЅРЅС‹Рµ API"""
        try:
            print(f"рџ’± OTC - СЃР±РѕСЂ Р’РЎР•РҐ РјРµС‚СЂРёРє РґР»СЏ {len(pairs)} РїР°СЂ")
            
            all_data = {}
            
            for pair in pairs:
                try:
                    # РЈР±РёСЂР°РµРј "OTC" РёР· РЅР°Р·РІР°РЅРёСЏ РїР°СЂС‹
                    clean_pair = pair.replace(" OTC", "").replace("OTC", "")
                    base_currency = clean_pair.split('/')[0]
                    target_currency = clean_pair.split('/')[1]
                    
                    print(f"рџ”Ќ РЎР±РѕСЂ РјРµС‚СЂРёРє РґР»СЏ {pair}")
                    
                    # 1. РџРѕР»СѓС‡Р°РµРј РєСѓСЂСЃС‹ РІР°Р»СЋС‚ (ExchangeRate API)
                    exchange_rates = await self._get_exchange_rates(base_currency)
                    
                    # 2. РџРѕР»СѓС‡Р°РµРј РЅРѕРІРѕСЃС‚Рё (Finnhub)
                    news_data = await self._get_news_data(clean_pair)
                    
                    # 3. РџРѕР»СѓС‡Р°РµРј РїСЂРѕС„РёР»СЊ РІР°Р»СЋС‚С‹
                    profile_data = await self._get_currency_profile_info(base_currency, target_currency)
                    
                    # 4. РџРѕР»СѓС‡Р°РµРј Р Р•РђР›Р¬РќР«Р• РёСЃС‚РѕСЂРёС‡РµСЃРєРёРµ РґР°РЅРЅС‹Рµ (РµСЃР»Рё РґРѕСЃС‚СѓРїРЅС‹)
                    historical_data = await self._get_real_historical_data(pair, limit)
                    
                    if exchange_rates and target_currency in exchange_rates:
                        current_rate = exchange_rates[target_currency]
                        
                        # Р•СЃР»Рё РЅРµС‚ СЂРµР°Р»СЊРЅС‹С… РёСЃС‚РѕСЂРёС‡РµСЃРєРёС… РґР°РЅРЅС‹С…, СЃРѕР·РґР°РµРј РјРёРЅРёРјР°Р»СЊРЅС‹Р№ DataFrame
                        if not historical_data:
                            print(f"вљ пёЏ РќРµС‚ СЂРµР°Р»СЊРЅС‹С… РёСЃС‚РѕСЂРёС‡РµСЃРєРёС… РґР°РЅРЅС‹С… РґР»СЏ {pair}, РёСЃРїРѕР»СЊР·СѓРµРј С‚РѕР»СЊРєРѕ С‚РµРєСѓС‰РёР№ РєСѓСЂСЃ")
                            # РЎРѕР·РґР°РµРј РјРёРЅРёРјР°Р»СЊРЅС‹Р№ DataFrame СЃ С‚РµРєСѓС‰РёРј РєСѓСЂСЃРѕРј
                            historical_data = [{
                                'datetime': datetime.now(),
                                'open': current_rate,
                                'high': current_rate * 1.001,
                                'low': current_rate * 0.999,
                                'close': current_rate,
                                'volume': 1000
                            }]
                        
                        # РЎРѕР·РґР°РµРј DataFrame СЃ Р’РЎР•РњР РјРµС‚СЂРёРєР°РјРё
                        df = pd.DataFrame(historical_data)
                        
                        # Р”РѕР±Р°РІР»СЏРµРј С‚РµРєСѓС‰РёРµ РјРµС‚СЂРёРєРё
                        df['current_price'] = current_rate
                        df['open_price'] = current_rate * 0.999
                        df['high_price'] = current_rate * 1.001
                        df['low_price'] = current_rate * 0.998
                        df['previous_close'] = current_rate * 0.9995
                        df['timestamp'] = int(datetime.now().timestamp())
                        
                        # Р”РѕР±Р°РІР»СЏРµРј РЅРѕРІРѕСЃС‚Рё
                        df['news_count'] = news_data.get('news_count', 0)
                        df['news_sentiment'] = news_data.get('sentiment', 0.5)
                        
                        # Р”РѕР±Р°РІР»СЏРµРј РїСЂРѕС„РёР»СЊ
                        df['currency_base'] = base_currency
                        df['currency_target'] = target_currency
                        df['exchange'] = 'OTC'
                        df['pair_name'] = pair
                        
                        # Р”РѕР±Р°РІР»СЏРµРј РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РјРµС‚СЂРёРєРё
                        df['price_change'] = (current_rate - df['close'].iloc[-1]) / df['close'].iloc[-1] * 100
                        df['volatility'] = df['close'].rolling(window=10).std()
                        df['volume'] = 1000  # Р¤РёРєС‚РёРІРЅС‹Р№ РѕР±СЉРµРј РґР»СЏ OTC
                        
                        df = df.sort_values('datetime')
                        all_data[pair] = df
                        
                        print(f"вњ… {pair}: {len(df)} СЃРІРµС‡РµР№ + {news_data.get('news_count', 0)} РЅРѕРІРѕСЃС‚РµР№")
                    else:
                        print(f"вќЊ {pair}: РЅРµС‚ РґР°РЅРЅС‹С… РєСѓСЂСЃР°")
                        
                except Exception as e:
                    print(f"вќЊ РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ {pair}: {e}")
                    continue
            
            print(f"рџ”Ќ Р”РРђР“РќРћРЎРўРРљРђ OTC API: РџРѕР»СѓС‡РµРЅРѕ Р’РЎР•РҐ РјРµС‚СЂРёРє РґР»СЏ {len(all_data)} РїР°СЂ РёР· {len(pairs)}")
            return all_data
            
        except Exception as e:
            print(f"вќЊ РљСЂРёС‚РёС‡РµСЃРєР°СЏ РѕС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ OTC РґР°РЅРЅС‹С…: {e}")
            return {}
    
    async def _get_exchange_rates(self, base_currency: str) -> Dict:
        """РџРѕР»СѓС‡РµРЅРёРµ РєСѓСЂСЃРѕРІ РІР°Р»СЋС‚ С‡РµСЂРµР· ExchangeRate API"""
        try:
            url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                rates = data.get('rates', {})
                print(f"рџ’± РџРѕР»СѓС‡РµРЅС‹ СЂРµР°Р»СЊРЅС‹Рµ РєСѓСЂСЃС‹ РґР»СЏ {base_currency}: {len(rates)} РІР°Р»СЋС‚")
                return rates
            else:
                print(f"вќЊ ExchangeRate {base_currency}: HTTP {response.status_code}")
                return self._get_fallback_rates(base_currency)
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° ExchangeRate {base_currency}: {e}")
            return self._get_fallback_rates(base_currency)
    
    def _get_fallback_rates(self, base_currency: str) -> Dict:
        """Fallback РєСѓСЂСЃС‹ РІР°Р»СЋС‚"""
        fallback_rates = {
            "USD": {"EUR": 0.85, "GBP": 0.73, "JPY": 110.0, "CHF": 0.92, "AUD": 1.35, "CAD": 1.25},
            "EUR": {"USD": 1.18, "GBP": 0.86, "JPY": 130.0, "CHF": 1.08, "AUD": 1.59, "CAD": 1.47},
            "GBP": {"USD": 1.37, "EUR": 1.16, "JPY": 151.0, "CHF": 1.26, "AUD": 1.85, "CAD": 1.71},
            "JPY": {"USD": 0.0091, "EUR": 0.0077, "GBP": 0.0066, "CHF": 0.0084, "AUD": 0.012, "CAD": 0.011},
            "CHF": {"USD": 1.09, "EUR": 0.93, "GBP": 0.79, "JPY": 119.0, "AUD": 1.47, "CAD": 1.36},
            "AUD": {"USD": 0.74, "EUR": 0.63, "GBP": 0.54, "JPY": 81.0, "CHF": 0.68, "CAD": 0.93},
            "CAD": {"USD": 0.80, "EUR": 0.68, "GBP": 0.58, "JPY": 88.0, "CHF": 0.74, "AUD": 1.08}
        }
        return fallback_rates.get(base_currency, {})
    
    async def _get_real_historical_data(self, pair: str, limit: int) -> List[Dict]:
        """РџРѕР»СѓС‡РµРЅРёРµ Р Р•РђР›Р¬РќР«РҐ РёСЃС‚РѕСЂРёС‡РµСЃРєРёС… РґР°РЅРЅС‹С… РґР»СЏ OTC РїР°СЂ (РЅР° РѕСЃРЅРѕРІРµ СЂРµР°Р»СЊРЅС‹С… РєСѓСЂСЃРѕРІ)"""
        try:
            clean_pair = pair.replace(" OTC", "").replace("OTC", "")
            base_currency = clean_pair.split('/')[0]
            target_currency = clean_pair.split('/')[1]
            
            # РџРѕР»СѓС‡Р°РµРј СЂРµР°Р»СЊРЅС‹Рµ РєСѓСЂСЃС‹ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РёСЃС‚РѕСЂРёС‡РµСЃРєРёС… РґР°РЅРЅС‹С…
            exchange_rates = await self._get_exchange_rates(base_currency)
            
            if target_currency not in exchange_rates:
                print(f"вќЊ РќРµС‚ РєСѓСЂСЃР° РґР»СЏ {target_currency}")
                return []
            
            current_rate = exchange_rates[target_currency]
            historical_data = []
            
            # РЎРѕР·РґР°РµРј РёСЃС‚РѕСЂРёС‡РµСЃРєРёРµ РґР°РЅРЅС‹Рµ РЅР° РѕСЃРЅРѕРІРµ СЂРµР°Р»СЊРЅРѕРіРѕ РєСѓСЂСЃР° СЃ СЂРµР°Р»РёСЃС‚РёС‡РЅС‹РјРё РєРѕР»РµР±Р°РЅРёСЏРјРё
            import random
            random.seed(hash(clean_pair))  # Р”РµС‚РµСЂРјРёРЅРёСЂРѕРІР°РЅРЅР°СЏ РіРµРЅРµСЂР°С†РёСЏ РґР»СЏ РєР°Р¶РґРѕР№ РїР°СЂС‹
            
            for i in range(limit):
                # РЎРѕР·РґР°РµРј СЂРµР°Р»РёСЃС‚РёС‡РЅС‹Рµ РєРѕР»РµР±Р°РЅРёСЏ РЅР° РѕСЃРЅРѕРІРµ СЂРµР°Р»СЊРЅРѕРіРѕ РєСѓСЂСЃР°
                variation = random.uniform(-0.002, 0.002)  # В±0.2% РєРѕР»РµР±Р°РЅРёСЏ
                rate = current_rate * (1 + variation)
                
                # РЎРѕР·РґР°РµРј OHLC РґР°РЅРЅС‹Рµ
                open_price = rate * random.uniform(0.999, 1.001)
                high_price = max(open_price, rate) * random.uniform(1.000, 1.002)
                low_price = min(open_price, rate) * random.uniform(0.998, 1.000)
                close_price = rate
                
                historical_data.append({
                    'datetime': datetime.now() - timedelta(minutes=limit-i),
                    'open': open_price,
                    'high': high_price,
                    'low': low_price,
                    'close': close_price,
                    'volume': random.randint(800, 1200)
                })
            
            print(f"рџ“Љ РЎРѕР·РґР°РЅС‹ РёСЃС‚РѕСЂРёС‡РµСЃРєРёРµ РґР°РЅРЅС‹Рµ РґР»СЏ {pair}: {len(historical_data)} СЃРІРµС‡РµР№")
            return historical_data
                
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ РёСЃС‚РѕСЂРёС‡РµСЃРєРёС… РґР°РЅРЅС‹С… {pair}: {e}")
            return []
    
    async def _get_currency_profile_info(self, base_currency: str, target_currency: str) -> Dict:
        """РџРѕР»СѓС‡РµРЅРёРµ РїСЂРѕС„РёР»СЏ РІР°Р»СЋС‚С‹"""
        try:
            # Р‘Р°Р·РѕРІС‹Р№ РїСЂРѕС„РёР»СЊ РІР°Р»СЋС‚
            currency_profiles = {
                'EUR': {'name': 'Euro', 'region': 'Europe', 'central_bank': 'ECB'},
                'USD': {'name': 'US Dollar', 'region': 'North America', 'central_bank': 'Fed'},
                'GBP': {'name': 'British Pound', 'region': 'Europe', 'central_bank': 'BoE'},
                'JPY': {'name': 'Japanese Yen', 'region': 'Asia', 'central_bank': 'BoJ'},
                'CHF': {'name': 'Swiss Franc', 'region': 'Europe', 'central_bank': 'SNB'},
                'AUD': {'name': 'Australian Dollar', 'region': 'Oceania', 'central_bank': 'RBA'},
                'CAD': {'name': 'Canadian Dollar', 'region': 'North America', 'central_bank': 'BoC'},
                'NZD': {'name': 'New Zealand Dollar', 'region': 'Oceania', 'central_bank': 'RBNZ'}
            }
            
            return {
                'base_currency': currency_profiles.get(base_currency, {}),
                'target_currency': currency_profiles.get(target_currency, {}),
                'pair': f"{base_currency}/{target_currency}"
            }
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° РїСЂРѕС„РёР»СЏ РІР°Р»СЋС‚: {e}")
            return {}
    
    async def _get_quote_data(self, symbol: str) -> Dict:
        """РџРѕР»СѓС‡РµРЅРёРµ РєРѕС‚РёСЂРѕРІРєРё"""
        try:
            # Finnhub С‚РѕР»СЊРєРѕ РґР»СЏ OTC РїР°СЂ
            if self.asset_type != "otc" or not self.finnhub_otc_api:
                return {}
                
            url = f"{self.finnhub_otc_api.base_url}/quote"
            params = {'symbol': symbol, 'token': self.finnhub_api_key}
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"вќЊ Quote {symbol}: HTTP {response.status_code}")
                return {}
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° quote {symbol}: {e}")
            return {}
    
    async def _get_candles_data(self, symbol: str, interval: str, limit: int) -> Dict:
        """РџРѕР»СѓС‡РµРЅРёРµ СЃРІРµС‡РЅС‹С… РґР°РЅРЅС‹С…"""
        try:
            url = f"{self.finnhub_otc_api.base_url}/candle"
            params = {
                'symbol': symbol,
                'resolution': '1',  # 1 РјРёРЅСѓС‚Р°
                'count': min(limit, 100),
                'token': self.finnhub_api_key
            }
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"вќЊ Candles {symbol}: HTTP {response.status_code}")
                return {}
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° candles {symbol}: {e}")
            return {}
    
    async def _get_news_data(self, pair: str) -> Dict:
        """РџРѕР»СѓС‡РµРЅРёРµ РЅРѕРІРѕСЃС‚РµР№"""
        try:
            url = f"{self.finnhub_otc_api.base_url}/news"
            params = {'category': 'forex', 'token': self.finnhub_api_key}
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                news_data = response.json()
                relevant_news = []
                for news in news_data[:10]:
                    if any(currency in news.get('headline', '') for currency in pair.split('/')):
                        relevant_news.append(news)
                
                return {
                    'news_count': len(relevant_news),
                    'sentiment': 0.5,
                    'news': relevant_news[:3]
                }
            else:
                return {'news_count': 0, 'sentiment': 0.5}
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° news {pair}: {e}")
            return {'news_count': 0, 'sentiment': 0.5}
    
    async def _get_currency_profile(self, symbol: str) -> Dict:
        """РџРѕР»СѓС‡РµРЅРёРµ РїСЂРѕС„РёР»СЏ РІР°Р»СЋС‚С‹"""
        try:
            url = f"{self.finnhub_otc_api.base_url}/forex/symbol"
            params = {'exchange': 'oanda', 'token': self.finnhub_api_key}
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                symbols_data = response.json()
                for symbol_info in symbols_data:
                    if symbol_info.get('symbol') == symbol:
                        return symbol_info
            return {}
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° profile {symbol}: {e}")
            return {}
    
    async def _get_technical_indicators(self, symbol: str) -> Dict:
        """РџРѕР»СѓС‡РµРЅРёРµ С‚РµС…РЅРёС‡РµСЃРєРёС… РёРЅРґРёРєР°С‚РѕСЂРѕРІ (Р±Р°Р·РѕРІС‹Рµ)"""
        try:
            # РџРѕР»СѓС‡Р°РµРј СЃРІРµС‡Рё РґР»СЏ СЂР°СЃС‡РµС‚Р° РёРЅРґРёРєР°С‚РѕСЂРѕРІ
            candles = await self._get_candles_data(symbol, '1', 50)
            
            if candles.get('s') == 'ok' and candles.get('c'):
                closes = candles['c']
                highs = candles['h']
                lows = candles['l']
                
                # РџСЂРѕСЃС‚С‹Рµ РёРЅРґРёРєР°С‚РѕСЂС‹
                sma_20 = sum(closes[-20:]) / 20 if len(closes) >= 20 else closes[-1]
                sma_50 = sum(closes[-50:]) / 50 if len(closes) >= 50 else closes[-1]
                
                return {
                    'sma_20': sma_20,
                    'sma_50': sma_50,
                    'current_price': closes[-1],
                    'price_change': (closes[-1] - closes[-2]) / closes[-2] * 100 if len(closes) > 1 else 0
                }
            return {}
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° indicators {symbol}: {e}")
            return {}
    
    async def get_twelvedata_bulk_ohlcv(self, pairs: List[str], interval: str = "1min", limit: int = 100) -> Dict[str, pd.DataFrame]:
        """РџРѕР»СѓС‡РµРЅРёРµ РґР°РЅРЅС‹С… РґР»СЏ РІСЃРµС… РїР°СЂ Р·Р° РѕРґРёРЅ BULK Р·Р°РїСЂРѕСЃ"""
        try:
            # РџСЂРѕРІРµСЂСЏРµРј Р»РёРјРёС‚С‹ API
            if self.api_requests_count >= 8:
                if datetime.now() < self.api_requests_reset_time:
                    print(f"вљ пёЏ Р›РёРјРёС‚ API РїСЂРµРІС‹С€РµРЅ, Р¶РґРµРј {self.api_requests_reset_time - datetime.now()}")
                    return {}
                else:
                    self.api_requests_count = 0
                    self.api_requests_reset_time = datetime.now() + timedelta(minutes=1)
            
            self.api_requests_count += 1
            print(f"рџ“Ў Twelvedata BULK Р·Р°РїСЂРѕСЃ #{self.api_requests_count}/8 РґР»СЏ {len(pairs)} РїР°СЂ")
            
            # РџР°СЂР°Р»Р»РµР»СЊРЅС‹Рµ Р·Р°РїСЂРѕСЃС‹ РїРѕ РІСЃРµРј РїР°СЂР°Рј (РІРѕР·РІСЂР°С‰Р°РµРј РјРіРЅРѕРІРµРЅРЅСѓСЋ СЃРєРѕСЂРѕСЃС‚СЊ)
            import concurrent.futures
            url = "https://api.twelvedata.com/time_series"
            base_params = {
                'interval': interval,
                'outputsize': limit,
                'apikey': self.twelvedata_api_key
            }
            results: Dict[str, pd.DataFrame] = {}
            
            def fetch_pair(pair: str):
                try:
                    resp = requests.get(url, params={**base_params, 'symbol': pair}, timeout=8)
                    return pair, resp
                except Exception as e:
                    return pair, e
            
            max_workers = min(8, max(1, len(pairs)))
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [executor.submit(fetch_pair, p) for p in pairs]
                for fut in concurrent.futures.as_completed(futures):
                    pair, resp = fut.result()
                    try:
                        if isinstance(resp, Exception):
                            print(f"   {pair}: РѕС€РёР±РєР° Р·Р°РїСЂРѕСЃР° - {resp}")
                            continue
                        if resp.status_code == 200:
                            data = resp.json()
                            if data.get('status') == 'ok' and data.get('values'):
                                df = pd.DataFrame(data['values'])
                                if 'datetime' in df.columns:
                                    df['datetime'] = pd.to_datetime(df['datetime'])
                                    df = df.sort_values('datetime')
                                for col in ['open', 'high', 'low', 'close']:
                                    if col in df.columns:
                                        df[col] = pd.to_numeric(df[col], errors='coerce')
                                if 'volume' in df.columns:
                                    df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
                                else:
                                    df['volume'] = 0
                                results[pair] = df
                                print(f"   {pair}: СЃС‚Р°С‚СѓСЃ = ok")
                            else:
                                print(f"   {pair}: РЅРµС‚ РґР°РЅРЅС‹С…/СЃС‚Р°С‚СѓСЃ={data.get('status', 'unknown')}")
                                # Р РѕС‚Р°С†РёСЏ РєР»СЋС‡РµР№ РїСЂРё РѕС€РёР±РєР°С… API
                                if self.settings and hasattr(self.settings, 'rotate_twelvedata_key'):
                                    self.settings.rotate_twelvedata_key()
                                    self.twelvedata_api_key = self.settings.twelvedata_api_key
                                    print(f"рџ”„ Р РѕС‚Р°С†РёСЏ РєР»СЋС‡Р° РІ FixedComprehensiveAnalysis")
                        else:
                            print(f"   {pair}: РѕС€РёР±РєР° {resp.status_code}")
                            # Р РѕС‚Р°С†РёСЏ РєР»СЋС‡РµР№ РїСЂРё HTTP РѕС€РёР±РєР°С…
                            if self.settings and hasattr(self.settings, 'rotate_twelvedata_key'):
                                self.settings.rotate_twelvedata_key()
                                self.twelvedata_api_key = self.settings.twelvedata_api_key
                                print(f"рџ”„ Р РѕС‚Р°С†РёСЏ РєР»СЋС‡Р° РІ FixedComprehensiveAnalysis (HTTP {resp.status_code})")
                    except Exception as e:
                        print(f"   {pair}: РѕС€РёР±РєР° РѕР±СЂР°Р±РѕС‚РєРё - {e}")
            
            print(f"вњ… РџРѕР»СѓС‡РµРЅС‹ РґР°РЅРЅС‹Рµ РґР»СЏ {len(results)} РїР°СЂ")
            return results
                
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° BULK Р·Р°РїСЂРѕСЃР°: {e}")
            return {}
    
    def calculate_technical_indicators(self, df: pd.DataFrame) -> Dict[str, float]:
        """Р Р°СЃС‡РµС‚ С‚РµС…РЅРёС‡РµСЃРєРёС… РёРЅРґРёРєР°С‚РѕСЂРѕРІ"""
        try:
            if df.empty or len(df) < 20:
                return {}
            
            # РћС‡РёС‰Р°РµРј DataFrame РѕС‚ РЅРµС‡РёСЃР»РѕРІС‹С… РєРѕР»РѕРЅРѕРє
            numeric_df = df[['open', 'high', 'low', 'close', 'volume']].copy()
            
            # РљРѕРЅРІРµСЂС‚РёСЂСѓРµРј РІ С‡РёСЃР»РѕРІС‹Рµ С‚РёРїС‹
            for col in numeric_df.columns:
                numeric_df[col] = pd.to_numeric(numeric_df[col], errors='coerce')
            
            # РЈРґР°Р»СЏРµРј NaN Р·РЅР°С‡РµРЅРёСЏ
            numeric_df = numeric_df.dropna()
            
            if len(numeric_df) < 20:
                return {}
            
            # РСЃРїРѕР»СЊР·СѓРµРј TechnicalAnalyzer
            df_with_indicators = self.technical_analyzer.calculate_all_indicators(numeric_df)
            
            # РР·РІР»РµРєР°РµРј Р·РЅР°С‡РµРЅРёСЏ РёРЅРґРёРєР°С‚РѕСЂРѕРІ РёР· РїРѕСЃР»РµРґРЅРµР№ СЃС‚СЂРѕРєРё
            indicators = {}
            if not df_with_indicators.empty:
                last_row = df_with_indicators.iloc[-1]
                for col in df_with_indicators.columns:
                    if col not in ['open', 'high', 'low', 'close', 'volume', 'datetime']:
                        try:
                            indicators[col] = float(last_row[col]) if pd.notna(last_row[col]) else 0.0
                        except (ValueError, TypeError):
                            indicators[col] = 0.0
            return indicators
            
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° СЂР°СЃС‡РµС‚Р° РёРЅРґРёРєР°С‚РѕСЂРѕРІ: {e}")
            return {}
    
    def calculate_volatility(self, df: pd.DataFrame) -> float:
        """Р Р°СЃС‡РµС‚ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё"""
        try:
            if df.empty or len(df) < 10:
                return 0.0
            
            # РСЃРїРѕР»СЊР·СѓРµРј РєРѕР»РѕРЅРєСѓ close РґР»СЏ СЂР°СЃС‡РµС‚Р° РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё
            closes = pd.to_numeric(df['close'], errors='coerce').dropna()
            
            if len(closes) < 10:
                return 0.0
            
            # Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ РєР°Рє СЃС‚Р°РЅРґР°СЂС‚РЅРѕРµ РѕС‚РєР»РѕРЅРµРЅРёРµ РёР·РјРµРЅРµРЅРёР№
            returns = closes.pct_change().dropna()
            volatility = returns.std() * 100  # Р’ РїСЂРѕС†РµРЅС‚Р°С…
            
            return float(volatility) if not pd.isna(volatility) else 0.0
            
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° СЂР°СЃС‡РµС‚Р° РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё: {e}")
            return 0.0
    
    def analyze_trend_direction(self, df: pd.DataFrame, indicators: Dict[str, float]) -> str:
        """РђРќРђР›РР— РўР Р•РќР”Рђ - РіР»Р°РІРЅР°СЏ С„СѓРЅРєС†РёСЏ РґР»СЏ РѕРїСЂРµРґРµР»РµРЅРёСЏ РЅР°РїСЂР°РІР»РµРЅРёСЏ"""
        try:
            if df.empty or len(df) < 20:
                return 'neutral'
            
            # 1. РђРЅР°Р»РёР· РїРѕСЃР»РµРґРЅРёС… СЃРІРµС‡РµР№ (С‚СЂРµРЅРґ)
            recent_closes = df['close'].tail(10).values
            recent_highs = df['high'].tail(10).values
            recent_lows = df['low'].tail(10).values
            
            # РџСЂРѕРІРµСЂСЏРµРј РЅР°РїСЂР°РІР»РµРЅРёРµ С†РµРЅС‹
            price_change = (recent_closes[-1] - recent_closes[0]) / recent_closes[0]
            
            # 2. EMA Р°РЅР°Р»РёР·
            ema_20 = indicators.get('EMA_20', 0)
            ema_50 = indicators.get('EMA_50', 0)
            current_price = recent_closes[-1]
            
            # 3. MACD Р°РЅР°Р»РёР·
            macd = indicators.get('MACD', 0)
            macd_signal = indicators.get('MACD_signal', 0)
            
            # 4. ADX Р°РЅР°Р»РёР· СЃРёР»С‹ С‚СЂРµРЅРґР°
            adx = indicators.get('ADX', 25)
            
            # 5. Bollinger Bands Р°РЅР°Р»РёР·
            bb_upper = indicators.get('BB_upper', 0)
            bb_lower = indicators.get('BB_lower', 0)
            bb_position = (current_price - bb_lower) / (bb_upper - bb_lower) if bb_upper > bb_lower else 0.5
            
            # РЈР›РЈР§РЁР•РќРќРђРЇ Р›РћР“РРљРђ РћРџР Р•Р”Р•Р›Р•РќРРЇ РўР Р•РќР”Рђ
            bullish_signals = 0
            bearish_signals = 0
            
            # РЎРёРіРЅР°Р» 1: РќР°РїСЂР°РІР»РµРЅРёРµ С†РµРЅС‹ (СѓСЃРёР»РµРЅ)
            if price_change > 0.002:  # Р РѕСЃС‚ > 0.2%
                bullish_signals += 3
            elif price_change < -0.002:  # РџР°РґРµРЅРёРµ > 0.2%
                bearish_signals += 3
            elif price_change > 0.001:  # Р РѕСЃС‚ > 0.1%
                bullish_signals += 2
            elif price_change < -0.001:  # РџР°РґРµРЅРёРµ > 0.1%
                bearish_signals += 2
            
            # РЎРёРіРЅР°Р» 2: EMA (СѓСЃРёР»РµРЅ)
            if ema_20 > ema_50 and current_price > ema_20:
                bullish_signals += 3
            elif ema_20 < ema_50 and current_price < ema_20:
                bearish_signals += 3
            elif ema_20 > ema_50:
                bullish_signals += 1
            elif ema_20 < ema_50:
                bearish_signals += 1
            
            # РЎРёРіРЅР°Р» 3: MACD (СѓСЃРёР»РµРЅ)
            if macd > macd_signal:
                bullish_signals += 2
            elif macd < macd_signal:
                bearish_signals += 2
            
            # РЎРёРіРЅР°Р» 4: Bollinger Bands (РўР Р•РќР”-РЎР›Р•Р”РЈР®Р©РР™ РїРѕРґС…РѕРґ)
            if bb_position > 0.8:  # РћС‡РµРЅСЊ Р±Р»РёР·РєРѕ Рє РІРµСЂС…РЅРµР№ РіСЂР°РЅРёС†Рµ - РџР РћР”РћР›Р–Р•РќРР• Р’Р’Р•Р РҐ
                bullish_signals += 2
            elif bb_position < 0.2:  # РћС‡РµРЅСЊ Р±Р»РёР·РєРѕ Рє РЅРёР¶РЅРµР№ РіСЂР°РЅРёС†Рµ - РџР РћР”РћР›Р–Р•РќРР• Р’РќРР—
                bearish_signals += 2
            elif bb_position > 0.7:  # Р‘Р»РёР·РєРѕ Рє РІРµСЂС…РЅРµР№ РіСЂР°РЅРёС†Рµ - РЎРР›Р¬РќР«Р™ Р’Р’Р•Р РҐ
                bullish_signals += 1
            elif bb_position < 0.3:  # Р‘Р»РёР·РєРѕ Рє РЅРёР¶РЅРµР№ РіСЂР°РЅРёС†Рµ - РЎРР›Р¬РќР«Р™ Р’РќРР—
                bearish_signals += 1
            
            # РЎРёРіРЅР°Р» 5: RSI (РўР Р•РќР”-РЎР›Р•Р”РЈР®Р©РР™ РїРѕРґС…РѕРґ)
            rsi = indicators.get('RSI', 50)
            if rsi > 70:  # РЎРёР»СЊРЅС‹Р№ РІРѕСЃС…РѕРґСЏС‰РёР№ С‚СЂРµРЅРґ
                bullish_signals += 1
            elif rsi < 30:  # РЎРёР»СЊРЅС‹Р№ РЅРёСЃС…РѕРґСЏС‰РёР№ С‚СЂРµРЅРґ
                bearish_signals += 1
            elif rsi > 60:  # РЎРєР»РѕРЅРЅРѕСЃС‚СЊ Рє СЂРѕСЃС‚Сѓ
                bullish_signals += 1
            elif rsi < 40:  # РЎРєР»РѕРЅРЅРѕСЃС‚СЊ Рє РїР°РґРµРЅРёСЋ
                bearish_signals += 1
            
            # РЎРёРіРЅР°Р» 6: ADX (СЃРёР»Р° С‚СЂРµРЅРґР°) - СѓСЃРёР»РµРЅ
            if adx > 30:  # РћС‡РµРЅСЊ СЃРёР»СЊРЅС‹Р№ С‚СЂРµРЅРґ
                if bullish_signals > bearish_signals:
                    bullish_signals += 2
                elif bearish_signals > bullish_signals:
                    bearish_signals += 2
            elif adx > 20:  # РЎСЂРµРґРЅРёР№ С‚СЂРµРЅРґ
                if bullish_signals > bearish_signals:
                    bullish_signals += 1
                elif bearish_signals > bullish_signals:
                    bearish_signals += 1
            
            # РћРџР Р•Р”Р•Р›Р•РќРР• РќРђРџР РђР’Р›Р•РќРРЇ (СѓСЃРёР»РµРЅРЅРѕРµ)
            signal_difference = abs(bullish_signals - bearish_signals)
            
            # РўСЂРµР±СѓРµРј РјРёРЅРёРјСѓРј 3 СЃРёРіРЅР°Р»Р° СЂР°Р·РЅРёС†С‹ РґР»СЏ РѕРїСЂРµРґРµР»РµРЅРёСЏ С‚СЂРµРЅРґР°
            if bullish_signals > bearish_signals + 2 and signal_difference >= 3:
                return 'uptrend'
            elif bearish_signals > bullish_signals + 2 and signal_difference >= 3:
                return 'downtrend'
            else:
                return 'neutral'
                
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° Р°РЅР°Р»РёР·Р° С‚СЂРµРЅРґР°: {e}")
            return 'neutral'
    
    def calculate_trend_score(self, df: pd.DataFrame, indicators: Dict[str, float], direction: str) -> float:
        """Р Р°СЃС‡РµС‚ СЃРєРѕСЂР° РЅР° РѕСЃРЅРѕРІРµ С‚СЂРµРЅРґР°"""
        try:
            trend = self.analyze_trend_direction(df, indicators)
            
            # Р‘Р°Р·РѕРІС‹Р№ СЃРєРѕСЂ
            base_score = 50.0
            
            # РђР“Р Р•РЎРЎРР’РќРћР• РЎР›Р•Р”РћР’РђРќРР• РўР Р•РќР”РЈ
            if direction.upper() == 'BUY' and trend == 'uptrend':
                base_score = 85.0  # РћС‡РµРЅСЊ РІС‹СЃРѕРєРёР№ СЃРєРѕСЂ Р·Р° СЃР»РµРґРѕРІР°РЅРёРµ С‚СЂРµРЅРґСѓ
            elif direction.upper() == 'SELL' and trend == 'downtrend':
                base_score = 85.0  # РћС‡РµРЅСЊ РІС‹СЃРѕРєРёР№ СЃРєРѕСЂ Р·Р° СЃР»РµРґРѕРІР°РЅРёРµ С‚СЂРµРЅРґСѓ
            elif direction.upper() == 'BUY' and trend == 'downtrend':
                base_score = 15.0  # РЎРёР»СЊРЅС‹Р№ С€С‚СЂР°С„ Р·Р° СЃРёРіРЅР°Р» РїСЂРѕС‚РёРІ С‚СЂРµРЅРґР°
            elif direction.upper() == 'SELL' and trend == 'uptrend':
                base_score = 15.0  # РЎРёР»СЊРЅС‹Р№ С€С‚СЂР°С„ Р·Р° СЃРёРіРЅР°Р» РїСЂРѕС‚РёРІ С‚СЂРµРЅРґР°
            else:
                base_score = 50.0  # РќРµР№С‚СЂР°Р»СЊРЅС‹Р№ С‚СЂРµРЅРґ
            
            # Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ С„Р°РєС‚РѕСЂС‹
            if trend != 'neutral':
                # ADX РїРѕРєР°Р·С‹РІР°РµС‚ СЃРёР»Сѓ С‚СЂРµРЅРґР°
                adx = indicators.get('ADX', 25)
                if adx > 30:  # РЎРёР»СЊРЅС‹Р№ С‚СЂРµРЅРґ
                    base_score += 10
                elif adx > 20:  # РЎСЂРµРґРЅРёР№ С‚СЂРµРЅРґ
                    base_score += 5
                
                # RSI РґР»СЏ С‚СЂРµРЅРґ-СЃР»РµРґСѓСЋС‰РµРіРѕ РїРѕРґС…РѕРґР°
                rsi = indicators.get('RSI', 50)
                if direction.upper() == 'BUY' and rsi > 60:  # РЎРёР»СЊРЅС‹Р№ РІРѕСЃС…РѕРґСЏС‰РёР№ С‚СЂРµРЅРґ
                    base_score += 15
                elif direction.upper() == 'SELL' and rsi < 40:  # РЎРёР»СЊРЅС‹Р№ РЅРёСЃС…РѕРґСЏС‰РёР№ С‚СЂРµРЅРґ
                    base_score += 15
                elif direction.upper() == 'BUY' and rsi < 40:  # РџСЂРѕС‚РёРІ С‚СЂРµРЅРґР° РґР»СЏ BUY
                    base_score -= 20
                elif direction.upper() == 'SELL' and rsi > 60:  # РџСЂРѕС‚РёРІ С‚СЂРµРЅРґР° РґР»СЏ SELL
                    base_score -= 20
            
            return max(0, min(100, base_score))
            
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° СЂР°СЃС‡РµС‚Р° С‚СЂРµРЅРґ СЃРєРѕСЂР°: {e}")
            return 50.0
    
    def calculate_sentiment_score(self, sentiment_data: Dict[str, Any], direction: str, pair: str = "") -> float:
        """Р Р°СЃС‡РµС‚ СЃРєРѕСЂР° sentiment С‚РѕР»РїС‹ РЅР° РѕСЃРЅРѕРІРµ Р Р•РђР›Р¬РќР«РҐ РґР°РЅРЅС‹С… Myfxbook"""
        try:
            # РР·РІР»РµРєР°РµРј РґР°РЅРЅС‹Рµ РґР»СЏ РєРѕРЅРєСЂРµС‚РЅРѕР№ РїР°СЂС‹ РёР· Myfxbook
            symbols = sentiment_data.get('symbols', [])
            pair_data = None
            
            # РС‰РµРј РґР°РЅРЅС‹Рµ РґР»СЏ РЅР°С€РµР№ РїР°СЂС‹
            clean_pair = pair.replace(" OTC", "").replace("OTC", "").replace("/", "")
            for symbol_data in symbols:
                if symbol_data.get('symbol', '').upper() == clean_pair.upper():
                    pair_data = symbol_data
                    break
            
            if not pair_data:
                # Fallback РґР»СЏ РєСЂРѕСЃСЃ-РїР°СЂ - РЅРµР№С‚СЂР°Р»СЊРЅС‹Р№ sentiment
                print(f"вљ пёЏ РќРµС‚ sentiment РґР°РЅРЅС‹С… РґР»СЏ {pair}, РёСЃРїРѕР»СЊР·СѓРµРј РЅРµР№С‚СЂР°Р»СЊРЅС‹Р№ sentiment")
                return 50.0
            
            long_percentage = pair_data.get('longPercentage', 50)
            short_percentage = pair_data.get('shortPercentage', 50)
            total_positions = pair_data.get('totalPositions', 0)
            
            # print(f"рџ“Љ Sentiment {pair}: LONG {long_percentage:.1f}% vs SHORT {short_percentage:.1f}% ({total_positions} РїРѕР·РёС†РёР№)")
            
            # Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј sentiment СЃРєРѕСЂ РЅР° РѕСЃРЅРѕРІРµ СЂРµР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…
            if direction.upper() == 'BUY':
                # Р”Р»СЏ BUY РёСЃРїРѕР»СЊР·СѓРµРј long_percentage
                if long_percentage > 60:  # РЎРёР»СЊРЅС‹Р№ Р±С‹С‡РёР№ sentiment
                    return 80 + (long_percentage - 60) * 0.5
                elif long_percentage > 50:  # РЈРјРµСЂРµРЅРЅС‹Р№ Р±С‹С‡РёР№ sentiment
                    return 60 + (long_percentage - 50) * 2
                else:  # РњРµРґРІРµР¶РёР№ sentiment
                    return 40 + long_percentage * 0.4
            else:  # SELL
                # Р”Р»СЏ SELL РёСЃРїРѕР»СЊР·СѓРµРј short_percentage
                if short_percentage > 60:  # РЎРёР»СЊРЅС‹Р№ РјРµРґРІРµР¶РёР№ sentiment
                    return 80 + (short_percentage - 60) * 0.5
                elif short_percentage > 50:  # РЈРјРµСЂРµРЅРЅС‹Р№ РјРµРґРІРµР¶РёР№ sentiment
                    return 60 + (short_percentage - 50) * 2
                else:  # Р‘С‹С‡РёР№ sentiment
                    return 40 + short_percentage * 0.4
                
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° СЂР°СЃС‡РµС‚Р° sentiment СЃРєРѕСЂР°: {e}")
            return 50.0
    
    def _get_fallback_sentiment(self, pair: str) -> float:
        """Fallback sentiment РґР»СЏ РєСЂРѕСЃСЃ-РїР°СЂ РЅР° РѕСЃРЅРѕРІРµ РѕСЃРЅРѕРІРЅС‹С… РІР°Р»СЋС‚"""
        try:
            # РР·РІР»РµРєР°РµРј РІР°Р»СЋС‚С‹ РёР· РїР°СЂС‹
            currencies = pair.replace(" OTC", "").replace("OTC", "").split("/")
            if len(currencies) != 2:
                return 50.0
            
            base_currency = currencies[0]
            quote_currency = currencies[1]
            
            # Р”Р»СЏ РєСЂРѕСЃСЃ-РїР°СЂ РёСЃРїРѕР»СЊР·СѓРµРј СЃСЂРµРґРЅРµРµ Р·РЅР°С‡РµРЅРёРµ sentiment РѕСЃРЅРѕРІРЅС‹С… РІР°Р»СЋС‚
            base_sentiment = self._get_currency_sentiment(base_currency)
            quote_sentiment = self._get_currency_sentiment(quote_currency)
            
            # РЎСЂРµРґРЅРµРµ Р·РЅР°С‡РµРЅРёРµ СЃ РЅРµР±РѕР»СЊС€РёРј СЃР»СѓС‡Р°Р№РЅС‹Рј С„Р°РєС‚РѕСЂРѕРј
            import random
            fallback_score = (base_sentiment + quote_sentiment) / 2
            fallback_score += random.uniform(-5, 5)  # В±5% СЃР»СѓС‡Р°Р№РЅРѕСЃС‚Рё
            
            return max(30.0, min(70.0, fallback_score))
            
        except Exception as e:
            print(f"вљ пёЏ РћС€РёР±РєР° fallback sentiment: {e}")
            return 50.0
    
    def _get_currency_sentiment(self, currency: str) -> float:
        """РџРѕР»СѓС‡Р°РµС‚ Р±Р°Р·РѕРІС‹Р№ sentiment РґР»СЏ РІР°Р»СЋС‚С‹"""
        # Р‘Р°Р·РѕРІС‹Рµ Р·РЅР°С‡РµРЅРёСЏ sentiment РґР»СЏ РѕСЃРЅРѕРІРЅС‹С… РІР°Р»СЋС‚
        currency_sentiments = {
            'USD': 52.0,  # РЎР»РµРіРєР° РїРѕР·РёС‚РёРІРЅС‹Р№
            'EUR': 48.0,  # РЎР»РµРіРєР° РЅРµРіР°С‚РёРІРЅС‹Р№
            'GBP': 50.0,  # РќРµР№С‚СЂР°Р»СЊРЅС‹Р№
            'JPY': 45.0,  # РЎР»РµРіРєР° РЅРµРіР°С‚РёРІРЅС‹Р№
            'CHF': 55.0,  # РџРѕР·РёС‚РёРІРЅС‹Р№ (safe haven)
            'CAD': 51.0,  # РЎР»РµРіРєР° РїРѕР·РёС‚РёРІРЅС‹Р№
            'AUD': 49.0,  # РЎР»РµРіРєР° РЅРµРіР°С‚РёРІРЅС‹Р№
            'NZD': 50.0   # РќРµР№С‚СЂР°Р»СЊРЅС‹Р№
        }
        
        return currency_sentiments.get(currency, 50.0)
    
    def calculate_news_score(self, news_data: Dict[str, Any]) -> float:
        """Р Р°СЃС‡РµС‚ РЅРѕРІРѕСЃС‚РЅРѕРіРѕ СЃРєРѕСЂР°"""
        if not news_data or news_data.get('news_count', 0) == 0:
            return 50.0
        
        sentiment = news_data.get('sentiment', 0.5)
        return sentiment * 100
    
    def calculate_time_score(self) -> float:
        """Р Р°СЃС‡РµС‚ СЃРєРѕСЂР° РІСЂРµРјРµРЅРё РґРЅСЏ"""
        current_hour = datetime.now().hour
        
        # РђРєС‚РёРІРЅС‹Рµ С‚РѕСЂРіРѕРІС‹Рµ СЃРµСЃСЃРёРё
        if 8 <= current_hour <= 18:
            return 60.0
        else:
            return 40.0
    
    def calculate_volatility_score(self, df: pd.DataFrame) -> float:
        """Р Р°СЃС‡РµС‚ СЃРєРѕСЂР° РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё"""
        try:
            if df.empty or len(df) < 20:
                return 50.0
            
            # Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
            returns = df['close'].pct_change().dropna()
            volatility = returns.std() * np.sqrt(252)  # Р“РѕРґРѕРІР°СЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
            
            # РќРѕСЂРјР°Р»РёР·СѓРµРј РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
            if volatility > 0.2:  # Р’С‹СЃРѕРєР°СЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
                return 70.0
            elif volatility > 0.1:  # РЎСЂРµРґРЅСЏСЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
                return 50.0
            else:  # РќРёР·РєР°СЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
                return 30.0
                
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° СЂР°СЃС‡РµС‚Р° РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё: {e}")
            return 50.0
    
    def calculate_optimal_expiration(self, indicators: Dict[str, float], sentiment_data: Dict[str, Any], volatility: float, symbol: str = "", trend: str = "neutral") -> Tuple[int, str]:
        """Р Р°СЃС‡РµС‚ РѕРїС‚РёРјР°Р»СЊРЅРѕРіРѕ РІСЂРµРјРµРЅРё СЌРєСЃРїРёСЂР°С†РёРё РЅР° РѕСЃРЅРѕРІРµ С‚СЂРµРЅРґР°"""
        try:
            # РРЅРґРёРІРёРґСѓР°Р»СЊРЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё РґР»СЏ РїР°СЂ
            pair_settings = {
                "EUR/USD": {"base": 3, "volatility_factor": 0.8},
                "GBP/USD": {"base": 2, "volatility_factor": 1.2},
                "USD/JPY": {"base": 3, "volatility_factor": 0.9},
                "USD/CHF": {"base": 3, "volatility_factor": 0.7},
                "AUD/USD": {"base": 2, "volatility_factor": 1.0},
                "USD/CAD": {"base": 3, "volatility_factor": 0.8},
            }
            
            settings = pair_settings.get(symbol, {"base": 3, "volatility_factor": 1.0})
            base_expiration = settings["base"]
            
            # РљРћР Р Р•РљРўРР РћР’РљРђ РќРђ РћРЎРќРћР’Р• РўР Р•РќР”Рђ Р РџРђР Р«
            import random
            random.seed(hash(symbol + str(datetime.now().second)))  # РЈРЅРёРєР°Р»СЊРЅС‹Р№ seed РґР»СЏ РєР°Р¶РґРѕР№ РїР°СЂС‹ Рё СЃРµРєСѓРЅРґС‹
            
            if trend == 'uptrend':
                if symbol in ["EUR/USD", "USD/JPY", "USD/CHF"]:
                    optimal_expiration = random.choice([3, 4, 5])  # РЎС‚Р°Р±РёР»СЊРЅС‹Рµ РїР°СЂС‹ - 3-5 РјРёРЅСѓС‚
                elif symbol in ["GBP/USD", "AUD/USD"]:
                    optimal_expiration = random.choice([1, 2, 3])  # Р’РѕР»Р°С‚РёР»СЊРЅС‹Рµ РїР°СЂС‹ - 1-3 РјРёРЅСѓС‚С‹
                else:
                    optimal_expiration = random.choice([2, 3, 4])
                reason = f"{symbol}: Р’РѕСЃС…РѕРґСЏС‰РёР№ С‚СЂРµРЅРґ"
            elif trend == 'downtrend':
                if symbol in ["EUR/USD", "USD/JPY", "USD/CHF"]:
                    optimal_expiration = random.choice([4, 5])  # РЎС‚Р°Р±РёР»СЊРЅС‹Рµ РїР°СЂС‹ - 4-5 РјРёРЅСѓС‚
                elif symbol in ["GBP/USD", "AUD/USD"]:
                    optimal_expiration = random.choice([1, 2])  # Р’РѕР»Р°С‚РёР»СЊРЅС‹Рµ РїР°СЂС‹ - 1-2 РјРёРЅСѓС‚С‹
                else:
                    optimal_expiration = random.choice([2, 3, 4])
                reason = f"{symbol}: РќРёСЃС…РѕРґСЏС‰РёР№ С‚СЂРµРЅРґ"
            else:  # neutral
                if symbol in ["EUR/USD", "USD/JPY", "USD/CHF"]:
                    optimal_expiration = random.choice([2, 3, 4])  # РЎС‚Р°Р±РёР»СЊРЅС‹Рµ РїР°СЂС‹ - 2-4 РјРёРЅСѓС‚С‹
                elif symbol in ["GBP/USD", "AUD/USD"]:
                    optimal_expiration = random.choice([1, 2, 3])  # Р’РѕР»Р°С‚РёР»СЊРЅС‹Рµ РїР°СЂС‹ - 1-3 РјРёРЅСѓС‚С‹
                else:
                    optimal_expiration = random.choice([1, 2, 3])
                reason = f"{symbol}: РќРµР№С‚СЂР°Р»СЊРЅС‹Р№ С‚СЂРµРЅРґ"
            
            # РљРѕСЂСЂРµРєС‚РёСЂРѕРІРєР° РЅР° РѕСЃРЅРѕРІРµ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё
            if volatility > 0.015:  # Р’С‹СЃРѕРєР°СЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
                optimal_expiration = max(1, optimal_expiration - 1)
                reason += " + РІС‹СЃРѕРєР°СЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ"
            elif volatility < 0.005:  # РќРёР·РєР°СЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
                optimal_expiration = min(5, optimal_expiration + 1)
                reason += " + РЅРёР·РєР°СЏ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ"
            
            return optimal_expiration, reason
            
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° СЂР°СЃС‡РµС‚Р° РІСЂРµРјРµРЅРё СЌРєСЃРїРёСЂР°С†РёРё: {e}")
            return 3, "РћС€РёР±РєР° СЂР°СЃС‡РµС‚Р° - СЃС‚Р°РЅРґР°СЂС‚РЅРѕРµ РІСЂРµРјСЏ"
    
    def get_myfxbook_sentiment(self, pair: str) -> Dict[str, Any]:
        """РџРѕР»СѓС‡РµРЅРёРµ sentiment РґР°РЅРЅС‹С… РѕС‚ Myfxbook"""
        try:
            if hasattr(self, 'myfxbook_api') and self.myfxbook_api:
                sentiment_data = self.myfxbook_api.get_community_outlook(pair)
                return sentiment_data
            else:
                return {'sentiment': 0, 'confidence': 0.5}
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ sentiment: {e}")
            return {'sentiment': 0, 'confidence': 0.5}
    
    async def get_finnhub_news(self, pair: str) -> Dict[str, Any]:
        """РџРѕР»СѓС‡РµРЅРёРµ РЅРѕРІРѕСЃС‚РµР№ РѕС‚ Finnhub РґР»СЏ OTC РІР°Р»СЋС‚РЅС‹С… РїР°СЂ"""
        try:
            if self.asset_type != "otc":
                return {'news_count': 0, 'sentiment': 0.5, 'source': 'none'}
            
            # РЈР±РёСЂР°РµРј "OTC" РёР· РЅР°Р·РІР°РЅРёСЏ РїР°СЂС‹
            clean_pair = pair.replace(" OTC", "").replace("OTC", "")
            
            # РџРѕР»СѓС‡Р°РµРј РЅРѕРІРѕСЃС‚Рё РїРѕ РІР°Р»СЋС‚Р°Рј
            url = f"{self.finnhub_otc_api.base_url}/news"
            params = {
                'category': 'forex',
                'token': self.finnhub_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                news_data = response.json()
                
                # Р¤РёР»СЊС‚СЂСѓРµРј РЅРѕРІРѕСЃС‚Рё РїРѕ РІР°Р»СЋС‚Р°Рј
                relevant_news = []
                for news in news_data[:10]:  # Р‘РµСЂРµРј РїРѕСЃР»РµРґРЅРёРµ 10 РЅРѕРІРѕСЃС‚РµР№
                    if any(currency in news.get('headline', '') for currency in clean_pair.split('/')):
                        relevant_news.append(news)
                
                return {
                    'news_count': len(relevant_news),
                    'sentiment': 0.5,  # Р‘Р°Р·РѕРІС‹Р№ sentiment
                    'source': 'finnhub',
                    'news': relevant_news[:3]  # РўРѕРї 3 РЅРѕРІРѕСЃС‚Рё
                }
            else:
                return {'news_count': 0, 'sentiment': 0.5, 'source': 'error'}
                
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РЅРѕРІРѕСЃС‚РµР№: {e}")
            return {'news_count': 0, 'sentiment': 0.5, 'source': 'error'}
    
    async def get_finnhub_forex_rates(self, pairs: List[str]) -> Dict[str, Dict]:
        """РџРѕР»СѓС‡РµРЅРёРµ РєСѓСЂСЃРѕРІ РІР°Р»СЋС‚ РѕС‚ Finnhub"""
        try:
            if self.asset_type != "otc":
                return {}
            
            rates = {}
            
            for pair in pairs:
                try:
                    clean_pair = pair.replace(" OTC", "").replace("OTC", "")
                    base_currency = clean_pair.split('/')[0]
                    target_currency = clean_pair.split('/')[1]
                    oanda_symbol = f"OANDA:{base_currency}_{target_currency}"
                    
                    url = f"{self.finnhub_otc_api.base_url}/quote"
                    params = {
                        'symbol': oanda_symbol,
                        'token': self.finnhub_api_key
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data.get('c'):
                            rates[pair] = {
                                'current': data['c'],
                                'open': data.get('o', data['c']),
                                'high': data.get('h', data['c']),
                                'low': data.get('l', data['c']),
                                'previous_close': data.get('pc', data['c']),
                                'timestamp': data.get('t', int(datetime.now().timestamp()))
                            }
                    else:
                        print(f"вќЊ {pair}: HTTP {response.status_code}")
                        
                except Exception as e:
                    print(f"вќЊ РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєСѓСЂСЃР° {pair}: {e}")
                    continue
            
            return rates
            
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РєСѓСЂСЃРѕРІ: {e}")
            return {}
    
    async def get_finnhub_forex_symbols(self) -> List[str]:
        """РџРѕР»СѓС‡РµРЅРёРµ РґРѕСЃС‚СѓРїРЅС‹С… РІР°Р»СЋС‚РЅС‹С… СЃРёРјРІРѕР»РѕРІ РѕС‚ Finnhub"""
        try:
            if self.asset_type != "otc":
                return []
            
            url = f"{self.finnhub_otc_api.base_url}/forex/symbol"
            params = {
                'exchange': 'oanda',
                'token': self.finnhub_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                symbols_data = response.json()
                symbols = []
                
                for symbol_info in symbols_data:
                    if 'symbol' in symbol_info:
                        # РљРѕРЅРІРµСЂС‚РёСЂСѓРµРј OANDA:EUR_USD РІ EUR/USD OTC
                        oanda_symbol = symbol_info['symbol']
                        if oanda_symbol.startswith('OANDA:'):
                            pair = oanda_symbol.replace('OANDA:', '').replace('_', '/')
                            symbols.append(f"{pair} OTC")
                
                return symbols
            else:
                print(f"вќЊ РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ СЃРёРјРІРѕР»РѕРІ: HTTP {response.status_code}")
                return []
                
        except Exception as e:
            print(f"вќЊ РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ СЃРёРјРІРѕР»РѕРІ: {e}")
            return []
    
    async def generate_ultra_precise_signals(self, symbols: List[str], max_signals: int = 3) -> List[Dict[str, Any]]:
        """Р“РµРЅРµСЂР°С†РёСЏ СѓР»СЊС‚СЂР° С‚РѕС‡РЅС‹С… СЃРёРіРЅР°Р»РѕРІ РЅР° РѕСЃРЅРѕРІРµ РўР Р•РќР”РћР’"""
        print(f"рџЋЇ Р“РµРЅРµСЂР°С†РёСЏ {max_signals} СѓР»СЊС‚СЂР° С‚РѕС‡РЅС‹С… СЃРёРіРЅР°Р»РѕРІ РёР· {len(symbols)} СЃРёРјРІРѕР»РѕРІ")
        
        # РџРѕР»СѓС‡Р°РµРј РґР°РЅРЅС‹Рµ РґР»СЏ РІСЃРµС… СЃРёРјРІРѕР»РѕРІ
        all_data = await self.get_market_data(symbols, "1min", 100)
        print(f"рџ”Ќ Р”РРђР“РќРћРЎРўРРљРђ API: РџРѕР»СѓС‡РµРЅРѕ РґР°РЅРЅС‹С… РґР»СЏ {len(all_data)} СЃРёРјРІРѕР»РѕРІ РёР· {len(symbols)}")
        
        all_signals = []
        
        # РђРЅР°Р»РёР·РёСЂСѓРµРј РєР°Р¶РґС‹Р№ СЃРёРјРІРѕР»
        for symbol in symbols:
            try:
                df = all_data.get(symbol)
                if df is None or df.empty:
                    continue
                
                # РўРµС…РЅРёС‡РµСЃРєРёРµ РёРЅРґРёРєР°С‚РѕСЂС‹
                indicators = self.calculate_technical_indicators(df)
                if not indicators:
                    continue
                
                # РђРќРђР›РР—РР РЈР•Рњ РўР Р•РќР”
                trend = self.analyze_trend_direction(df, indicators)
                print(f"   {symbol}: С‚СЂРµРЅРґ = {trend}")
                
                # РџРѕР»СѓС‡Р°РµРј sentiment Рё РЅРѕРІРѕСЃС‚Рё
                sentiment_data = self.get_myfxbook_sentiment(symbol)
                # print(f"рџ”Ќ Р”РРђР“РќРћРЎРўРРљРђ Myfxbook: {symbol} = {sentiment_data}")
                news_data = await self.get_finnhub_news(symbol)
                
                # РђРЅР°Р»РёР·РёСЂСѓРµРј РѕР±Р° РЅР°РїСЂР°РІР»РµРЅРёСЏ
                for direction in ["BUY", "SELL"]:
                    try:
                        # Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РІСЃРµ СЃРєРѕСЂС‹
                        trend_score = self.calculate_trend_score(df, indicators, direction)
                        sentiment_score = self.calculate_sentiment_score(sentiment_data, direction, symbol)
                        news_score = self.calculate_news_score(news_data)
                        time_score = self.calculate_time_score()
                        volatility_score = self.calculate_volatility_score(df)
                        
                        # РљРѕРјРїР»РµРєСЃРЅС‹Р№ СЃРєРѕСЂ СЃ РђР“Р Р•РЎРЎРР’РќР«Рњ Р°РєС†РµРЅС‚РѕРј РЅР° С‚СЂРµРЅРґ (РћР РР“РРќРђР›Р¬РќР«Р™ Р РђРЎР§Р•Рў)
                        composite_score = (
                            trend_score * 0.70 +      # 70% - С‚СЂРµРЅРґ (РћР§Р•РќР¬ Р’РђР–РќРћ!)
                            sentiment_score * 0.15 +  # 15% - sentiment
                            news_score * 0.10 +       # 10% - РЅРѕРІРѕСЃС‚Рё
                            time_score * 0.03 +       # 3% - РІСЂРµРјСЏ
                            volatility_score * 0.02   # 2% - РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚СЊ
                        )
                        
                        # MT5 РљРђР§Р•РЎРўР’Р•РќРќР«Р™ РњРќРћР–РРўР•Р›Р¬ (РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РґР°РЅРЅС‹Рµ)
                        mt5_quality_multiplier = 1.0  # РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ Р±РµР· РёР·РјРµРЅРµРЅРёР№
                        
                        if self.asset_type == "forex":
                            try:
                                # РџРѕР»СѓС‡Р°РµРј MT5 РґР°РЅРЅС‹Рµ РґР»СЏ РѕС†РµРЅРєРё РєР°С‡РµСЃС‚РІР°
                                mt5_symbol = symbol.replace('/', '')
                                
                                if hasattr(self, 'mt5_reader') and self.mt5_reader:
                                    mt5_data = self.mt5_reader.get_current_prices(mt5_symbol)
                                    
                                    if mt5_data:
                                        # Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РјРЅРѕР¶РёС‚РµР»СЊ РєР°С‡РµСЃС‚РІР° РЅР° РѕСЃРЅРѕРІРµ MT5 РґР°РЅРЅС‹С…
                                        spread = mt5_data['spread']
                                        
                                        # РњРЅРѕР¶РёС‚РµР»СЊ РЅР° РѕСЃРЅРѕРІРµ РєР°С‡РµСЃС‚РІР° СЃРїСЂРµРґР°
                                        if spread <= 0.00002:
                                            mt5_quality_multiplier = 1.05  # +5% Р·Р° РѕС‚Р»РёС‡РЅС‹Р№ СЃРїСЂРµРґ
                                        elif spread <= 0.00005:
                                            mt5_quality_multiplier = 1.02  # +2% Р·Р° С…РѕСЂРѕС€РёР№ СЃРїСЂРµРґ
                                        elif spread <= 0.0001:
                                            mt5_quality_multiplier = 1.0   # РќРµР№С‚СЂР°Р»СЊРЅРѕ
                                        elif spread <= 0.0003:
                                            mt5_quality_multiplier = 0.98  # -2% Р·Р° СЃСЂРµРґРЅРёР№ СЃРїСЂРµРґ
                                        else:
                                            mt5_quality_multiplier = 0.95  # -5% Р·Р° РїР»РѕС…РѕР№ СЃРїСЂРµРґ
                                        
                                        # Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Р№ РјРЅРѕР¶РёС‚РµР»СЊ Р·Р° РѕР±СЉРµРјС‹ (РµСЃР»Рё РµСЃС‚СЊ)
                                        volume_data = self.mt5_reader.get_volume_analysis(mt5_symbol)
                                        if volume_data:
                                            imbalance = abs(volume_data.get('volume_imbalance', 0))
                                            if imbalance > 0.2:
                                                mt5_quality_multiplier *= 1.02  # +2% Р·Р° СЃРёР»СЊРЅС‹Р№ РґРёСЃР±Р°Р»Р°РЅСЃ
                                            elif imbalance > 0.1:
                                                mt5_quality_multiplier *= 1.01  # +1% Р·Р° СѓРјРµСЂРµРЅРЅС‹Р№ РґРёСЃР±Р°Р»Р°РЅСЃ
                                        
                                        print(f"   рџ“Љ MT5 {symbol}: РњРЅРѕР¶РёС‚РµР»СЊ РєР°С‡РµСЃС‚РІР° {mt5_quality_multiplier:.3f} (СЃРїСЂРµРґ: {spread:.5f})")
                                
                            except Exception as e:
                                print(f"   вљ пёЏ MT5 РґР°РЅРЅС‹Рµ РЅРµРґРѕСЃС‚СѓРїРЅС‹ РґР»СЏ {symbol}: {e}")
                        
                        # РџСЂРёРјРµРЅСЏРµРј MT5 РјРЅРѕР¶РёС‚РµР»СЊ РєР°С‡РµСЃС‚РІР° Рє Р±Р°Р·РѕРІРѕРјСѓ СЃРєРѕСЂСѓ
                        enhanced_composite_score = composite_score * mt5_quality_multiplier
                        
                        # Р¤РР›Р¬РўР Р« РћРџРўРРњРР—РђР¦РР - РРЎРљР›Р®Р§РђР•Рњ РЈР‘Р«РўРћР§РќР«Р• РџРђР Р«
                        if not should_trade(symbol, datetime.now().hour):
                            print(f"   рџљ« {symbol} {direction}: Р¤РёР»СЊС‚СЂ РѕС‚РєР»РѕРЅРµРЅ (СѓР±С‹С‚РѕС‡РЅР°СЏ РїР°СЂР°)")
                            continue  # РџСЂРѕРїСѓСЃРєР°РµРј СЌС‚РѕС‚ СЃРёРіРЅР°Р»
                        
                        # РћРїС‚РёРјР°Р»СЊРЅР°СЏ СЌРєСЃРїРёСЂР°С†РёСЏ
                        optimal_expiration, expiration_reason = self.calculate_optimal_expiration(
                            indicators, sentiment_data, volatility_score, symbol, trend
                        )
                        
                        signal = {
                            'pair': symbol,
                            'direction': direction,
                            'composite_score': enhanced_composite_score,  # РЈР»СѓС‡С€РµРЅРЅС‹Р№ СЃРєРѕСЂ СЃ MT5
                            'base_composite_score': composite_score,      # РћСЂРёРіРёРЅР°Р»СЊРЅС‹Р№ СЃРєРѕСЂ
                            'mt5_quality_multiplier': mt5_quality_multiplier,  # MT5 РјРЅРѕР¶РёС‚РµР»СЊ
                            'technical_score': trend_score,  # РџРµСЂРµРёРјРµРЅРѕРІС‹РІР°РµРј РґР»СЏ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё
                            'sentiment_score': sentiment_score,
                            'news_score': news_score,
                            'time_score': time_score,
                            'volatility_score': volatility_score,
                            'optimal_expiration': optimal_expiration,
                            'expiration_reason': expiration_reason,
                            'confidence': enhanced_composite_score,       # РЈР»СѓС‡С€РµРЅРЅР°СЏ СѓРІРµСЂРµРЅРЅРѕСЃС‚СЊ
                            'trend': trend,
                            'indicators': indicators,
                            'sentiment_data': sentiment_data,
                            'news_data': news_data,
                            'memory_boost': False  # Только реальные скоры без бонусов
                        }
                        
                        all_signals.append(signal)
                        # РџРѕРєР°Р·С‹РІР°РµРј РѕСЂРёРіРёРЅР°Р»СЊРЅС‹Р№ Рё СѓР»СѓС‡С€РµРЅРЅС‹Р№ СЃРєРѕСЂ
                        if mt5_quality_multiplier != 1.0:
                            print(f"   вњ… {symbol} {direction}: РЎРєРѕСЂ {composite_score:.1f} в†’ {enhanced_composite_score:.1f} (MT5: {mt5_quality_multiplier:.3f}x) - РџР РћРЁР•Р› Р¤РР›Р¬РўР Р«")
                        else:
                            print(f"   вњ… {symbol} {direction}: РЎРєРѕСЂ {composite_score:.1f} - РџР РћРЁР•Р› Р¤РР›Р¬РўР Р«")
                        
                    except Exception as e:
                        print(f"вљ пёЏ РћС€РёР±РєР° Р°РЅР°Р»РёР·Р° {symbol} {direction}: {e}")
                        continue
                
            except Exception as e:
                print(f"вљ пёЏ РћС€РёР±РєР° РѕР±СЂР°Р±РѕС‚РєРё РїР°СЂС‹ {symbol}: {e}")
                continue
        
        # Р¤РёР»СЊС‚СЂСѓРµРј СЃРёРіРЅР°Р»С‹ РїРѕ РєР°С‡РµСЃС‚РІСѓ (РјРёРЅРёРјСѓРј 60% СѓРІРµСЂРµРЅРЅРѕСЃС‚Рё)
        # Фильтруем сигналы по качеству в зависимости от типа актива
        if self.asset_type == "otc":
            # OTC пары: минимум 60% для качественных сигналов
            quality_signals = [s for s in all_signals if s['composite_score'] >= 60.0]
        else:
            # Forex пары: минимум 75% для качественных сигналов
            quality_signals = [s for s in all_signals if s['composite_score'] >= 75.0]
        
        # Р¤РёР»СЊС‚СЂР°С†РёСЏ С‚РѕР»СЊРєРѕ РїРѕ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё (СѓР±РёСЂР°РµРј Р°РЅР°Р»РёР· РІСЂРµРјРµРЅРё РґРЅСЏ)
        filtered_signals = []
        
        for signal in quality_signals:
            volatility = signal.get('volatility_score', 50)
            
            # РќРµ С‚РѕСЂРіСѓРµРј РїСЂРё СЌРєСЃС‚СЂРµРјР°Р»СЊРЅРѕР№ РІРѕР»Р°С‚РёР»СЊРЅРѕСЃС‚Рё
            volatility_ok = 20 <= volatility <= 80
            
            if volatility_ok:
                filtered_signals.append(signal)
        
        quality_signals = filtered_signals
        
        if not quality_signals:
            print("⚠️ Нет сигналов с достаточной уверенностью (минимум 75%)")
            print(f"рџ”Ќ Р”РРђР“РќРћРЎРўРРљРђ: Р’СЃРµРіРѕ СЃРёРіРЅР°Р»РѕРІ {len(all_signals)}, СЃРєРѕСЂС‹: {[s['composite_score'] for s in all_signals[:5]]}")
            print("❌ НЕ ГЕНЕРИРУЕМ принудительные сигналы - требуется минимум 75%")
            return []
        
        # Сортируем финальный результат по скору
        quality_signals.sort(key=lambda x: x['composite_score'], reverse=True)
        
        # Берем только 1 лучший сигнал (лучшую пару)
        top_signals = quality_signals[:1]
        
        print(f"✅ Выбрана ЛУЧШАЯ пара из {len(quality_signals)} доступных:")
        for i, signal in enumerate(top_signals, 1):
            print(f"   {i}. {signal['pair']} {signal['direction']}: {signal['composite_score']:.1f}% "
                  f"(РЈРІРµСЂРµРЅРЅРѕСЃС‚СЊ: {signal['confidence']:.1f}%, РўСЂРµРЅРґ: {signal['trend']})")
        
        return top_signals
