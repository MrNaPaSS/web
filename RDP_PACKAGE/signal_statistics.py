#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль для сбора статистики успешности сигналов
Отслеживает обратную связь от пользователей
"""

import json
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class SignalFeedback:
    """Обратная связь по сигналу"""
    signal_id: str
    user_id: int
    pair: str
    direction: str
    confidence: float
    entry_price: float
    expiration: int
    signal_type: str  # "forex" или "otc"
    timestamp: str
    feedback: str  # "success" или "failure"
    feedback_time: str

class SignalStatistics:
    """Класс для сбора и анализа статистики сигналов"""
    
    def __init__(self, stats_file: str = "signal_stats.json"):
        self.stats_file = stats_file
        self.feedback_data = []
        self.load_statistics()
        logger.info("✅ SignalStatistics инициализирован")
    
    def load_statistics(self):
        """Загружает статистику из файла"""
        try:
            if os.path.exists(self.stats_file):
                with open(self.stats_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.feedback_data = data.get('feedback', [])
                logger.info(f"✅ Загружено {len(self.feedback_data)} записей статистики")
            else:
                self.feedback_data = []
                logger.info("📊 Создан новый файл статистики")
        except Exception as e:
            logger.error(f"❌ Ошибка загрузки статистики: {e}")
            self.feedback_data = []
    
    def save_statistics(self):
        """Сохраняет статистику в файл"""
        try:
            data = {
                'feedback': self.feedback_data,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.stats_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"✅ Статистика сохранена ({len(self.feedback_data)} записей)")
        except Exception as e:
            logger.error(f"❌ Ошибка сохранения статистики: {e}")
    
    def add_feedback(self, signal_id: str, user_id: int, pair: str, direction: str,
                    confidence: float, entry_price: float, expiration: int,
                    signal_type: str, timestamp: str, feedback: str) -> bool:
        """Добавляет обратную связь по сигналу"""
        try:
            feedback_entry = SignalFeedback(
                signal_id=signal_id,
                user_id=user_id,
                pair=pair,
                direction=direction,
                confidence=confidence,
                entry_price=entry_price,
                expiration=expiration,
                signal_type=signal_type,
                timestamp=timestamp,
                feedback=feedback,
                feedback_time=datetime.now().isoformat()
            )
            
            self.feedback_data.append(asdict(feedback_entry))
            self.save_statistics()
            
            logger.info(f"✅ Добавлена обратная связь: {pair} {direction} - {feedback}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Ошибка добавления обратной связи: {e}")
            return False
    
    def get_overall_statistics(self) -> Dict:
        """Возвращает общую статистику"""
        try:
            if not self.feedback_data:
                return {
                    'total_signals': 0,
                    'successful': 0,
                    'failed': 0,
                    'success_rate': 0.0,
                    'forex_stats': {'total': 0, 'successful': 0, 'success_rate': 0.0},
                    'otc_stats': {'total': 0, 'successful': 0, 'success_rate': 0.0}
                }
            
            total_signals = len(self.feedback_data)
            successful = len([f for f in self.feedback_data if f['feedback'] == 'success'])
            failed = len([f for f in self.feedback_data if f['feedback'] == 'failure'])
            success_rate = (successful / total_signals * 100) if total_signals > 0 else 0.0
            
            # Статистика по типам
            forex_feedback = [f for f in self.feedback_data if f['signal_type'] == 'forex']
            otc_feedback = [f for f in self.feedback_data if f['signal_type'] == 'otc']
            
            forex_successful = len([f for f in forex_feedback if f['feedback'] == 'success'])
            otc_successful = len([f for f in otc_feedback if f['feedback'] == 'success'])
            
            forex_success_rate = (forex_successful / len(forex_feedback) * 100) if forex_feedback else 0.0
            otc_success_rate = (otc_successful / len(otc_feedback) * 100) if otc_feedback else 0.0
            
            return {
                'total_signals': total_signals,
                'successful': successful,
                'failed': failed,
                'success_rate': success_rate,
                'forex_stats': {
                    'total': len(forex_feedback),
                    'successful': forex_successful,
                    'success_rate': forex_success_rate
                },
                'otc_stats': {
                    'total': len(otc_feedback),
                    'successful': otc_successful,
                    'success_rate': otc_success_rate
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Ошибка расчета статистики: {e}")
            return {'total_signals': 0, 'successful': 0, 'failed': 0, 'success_rate': 0.0}
    
    def get_pair_statistics(self) -> Dict:
        """Возвращает статистику по парам"""
        try:
            pair_stats = {}
            
            for feedback in self.feedback_data:
                pair = feedback['pair']
                if pair not in pair_stats:
                    pair_stats[pair] = {'total': 0, 'successful': 0, 'success_rate': 0.0}
                
                pair_stats[pair]['total'] += 1
                if feedback['feedback'] == 'success':
                    pair_stats[pair]['successful'] += 1
            
            # Рассчитываем процент успеха для каждой пары
            for pair in pair_stats:
                total = pair_stats[pair]['total']
                successful = pair_stats[pair]['successful']
                pair_stats[pair]['success_rate'] = (successful / total * 100) if total > 0 else 0.0
            
            return pair_stats
            
        except Exception as e:
            logger.error(f"❌ Ошибка расчета статистики по парам: {e}")
            return {}
    
    def get_recent_feedback(self, limit: int = 10) -> List[Dict]:
        """Возвращает последние отзывы"""
        try:
            # Сортируем по времени обратной связи
            sorted_feedback = sorted(self.feedback_data, 
                                   key=lambda x: x['feedback_time'], 
                                   reverse=True)
            return sorted_feedback[:limit]
        except Exception as e:
            logger.error(f"❌ Ошибка получения последних отзывов: {e}")
            return []


# Глобальный экземпляр для использования в боте
signal_statistics = SignalStatistics()


def test_statistics():
    """Тестирование системы статистики"""
    print("📊 Тестирование системы статистики сигналов...")
    
    stats = SignalStatistics("test_stats.json")
    
    # Добавляем тестовые данные
    test_feedbacks = [
        ("sig1", 123, "EUR/USD (OTC)", "BUY", 0.75, 1.18500, 3, "otc", "2025-09-19T01:00:00", "success"),
        ("sig2", 123, "GBP/USD", "SELL", 0.68, 1.30250, 1, "forex", "2025-09-19T01:05:00", "failure"),
        ("sig3", 456, "USD/JPY (OTC)", "BUY", 0.82, 146.50, 5, "otc", "2025-09-19T01:10:00", "success"),
    ]
    
    for feedback in test_feedbacks:
        stats.add_feedback(*feedback)
    
    # Показываем статистику
    overall = stats.get_overall_statistics()
    print(f"\n📈 Общая статистика:")
    print(f"   Всего сигналов: {overall['total_signals']}")
    print(f"   Успешных: {overall['successful']}")
    print(f"   Неудачных: {overall['failed']}")
    print(f"   Процент успеха: {overall['success_rate']:.1f}%")
    
    print(f"\n💱 Форекс: {overall['forex_stats']['success_rate']:.1f}% ({overall['forex_stats']['successful']}/{overall['forex_stats']['total']})")
    print(f"⚡ ОТС: {overall['otc_stats']['success_rate']:.1f}% ({overall['otc_stats']['successful']}/{overall['otc_stats']['total']})")
    
    pair_stats = stats.get_pair_statistics()
    print(f"\n📊 Статистика по парам:")
    for pair, stat in pair_stats.items():
        print(f"   {pair}: {stat['success_rate']:.1f}% ({stat['successful']}/{stat['total']})")
    
    # Удаляем тестовый файл
    if os.path.exists("test_stats.json"):
        os.remove("test_stats.json")
    
    print("\n🎉 Тестирование завершено!")


if __name__ == "__main__":
    test_statistics()
