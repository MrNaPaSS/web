#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль для проверки расписания работы форекс рынка
Понедельник-Пятница с 6:00 до 22:00 (европейское время)
"""

from datetime import datetime, time
import pytz
from typing import Tuple, Dict

class MarketSchedule:
    """Класс для работы с расписанием форекс рынка"""
    
    def __init__(self, timezone: str = "Europe/Berlin"):
        self.timezone = pytz.timezone(timezone)
        
        # Время работы рынка (европейское время)
        self.market_open_time = time(6, 0)   # 06:00
        self.market_close_time = time(22, 0) # 22:00
        
        # Ограничения для форекс рынка (недоступен с 22:00 до 6:00 по будням)
        self.forex_restricted_start = time(22, 0)  # 22:00
        self.forex_restricted_end = time(6, 0)     # 06:00
        
        # Рабочие дни (понедельник=0, воскресенье=6)
        self.working_days = [0, 1, 2, 3, 4]  # Пн-Пт
    
    def is_market_open(self, check_time: datetime = None) -> bool:
        """Проверяет, открыт ли рынок в указанное время"""
        if check_time is None:
            check_time = datetime.now(self.timezone)
        else:
            # Конвертируем в европейское время если нужно
            if check_time.tzinfo is None:
                check_time = self.timezone.localize(check_time)
            else:
                check_time = check_time.astimezone(self.timezone)
        
        # Проверяем день недели
        if check_time.weekday() not in self.working_days:
            return False
        
        # Проверяем время
        current_time = check_time.time()
        return self.market_open_time <= current_time <= self.market_close_time
    
    def is_forex_available(self, check_time: datetime = None) -> bool:
        """Проверяет, доступен ли форекс рынок в указанное время (недоступен с 22:00 до 6:00 по будням)"""
        if check_time is None:
            check_time = datetime.now(self.timezone)
        else:
            # Конвертируем в европейское время если нужно
            if check_time.tzinfo is None:
                check_time = self.timezone.localize(check_time)
            else:
                check_time = check_time.astimezone(self.timezone)
        
        # Проверяем день недели
        if check_time.weekday() not in self.working_days:
            return True  # В выходные форекс доступен
        
        # Проверяем время ограничения (22:00-06:00)
        current_time = check_time.time()
        
        # Если время между 22:00 и 23:59 или между 00:00 и 06:00 - форекс недоступен
        if (current_time >= self.forex_restricted_start or 
            current_time < self.forex_restricted_end):
            return False
        
        return True
    
    def get_market_status(self) -> Dict:
        """Возвращает подробную информацию о статусе рынка"""
        now = datetime.now(self.timezone)
        is_open = self.is_market_open(now)
        forex_available = self.is_forex_available(now)
        
        # Рассчитываем время до открытия/закрытия
        if is_open:
            # Рынок открыт - считаем время до закрытия
            close_today = self.timezone.localize(
                datetime.combine(now.date(), self.market_close_time)
            )
            time_until_change = close_today - now
            next_event = "закрытие"
        else:
            # Рынок закрыт - считаем время до открытия
            next_open = self._get_next_open_time(now)
            time_until_change = next_open - now
            next_event = "открытие"
        
        return {
            'is_open': is_open,
            'forex_available': forex_available,
            'current_time': now.strftime('%H:%M:%S'),
            'current_day': self._get_day_name(now.weekday()),
            'next_event': next_event,
            'time_until_change': str(time_until_change).split('.')[0],  # Убираем микросекунды
            'market_hours': f"{self.market_open_time.strftime('%H:%M')}-{self.market_close_time.strftime('%H:%M')}",
            'working_days': "Понедельник-Пятница",
            'forex_restriction': "Форекс недоступен с 22:00 до 6:00 по будням"
        }
    
    def _get_next_open_time(self, current_time: datetime) -> datetime:
        """Вычисляет время следующего открытия рынка"""
        current_date = current_time.date()
        
        # Если сегодня рабочий день и время еще не прошло
        if (current_time.weekday() in self.working_days and 
            current_time.time() < self.market_open_time):
            return self.timezone.localize(
                datetime.combine(current_date, self.market_open_time)
            )
        
        # Ищем следующий рабочий день
        days_ahead = 1
        while True:
            next_date = current_date.replace(day=current_date.day + days_ahead)
            try:
                next_datetime = datetime.combine(next_date, self.market_open_time)
                next_datetime = self.timezone.localize(next_datetime)
                
                if next_datetime.weekday() in self.working_days:
                    return next_datetime
                    
                days_ahead += 1
                if days_ahead > 7:  # Защита от бесконечного цикла
                    break
            except ValueError:
                # Обработка перехода месяца
                if current_date.month == 12:
                    next_date = current_date.replace(year=current_date.year + 1, month=1, day=1)
                else:
                    next_date = current_date.replace(month=current_date.month + 1, day=1)
                days_ahead = (next_date - current_date).days
        
        # Fallback - понедельник следующей недели
        days_until_monday = (7 - current_time.weekday()) % 7
        if days_until_monday == 0:
            days_until_monday = 7
        
        next_monday = current_date.replace(day=current_date.day + days_until_monday)
        return self.timezone.localize(
            datetime.combine(next_monday, self.market_open_time)
        )
    
    def _get_day_name(self, weekday: int) -> str:
        """Возвращает название дня недели"""
        days = {
            0: "Понедельник",
            1: "Вторник", 
            2: "Среда",
            3: "Четверг",
            4: "Пятница",
            5: "Суббота",
            6: "Воскресенье"
        }
        return days.get(weekday, "Неизвестно")
    
    def get_market_message(self, user_lang: str = "ru") -> str:
        """Возвращает сообщение о статусе рынка для пользователя"""
        try:
            from i18n_signals import get_interface_text
        except ImportError:
            # Fallback to Russian if i18n_signals is not available
            return self._get_fallback_market_message()
        
        status = self.get_market_status()
        
        if status['is_open']:
            forex_status = "🟢 Доступен" if status['forex_available'] else "🔴 Недоступен (22:00-06:00)"
            return (
                f"🟢 <b>{get_interface_text('market_open', 'title', user_lang)}</b>\n\n"
                f"🕒 {get_interface_text('market_status', 'current_time', user_lang)}: {status['current_time']} ({status['current_day']})\n"
                f"⏰ {get_interface_text('market_status', 'open_until', user_lang)}: {self.market_close_time.strftime('%H:%M')}\n"
                f"⏳ {get_interface_text('market_status', 'until_close', user_lang)}: {status['time_until_change']}\n"
                f"📊 Форекс: {forex_status}\n\n"
                f"💡 {get_interface_text('market_open', 'description', user_lang)}"
            )
        else:
            return (
                f"🔴 <b>{get_interface_text('market_closed', 'title', user_lang)}</b>\n\n"
                f"🕒 {get_interface_text('market_status', 'current_time', user_lang)}: {status['current_time']} ({status['current_day']})\n"
                f"📅 {get_interface_text('market_status', 'working_days', user_lang)}: {status['working_days']}\n"
                f"⏰ {get_interface_text('market_status', 'working_hours', user_lang)}: {status['market_hours']}\n"
                f"⏳ {get_interface_text('market_status', 'until_open', user_lang)}: {status['time_until_change']}\n\n"
                f"💡 {get_interface_text('market_closed', 'description', user_lang)}"
            )
    
    def _get_fallback_market_message(self) -> str:
        """Fallback market message in Russian if translations are not available"""
        status = self.get_market_status()
        
        if status['is_open']:
            forex_status = "🟢 Доступен" if status['forex_available'] else "🔴 Недоступен (22:00-06:00)"
            return (
                f"🟢 <b>Рынок ОТКРЫТ</b>\n\n"
                f"🕒 Текущее время: {status['current_time']} ({status['current_day']})\n"
                f"⏰ Работает до: {self.market_close_time.strftime('%H:%M')}\n"
                f"⏳ До закрытия: {status['time_until_change']}\n"
                f"📊 Форекс: {forex_status}\n\n"
                f"💡 Можно получать актуальные сигналы!"
            )
        else:
            return (
                f"🔴 <b>Рынок ЗАКРЫТ</b>\n\n"
                f"🕒 Текущее время: {status['current_time']} ({status['current_day']})\n"
                f"📅 Рабочие дни: {status['working_days']}\n"
                f"⏰ Рабочие часы: {status['market_hours']}\n"
                f"⏳ До открытия: {status['time_until_change']}\n\n"
                f"💡 Сейчас можно тестировать интерфейс.\n"
                f"Реальные сигналы будут доступны во время работы рынка."
            )


def test_market_schedule():
    """Тестирование расписания рынка"""
    print("📅 Тестирование расписания рынка...")
    
    schedule = MarketSchedule()
    
    # Текущий статус
    print("\n🕒 Текущий статус:")
    status = schedule.get_market_status()
    for key, value in status.items():
        print(f"   {key}: {value}")
    
    # Сообщение для пользователя
    print("\n📱 Сообщение для пользователя:")
    message = schedule.get_market_message()
    print(message)
    
    # Тест разного времени
    print("\n🧪 Тест разного времени:")
    test_times = [
        datetime(2025, 9, 19, 5, 30),   # Четверг 05:30 - закрыт
        datetime(2025, 9, 19, 10, 0),   # Четверг 10:00 - открыт
        datetime(2025, 9, 19, 23, 0),   # Четверг 23:00 - закрыт
        datetime(2025, 9, 21, 12, 0),   # Суббота 12:00 - закрыт
        datetime(2025, 9, 22, 12, 0),   # Воскресенье 12:00 - закрыт
    ]
    
    for test_time in test_times:
        is_open = schedule.is_market_open(test_time)
        forex_available = schedule.is_forex_available(test_time)
        market_status = "🟢 ОТКРЫТ" if is_open else "🔴 ЗАКРЫТ"
        forex_status = "🟢 Доступен" if forex_available else "🔴 Недоступен"
        print(f"   {test_time.strftime('%A %H:%M')}: Рынок {market_status}, Форекс {forex_status}")


if __name__ == "__main__":
    test_market_schedule()
