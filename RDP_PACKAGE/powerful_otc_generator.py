#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
МОЩНЫЙ ОТС Генератор сигналов с полным анализом
Использует FixedComprehensiveAnalysis для генерации точных сигналов
Анализирует тренды и 22+ индикаторов
"""

import asyncio
import logging
import random
from datetime import datetime
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class PowerfulOTCSignal:
    """Мощный ОТС сигнал с полным анализом"""
    
    def __init__(self, pair: str, direction: str, confidence: float, 
                 entry_price: float, indicators: Dict = None, timestamp: datetime = None,
                 trend: str = None, score: float = None):
        self.pair = pair
        self.direction = direction  # "BUY" или "SELL"
        
        # Нормализуем confidence в диапазон 0-1
        self.confidence = confidence if confidence <= 1.0 else confidence / 100.0
        
        self.entry_price = entry_price
        self.indicators = indicators or {}
        self.timestamp = timestamp or datetime.now()
        self.trend = trend or "neutral"
        self.duration = random.choice([1, 2, 3, 4, 5])  # Полный диапазон времени экспирации
        
        # Final score как в основном боте (в диапазоне 0-1)
        raw_score = score or self.confidence
        self.final_score = raw_score if raw_score <= 1.0 else raw_score / 100.0
        
    def __str__(self):
        return f"{self.pair} {self.direction} @ {self.entry_price:.5f} (Score: {self.final_score:.2f}) [OTC]"
        
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
            'duration': self.duration,
            'trend': self.trend,
            'type': 'OTC_POWERFUL'
        }


class PowerfulOTCGenerator:
    """МОЩНЫЙ Генератор ОТС сигналов с полным анализом (24/7)"""
    
    def __init__(self):
        # Инициализируем мощную систему анализа
        try:
            from fixed_comprehensive_analysis import FixedComprehensiveAnalysis
            self.comprehensive_analyzer = FixedComprehensiveAnalysis(
                asset_type="otc",
                twelvedata_api_key="135a5040fb4642d6be0dda33fdf12232", 
                finnhub_api_key="d2s4r39r01qiq7a2l940d2s4r39r01qiq7a2l94g"
            )
            self.analyzer_available = True
            logger.info("✅ FixedComprehensiveAnalysis инициализирован для мощных ОТС сигналов")
        except Exception as e:
            logger.error(f"❌ Ошибка инициализации FixedComprehensiveAnalysis: {e}")
            self.comprehensive_analyzer = None
            self.analyzer_available = False
        
        # 5 ОТС пар как в основном боте (без OTC в названии для анализатора)
        self.otc_pairs_for_analysis = ["EUR/USD", "NZD/USD", "USD/CHF", "GBP/USD", "USD/CAD"]
        
        # Соответствие для отображения в боте
        self.supported_otc_pairs = [
            "EUR/USD (OTC)",
            "NZD/USD (OTC)", 
            "USD/CHF (OTC)",
            "GBP/USD (OTC)",
            "USD/CAD (OTC)"
        ]
        
        # Кэш для сигналов (ОТКЛЮЧЕН)
        self.signals_cache = {}
        self.cache_timeout = 0
        
        logger.info("✅ PowerfulOTCGenerator инициализирован (24/7 режим с полным анализом)")
    
    def get_supported_pairs(self) -> List[str]:
        """Возвращает список поддерживаемых ОТС пар"""
        return self.supported_otc_pairs.copy()
    
    async def generate_otc_signal(self, pair: str) -> Optional[PowerfulOTCSignal]:
        """Генерирует мощный ОТС сигнал для одной пары"""
        try:
            if not self.analyzer_available:
                logger.error("❌ Анализатор недоступен")
                return None
            
            # Убираем " (OTC)" из названия пары для анализа
            clean_pair = pair.replace(" (OTC)", "")
            
            if clean_pair not in self.otc_pairs_for_analysis:
                logger.error(f"❌ Пара {clean_pair} не поддерживается")
                return None
            
            logger.info(f"🎯 Генерация мощного ОТС сигнала для {pair}...")
            
            # Генерируем сигналы через мощную систему (исправленный вызов)
            signals = await self.comprehensive_analyzer.generate_ultra_precise_signals(
                symbols=[clean_pair], 
                max_signals=2  # BUY и SELL
            )
            
            if not signals:
                logger.warning(f"⚠️ Не удалось сгенерировать сигналы для {clean_pair}")
                return None
            
            # Берем лучший сигнал (первый в отсортированном списке)
            best_signal = signals[0] if signals else None
            
            if not best_signal:
                logger.warning(f"⚠️ Не найден подходящий сигнал для {clean_pair}")
                return None
            
            # Создаем мощный ОТС сигнал
            # Берем реальную цену из разных источников
            indicators = best_signal.get('indicators', {})
            
            # Отладка - смотрим что есть в сигнале
            logger.info(f"🔍 Доступные поля в сигнале: {list(best_signal.keys())}")
            logger.info(f"🔍 Indicators: {list(indicators.keys()) if indicators else 'None'}")
            
            real_price = (
                best_signal.get('entry_price') or 
                best_signal.get('current_price') or
                indicators.get('current_price') or 
                indicators.get('close') or
                best_signal.get('price') or
                1.18500  # Fallback для EUR/USD
            )
            
            logger.info(f"💰 Найденная цена для {clean_pair}: {real_price}")
            
            otc_signal = PowerfulOTCSignal(
                pair=pair,  # С (OTC)
                direction=best_signal.get('direction', 'BUY'),
                confidence=best_signal.get('confidence', 0.5),
                entry_price=float(real_price),
                indicators=best_signal.get('indicators', {}),
                trend=best_signal.get('trend', 'neutral'),
                score=best_signal.get('confidence', 0.5)
            )
            
            logger.info(f"✅ Мощный ОТС сигнал сгенерирован: {otc_signal}")
            return otc_signal
            
        except Exception as e:
            logger.error(f"❌ Ошибка генерации мощного ОТС сигнала для {pair}: {e}")
            return None
    
    async def get_best_otc_signals(self, limit: int = 5) -> List[PowerfulOTCSignal]:
        """Генерирует ТОП мощных ОТС сигналов"""
        try:
            if not self.analyzer_available:
                logger.error("❌ Анализатор недоступен для массовой генерации")
                return []
            
            logger.info(f"🎯 Генерация {limit} лучших мощных ОТС сигналов...")
            
            # Генерируем сигналы для всех пар через мощную систему (исправленный вызов)
            signals = await self.comprehensive_analyzer.generate_ultra_precise_signals(
                symbols=self.otc_pairs_for_analysis, 
                max_signals=10  # Больше сигналов для выбора лучших
            )
            
            if not signals:
                logger.warning("⚠️ Не удалось сгенерировать массовые ОТС сигналы")
                return []
            
            # Конвертируем в PowerfulOTCSignal и сортируем
            otc_signals = []
            
            for signal in signals:
                try:
                    signal_symbol = signal.get('symbol', '')
                    signal_pair = signal.get('pair', '')
                    clean_pair = signal_symbol or signal_pair
                    
                    if clean_pair in self.otc_pairs_for_analysis:
                        # Добавляем (OTC) к названию пары
                        display_pair = f"{clean_pair} (OTC)"
                        
                        otc_signal = PowerfulOTCSignal(
                            pair=display_pair,
                            direction=signal.get('direction', 'BUY'),
                            confidence=signal.get('confidence', 0.5),
                            entry_price=signal.get('entry_price', 1.0),
                            indicators=signal.get('indicators', {}),
                            trend=signal.get('trend', 'neutral'),
                            score=signal.get('confidence', 0.5)
                        )
                        otc_signals.append(otc_signal)
                except Exception as e:
                    logger.error(f"❌ Ошибка конвертации сигнала: {e}")
                    continue
            
            # Сортируем по final_score и берем лучшие
            otc_signals.sort(key=lambda x: x.final_score, reverse=True)
            top_signals = otc_signals[:limit]
            
            logger.info(f"✅ Сгенерировано {len(top_signals)} лучших мощных ОТС сигналов")
            for i, signal in enumerate(top_signals, 1):
                logger.info(f"   {i}. {signal}")
            
            return top_signals
            
        except Exception as e:
            logger.error(f"❌ Ошибка генерации массовых мощных ОТС сигналов: {e}")
            return []


async def test_powerful_otc_generator():
    """Тестирование мощного ОТС генератора"""
    print("🚀 ТЕСТИРОВАНИЕ МОЩНОГО ОТС ГЕНЕРАТОРА")
    print("=" * 60)
    
    generator = PowerfulOTCGenerator()
    
    if not generator.analyzer_available:
        print("❌ Анализатор недоступен - тест невозможен")
        return
    
    # Тест одиночного сигнала
    print("\n1️⃣ Тест генерации одиночного мощного ОТС сигнала:")
    signal = await generator.generate_otc_signal("EUR/USD (OTC)")
    if signal:
        print(f"✅ Сигнал: {signal}")
        print(f"   Тренд: {signal.trend}")
        print(f"   Скор: {signal.final_score:.1%}")
    else:
        print("❌ Не удалось сгенерировать сигнал")
    
    # Тест массовых сигналов
    print("\n2️⃣ Тест генерации ТОП-5 мощных ОТС сигналов:")
    top_signals = await generator.get_best_otc_signals(5)
    if top_signals:
        for i, signal in enumerate(top_signals, 1):
            print(f"   {i}. {signal} (Тренд: {signal.trend})")
    else:
        print("❌ Не удалось сгенерировать массовые сигналы")
    
    print("\n🎉 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!")


if __name__ == "__main__":
    asyncio.run(test_powerful_otc_generator())
