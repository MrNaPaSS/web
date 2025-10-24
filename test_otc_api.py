#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тест OTC генератора через API
"""

import asyncio
import sys
import os

# Добавляем текущую директорию в путь
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from powerful_otc_generator import PowerfulOTCGenerator

async def test_otc_api():
    """Тест OTC генератора через API"""
    try:
        print("🔍 Тестирование OTC генератора...")
        
        # Инициализируем генератор
        generator = PowerfulOTCGenerator()
        
        if not generator.analyzer_available:
            print("❌ Анализатор недоступен")
            return False
            
        print("✅ OTC генератор инициализирован")
        
        # Тестируем генерацию сигнала
        test_pair = "EUR/USD (OTC)"
        signal = await generator.generate_powerful_otc_signal(test_pair)
        
        if signal:
            print(f"✅ Сгенерирован сигнал:")
            print(f"   Пара: {signal.pair}")
            print(f"   Направление: {signal.direction}")
            print(f"   Уверенность: {signal.confidence:.2f}")
            print(f"   Цена входа: {signal.entry_price:.5f}")
            print(f"   Тренд: {signal.trend}")
            return True
        else:
            print("⚠️ Сигнал не сгенерирован")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_otc_api())
    if result:
        print("🎉 OTC генератор работает!")
    else:
        print("💥 OTC генератор не работает!")
