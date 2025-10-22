#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Signal Generator - Система генерации форекс сигналов через Twelvedata API
Основной модуль, объединяющий все компоненты системы

Скопировано из основного торгового бота для отдельного использования
"""

import asyncio
import time
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

# Импорт компонентов системы
from twelvedata_analyzer import TwelvedataAnalyzer
from technical_analyzer import TechnicalAnalyzer
from market_data_fetcher import MarketDataFetcher
from api_optimizer import APIOptimizer

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ForexSignal:
    """Класс для представления форекс сигнала (как в основном боте)"""
    
    def __init__(self, pair: str, direction: str, confidence: float, 
                 entry_price: float, indicators: Dict = None, timestamp: datetime = None, memory_boost: bool = False, duration: int = 1):
        self.pair = pair
        self.direction = direction  # "BUY" или "SELL"
        self.confidence = confidence  # 0.0 - 1.0
        self.entry_price = entry_price
        self.indicators = indicators or {}
        self.timestamp = timestamp or datetime.now()
        self.memory_boost = memory_boost
        self.duration = duration  # Время экспирации в минутах
        
        # Рассчитываем final_score БЕЗ бонусов - только реальные метрики
        self.final_score = confidence
        # Убираем memory_boost бонус - показываем только реальные скоры
        
        # Добавляем недостающие атрибуты для совместимости с API
        self.expiration_minutes = duration
        self.technical_analysis = self._generate_technical_analysis()
        
    def _generate_technical_analysis(self) -> str:
        """Генерирует технический анализ на основе индикаторов"""
        analysis_parts = []
        
        if 'rsi' in self.indicators:
            rsi = self.indicators['rsi']
            if rsi > 70:
                analysis_parts.append("RSI показывает перекупленность")
            elif rsi < 30:
                analysis_parts.append("RSI показывает перепроданность")
            else:
                analysis_parts.append("RSI в нейтральной зоне")
        
        if 'macd' in self.indicators:
            macd = self.indicators['macd']
            if macd > 0:
                analysis_parts.append("MACD положительный")
            else:
                analysis_parts.append("MACD отрицательный")
        
        if 'trend' in self.indicators:
            trend = self.indicators['trend']
            analysis_parts.append(f"Тренд: {trend}")
        
        return ". ".join(analysis_parts) if analysis_parts else "Технический анализ выполнен"
        
    def to_dict(self) -> Dict:
        """Конвертирует сигнал в словарь"""
        return {
            'pair': self.pair,
            'direction': self.direction,
            'confidence': self.confidence,
            'final_score': self.final_score,
            'entry_price': self.entry_price,
            'indicators': self.indicators,
            'timestamp': self.timestamp.isoformat(),
            'memory_boost': self.memory_boost,
            'duration': self.duration,
            'expiration_minutes': self.expiration_minutes,
            'technical_analysis': self.technical_analysis
        }
    
    def __str__(self) -> str:
        boost_info = " 🧠" if self.memory_boost else ""
        return f"{self.pair} {self.direction} @ {self.entry_price:.5f} (Score: {self.final_score:.2f}){boost_info}"


class SignalGenerator:
    """Главный класс генератора сигналов"""
    
    def __init__(self, twelvedata_api_key: str):
        self.twelvedata_api_key = twelvedata_api_key
        
        # Инициализация компонентов
        self.twelvedata_analyzer = TwelvedataAnalyzer(twelvedata_api_key)
        self.technical_analyzer = TechnicalAnalyzer(twelvedata_api_key)
        self.market_data_fetcher = MarketDataFetcher()
        self.api_optimizer = APIOptimizer()
        
        # Добавляем market_schedule для LITE режима
        from market_schedule import MarketSchedule
        self.market_schedule = MarketSchedule()
        
        # Настройки API ключей в оптимизаторе
        self.api_optimizer.api_keys['twelvedata'] = twelvedata_api_key
        
        # Список поддерживаемых валютных пар - только 6 основных
        self.supported_pairs = [
            "EUR/USD", "GBP/USD", "USD/JPY", 
            "USD/CHF", "AUD/USD", "USD/CAD"
        ]
        
        # Кэш сигналов (ОТКЛЮЧЕН)
        self.signals_cache = {}
        self.cache_duration = 0
        
        logger.info("✅ SignalGenerator инициализирован")
    
    def _generate_test_market_data(self, pair: str) -> Dict:
        """Генерирует тестовые рыночные данные для демонстрации (когда рынок закрыт)"""
        import random
        
        # Базовые цены для разных пар
        base_prices = {
            "EUR/USD": 1.0950,
            "GBP/USD": 1.2630,
            "USD/JPY": 149.85,
            "USD/CHF": 0.9180,
            "AUD/USD": 0.6720,
            "USD/CAD": 1.3580
        }
        
        base_price = base_prices.get(pair, 1.1000)
        
        # Добавляем небольшие случайные изменения
        price_variation = random.uniform(-0.002, 0.002)  # ±0.2%
        current_price = base_price * (1 + price_variation)
        
        # Генерируем реалистичные индикаторы
        rsi = random.uniform(25, 75)  # RSI от 25 до 75
        ema_21 = current_price * random.uniform(0.998, 1.002)
        bb_upper = current_price * 1.01
        bb_lower = current_price * 0.99
        
        logger.info(f"🎭 Генерируем тестовые данные для {pair} (рынок закрыт)")
        
        return {
            'close': current_price,
            'ema_8': ema_21 * 0.999,
            'ema_21': ema_21,
            'ema_50': ema_21 * 1.001,
            'rsi_14': rsi,
            'bb_upper': bb_upper,
            'bb_lower': bb_lower,
            'volume': 1000000,
            'volume_sma_10': 1000000,
            'volatility_20': 0.5,
            'timestamp': int(datetime.now().timestamp())
        }
    
    def _generate_basic_tech_signal(self, market_data: Dict) -> Dict:
        """Генерирует базовый технический сигнал на основе рыночных данных"""
        try:
            rsi = float(market_data.get('rsi_14', 50))
            current_price = float(market_data.get('close', 1.1000))
            ema_21 = float(market_data.get('ema_21', current_price))
            
            # Простой анализ на основе RSI и EMA
            signals = []
            confidences = []
            
            # RSI анализ
            if rsi < 30:
                signals.append("BUY")
                confidences.append(0.7)
            elif rsi > 70:
                signals.append("SELL")
                confidences.append(0.7)
            else:
                signals.append("NEUTRAL")
                confidences.append(0.4)
            
            # EMA анализ
            if current_price > ema_21 * 1.001:
                signals.append("BUY")
                confidences.append(0.6)
            elif current_price < ema_21 * 0.999:
                signals.append("SELL")
                confidences.append(0.6)
            else:
                signals.append("NEUTRAL")
                confidences.append(0.4)
            
            # Определяем итоговый сигнал
            buy_count = signals.count("BUY")
            sell_count = signals.count("SELL")
            
            if buy_count > sell_count:
                final_signal = "BUY"
                final_confidence = sum(confidences) / len(confidences) * (buy_count / len(signals))
            elif sell_count > buy_count:
                final_signal = "SELL"
                final_confidence = sum(confidences) / len(confidences) * (sell_count / len(signals))
            else:
                final_signal = "NEUTRAL"
                final_confidence = 0.4
            
            return {
                "signal": final_signal,
                "confidence": final_confidence,
                "reason": f"Базовый анализ: RSI={rsi:.1f}, EMA тренд",
                "indicators": {
                    "rsi": rsi,
                    "current_price": current_price,
                    "ema_21": ema_21
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Ошибка базового анализа: {e}")
            return {
                "signal": "NEUTRAL",
                "confidence": 0.5,
                "reason": "Базовый нейтральный сигнал",
                "indicators": {}
            }
    
    async def generate_signal_lite(self, pair: str) -> Optional[ForexSignal]:
        """ОПТИМИЗИРОВАННАЯ генерация сигнала с минимальными API запросами"""
        logger.info(f"⚡ LITE генерация сигнала для {pair}...")
        
        try:
            # Кэш отключен — всегда генерируем заново
            
            # Получаем только базовые данные (1 API запрос вместо 5-6)
            if self.market_schedule.is_market_open():
                # Дополнительная проверка для форекс рынка
                if not self.market_schedule.is_forex_available():
                    logger.warning(f"⚠️ Форекс недоступен с 22:00 до 6:00 по будням для {pair}")
                    return None
                
                try:
                    # Простой запрос цены + RSI
                    market_data = await self.market_data_fetcher.get_basic_data(pair)
                except:
                    market_data = self._generate_test_market_data(pair)
            else:
                market_data = self._generate_test_market_data(pair)
            
            if not market_data:
                return None
            
            # Простой анализ без множественных индикаторов
            current_price = float(market_data.get('close', 1.1000))
            rsi = float(market_data.get('rsi_14', 50))
            
            # Быстрый расчет направления
            if rsi < 35:
                direction = "BUY"
                confidence = min(0.85, 0.6 + (35 - rsi) / 50)  # Чем ниже RSI, тем выше уверенность
            elif rsi > 65:
                direction = "SELL"  
                confidence = min(0.85, 0.6 + (rsi - 65) / 50)  # Чем выше RSI, тем выше уверенность
            else:
                return None  # Нейтральная зона - не торгуем
            
            # Создаем облегченный сигнал
            signal = ForexSignal(
                pair=pair,
                direction=direction,
                confidence=confidence,
                entry_price=current_price,
                indicators={'rsi': rsi, 'current_price': current_price},
                memory_boost=False  # Только реальные скоры
            )
            
            # Кэш отключен — не сохраняем
            
            logger.info(f"⚡ LITE сигнал создан: {pair} {direction} ({confidence:.1%}) - 1 API запрос")
            return signal
            
        except Exception as e:
            logger.error(f"❌ Ошибка LITE генерации для {pair}: {e}")
            return None
    
    async def generate_signal(self, pair: str) -> Optional[ForexSignal]:
        """Генерирует сигнал для валютной пары используя FixedComprehensiveAnalysis как в основном боте"""
        from config import BotConfig
        
        # Используем LITE режим если включен
        if BotConfig.SIGNAL_SETTINGS.get("lite_mode", False):
            return await self.generate_signal_lite(pair)
        
        # НОВОЕ: Проверка расписания в FULL режиме
        if not self.market_schedule.is_market_open():
            logger.warning(f"⚠️ Рынок закрыт для {pair}, используем тестовые данные")
            # Опция 2: Генерируем тестовые данные (текущее поведение)
            market_data = self._generate_test_market_data(pair)
        elif not self.market_schedule.is_forex_available():
            logger.warning(f"⚠️ Форекс недоступен с 22:00 до 6:00 для {pair}")
            return None
        
        try:
            logger.info(f"📊 Генерация ПОЛНОГО сигнала для {pair}...")
            
            # Кэш отключен — всегда генерируем заново
            
            # ИСПОЛЬЗУЕМ FixedComprehensiveAnalysis КАК В ОСНОВНОМ БОТЕ
            try:
                from fixed_comprehensive_analysis import FixedComprehensiveAnalysis
                
                # Создаем анализатор с теми же настройками что и в основном боте
                if not hasattr(self, '_comprehensive_analyzer'):
                    self._comprehensive_analyzer = FixedComprehensiveAnalysis(
                        asset_type="forex",
                        twelvedata_api_key=self.twelvedata_analyzer.api_key,
                        finnhub_api_key="d2s4r39r01qiq7a2l940d2s4r39r01qiq7a2l94g",
                        settings=None
                    )
                
                # Генерируем сигналы через FixedComprehensiveAnalysis
                all_signals = await self._comprehensive_analyzer.generate_ultra_precise_signals([pair], max_signals=2)
                
                if all_signals:
                    best_signal = all_signals[0]  # Берем лучший сигнал
                    
                    # Конвертируем в ForexSignal
                    signal = ForexSignal(
                        pair=pair,
                        direction=best_signal.get('direction', 'NEUTRAL'),
                        confidence=best_signal.get('confidence', 0.5),
                        entry_price=best_signal.get('entry_price', best_signal.get('current_price', 1.0)),
                        indicators=best_signal.get('indicators', {}),
                        timestamp=datetime.now(),
                        memory_boost=best_signal.get('memory_boost', False),
                        duration=best_signal.get('duration', random.choice([1, 2, 3, 4, 5]))
                    )
                    
                    # Кэш отключен — не сохраняем
                    logger.info(f"✅ Сигнал сгенерирован для {pair}: {signal}")
                    return signal
                    
            except ImportError:
                logger.warning("❌ FixedComprehensiveAnalysis недоступен, используем fallback")
            except Exception as e:
                logger.error(f"❌ ПОДРОБНАЯ ОШИБКА FixedComprehensiveAnalysis: {type(e).__name__}: {e}")
                import traceback
                logger.error(f"❌ ТРАССИРОВКА: {traceback.format_exc()}")
                logger.warning(f"❌ Ошибка FixedComprehensiveAnalysis: {e}, используем fallback")
            
            # FALLBACK: старый метод если FixedComprehensiveAnalysis не работает
            # Получаем рыночные данные
            market_data = self.twelvedata_analyzer.get_market_data(pair)
            if not market_data:
                logger.warning(f"❌ Нет рыночных данных для {pair}, используем тестовые данные")
                # Создаем тестовые данные для демонстрации (когда рынок закрыт)
                market_data = self._generate_test_market_data(pair)
            
            # Получаем технический анализ
            tech_df = self.technical_analyzer.get_technical_analysis(pair, "5min")
            if tech_df.empty:
                logger.warning(f"❌ Нет технических данных для {pair}, используем базовый анализ")
                # Создаем базовый технический анализ
                tech_signal = self._generate_basic_tech_signal(market_data)
            else:
                # Анализируем сигнал
                tech_signal = self.technical_analyzer.analyze_signal(tech_df)
            
            # Комбинируем анализы
            signal = self._combine_analyses(pair, market_data, tech_signal)
            
            # Кэш отключен — не сохраняем
            logger.info(f"✅ Сигнал сгенерирован для {pair}: {signal}")
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ Ошибка генерации сигнала для {pair}: {e}")
            return None
    
    def _combine_analyses(self, pair: str, market_data: Dict, tech_signal: Dict) -> Optional[ForexSignal]:
        """Комбинирует различные анализы в итоговый сигнал"""
        try:
            # Извлекаем данные и конвертируем в числа
            current_price = float(market_data.get('close', 1.1700))
            rsi = float(market_data.get('rsi_14', 50))
            ema_21 = float(market_data.get('ema_21', current_price))
            bb_upper = float(market_data.get('bb_upper', current_price * 1.01))
            bb_lower = float(market_data.get('bb_lower', current_price * 0.99))
            
            # Технический сигнал
            tech_direction = tech_signal.get('signal', 'NEUTRAL')
            tech_confidence = tech_signal.get('confidence', 0.0)
            
            # Анализ RSI
            rsi_signal = "NEUTRAL"
            rsi_confidence = 0.3
            if rsi < 30:
                rsi_signal = "BUY"
                rsi_confidence = 0.8
            elif rsi > 70:
                rsi_signal = "SELL"
                rsi_confidence = 0.8
            
            # Анализ EMA
            ema_signal = "NEUTRAL"
            ema_confidence = 0.3
            if current_price > ema_21 * 1.001:
                ema_signal = "BUY"
                ema_confidence = 0.6
            elif current_price < ema_21 * 0.999:
                ema_signal = "SELL"
                ema_confidence = 0.6
            
            # Анализ Bollinger Bands
            bb_signal = "NEUTRAL"
            bb_confidence = 0.3
            if current_price <= bb_lower:
                bb_signal = "BUY"
                bb_confidence = 0.7
            elif current_price >= bb_upper:
                bb_signal = "SELL"
                bb_confidence = 0.7
            
            # Подсчет итогового сигнала
            signals = [tech_direction, rsi_signal, ema_signal, bb_signal]
            confidences = [tech_confidence, rsi_confidence, ema_confidence, bb_confidence]
            
            buy_count = signals.count("BUY")
            sell_count = signals.count("SELL")
            neutral_count = signals.count("NEUTRAL")
            
            # Определяем направление
            if buy_count > sell_count and buy_count > neutral_count:
                final_direction = "BUY"
                final_confidence = sum(confidences) / len(confidences) * (buy_count / len(signals))
            elif sell_count > buy_count and sell_count > neutral_count:
                final_direction = "SELL"
                final_confidence = sum(confidences) / len(confidences) * (sell_count / len(signals))
            else:
                final_direction = "NEUTRAL"
                final_confidence = 0.3
            
            # Минимальная уверенность для генерации сигнала (понижен для демо режима)
            if final_confidence < 0.3:
                return None
            
            # Создаем сигнал
            indicators_data = {
                'rsi': rsi,
                'ema_21': ema_21,
                'bb_upper': bb_upper,
                'bb_lower': bb_lower,
                'current_price': current_price,
                'tech_signal': tech_direction,
                'tech_confidence': tech_confidence
            }
            
            signal = ForexSignal(
                pair=pair,
                direction=final_direction,
                confidence=min(final_confidence, 1.0),
                entry_price=current_price,
                indicators=indicators_data,
                memory_boost=False  # Только реальные скоры
            )
            
            return signal
            
        except Exception as e:
            logger.error(f"❌ Ошибка комбинирования анализов для {pair}: {e}")
            return None
    
    async def generate_signals_bulk(self, pairs: List[str] = None) -> List[ForexSignal]:
        """ОПТИМИЗИРОВАННАЯ генерация сигналов для списка пар"""
        from config import BotConfig
        
        if pairs is None:
            # Ограничиваем количество пар для экономии API
            max_pairs = BotConfig.SIGNAL_SETTINGS.get("max_bulk_pairs", 3)
            pairs = self.supported_pairs[:max_pairs]
        
        logger.info(f"⚡ ОПТИМИЗИРОВАННАЯ генерация для {len(pairs)} пар...")
        
        signals = []
        delay = BotConfig.SIGNAL_SETTINGS.get("request_delay", 2.0)
        
        for pair in pairs:
            try:
                # Используем LITE режим для массовой генерации
                if BotConfig.SIGNAL_SETTINGS.get("lite_mode", False):
                    signal = await self.generate_signal_lite(pair)
                else:
                    signal = await self.generate_signal(pair)
                    
                if signal:
                    signals.append(signal)
                
                # Увеличенная задержка для экономии API
                await asyncio.sleep(delay)
                
            except Exception as e:
                logger.error(f"❌ Ошибка для {pair}: {e}")
                continue
        
        # Сортируем сигналы по final_score (как в основном боте)
        signals.sort(key=lambda s: s.final_score, reverse=True)
        
        logger.info(f"✅ Сгенерировано {len(signals)} сигналов, отсортированных по скору")
        return signals
    
    async def get_best_signals(self, limit: int = 3) -> List[ForexSignal]:
        """ОПТИМИЗИРОВАННЫЙ поиск лучших сигналов"""
        from config import BotConfig
        
        # Ограничиваем количество для экономии API
        actual_limit = min(limit, BotConfig.SIGNAL_SETTINGS.get("max_bulk_pairs", 3))
        logger.info(f"⚡ ОПТИМИЗИРОВАННЫЙ поиск {actual_limit} лучших сигналов...")
        
        # Генерируем сигналы только для ограниченного количества пар
        all_signals = await self.generate_signals_bulk()
        
        # Фильтруем сигналы с учетом LITE режима
        if BotConfig.SIGNAL_SETTINGS.get("lite_mode", False):
            # В LITE режиме более мягкие требования
            high_score_signals = [s for s in all_signals if s.final_score >= 0.65]
        else:
            # В полном режиме строгие требования
            high_score_signals = [s for s in all_signals if s.final_score >= 0.75]
        
        # Возвращаем топ сигналы
        best_signals = high_score_signals[:actual_limit]
        
        logger.info(f"🏆 Найдено {len(best_signals)} лучших сигналов")
        for i, signal in enumerate(best_signals, 1):
            confidence_color = "🟢" if signal.final_score > 0.8 else "🟡" if signal.final_score > 0.7 else "🔴"
            boost_info = " 🧠" if signal.memory_boost else ""
            logger.info(f"   {i}. {confidence_color} {signal.pair} {signal.direction} (Score: {signal.final_score:.2f}){boost_info}")
        
        return best_signals
    
    def get_supported_pairs(self) -> List[str]:
        """Возвращает список поддерживаемых валютных пар"""
        return self.supported_pairs.copy()
    
    def get_api_status(self) -> Dict:
        """Возвращает статус API"""
        return self.api_optimizer.get_api_status()
    
    def clear_cache(self):
        """Очищает кэш сигналов"""
        self.signals_cache.clear()
        self.twelvedata_analyzer.data_cache.clear()
        self.technical_analyzer.cache.clear()
        logger.info("🗑️ Кэш очищен")


async def main():
    """Основная функция для тестирования"""
    print("🚀 ТЕСТИРОВАНИЕ СИСТЕМЫ ГЕНЕРАЦИИ СИГНАЛОВ")
    print("=" * 60)
    
    # API ключ (замените на реальный)
    api_key = "demo"
    
    try:
        # Создаем генератор сигналов
        generator = SignalGenerator(api_key)
        print("✅ Генератор сигналов создан")
        
        # Тестируем генерацию сигнала для одной пары
        print("\n1️⃣ Тест генерации сигнала для EUR/USD:")
        signal = await generator.generate_signal("EUR/USD")
        
        if signal:
            print(f"   ✅ Сигнал сгенерирован: {signal}")
            print(f"   📊 Индикаторы: RSI={signal.indicators.get('rsi', 'N/A'):.1f}, "
                  f"EMA={signal.indicators.get('ema_21', 'N/A'):.5f}")
        else:
            print("   ❌ Сигнал не сгенерирован")
        
        # Тестируем массовую генерацию
        print("\n2️⃣ Тест массовой генерации сигналов:")
        test_pairs = ["EUR/USD", "GBP/USD", "USD/JPY"]
        signals = await generator.generate_signals_bulk(test_pairs)
        
        if signals:
            print(f"   ✅ Сгенерировано {len(signals)} сигналов:")
            for sig in signals:
                print(f"      {sig}")
        else:
            print("   ❌ Сигналы не сгенерированы")
        
        # Статус API
        print("\n3️⃣ Статус API:")
        api_status = generator.get_api_status()
        for api_name, status in api_status.items():
            print(f"   {api_name}: {status['minute_requests']} запросов")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ Тестирование завершено!")


if __name__ == "__main__":
    asyncio.run(main())
