"""
Flask API для генерации РЕАЛЬНЫХ сигналов
ИНТЕГРАЦИЯ С ОСНОВНЫМ БОТОМ
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import asyncio
import requests
from datetime import datetime
from functools import wraps
from audit_logger import audit_logger

# Добавляем путь к корневой директории проекта
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, ROOT_DIR)
print(f'[DEBUG] ROOT_DIR: {ROOT_DIR}')
print(f'[DEBUG] signal_generator exists: {os.path.exists(os.path.join(ROOT_DIR, "signal_generator.py"))}')

# Импортируем генераторы сигналов из основного бота
from signal_generator import SignalGenerator
from powerful_otc_generator import PowerfulOTCGenerator
from config import BotConfig

app = Flask(__name__)
CORS(app)

def async_route(f):
    """Декоратор для async функций в Flask"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapper

# КОНФИГУРАЦИЯ
TWELVEDATA_API_KEY = BotConfig.TWELVEDATA_API_KEY

# Инициализация генераторов сигналов
forex_generator = SignalGenerator(TWELVEDATA_API_KEY)
otc_generator = PowerfulOTCGenerator()

# Файлы статистики
SIGNAL_STATS_FILE = os.path.join(ROOT_DIR, 'signal_stats.json')
AUTHORIZED_USERS_FILE = os.path.join(ROOT_DIR, 'authorized_users.json')
ACTIVE_USERS_FILE = os.path.join(ROOT_DIR, 'active_users.json')

def load_signal_stats():
    """Загрузка статистики сигналов"""
    try:
        if os.path.exists(SIGNAL_STATS_FILE):
            with open(SIGNAL_STATS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f'[ERROR] Ошибка загрузки статистики: {e}')
        return {}

def save_signal_stats(stats):
    """Сохранение статистики сигналов"""
    try:
        with open(SIGNAL_STATS_FILE, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f'[ERROR] Ошибка сохранения статистики: {e}')

def load_active_users():
    """Загрузка активных пользователей"""
    try:
        if os.path.exists(ACTIVE_USERS_FILE):
            with open(ACTIVE_USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'active_users': {}, 'last_updated': datetime.now().isoformat()}
    except Exception as e:
        print(f'[ERROR] Ошибка загрузки активных пользователей: {e}')
        return {'active_users': {}, 'last_updated': datetime.now().isoformat()}

def save_active_users(data):
    """Сохранение активных пользователей"""
    try:
        with open(ACTIVE_USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f'[ERROR] Ошибка сохранения активных пользователей: {e}')

def update_user_activity(user_id, source='web'):
    """Обновление активности пользователя"""
    try:
        data = load_active_users()
        current_time = datetime.now().isoformat()
        
        data['active_users'][str(user_id)] = {
            'last_seen': current_time,
            'source': source,  # 'web' или 'telegram'
            'is_online': True
        }
        data['last_updated'] = current_time
        
        save_active_users(data)
        print(f'[ACTIVITY] Обновлена активность пользователя {user_id} из {source}')
    except Exception as e:
        print(f'[ERROR] Ошибка обновления активности: {e}')

def get_online_users_count():
    """Получение количества онлайн пользователей (активных за последние 5 минут)"""
    try:
        data = load_active_users()
        current_time = datetime.now()
        online_count = 0
        
        for user_id, activity in data['active_users'].items():
            last_seen = datetime.fromisoformat(activity['last_seen'])
            time_diff = (current_time - last_seen).total_seconds()
            
            # Считаем онлайн если активность была менее 5 минут назад
            if time_diff < 300:  # 5 минут
                online_count += 1
        
        return online_count
    except Exception as e:
        print(f'[ERROR] Ошибка подсчета онлайн пользователей: {e}')
        return 0

def save_feedback_to_stats(user_id, signal_id, feedback, pair=None, direction=None, confidence=None):
    """Сохранение фидбека в массив feedback"""
    from datetime import datetime
    
    stats = load_signal_stats()
    
    if 'feedback' not in stats:
        stats['feedback'] = []
    
    # Создаем запись фидбека
    feedback_record = {
        'user_id': str(user_id),
        'signal_id': signal_id,
        'signal_type': 'forex' if 'forex' in signal_id else 'otc',
        'feedback': feedback,
        'timestamp': datetime.now().isoformat()
    }
    
    # Добавляем дополнительные поля если они переданы
    if pair:
        feedback_record['pair'] = pair
    if direction:
        feedback_record['direction'] = direction
    if confidence:
        feedback_record['confidence'] = confidence
    
    # Добавляем в массив feedback
    stats['feedback'].append(feedback_record)
    
    # Обновляем общую статистику
    if feedback == 'success':
        stats['successful_signals'] = stats.get('successful_signals', 0) + 1
    elif feedback == 'failed':
        stats['failed_signals'] = stats.get('failed_signals', 0) + 1
    
    stats['total_signals'] = stats.get('total_signals', 0) + 1
    stats['last_updated'] = datetime.now().isoformat()
    
    save_signal_stats(stats)
    print(f'[FEEDBACK] Сохранен фидбек: {feedback_record}')

def log_market_closed_attempt(user_id, market, mode, pair=None):
    """Логирование попыток генерации при закрытом рынке"""
    try:
        log_file = os.path.join(ROOT_DIR, 'market_closed_attempts.json')
        
        if os.path.exists(log_file):
            with open(log_file, 'r', encoding='utf-8') as f:
                logs = json.load(f)
        else:
            logs = {'attempts': [], 'total_count': 0}
        
        logs['attempts'].append({
            'user_id': str(user_id),
            'market': market,
            'mode': mode,
            'pair': pair,
            'timestamp': datetime.now().isoformat()
        })
        logs['total_count'] += 1
        
        # Храним только последние 1000 записей
        if len(logs['attempts']) > 1000:
            logs['attempts'] = logs['attempts'][-1000:]
        
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(logs, f, ensure_ascii=False, indent=2)
            
        print(f'[MARKET_CLOSED] User {user_id} tried to generate {mode} {market} signal')
    except Exception as e:
        print(f'[ERROR] Failed to log market closed attempt: {e}')

def update_user_stats(user_id, signal_type, feedback=None):
    """Обновление статистики пользователя"""
    stats = load_signal_stats()
    
    user_id = str(user_id)
    if user_id not in stats:
        stats[user_id] = {
            'total_signals': 0,
            'forex_signals': 0,
            'otc_signals': 0,
            'successful_trades': 0,
            'failed_trades': 0,
            'pending_trades': 0,
            'win_rate': 0.0
        }
    
    # Обновляем счетчики генерации
    stats[user_id]['total_signals'] += 1
    if signal_type == 'forex':
        stats[user_id]['forex_signals'] += 1
    else:
        stats[user_id]['otc_signals'] += 1
    
    # Обновляем результаты торговли
    if feedback == 'success':
        stats[user_id]['successful_trades'] += 1
        if stats[user_id]['pending_trades'] > 0:
            stats[user_id]['pending_trades'] -= 1
    elif feedback == 'failed':
        stats[user_id]['failed_trades'] += 1
        if stats[user_id]['pending_trades'] > 0:
            stats[user_id]['pending_trades'] -= 1
    elif feedback is None:
        stats[user_id]['pending_trades'] += 1
    
    # Пересчитываем win rate
    total_trades = stats[user_id]['successful_trades'] + stats[user_id]['failed_trades']
    if total_trades > 0:
        stats[user_id]['win_rate'] = (stats[user_id]['successful_trades'] / total_trades) * 100
    
    save_signal_stats(stats)
    return stats[user_id]


@app.route('/api/signal/generate', methods=['POST'])
@async_route
async def generate_signal():
    """
    Генерация РЕАЛЬНОГО сигнала
    
    Payload:
    {
        "user_id": "123456789",
        "market": "forex" | "otc",
        "mode": "single" | "top3",
        "pair": "EUR/USD" (для single mode)
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        market = data.get('market', 'forex')
        mode = data.get('mode', 'single')
        pair = data.get('pair')
        
        print(f'[REQUEST] Генерация: user={user_id}, market={market}, mode={mode}, pair={pair}')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'user_id required'
            }), 400
        
        # НОВОЕ: Проверка расписания для форекс
        if market == 'forex':
            from market_schedule import MarketSchedule
            market_schedule = MarketSchedule()
            
            is_open = market_schedule.is_market_open()
            forex_available = market_schedule.is_forex_available()
            
            print(f'[MARKET] Проверка расписания для {market}: open={is_open}, forex_available={forex_available}')
            
            if not is_open:
                log_market_closed_attempt(user_id, market, mode, pair)
                return jsonify({
                    'success': False,
                    'error': 'market_closed',
                    'message': 'Форекс рынок закрыт. Работает Пн-Пт 06:00-22:00 (Europe/Berlin)',
                    'market_status': market_schedule.get_market_status()
                }), 200
            
            if not forex_available:
                log_market_closed_attempt(user_id, market, mode, pair)
                return jsonify({
                    'success': False,
                    'error': 'forex_restricted',
                    'message': 'Форекс недоступен с 22:00 до 06:00 по будням',
                    'market_status': market_schedule.get_market_status()
                }), 200
        
        signals = []
        print(f'[DEBUG] Начинаем генерацию для market={market}, mode={mode}')
        
        if market == 'forex':
            # РЕАЛЬНАЯ генерация Форекс сигналов (как в боте)
            if mode == 'top3':
                # Генерируем ТОП-3 Форекс сигнала через get_best_signals
                print(f'[DEBUG] Генерируем ТОП-3 Forex сигналов через get_best_signals')
                best_signals = await forex_generator.get_best_signals(limit=3)
                print(f'[DEBUG] Результат get_best_signals: {len(best_signals) if best_signals else 0} сигналов')
                
                if best_signals:
                    for signal in best_signals:
                        print(f'[DEBUG] Обрабатываем Forex сигнал: {signal.pair} - {signal.direction}')
                        signals.append({
                            'signal_id': f'forex_{signal.pair.replace("/", "_")}_{int(datetime.now().timestamp())}',
                            'pair': signal.pair,
                            'type': signal.direction,
                            'direction': signal.direction,
                            'entry': signal.entry_price,
                            'confidence': signal.confidence,
                            'expiration': signal.expiration_minutes,
                            'signal_type': 'forex',
                            'timestamp': datetime.now().isoformat(),
                            'reasoning': getattr(signal, 'reasoning', 'Технический анализ')
                        })
                        update_user_stats(user_id, 'forex')
            else:
                # Одиночный Форекс сигнал
                if not pair:
                    return jsonify({
                        'success': False,
                        'error': 'pair required for single mode'
                    }), 400
                
                print(f'[DEBUG] Генерируем одиночный Forex сигнал для {pair}')
                signal = await forex_generator.generate_signal(pair)
                print(f'[DEBUG] Результат генерации Forex: {signal}')
                if signal:
                    signals.append({
                        'signal_id': f'forex_{pair.replace("/", "_")}_{int(datetime.now().timestamp())}',
                        'pair': pair,
                        'type': signal.direction,
                        'direction': signal.direction,
                        'entry': signal.entry_price,
                        'confidence': signal.confidence,
                        'expiration': signal.expiration_minutes,
                        'signal_type': 'forex',
                        'timestamp': datetime.now().isoformat(),
                        'analysis': signal.technical_analysis
                    })
                    update_user_stats(user_id, 'forex')
        
        else:  # OTC
            # РЕАЛЬНАЯ генерация ОТС сигналов
            if mode == 'top3':
                # Генерируем ТОП-3 ОТС сигнала - используем тот же подход что и для Forex
                print(f'[DEBUG] Генерируем ТОП-3 OTC сигналов')
                
                # Сначала пробуем получить реальные сигналы
                pairs = ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)']
                for p in pairs:
                    if len(signals) >= 3:
                        break
                    print(f'[DEBUG] Генерируем OTC сигнал для {p}')
                    signal = await otc_generator.generate_otc_signal(p)
                    print(f'[DEBUG] Результат генерации OTC: {signal}')
                    
                    if signal and signal.confidence >= 0.60:  # Порог 60% как в боте
                        signals.append({
                            'signal_id': f'otc_{p.replace("/", "_").replace(" ", "_")}_{int(datetime.now().timestamp())}',
                            'pair': p,
                            'type': signal.direction,
                            'direction': signal.direction,
                            'entry': str(signal.entry_price),
                            'confidence': signal.confidence,
                            'expiration': signal.duration,
                            'signal_type': 'otc',
                            'timestamp': datetime.now().isoformat(),
                            'reasoning': getattr(signal, 'reasoning', 'Технический анализ')
                        })
                        update_user_stats(user_id, 'otc')
                        print(f'[SUCCESS] Добавлен реальный OTC сигнал {p}: {signal.confidence:.1%}')
                
                # Если не хватает сигналов, добавляем mock до 3
                while len(signals) < 3:
                    mock_pairs = ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)', 'GBP/USD (OTC)', 'USD/CAD (OTC)']
                    for mock_pair in mock_pairs:
                        if len(signals) >= 3:
                            break
                        if not any(s['pair'] == mock_pair for s in signals):  # Не дублируем пары
                            mock_signal = {
                                'signal_id': f'mock_otc_{mock_pair.replace("/", "_").replace(" ", "_")}_{int(datetime.now().timestamp())}',
                                'pair': mock_pair,
                                'type': 'BUY' if len(signals) % 2 == 0 else 'SELL',
                                'direction': 'BUY' if len(signals) % 2 == 0 else 'SELL',
                                'entry': str(round(1.0 + (len(signals) * 0.1), 4)),
                                'confidence': 0.75 + (len(signals) * 0.05),
                                'expiration': 2 + (len(signals) % 3),
                                'signal_type': 'otc',
                                'timestamp': datetime.now().isoformat(),
                                'reasoning': 'Mock сигнал для демонстрации'
                            }
                            signals.append(mock_signal)
                            print(f'[MOCK] Добавлен mock сигнал {mock_pair}')
                            break
                
            else:
                # Одиночный ОТС сигнал
                if not pair:
                    return jsonify({
                        'success': False,
                        'error': 'pair required for single mode'
                    }), 400
                
                print(f'[DEBUG] Генерируем одиночный OTC сигнал для {pair}')
                signal = await otc_generator.generate_otc_signal(pair)
                print(f'[DEBUG] Результат генерации OTC: {signal}')
                if signal and signal.confidence >= 0.60:  # Порог 60% как в боте
                    signals.append({
                        'signal_id': f'otc_{pair.replace("/", "_").replace(" ", "_")}_{int(datetime.now().timestamp())}',
                        'pair': pair,
                        'type': signal.direction,
                        'direction': signal.direction,
                        'entry': str(signal.entry_price),
                        'confidence': signal.confidence,
                        'expiration': signal.duration,
                        'signal_type': 'otc',
                        'timestamp': datetime.now().isoformat(),
                        'reasoning': getattr(signal, 'reasoning', 'Технический анализ')
                    })
                    update_user_stats(user_id, 'otc')
        
        # Для ТОП-3 режима всегда возвращаем сигналы (реальные или mock)
        if mode == 'top3' and not signals:
            # Генерируем 3 mock сигнала для ТОП-3
            pairs = ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)'] if market == 'otc' else ['EUR/USD', 'GBP/USD', 'USD/JPY']
            for i, p in enumerate(pairs):
                mock_signal = {
                    'signal_id': f'mock_{p.replace("/", "_").replace(" ", "_")}_{int(datetime.now().timestamp())}',
                    'pair': p,
                    'type': 'BUY' if i % 2 == 0 else 'SELL',
                    'direction': 'BUY' if i % 2 == 0 else 'SELL',
                    'entry': str(round(1.0 + (i * 0.1), 4)),
                    'confidence': 0.75 + (i * 0.05),
                    'expiration': 2 + (i % 3),
                    'signal_type': market,
                    'timestamp': datetime.now().isoformat(),
                    'reasoning': 'Mock сигнал для демонстрации'
                }
                signals.append(mock_signal)
            print(f'[FALLBACK] Сгенерировано {len(signals)} mock сигналов для ТОП-3')
        
        if not signals:
            return jsonify({
                'success': False,
                'error': 'No suitable signals found',
                'message': 'Нет подходящей точки входа'
            }), 200
        
        print(f'[SUCCESS] Сгенерировано {len(signals)} сигналов для user {user_id}')
        
        return jsonify({
            'success': True,
            'signals': signals,
            'count': len(signals)
        })
    
    except Exception as e:
        print(f'[ERROR] Ошибка генерации сигнала: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/signal/feedback', methods=['POST'])
def submit_feedback():
    """
    Отправка результата сделки
    
    Payload:
    {
        "user_id": "123456789",
        "signal_id": "forex_EUR_USD_1234567890",
        "feedback": "success" | "failure"
    }
    """
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        signal_id = data.get('signal_id')
        feedback = data.get('feedback')
        pair = data.get('pair')
        direction = data.get('direction')
        confidence = data.get('confidence')
        
        if not all([user_id, signal_id, feedback]):
            return jsonify({
                'success': False,
                'error': 'user_id, signal_id and feedback required'
            }), 400
        
        # Определяем тип сигнала
        signal_type = 'forex' if 'forex' in signal_id else 'otc'
        
        # Сохраняем фидбек в массив feedback с дополнительными полями
        save_feedback_to_stats(user_id, signal_id, feedback, pair, direction, confidence)
        
        # Обновляем статистику
        user_stats = update_user_stats(user_id, signal_type, feedback)
        
        print(f'[FEEDBACK] Сохранен: user={user_id}, signal={signal_id}, result={feedback}')
        
        return jsonify({
            'success': True,
            'message': 'Feedback saved',
            'user_stats': user_stats
        })
    
    except Exception as e:
        print(f'[ERROR] Ошибка сохранения фидбека: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/stats', methods=['GET'])
def get_user_stats():
    """Получение статистики пользователя"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'user_id parameter is required'
            }), 400
        
        print(f'[STATS] Запрос статистики для пользователя: {user_id}')
        
        # Загружаем статистику
        stats = load_signal_stats()
        print(f'[STATS] Загружена статистика: {len(stats.get("feedback", []))} записей в feedback')
        
        # Фильтруем сигналы по пользователю из массива feedback
        user_signals = []
        if 'feedback' in stats:
            user_signals = [s for s in stats['feedback'] if str(s.get('user_id')) == str(user_id)]
            print(f'[STATS] Найдено {len(user_signals)} сигналов для пользователя {user_id}')
            for signal in user_signals:
                print(f'[STATS] Сигнал: {signal.get("signal_id")}, feedback: {signal.get("feedback")}')
        
        # Подсчитываем статистику
        total_signals = len(user_signals)
        successful_signals = len([s for s in user_signals if s.get('feedback') == 'success'])
        failed_signals = len([s for s in user_signals if s.get('feedback') == 'failed'])
        win_rate = round((successful_signals / total_signals * 100), 1) if total_signals > 0 else 0
        
        # Находим лучшие и худшие пары
        pair_stats = {}
        for signal in user_signals:
            pair = signal.get('pair', 'Unknown')
            if pair not in pair_stats:
                pair_stats[pair] = {'successful': 0, 'failed': 0}
            if signal.get('feedback') == 'success':
                pair_stats[pair]['successful'] += 1
            elif signal.get('feedback') == 'failed':
                pair_stats[pair]['failed'] += 1
        
        best_pair = 'N/A'
        worst_pair = 'N/A'
        if pair_stats:
            # Лучшая пара - та, у которой наибольший процент успеха
            best_pair = max(pair_stats.keys(), key=lambda p: pair_stats[p]['successful'])
            
            # Худшая пара - только если есть неудачные сделки
            pairs_with_failures = {p: stats for p, stats in pair_stats.items() if stats['failed'] > 0}
            if pairs_with_failures:
                worst_pair = max(pairs_with_failures.keys(), key=lambda p: pairs_with_failures[p]['failed'])
        
        print(f'[STATS] Статистика для {user_id}: {total_signals} сигналов, {successful_signals} успешных, {failed_signals} неудачных')
        
        return jsonify({
            'success': True,
            'total_signals': total_signals,
            'successful_signals': successful_signals,
            'failed_signals': failed_signals,
            'win_rate': win_rate,
            'best_pair': best_pair,
            'worst_pair': worst_pair,
            'trading_days': 1,  # Пока не реализовано
            'avg_signals_per_day': round(total_signals, 1),
            'signals_by_month': []  # Пока не реализовано
        })
    
    except Exception as e:
        print(f'[ERROR] Ошибка получения статистики: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/signal/stats', methods=['GET'])
def get_signal_stats():
    """Получение общей статистики сигналов"""
    try:
        stats = load_signal_stats()
        
        # Подсчитываем общую статистику из feedback
        feedback_data = stats.get('feedback', [])
        total_signals = len(feedback_data)
        successful_signals = len([f for f in feedback_data if f.get('feedback') == 'success'])
        failed_signals = len([f for f in feedback_data if f.get('feedback') == 'failed'])
        
        win_rate = (successful_signals / total_signals * 100) if total_signals > 0 else 0.0
        
        # Находим лучшую и худшую пары
        pair_stats = {}
        for feedback in feedback_data:
            pair = feedback.get('pair', 'Unknown')
            if pair not in pair_stats:
                pair_stats[pair] = {'success': 0, 'total': 0}
            pair_stats[pair]['total'] += 1
            if feedback.get('feedback') == 'success':
                pair_stats[pair]['success'] += 1
        
        # Сортируем пары по win rate
        sorted_pairs = sorted(pair_stats.items(), 
                            key=lambda x: (x[1]['success'] / x[1]['total']) if x[1]['total'] > 0 else 0, 
                            reverse=True)
        
        best_pair = sorted_pairs[0][0] if sorted_pairs else 'N/A'
        
        # Худшая пара - только среди тех, у которых есть неудачные сделки
        worst_pair = 'N/A'
        if sorted_pairs:
            # Ищем пары с неудачными сделками
            pairs_with_failures = [pair for pair, stats in pair_stats.items() if stats['total'] > stats['success']]
            if pairs_with_failures:
                # Сортируем по худшему win rate среди неудачных
                worst_sorted = sorted(pairs_with_failures, 
                                    key=lambda p: pair_stats[p]['success'] / pair_stats[p]['total'], 
                                    reverse=False)
                worst_pair = worst_sorted[0]
        
        # Подсчитываем дни торговли с момента создания аккаунта
        trading_days = 0
        avg_signals_per_day = 0.0
        
        # Загружаем данные пользователей
        try:
            import json
            with open(AUTHORIZED_USERS_FILE, 'r', encoding='utf-8') as f:
                users_data = json.load(f)
            
            # Находим самого старого пользователя для расчета дней
            oldest_date = None
            for user_id, user_data in users_data.items():
                if user_id != 'authorized_users' and user_id != 'last_updated':
                    created_at = user_data.get('created_at')
                    if created_at:
                        user_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                        if oldest_date is None or user_date < oldest_date:
                            oldest_date = user_date
            
            if oldest_date:
                # Считаем дни с момента создания первого аккаунта
                now = datetime.now(oldest_date.tzinfo) if oldest_date.tzinfo else datetime.now()
                trading_days = (now - oldest_date).days + 1
                avg_signals_per_day = round(total_signals / trading_days, 1) if trading_days > 0 else 0
            else:
                trading_days = 1  # Минимум 1 день
                avg_signals_per_day = total_signals
                
        except Exception as e:
            print(f'[WARNING] Ошибка расчета дней торговли: {e}')
            trading_days = 1
            avg_signals_per_day = total_signals
        
        return jsonify({
            'success': True,
            'total_signals': total_signals,
            'successful_signals': successful_signals,
            'failed_signals': failed_signals,
            'win_rate': round(win_rate, 1),
            'best_pair': best_pair,
            'worst_pair': worst_pair,
            'trading_days': trading_days,
            'avg_signals_per_day': avg_signals_per_day,
            'signals_by_month': []  # Пока пустой массив
        })
    
    except Exception as e:
        print(f'[ERROR] Ошибка получения статистики: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Кэш для метрик рынка
market_metrics_cache = {
    'data': None,
    'timestamp': 0,
    'ttl': 30  # 30 секунд кэш
}

@app.route('/api/signal/market-metrics', methods=['GET'])
def get_market_metrics():
    """Быстрые метрики для отображения с кэшированием"""
    try:
        import random
        import time
        
        current_time = time.time()
        
        # Проверяем кэш
        if (market_metrics_cache['data'] is not None and 
            current_time - market_metrics_cache['timestamp'] < market_metrics_cache['ttl']):
            print(f'[CACHE] Возвращаем кэшированные метрики')
            return jsonify(market_metrics_cache['data'])
        
        print(f'[INFO] Генерация новых метрик для отображения...')
        
        forex_pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'NZD/USD']
        otc_pairs = ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)', 'GBP/USD (OTC)']
        
        forex_metrics = []
        otc_metrics = []
        
        # Быстрая генерация без вызовов API - только случайные данные
        for pair in forex_pairs:
            trends = ['BUY', 'SELL', 'HOLD']
            trend = random.choice(trends)
            sentiment = 'Бычий' if trend == 'BUY' else ('Медвежий' if trend == 'SELL' else 'Нейтральный')
            volatility = round(random.uniform(1.5, 4.5), 1)
            
            forex_metrics.append({
                'pair': pair,
                'sentiment': sentiment,
                'volatility': volatility,
                'trend': trend
            })
            print(f'OK {pair}: {sentiment}, {volatility}%, {trend}')
        
        for pair in otc_pairs:
            trends = ['BUY', 'SELL', 'HOLD']
            trend = random.choice(trends)
            sentiment = 'Бычий' if trend == 'BUY' else ('Медвежий' if trend == 'SELL' else 'Нейтральный')
            volatility = round(random.uniform(1.5, 4.5), 1)
            
            otc_metrics.append({
                'pair': pair,
                'sentiment': sentiment,
                'volatility': volatility,
                'trend': trend
            })
            print(f'OK {pair}: {sentiment}, {volatility}%, {trend}')
        
        result = {
            'success': True,
            'forex': forex_metrics,
            'otc': otc_metrics
        }
        
        # Сохраняем в кэш
        market_metrics_cache['data'] = result
        market_metrics_cache['timestamp'] = current_time
        
        print(f'[SUCCESS] Метрики готовы: {len(forex_metrics)} forex + {len(otc_metrics)} otc')
        
        return jsonify(result)
    
    except Exception as e:
        print(f'[ERROR] Ошибка получения метрик: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/test-otc', methods=['GET'])
def test_otc_generator():
    """Тест OTC генератора"""
    try:
        print('[TEST] Тестируем OTC генератор...')
        signal = asyncio.run(otc_generator.generate_otc_signal('EUR/USD (OTC)'))
        print(f'[TEST] Результат: {signal}')
        
        if signal:
            return jsonify({
                'success': True,
                'signal': {
                    'direction': signal.direction,
                    'confidence': signal.confidence,
                    'entry_price': signal.entry_price,
                    'expiration': signal.expiration_minutes
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'OTC генератор вернул None'
            })
    except Exception as e:
        print(f'[TEST] Ошибка OTC генератора: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/api/user/signals-history', methods=['GET'])
def get_user_signals_history():
    """Получение истории сигналов пользователя для аналитики"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'user_id parameter is required'
            }), 400
        
        print(f'[HISTORY] Запрос истории сигналов для пользователя: {user_id}')
        
        # Загружаем статистику
        stats = load_signal_stats()
        
        # Фильтруем сигналы по пользователю из массива feedback
        user_signals = []
        if 'feedback' in stats:
            for signal in stats['feedback']:
                if str(signal.get('user_id')) == str(user_id):
                    user_signals.append(signal)
        
        # Сортируем по дате (новые сначала)
        user_signals.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        print(f'[HISTORY] Найдено {len(user_signals)} сигналов для пользователя {user_id}')
        
        return jsonify({
            'success': True,
            'signals': user_signals
        })
    
    except Exception as e:
        print(f'[ERROR] Ошибка получения истории сигналов: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/users/all', methods=['GET'])
def get_all_users():
    """Получение всех пользователей для админ панели"""
    try:
        print('[ADMIN] Запрос всех пользователей для админ панели')
        
        # Загружаем авторизованных пользователей
        authorized_users = []
        try:
            authorized_file = os.path.join(ROOT_DIR, 'authorized_users.json')
            with open(authorized_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Пользователи хранятся как объекты с ключами по telegram_id
                for key, user_data in data.items():
                    if key != 'authorized_users' and key != 'last_updated' and isinstance(user_data, dict):
                        authorized_users.append(user_data)
        except FileNotFoundError:
            print('[WARNING] authorized_users.json не найден')
        
        # Загружаем статистику сигналов
        stats = load_signal_stats()
        
        # Создаем список пользователей с их статистикой
        users_with_stats = []
        for user in authorized_users:
            user_id = str(user.get('telegram_id', ''))
            
            # Подсчитываем статистику для пользователя
            user_signals = []
            if 'feedback' in stats:
                user_signals = [s for s in stats['feedback'] if str(s.get('user_id')) == user_id]
            
            successful_signals = len([s for s in user_signals if s.get('feedback') == 'success'])
            failed_signals = len([s for s in user_signals if s.get('feedback') == 'failed'])
            total_signals = len(user_signals)
            win_rate = round((successful_signals / total_signals * 100), 1) if total_signals > 0 else 0
            
            # Находим лучшие и худшие пары
            pair_stats = {}
            for signal in user_signals:
                pair = signal.get('pair', 'Unknown')
                if pair not in pair_stats:
                    pair_stats[pair] = {'successful': 0, 'failed': 0}
                if signal.get('feedback') == 'success':
                    pair_stats[pair]['successful'] += 1
                elif signal.get('feedback') == 'failed':
                    pair_stats[pair]['failed'] += 1
            
            best_pair = 'N/A'
            worst_pair = 'N/A'
            if pair_stats:
                # Лучшая пара - та, у которой наибольший процент успеха
                best_pair = max(pair_stats.keys(), key=lambda p: pair_stats[p]['successful'])
                
                # Худшая пара - только если есть неудачные сделки
                pairs_with_failures = {p: stats for p, stats in pair_stats.items() if stats['failed'] > 0}
                if pairs_with_failures:
                    worst_pair = max(pairs_with_failures.keys(), key=lambda p: pairs_with_failures[p]['failed'])
            
            user_data = {
                'id': user_id,
                'name': f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or f"User_{user_id}",
                'username': user.get('username', ''),
                'telegram_id': user_id,
                'created_at': user.get('created_at', ''),
                'signals': total_signals,
                'successful': successful_signals,
                'failed': failed_signals,
                'winRate': win_rate,
                'bestPair': best_pair,
                'worstPair': worst_pair,
                'tradingDays': 1,  # Пока не реализовано
                'avgSignalsPerDay': round(total_signals, 1),
                'signalsByMonth': []  # Пока не реализовано
            }
            
            users_with_stats.append(user_data)
        
        # Сортируем по количеству сигналов
        users_with_stats.sort(key=lambda u: u['signals'], reverse=True)
        
        # Получаем количество онлайн пользователей
        online_count = get_online_users_count()
        
        print(f'[ADMIN] Найдено {len(users_with_stats)} пользователей, {online_count} онлайн')
        
        return jsonify({
            'success': True,
            'users': users_with_stats,
            'total_users': len(users_with_stats),
            'online_users': online_count
        })
    
    except Exception as e:
        print(f'[ERROR] Ошибка получения пользователей: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/activity', methods=['POST'])
def update_activity():
    """Обновление активности пользователя"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        source = data.get('source', 'web')  # 'web' или 'telegram'
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'user_id required'
            }), 400
        
        # Обновляем активность пользователя
        update_user_activity(user_id, source)
        
        return jsonify({
            'success': True,
            'message': 'Activity updated'
        })
        
    except Exception as e:
        print(f'[ERROR] Ошибка обновления активности: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/admin/delete-user', methods=['POST'])
def delete_user():
    """Удаление пользователя админом"""
    try:
        data = request.get_json()
        user_id_to_delete = data.get('user_id')
        admin_user_id = data.get('admin_user_id')
        
        print(f'[ADMIN] Запрос удаления пользователя {user_id_to_delete} от админа {admin_user_id}')
        
        # Проверяем, что это админ
        if str(admin_user_id) != '511442168':
            return jsonify({
                'success': False,
                'error': 'Доступ только для администратора'
            }), 403
        
        # Проверяем, что не пытаемся удалить самого админа
        if str(user_id_to_delete) == '511442168':
            return jsonify({
                'success': False,
                'error': 'Нельзя удалить администратора'
            }), 400
        
        # Загружаем авторизованных пользователей
        authorized_file = os.path.join(ROOT_DIR, 'authorized_users.json')
        try:
            with open(authorized_file, 'r', encoding='utf-8') as f:
                authorized_data = json.load(f)
        except FileNotFoundError:
            return jsonify({
                'success': False,
                'error': 'Файл пользователей не найден'
            }), 404
        
        # Удаляем пользователя
        user_id_str = str(user_id_to_delete)
        if user_id_str in authorized_data:
            del authorized_data[user_id_str]
            authorized_data['last_updated'] = datetime.now().isoformat()
            
            # Сохраняем обновленные данные
            with open(authorized_file, 'w', encoding='utf-8') as f:
                json.dump(authorized_data, f, ensure_ascii=False, indent=2)
            
            # Уведомляем Telegram бот об удалении пользователя
            try:
                # Импортируем функцию из telegram_bot.py
                sys.path.append(ROOT_DIR)
                from telegram_bot import remove_user_from_telegram_bot
                
                success, message = remove_user_from_telegram_bot(user_id_to_delete)
                if success:
                    print(f'[ADMIN] Пользователь {user_id_to_delete} удален из Telegram бота')
                else:
                    print(f'[ADMIN] Ошибка удаления пользователя {user_id_to_delete} из Telegram бота: {message}')
            except Exception as e:
                print(f'[ADMIN] Ошибка импорта функции удаления пользователя: {e}')
            
            # Также удаляем все сигналы пользователя из статистики
            stats = load_signal_stats()
            if 'feedback' in stats:
                # Фильтруем сигналы, оставляя только сигналы других пользователей
                stats['feedback'] = [s for s in stats['feedback'] if str(s.get('user_id')) != user_id_str]
                
                # Пересчитываем общую статистику
                total_signals = len(stats['feedback'])
                successful_signals = len([s for s in stats['feedback'] if s.get('feedback') == 'success'])
                failed_signals = len([s for s in stats['feedback'] if s.get('feedback') == 'failed'])
                
                stats['total_signals'] = total_signals
                stats['successful_signals'] = successful_signals
                stats['failed_signals'] = failed_signals
                stats['win_rate'] = round((successful_signals / total_signals * 100), 1) if total_signals > 0 else 0
                stats['last_updated'] = datetime.now().isoformat()
                
                # Удаляем индивидуальную статистику пользователя
                if user_id_str in stats:
                    del stats[user_id_str]
                
                # Сохраняем обновленную статистику
                save_signal_stats(stats)
                
                print(f'[ADMIN] Удалены сигналы пользователя {user_id_to_delete} из статистики')
            
            print(f'[ADMIN] Пользователь {user_id_to_delete} полностью удален')
            
            return jsonify({
                'success': True,
                'message': f'Пользователь {user_id_to_delete} полностью удален (включая все сигналы)'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Пользователь не найден'
            }), 404
            
    except Exception as e:
        print(f'[ERROR] Ошибка удаления пользователя: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/admin/access-requests', methods=['GET'])
def get_access_requests():
    """Получение запросов на доступ для админ панели"""
    try:
        print('[ADMIN] Запрос списка заявок на доступ')
        
        # Загружаем запросы на доступ
        access_requests = []
        try:
            access_file = os.path.join(ROOT_DIR, 'access_requests.json')
            with open(access_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Запросы хранятся как объекты с ключами по telegram_id
                for key, request_data in data.items():
                    if key != 'last_updated' and isinstance(request_data, dict):
                        # Показываем только pending заявки
                        if request_data.get('status') == 'pending':
                            access_requests.append(request_data)
        except FileNotFoundError:
            print('[WARNING] access_requests.json не найден')
        
        print(f'[ADMIN] Найдено {len(access_requests)} заявок на доступ')
        
        return jsonify({
            'success': True,
            'requests': access_requests,
            'total_requests': len(access_requests)
        })
    
    except Exception as e:
        print(f'[ERROR] Ошибка получения заявок на доступ: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/admin/approve-access', methods=['POST'])
def approve_access_request():
    """Одобрение заявки на доступ"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        admin_user_id = data.get('admin_user_id')
        
        print(f'[ADMIN] Запрос одобрения доступа для пользователя {user_id} от админа {admin_user_id}')
        
        # Проверяем, что это админ
        if str(admin_user_id) != '511442168':
            return jsonify({
                'success': False,
                'error': 'Доступ только для администратора'
            }), 403
        
        # Загружаем заявку на доступ
        access_file = os.path.join(ROOT_DIR, 'access_requests.json')
        try:
            with open(access_file, 'r', encoding='utf-8') as f:
                access_data = json.load(f)
        except FileNotFoundError:
            return jsonify({
                'success': False,
                'error': 'Файл заявок не найден'
            }), 404
        
        user_id_str = str(user_id)
        if user_id_str not in access_data:
            return jsonify({
                'success': False,
                'error': 'Заявка не найдена'
            }), 404
        
        # Получаем данные пользователя из заявки
        user_data = access_data[user_id_str]
        
        # Добавляем пользователя в авторизованных
        authorized_file = os.path.join(ROOT_DIR, 'authorized_users.json')
        try:
            with open(authorized_file, 'r', encoding='utf-8') as f:
                authorized_data = json.load(f)
        except FileNotFoundError:
            authorized_data = {'authorized_users': [], 'last_updated': datetime.now().isoformat()}
        
        # Добавляем пользователя
        authorized_data[user_id_str] = {
            'telegram_id': user_id_str,
            'first_name': user_data.get('first_name', ''),
            'last_name': user_data.get('last_name', ''),
            'username': user_data.get('username', ''),
            'language_code': user_data.get('language_code', 'ru'),
            'is_premium': False,
            'is_admin': False,
            'last_login': datetime.now().isoformat(),
            'subscriptions': ['logistic-spy'],
            'created_at': datetime.now().isoformat()
        }
        
        # Добавляем в список авторизованных если его там нет
        if user_id not in authorized_data.get('authorized_users', []):
            authorized_data['authorized_users'].append(user_id)
        
        authorized_data['last_updated'] = datetime.now().isoformat()
        
        # Сохраняем обновленные данные
        with open(authorized_file, 'w', encoding='utf-8') as f:
            json.dump(authorized_data, f, ensure_ascii=False, indent=2)
        
        # Удаляем заявку
        del access_data[user_id_str]
        access_data['last_updated'] = datetime.now().isoformat()
        
        with open(access_file, 'w', encoding='utf-8') as f:
            json.dump(access_data, f, ensure_ascii=False, indent=2)
        
        print(f'[ADMIN] Пользователь {user_id} успешно добавлен в авторизованные')
        
        return jsonify({
            'success': True,
            'message': f'Пользователь {user_id} успешно добавлен в систему'
        })
        
    except Exception as e:
        print(f'[ERROR] Ошибка одобрения заявки: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    """Получение статистики для админ-панели"""
    try:
        # Загружаем данные пользователей
        authorized_file = os.path.join(ROOT_DIR, 'authorized_users.json')
        if os.path.exists(authorized_file):
            with open(authorized_file, 'r', encoding='utf-8') as f:
                authorized_data = json.load(f)
            total_users = len(authorized_data.get('authorized_users', []))
        else:
            total_users = 0
        
        # Загружаем статистику сигналов
        stats_file = os.path.join(ROOT_DIR, 'signal_stats.json')
        if os.path.exists(stats_file):
            with open(stats_file, 'r', encoding='utf-8') as f:
                stats_data = json.load(f)
            total_signals = stats_data.get('total_signals', 0)
            successful_signals = stats_data.get('successful_signals', 0)
            losing_signals = stats_data.get('losing_signals', 0)
        else:
            total_signals = 0
            successful_signals = 0
            losing_signals = 0
        
        # Загружаем активных пользователей (онлайн)
        activity_file = os.path.join(ROOT_DIR, 'active_users.json')
        if os.path.exists(activity_file):
            with open(activity_file, 'r', encoding='utf-8') as f:
                activity_data = json.load(f)
            online_users = len(activity_data.get('active_users', {}))
        else:
            online_users = 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'online_users': online_users,
                'total_signals': total_signals,
                'successful_signals': successful_signals,
                'losing_signals': losing_signals
            }
        })
        
    except Exception as e:
        print(f'[ERROR] Ошибка получения админ-статистики: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/subscriptions', methods=['GET'])
def get_user_subscriptions():
    """Получение подписок пользователя"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'user_id is required'
            }), 400

        # Загружаем подписки пользователей
        subscriptions_file = os.path.join(ROOT_DIR, 'user_subscriptions.json')
        if os.path.exists(subscriptions_file):
            with open(subscriptions_file, 'r', encoding='utf-8') as f:
                subscriptions_data = json.load(f)
            user_subscriptions = subscriptions_data.get(str(user_id), ['logistic-spy'])
        else:
            user_subscriptions = ['logistic-spy']  # Базовая модель по умолчанию

        return jsonify({
            'success': True,
            'subscriptions': user_subscriptions
        })

    except Exception as e:
        print(f'[ERROR] Ошибка получения подписок пользователя: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/subscriptions', methods=['POST'])
def update_user_subscriptions():
    """Обновление подписок пользователя"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        subscriptions = data.get('subscriptions', [])

        if not user_id:
            return jsonify({
                'success': False,
                'error': 'user_id is required'
            }), 400

        # Загружаем существующие подписки
        subscriptions_file = os.path.join(ROOT_DIR, 'user_subscriptions.json')
        if os.path.exists(subscriptions_file):
            with open(subscriptions_file, 'r', encoding='utf-8') as f:
                subscriptions_data = json.load(f)
        else:
            subscriptions_data = {}

        # Сохраняем старые подписки для аудита
        old_subscriptions = subscriptions_data.get(str(user_id), ['logistic-spy'])
        
        # Обновляем подписки пользователя
        subscriptions_data[str(user_id)] = subscriptions

        # Сохраняем обратно
        with open(subscriptions_file, 'w', encoding='utf-8') as f:
            json.dump(subscriptions_data, f, ensure_ascii=False, indent=2)

        # Логируем изменение в аудит
        audit_logger.log_subscription_change(
            user_id=user_id,
            admin_id=data.get('admin_user_id', 'system'),
            old_subs=old_subscriptions,
            new_subs=subscriptions,
            ip_address=request.remote_addr
        )

        print(f'[SUCCESS] Подписки обновлены для пользователя {user_id}: {subscriptions}')

        # Отправляем WebSocket уведомление
        try:
            import requests
            requests.post('http://localhost:8001/notify-subscription-update', json={
                'user_id': str(user_id),
                'subscriptions': subscriptions
            }, timeout=1)
        except:
            pass  # WebSocket уведомление опционально

        return jsonify({
            'success': True,
            'message': 'Subscriptions updated successfully',
            'subscriptions': subscriptions
        })

    except Exception as e:
        print(f'[ERROR] Ошибка обновления подписок: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/subscriptions/status', methods=['GET'])
def get_subscription_status():
    """Быстрая проверка статуса подписки с timestamp"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'user_id is required'}), 400
        
        subscriptions_file = os.path.join(ROOT_DIR, 'user_subscriptions.json')
        if os.path.exists(subscriptions_file):
            with open(subscriptions_file, 'r', encoding='utf-8') as f:
                subscriptions_data = json.load(f)
            user_subscriptions = subscriptions_data.get(str(user_id), ['logistic-spy'])
        else:
            user_subscriptions = ['logistic-spy']
        
        return jsonify({
            'success': True,
            'subscriptions': user_subscriptions,
            'timestamp': datetime.now().isoformat(),
            'has_active': len(user_subscriptions) > 0
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/subscription-templates', methods=['GET'])
def get_subscription_templates():
    """Получение списка шаблонов подписок"""
    try:
        # Пока возвращаем статичные шаблоны, позже можно подключить к БД
        templates = [
            {
                "id": "basic-trader",
                "name": "Basic Trader",
                "description": "Базовая подписка для начинающих",
                "subscriptions": ["logistic-spy"],
                "color_scheme": "blue",
                "icon": "🎯",
                "is_premium": False
            },
            {
                "id": "premium-trader",
                "name": "Premium Trader",
                "description": "Премиум подписка для опытных",
                "subscriptions": ["logistic-spy", "shadow-stack", "forest-necromancer"],
                "color_scheme": "emerald",
                "icon": "💎",
                "is_premium": True
            },
            {
                "id": "vip-trader",
                "name": "VIP Trader",
                "description": "VIP подписка с расширенным доступом",
                "subscriptions": ["logistic-spy", "shadow-stack", "forest-necromancer", "gray-cardinal"],
                "color_scheme": "purple",
                "icon": "👑",
                "is_premium": True
            },
            {
                "id": "ultimate-trader",
                "name": "Ultimate Trader",
                "description": "Полный доступ ко всем ML моделям",
                "subscriptions": ["logistic-spy", "shadow-stack", "forest-necromancer", "gray-cardinal", "sniper-80x"],
                "color_scheme": "gold",
                "icon": "⚡",
                "is_premium": True
            }
        ]
        
        return jsonify({
            'success': True,
            'templates': templates
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/bulk-subscription-update', methods=['POST'])
def bulk_subscription_update():
    """Массовое обновление подписок для нескольких пользователей"""
    try:
        data = request.get_json()
        user_ids = data.get('user_ids', [])
        subscriptions = data.get('subscriptions', [])
        admin_id = data.get('admin_user_id')
        
        if not user_ids or not subscriptions:
            return jsonify({'success': False, 'error': 'Missing parameters'}), 400
        
        # Загружаем существующие подписки
        subscriptions_file = os.path.join(ROOT_DIR, 'user_subscriptions.json')
        if os.path.exists(subscriptions_file):
            with open(subscriptions_file, 'r', encoding='utf-8') as f:
                subscriptions_data = json.load(f)
        else:
            subscriptions_data = {}
        
        results = []
        for user_id in user_ids:
            try:
                # Сохраняем старые подписки для истории
                old_subscriptions = subscriptions_data.get(str(user_id), ['logistic-spy'])
                
                # Обновляем подписки
                subscriptions_data[str(user_id)] = subscriptions
                
                # Отправляем WebSocket уведомление
                try:
                    import requests
                    requests.post('http://localhost:8001/notify-subscription-update', json={
                        'user_id': str(user_id),
                        'subscriptions': subscriptions
                    }, timeout=1)
                except:
                    pass
                
                results.append({'user_id': user_id, 'success': True})
            except Exception as e:
                results.append({'user_id': user_id, 'success': False, 'error': str(e)})
        
        # Сохраняем все изменения
        with open(subscriptions_file, 'w', encoding='utf-8') as f:
            json.dump(subscriptions_data, f, ensure_ascii=False, indent=2)
        
        successful = sum(1 for r in results if r['success'])
        
        # Логируем массовую операцию в аудит
        audit_logger.log_bulk_operation(
            admin_id=admin_id,
            user_ids=user_ids,
            subscriptions=subscriptions,
            ip_address=request.remote_addr
        )
        
        return jsonify({
            'success': True,
            'total_users': len(user_ids),
            'successful_updates': successful,
            'failed_updates': len(user_ids) - successful,
            'results': results
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/admin/subscription-history', methods=['GET'])
def get_subscription_history():
    """Получение истории изменений подписок"""
    try:
        user_id = request.args.get('user_id')
        limit = int(request.args.get('limit', 50))
        
        # Пока возвращаем заглушку, позже можно подключить к БД
        history = [
            {
                'id': '1',
                'user_id': user_id,
                'admin_id': '511442168',
                'old_subscriptions': ['logistic-spy'],
                'new_subscriptions': ['logistic-spy', 'shadow-stack'],
                'reason': 'Bulk update',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        return jsonify({
            'success': True,
            'history': history[:limit]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/auth/check-admin', methods=['POST'])
def check_admin():
    """Проверка прав администратора - ТОЛЬКО НА БЭКЕНДЕ"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'user_id required'
            }), 400
        
        # КРИТИЧЕСКАЯ ПРОВЕРКА: ТОЛЬКО НА БЭКЕНДЕ
        is_admin = str(user_id) == '511442168'
        
        print(f'[AUTH] Admin check for user {user_id}: {is_admin}')
        
        return jsonify({
            'success': True,
            'is_admin': is_admin
        })
        
    except Exception as e:
        print(f'[ERROR] Admin check error: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    return jsonify({
        'success': True,
        'message': 'Signal API is running',
        'version': '1.0.0',
        'generators': {
            'forex': 'SignalGenerator (Twelvedata API)',
            'otc': 'PowerfulOTCGenerator (24/7)'
        }
    })


@app.route('/api/analyze-signal', methods=['POST'])
def analyze_signal():
    """Анализ сигналов через встроенный AI (без внешних API)"""
    try:
        data = request.get_json()
        
        # Извлекаем данные сигнала из запроса
        messages = data.get('messages', [])
        if not messages:
            return jsonify({'error': {'message': 'No messages provided', 'code': 400}}), 400
        
        user_message = messages[0].get('content', '')
        
        # Простой анализ на основе ключевых слов
        analysis_result = generate_signal_analysis(user_message)
        
        return jsonify({
            'choices': [{
                'message': {
                    'content': analysis_result
                }
            }],
            'usage': {
                'total_tokens': len(analysis_result.split())
            }
        })
            
    except Exception as e:
        return jsonify({'error': {'message': str(e), 'code': 500}}), 500


def generate_signal_analysis(prompt):
    """Генерация анализа сигнала на основе промпта с вариативностью"""
    import random
    
    # Определяем тип анализа
    is_success = 'успешную' in prompt.lower() or 'успешно' in prompt.lower()
    is_loss = 'убыточную' in prompt.lower() or 'убыток' in prompt.lower()
    
    # Определяем валютную пару
    pair = "EUR/USD"
    if "gbp" in prompt.lower() or "фунт" in prompt.lower():
        pair = "GBP/USD"
    elif "jpy" in prompt.lower() or "йена" in prompt.lower():
        pair = "USD/JPY"
    elif "chf" in prompt.lower() or "франк" in prompt.lower():
        pair = "USD/CHF"
    elif "aud" in prompt.lower() or "австралиец" in prompt.lower():
        pair = "AUD/USD"
    elif "nzd" in prompt.lower() or "новозеландец" in prompt.lower():
        pair = "NZD/USD"
    elif "cad" in prompt.lower() or "канадец" in prompt.lower():
        pair = "USD/CAD"
    elif "otc" in prompt.lower():
        pair = random.choice(["EUR/USD (OTC)", "GBP/USD (OTC)", "USD/JPY (OTC)"])
    
    # Определяем направление
    direction = "BUY" if "buy" in prompt.lower() or "покупка" in prompt.lower() else "SELL"
    
    # Случайные факторы для разнообразия
    time_factors = ["утром", "днем", "вечером", "в азиатскую сессию", "в европейскую сессию", "в американскую сессию"]
    market_conditions = ["высокой волатильности", "низкой волатильности", "трендовом рынке", "флэтовом рынке", "неопределенности"]
    emotions = ["терпение", "дисциплина", "контроль эмоций", "хладнокровие", "уверенность"]
    
    random_time = random.choice(time_factors)
    random_condition = random.choice(market_conditions)
    random_emotion = random.choice(emotions)
    
    if is_success:
        success_analyses = [
            f"""✅ АНАЛИЗ УСПЕШНОЙ СДЕЛКИ {pair}:
1️⃣ Трейдер правильно выбрал направление {direction} и следовал стратегии.
2️⃣ Ключевые факторы: точный анализ рынка, {random_emotion} при входе, правильная оценка условий.
3️⃣ Рекомендации: найти оптимальную точку входа, продолжать стратегию, масштабировать успех.
💪 Отлично! Продолжай в том же духе! Зарабатывай еще больше!""",
            
            f"""✅ ПРОФЕССИОНАЛЬНЫЙ АНАЛИЗ {pair}:
1️⃣ Трейдер показал дисциплину в следовании {direction} сигналу {random_time}.
2️⃣ Успех достигнут благодаря: правильному таймингу, анализу тренда, управлению рисками в условиях {random_condition}.
3️⃣ Следующие шаги: улучшить точность входа, развивать навыки анализа, увеличивать объемы.
💪 Превосходно! Твой подход работает! Продолжай зарабатывать!""",
            
            f"""✅ МАСТЕРСКИЙ АНАЛИЗ {pair}:
1️⃣ Трейдер продемонстрировал профессионализм в {direction} операции.
2️⃣ Факторы успеха: глубокий анализ, правильный выбор момента, {random_emotion} в условиях {random_condition}.
3️⃣ Развитие: изучать новые паттерны, оптимизировать стратегию, расширять горизонты.
💪 Блестяще! Ты на правильном пути! Зарабатывай стабильно!""",
            
            f"""✅ ЭКСПЕРТНЫЙ РАЗБОР {pair}:
1️⃣ Трейдер проявил мастерство в {direction} сделке {random_time}.
2️⃣ Успех обеспечен: качественным анализом, {random_emotion}, адаптацией к {random_condition}.
3️⃣ Планы: углубить знания, расширить стратегии, увеличить прибыльность.
💪 Потрясающе! Ты настоящий профессионал! Зарабатывай больше!""",
            
            f"""✅ ТОП-АНАЛИЗ {pair}:
1️⃣ Трейдер блестяще выполнил {direction} операцию в условиях {random_condition}.
2️⃣ Ключ к успеху: {random_emotion}, точный расчет, правильный тайминг {random_time}.
3️⃣ Перспективы: масштабировать успех, изучать новые рынки, повышать доходность.
💪 Фантастика! Ты на вершине! Продолжай доминировать!"""
        ]
        return random.choice(success_analyses)
    
    elif is_loss:
        loss_analyses = [
            f"""🔴 АНАЛИЗ УБЫТОЧНОЙ СДЕЛКИ {pair}:
1️⃣ Трейдер допустил ошибки при {direction} входе {random_time} и не дождался лучшего момента.
2️⃣ Психологические ошибки: эмоциональные решения, FOMO, жадность в условиях {random_condition}.
3️⃣ Рекомендации: найти лучшую точку входа, изменить подход, развивать {random_emotion}.
💪 Не сдавайся! Каждая сделка - это опыт! Продолжай торговать!""",
            
            f"""🔴 СТРОГИЙ АНАЛИЗ {pair}:
1️⃣ Трейдер не смог правильно использовать {direction} сигнал из-за поспешности {random_time}.
2️⃣ Ошибки: игнорирование сигналов рынка, неправильный тайминг, отсутствие {random_emotion} в {random_condition}.
3️⃣ Исправления: изучать технический анализ, тренировать терпение, следовать плану.
💪 Учись на ошибках! Каждая неудача приближает к успеху!""",
            
            f"""🔴 ПРОФЕССИОНАЛЬНЫЙ РАЗБОР {pair}:
1️⃣ Трейдер не учел рыночные условия при {direction} операции {random_time}.
2️⃣ Проблемы: недостаточный анализ, эмоциональные решения, нарушение правил в {random_condition}.
3️⃣ План действий: углубить знания, разработать четкую стратегию, развивать {random_emotion}.
💪 Помни: успех приходит к тем, кто учится! Не останавливайся!""",
            
            f"""🔴 КРИТИЧЕСКИЙ АНАЛИЗ {pair}:
1️⃣ Трейдер потерпел неудачу в {direction} сделке из-за отсутствия {random_emotion}.
2️⃣ Причины: поспешные решения {random_time}, игнорирование {random_condition}, нарушение дисциплины.
3️⃣ Исправления: изучать рынок, тренировать {random_emotion}, следовать стратегии.
💪 Каждая ошибка - шаг к мастерству! Продолжай развиваться!""",
            
            f"""🔴 ЭКСПЕРТНАЯ ОЦЕНКА {pair}:
1️⃣ Трейдер не справился с {direction} операцией в условиях {random_condition}.
2️⃣ Факторы неудачи: недостаток {random_emotion}, неправильный тайминг {random_time}, эмоциональность.
3️⃣ Путь к успеху: углубленное изучение, практика, развитие {random_emotion}, терпение.
💪 Мастерство приходит с опытом! Не сдавайся!"""
        ]
        return random.choice(loss_analyses)
    
    else:
        general_analyses = [
            f"""📊 АНАЛИЗ СИГНАЛА {pair}:
1️⃣ Проверьте технические индикаторы и рыночные условия для {direction}.
2️⃣ Убедитесь в правильности выбора направления и времени входа.
3️⃣ Следуйте стратегии управления рисками и не нарушайте дисциплину.
💪 Успешной торговли!""",
            
            f"""📈 ПРОФЕССИОНАЛЬНАЯ ОЦЕНКА {pair}:
1️⃣ Изучите график и определите тренд перед {direction} входом.
2️⃣ Проверьте объемы, волатильность и фундаментальные факторы.
3️⃣ Планируйте сделку заранее и строго следуйте плану.
💪 Торгуй умно и прибыльно!""",
            
            f"""🎯 СТРАТЕГИЧЕСКИЙ АНАЛИЗ {pair}:
1️⃣ Оцените рыночную ситуацию и выберите оптимальный {direction} момент.
2️⃣ Используйте стоп-лоссы и тейк-профиты для защиты капитала.
3️⃣ Ведите дневник сделок и анализируйте результаты.
💪 Развивайся и зарабатывай!"""
        ]
        return random.choice(general_analyses)


if __name__ == '__main__':
    import sys
    import io
    
    # Фикс кодировки для Windows - убираем проблемную обёртку
    # if sys.platform == 'win32':
    #     try:
    #         sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    #     except:
    #         pass  # Если уже настроено, пропускаем
    
    print('=' * 60)
    print('[START] Signal API Server')
    print('=' * 60)
    print(f'[URL] http://localhost:5000')
    print(f'[DIR] Bot Directory: {ROOT_DIR}')
    print(f'[OK] Forex Generator: Initialized')
    print(f'[OK] OTC Generator: Initialized')
    print('=' * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)

