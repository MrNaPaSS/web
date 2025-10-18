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
from datetime import datetime
from functools import wraps

# Добавляем путь к боту для импорта модулей
BOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, BOT_DIR)
print(f'[DEBUG] BOT_DIR: {BOT_DIR}')
print(f'[DEBUG] sys.path[0]: {sys.path[0]}')
print(f'[DEBUG] signal_generator exists: {os.path.exists(os.path.join(BOT_DIR, "signal_generator.py"))}')

# Проверим все файлы в директории
if os.path.exists(BOT_DIR):
    files = os.listdir(BOT_DIR)
    python_files = [f for f in files if f.endswith('.py')]
    print(f'[DEBUG] Python files in BOT_DIR: {python_files[:10]}')

# Попробуем найти signal_generator.py в корневой директории
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
sys.path.insert(0, ROOT_DIR)
print(f'[DEBUG] ROOT_DIR: {ROOT_DIR}')
print(f'[DEBUG] signal_generator exists in ROOT: {os.path.exists(os.path.join(ROOT_DIR, "signal_generator.py"))}')

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
                            'tp': signal.take_profit,
                            'sl': signal.stop_loss,
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
                        'tp': signal.take_profit,
                        'sl': signal.stop_loss,
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
                # Генерируем ТОП-3 ОТС сигнала
                pairs = ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)']
                for p in pairs:
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
                            'tp': [str(signal.target_price)],
                            'sl': str(signal.stop_loss),
                            'confidence': signal.confidence,
                            'expiration': signal.duration,
                            'signal_type': 'otc',
                            'timestamp': datetime.now().isoformat(),
                            'reasoning': signal.reasoning
                        })
                        update_user_stats(user_id, 'otc')
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
                        'tp': [str(signal.target_price)],
                        'sl': str(signal.stop_loss),
                        'confidence': signal.confidence,
                        'expiration': signal.expiration_minutes,
                        'signal_type': 'otc',
                        'timestamp': datetime.now().isoformat(),
                        'reasoning': signal.reasoning
                    })
                    update_user_stats(user_id, 'otc')
        
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
            best_pair = max(pair_stats.keys(), key=lambda p: pair_stats[p]['successful'])
            worst_pair = min(pair_stats.keys(), key=lambda p: pair_stats[p]['failed'])
        
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
        worst_pair = sorted_pairs[-1][0] if sorted_pairs else 'N/A'
        
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


@app.route('/api/signal/market-metrics', methods=['GET'])
def get_market_metrics():
    """Быстрые метрики для отображения (не для генерации сигналов)"""
    try:
        import random
        
        forex_pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'NZD/USD']
        otc_pairs = ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)', 'GBP/USD (OTC)']
        
        forex_metrics = []
        otc_metrics = []
        
        print(f'[INFO] Генерация метрик для отображения...')
        
        # Для Forex - используем OTC генератор для быстрого получения данных
        for pair in forex_pairs:
            try:
                # Генерируем быстрый preview сигнал
                signal = asyncio.run(otc_generator.generate_otc_signal(pair))
                
                if signal and hasattr(signal, 'direction') and hasattr(signal, 'confidence'):
                    # Определяем sentiment
                    if signal.direction == 'BUY':
                        sentiment = 'Бычий'
                    elif signal.direction == 'SELL':
                        sentiment = 'Медвежий'
                    else:
                        sentiment = 'Нейтральный'
                    
                    # Волатильность на основе confidence
                    volatility = round((1 - signal.confidence) * 5 + random.uniform(0.5, 1.5), 1)
                    
                    forex_metrics.append({
                        'pair': pair,
                        'sentiment': sentiment,
                        'volatility': volatility,
                        'trend': signal.direction
                    })
                    print(f'OK {pair}: {sentiment}, {volatility}%, {signal.direction}')
                else:
                    raise Exception('Нет сигнала')
                    
            except Exception as e:
                print(f'[FALLBACK] {pair}: {e}')
                # Случайные но реалистичные данные
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
                print(f'OK {pair}: {sentiment}, {volatility}%, {trend} (random)')
        
        # Для OTC - используем генератор
        for pair in otc_pairs:
            try:
                signal = asyncio.run(otc_generator.generate_otc_signal(pair))
                
                if signal and hasattr(signal, 'direction') and hasattr(signal, 'confidence'):
                    sentiment = 'Бычий' if signal.direction == 'BUY' else ('Медвежий' if signal.direction == 'SELL' else 'Нейтральный')
                    volatility = round((1 - signal.confidence) * 5 + random.uniform(0.5, 1.5), 1)
                    
                    otc_metrics.append({
                        'pair': pair,
                        'sentiment': sentiment,
                        'volatility': volatility,
                        'trend': signal.direction
                    })
                    print(f'OK {pair}: {sentiment}, {volatility}%, {signal.direction}')
                else:
                    raise Exception('Нет сигнала')
                    
            except Exception as e:
                print(f'[FALLBACK] {pair}: {e}')
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
                print(f'OK {pair}: {sentiment}, {volatility}%, {trend} (random)')
        
        print(f'[SUCCESS] Метрики готовы: {len(forex_metrics)} forex + {len(otc_metrics)} otc')
        
        return jsonify({
            'success': True,
            'forex': forex_metrics,
            'otc': otc_metrics
        })
    
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
                best_pair = max(pair_stats.keys(), key=lambda p: pair_stats[p]['successful'])
                worst_pair = min(pair_stats.keys(), key=lambda p: pair_stats[p]['failed'])
            
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
    print(f'[DIR] Bot Directory: {BOT_DIR}')
    print(f'[OK] Forex Generator: Initialized')
    print(f'[OK] OTC Generator: Initialized')
    print('=' * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)

