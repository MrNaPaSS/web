#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тест OTC генератора
"""

import asyncio
from fixed_comprehensive_analysis import FixedComprehensiveAnalysis

async def test_otc_generator():
    """Тест OTC генератора"""
    try:
        print("🔍 Тестирование OTC генератора...")
        
        # Инициализируем анализатор для OTC
        analyzer = FixedComprehensiveAnalysis(asset_type="otc")
        print("✅ Анализатор инициализирован")
        
        # Тестируем генерацию сигналов
        symbols = ["EUR/USD OTC", "GBP/USD OTC"]
        signals = await analyzer.generate_ultra_precise_signals(symbols, max_signals=1)
        
        if signals:
            print(f"✅ Сгенерировано {len(signals)} сигналов:")
            for signal in signals:
                print(f"   {signal['pair']} {signal['direction']}: {signal['composite_score']:.1f}%")
        else:
            print("⚠️ Сигналы не сгенерированы")
            
        return True
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_otc_generator())
    if result:
        print("🎉 OTC генератор работает!")
    else:
        print("💥 OTC генератор не работает!")
