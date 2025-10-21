#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Система генерации форекс сигналов
Автономная копия из основного торгового бота

Версия: 1.0.0
Дата создания: 18.09.2025

Компоненты:
- TwelvedataAnalyzer: Получение данных через Twelvedata API
- TechnicalAnalyzer: Технический анализ с TA-Lib
- MarketDataFetcher: Получение и обработка рыночных данных
- APIOptimizer: Оптимизация и управление API запросами
- SignalGenerator: Главный класс генерации сигналов

Использование:
    from signal_generator import SignalGenerator
    
    generator = SignalGenerator("ваш_api_key")
    signal = await generator.generate_signal("EUR/USD")
"""

__version__ = "1.0.0"
__author__ = "Trading Bot System"
__email__ = "support@example.com"

# Импорты для удобства использования
from .signal_generator import SignalGenerator, ForexSignal
from .twelvedata_analyzer import TwelvedataAnalyzer
from .technical_analyzer import TechnicalAnalyzer
from .market_data_fetcher import MarketDataFetcher
from .api_optimizer import APIOptimizer

__all__ = [
    'SignalGenerator',
    'ForexSignal',
    'TwelvedataAnalyzer',
    'TechnicalAnalyzer', 
    'MarketDataFetcher',
    'APIOptimizer'
]
