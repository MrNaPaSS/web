#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Тест системы активных сигналов пользователей
"""

import requests
import json
import time

API_BASE = "http://localhost:5000"

def test_active_signals_system():
    """Тест системы активных сигналов"""
    print("🔍 Тестирование системы активных сигналов...")
    
    test_user_id = "511442168"
    
    # 1. Тест активации сигнала
    print("\n1️⃣ Тест активации сигнала...")
    signal_data = {
        "user_id": test_user_id,
        "signal": {
            "signal_id": "otc_EUR_USD_1234567890",
            "pair": "EUR/USD (OTC)",
            "direction": "SELL",
            "confidence": 0.75,
            "entry_price": 1.18500,
            "expiration": 3,
            "start_time": int(time.time() * 1000)
        }
    }
    
    response = requests.post(f"{API_BASE}/api/signal/activate", json=signal_data)
    result = response.json()
    print(f"   Результат активации: {result}")
    
    if result.get('success'):
        print("   ✅ Сигнал успешно активирован")
    else:
        print(f"   ❌ Ошибка активации: {result.get('error')}")
        return False
    
    # 2. Тест получения активного сигнала
    print("\n2️⃣ Тест получения активного сигнала...")
    response = requests.get(f"{API_BASE}/api/signal/active?user_id={test_user_id}")
    result = response.json()
    print(f"   Активный сигнал: {result}")
    
    if result.get('success') and result.get('active_signal'):
        print("   ✅ Активный сигнал получен")
    else:
        print("   ❌ Активный сигнал не найден")
        return False
    
    # 3. Тест попытки повторной активации
    print("\n3️⃣ Тест попытки повторной активации...")
    response = requests.post(f"{API_BASE}/api/signal/activate", json=signal_data)
    result = response.json()
    print(f"   Результат повторной активации: {result}")
    
    if result.get('error') == 'User already has active signal':
        print("   ✅ Повторная активация заблокирована")
    else:
        print("   ❌ Повторная активация не заблокирована")
        return False
    
    # 4. Тест завершения сигнала с фидбеком
    print("\n4️⃣ Тест завершения сигнала...")
    complete_data = {
        "user_id": test_user_id,
        "feedback": "success"
    }
    
    response = requests.post(f"{API_BASE}/api/signal/complete", json=complete_data)
    result = response.json()
    print(f"   Результат завершения: {result}")
    
    if result.get('success'):
        print("   ✅ Сигнал успешно завершен")
    else:
        print(f"   ❌ Ошибка завершения: {result.get('error')}")
        return False
    
    # 5. Проверка что активный сигнал очищен
    print("\n5️⃣ Проверка очистки активного сигнала...")
    response = requests.get(f"{API_BASE}/api/signal/active?user_id={test_user_id}")
    result = response.json()
    print(f"   Активный сигнал после завершения: {result}")
    
    if result.get('success') and not result.get('active_signal'):
        print("   ✅ Активный сигнал очищен")
    else:
        print("   ❌ Активный сигнал не очищен")
        return False
    
    print("\n🎉 Все тесты пройдены успешно!")
    return True

if __name__ == "__main__":
    try:
        success = test_active_signals_system()
        if success:
            print("\n✅ Система активных сигналов работает корректно!")
        else:
            print("\n❌ Система активных сигналов работает некорректно!")
    except Exception as e:
        print(f"\n💥 Ошибка тестирования: {e}")
        import traceback
        traceback.print_exc()
