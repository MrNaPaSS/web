#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Technical Analyzer - Расширенный модуль технического анализа
- Загрузка OHLCV с TwelveData
- Локальный расчет всех индикаторов
- Готовый DataFrame с результатами

Скопировано из основного торгового бота для отдельного использования
"""

import pandas as pd
import requests
from typing import Dict, List, Optional, Any
import time
import logging

# Импорт talib для индикаторов
try:
    import talib
    TALIB_AVAILABLE = True
except ImportError:
    print("❌ TA-Lib не установлен. Установите: pip install TA-Lib")
    TALIB_AVAILABLE = False

class TechnicalAnalyzer:
    """Класс для технического анализа с локальными индикаторами"""
    
    def __init__(self, twelvedata_api_key: str):
        self.api_key = twelvedata_api_key
        self.cache = {}
        self.cache_timeout = 0  # кэш полностью отключен
        
    def fetch_ohlcv(self, symbol: str = "EUR/USD", interval: str = "5min", bars: int = 100) -> pd.DataFrame:
        """Запрос свечей с TwelveData"""
        try:
            url = "https://api.twelvedata.com/time_series"
            params = {
                "symbol": symbol,
                "interval": interval,
                "outputsize": bars,
                "apikey": self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if "values" not in data:
                raise Exception(f"[Ошибка]: {data.get('message', 'Нет данных')}")
            
            df = pd.DataFrame(data["values"])
            df["datetime"] = pd.to_datetime(df["datetime"])
            df.set_index("datetime", inplace=True)
            df = df.astype(float).sort_index()
            
            return df
            
        except Exception as e:
            print(f"❌ Ошибка загрузки OHLCV для {symbol}: {e}")
            return pd.DataFrame()
    
    def calculate_all_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Вычисление всех технических индикаторов"""
        if not TALIB_AVAILABLE:
            print("❌ TA-Lib недоступен, индикаторы не рассчитаны")
            return df
            
        try:
            # Конвертируем в numpy arrays
            high = df["high"].values.astype(float)
            low = df["low"].values.astype(float)
            close = df["close"].values.astype(float)
            volume = df.get("volume", pd.Series([1000] * len(df))).values.astype(float)
            
            # RSI
            df["RSI"] = talib.RSI(close, timeperiod=14)
            
            # EMA
            df["EMA_20"] = talib.EMA(close, timeperiod=20)
            df["EMA_50"] = talib.EMA(close, timeperiod=50)
            
            # MACD
            macd, macd_signal, macd_hist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
            df["MACD"] = macd
            df["MACD_signal"] = macd_signal
            df["MACD_histogram"] = macd_hist
            
            # Bollinger Bands
            bb_upper, bb_middle, bb_lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2)
            df["BB_upper"] = bb_upper
            df["BB_middle"] = bb_middle
            df["BB_lower"] = bb_lower
            
            # CCI
            df["CCI"] = talib.CCI(high, low, close, timeperiod=20)
            
            # ADX
            df["ADX"] = talib.ADX(high, low, close, timeperiod=14)
            df["ADX_POS"] = talib.PLUS_DI(high, low, close, timeperiod=14)
            df["ADX_NEG"] = talib.MINUS_DI(high, low, close, timeperiod=14)
            
            # Stochastic Oscillator
            stoch_k, stoch_d = talib.STOCH(high, low, close, fastk_period=14, slowk_period=3, slowd_period=3)
            df["Stoch_K"] = stoch_k
            df["Stoch_D"] = stoch_d
            
            # Williams %R
            df["WilliamsR"] = talib.WILLR(high, low, close, timeperiod=14)
            
            # MFI (Money Flow Index)
            df["MFI"] = talib.MFI(high, low, close, volume, timeperiod=14)
            
            # ATR
            df["ATR"] = talib.ATR(high, low, close, timeperiod=14)
            
            # OBV (On Balance Volume)
            df["OBV"] = talib.OBV(close, volume)
            
            # AD (Accumulation/Distribution Line)
            df["AD"] = talib.AD(high, low, close, volume)
            
            # SMA
            df["SMA_20"] = talib.SMA(close, timeperiod=20)
            df["SMA_50"] = talib.SMA(close, timeperiod=50)
            
            return df
            
        except Exception as e:
            print(f"❌ Ошибка расчета индикаторов: {e}")
            return df
    
    def get_technical_analysis(self, symbol: str = "EUR/USD", interval: str = "5min") -> pd.DataFrame:
        """Получение полного технического анализа"""
        try:
            # Кэш отключен — всегда загружаем свежие данные
            
            # Загружаем данные
            df = self.fetch_ohlcv(symbol, interval)
            if df.empty:
                return df
            
            # Рассчитываем индикаторы
            df = self.calculate_all_indicators(df)
            
            # Кэш отключен — не сохраняем
            
            return df
            
        except Exception as e:
            print(f"❌ Ошибка технического анализа для {symbol}: {e}")
            return pd.DataFrame()
    
    def analyze_signal(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Анализ сигнала на основе индикаторов"""
        try:
            if df.empty or len(df) < 20:
                return {"signal": "NEUTRAL", "confidence": 0.0, "reason": "Недостаточно данных"}
            
            latest = df.iloc[-1]
            signals = []
            confidences = []
            
            # RSI анализ
            rsi = latest.get("RSI", 50)
            if rsi < 30:
                signals.append("BUY")
                confidences.append(0.8)
            elif rsi > 70:
                signals.append("SELL")
                confidences.append(0.8)
            else:
                signals.append("NEUTRAL")
                confidences.append(0.3)
            
            # MACD анализ
            macd = latest.get("MACD", 0)
            macd_signal = latest.get("MACD_signal", 0)
            macd_hist = latest.get("MACD_histogram", 0)
            
            if macd > macd_signal and macd_hist > 0:
                signals.append("BUY")
                confidences.append(0.7)
            elif macd < macd_signal and macd_hist < 0:
                signals.append("SELL")
                confidences.append(0.7)
            else:
                signals.append("NEUTRAL")
                confidences.append(0.4)
            
            # Bollinger Bands анализ
            current_price = latest.get("close", 0)
            bb_upper = latest.get("BB_upper", 0)
            bb_lower = latest.get("BB_lower", 0)
            
            if current_price <= bb_lower:
                signals.append("BUY")
                confidences.append(0.6)
            elif current_price >= bb_upper:
                signals.append("SELL")
                confidences.append(0.6)
            else:
                signals.append("NEUTRAL")
                confidences.append(0.3)
            
            # Stochastic анализ
            stoch_k = latest.get("Stoch_K", 50)
            stoch_d = latest.get("Stoch_D", 50)
            
            if stoch_k < 20 and stoch_d < 20:
                signals.append("BUY")
                confidences.append(0.6)
            elif stoch_k > 80 and stoch_d > 80:
                signals.append("SELL")
                confidences.append(0.6)
            else:
                signals.append("NEUTRAL")
                confidences.append(0.3)
            
            # Подсчет итогового сигнала
            buy_count = signals.count("BUY")
            sell_count = signals.count("SELL")
            neutral_count = signals.count("NEUTRAL")
            
            if buy_count > sell_count and buy_count > neutral_count:
                final_signal = "BUY"
                confidence = sum(confidences) / len(confidences) * (buy_count / len(signals))
            elif sell_count > buy_count and sell_count > neutral_count:
                final_signal = "SELL"
                confidence = sum(confidences) / len(confidences) * (sell_count / len(signals))
            else:
                final_signal = "NEUTRAL"
                confidence = 0.3
            
            return {
                "signal": final_signal,
                "confidence": min(confidence, 1.0),
                "reason": f"RSI: {rsi:.1f}, MACD: {macd:.4f}, Stoch: {stoch_k:.1f}",
                "indicators": {
                    "rsi": rsi,
                    "macd": macd,
                    "macd_signal": macd_signal,
                    "bb_upper": bb_upper,
                    "bb_lower": bb_lower,
                    "stoch_k": stoch_k,
                    "stoch_d": stoch_d,
                    "current_price": current_price
                }
            }
            
        except Exception as e:
            print(f"❌ Ошибка анализа сигнала: {e}")
            return {"signal": "NEUTRAL", "confidence": 0.0, "reason": f"Ошибка: {e}"}


def test_technical_analyzer():
    """Тестирование технического анализатора"""
    print("🧮 Тестирование TechnicalAnalyzer...")
    
    # Тестовый API ключ
    api_key = "demo"  # Замените на реальный ключ
    
    try:
        analyzer = TechnicalAnalyzer(api_key)
        print("✅ TechnicalAnalyzer создан")
        
        # Тест загрузки данных
        print("\n1️⃣ Тест загрузки EUR/USD:")
        df = analyzer.fetch_ohlcv("EUR/USD", "5min", 50)
        
        if not df.empty:
            print(f"   ✅ Данные получены: {len(df)} свечей")
            print(f"   Последняя цена: {df.iloc[-1]['close']:.5f}")
            
            # Тест расчета индикаторов
            print("\n2️⃣ Тест расчета индикаторов:")
            df_with_indicators = analyzer.calculate_all_indicators(df)
            
            if 'RSI' in df_with_indicators.columns:
                print(f"   ✅ RSI рассчитан: {df_with_indicators.iloc[-1]['RSI']:.2f}")
            if 'MACD' in df_with_indicators.columns:
                print(f"   ✅ MACD рассчитан: {df_with_indicators.iloc[-1]['MACD']:.4f}")
            if 'BB_upper' in df_with_indicators.columns:
                print(f"   ✅ Bollinger Bands рассчитаны")
            
            # Тест анализа сигнала
            print("\n3️⃣ Тест анализа сигнала:")
            signal = analyzer.analyze_signal(df_with_indicators)
            print(f"   Сигнал: {signal['signal']}")
            print(f"   Уверенность: {signal['confidence']:.2f}")
            print(f"   Причина: {signal['reason']}")
            
        else:
            print("   ❌ Нет данных")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ Тест завершен!")


if __name__ == "__main__":
    test_technical_analyzer()
