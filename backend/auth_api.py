"""
Flask API для авторизации пользователей
ВЕРСИЯ С SQL БАЗОЙ ДАННЫХ
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from auth_service_sql import AuthServiceSQL
from auth_decorators import login_required, admin_required, get_current_user
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv('config.env')

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для фронтенда

# КОНФИГУРАЦИЯ из переменных окружения
BOT_TOKEN = os.getenv('BOT_TOKEN', '8365963410:AAFVnrFboehOUxWmkeivDVvC4nft_hjjcCQ')
ADMIN_TELEGRAM_ID = os.getenv('ADMIN_TELEGRAM_ID', '511442168')

# Инициализация SQL сервиса авторизации
auth_service = AuthServiceSQL()

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Авторизация пользователя через Telegram WebApp с JWT токеном
    
    Ожидаемый payload:
    {
        "initData": "query_id=...&user=...&auth_date=...&hash=...",
        "userData": {
            "id": 123456789,
            "first_name": "John",
            "last_name": "Doe",
            "username": "johndoe",
            "language_code": "ru",
            "is_premium": false
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        init_data = data.get('initData', '')
        user_data = data.get('userData', {})
        
        # В режиме разработки (если нет initData) пропускаем проверку
        if init_data:
            # Проверяем подлинность данных от Telegram
            is_valid = auth_service.verify_telegram_webapp_data(init_data, BOT_TOKEN)
            
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': 'Invalid Telegram data'
                }), 401
        else:
            print('⚠️ Режим разработки: проверка Telegram данных пропущена')
        
        # Регистрируем или обновляем пользователя в SQL
        user_info = auth_service.register_or_update_user(user_data, ADMIN_TELEGRAM_ID)
        
        if not user_info:
            return jsonify({
                'success': False,
                'error': 'Failed to register user'
            }), 500
        
        # Создаем JWT токен
        telegram_id = str(user_data.get('id'))
        token = auth_service.create_access_token(telegram_id)
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Failed to create access token'
            }), 500
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': telegram_id,
                'name': f"{user_info['first_name']} {user_info['last_name']}".strip(),
                'role': user_info['role'],
                'subscriptions': user_info['subscriptions'],
                'is_admin': user_info['role'] == 'admin',
                'is_premium': user_info['is_premium']
            },
            'message': 'Авторизация успешна'
        })
    
    except Exception as e:
        print(f'❌ Ошибка авторизации: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/<telegram_id>', methods=['GET'])
def get_user(telegram_id):
    """Получение данных пользователя"""
    try:
        user = auth_service.get_user(telegram_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': user
        })
    
    except Exception as e:
        print(f'❌ Ошибка получения пользователя: {e}')
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
        
        subscriptions = auth_service.get_user_subscriptions(user_id)
        
        return jsonify({
            'success': True,
            'subscriptions': subscriptions
        })
    
    except Exception as e:
        print(f'❌ Ошибка получения подписок: {e}')
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
        
        success = auth_service.update_subscriptions(user_id, subscriptions)
        
        if success:
            # Отправляем WebSocket уведомление
            try:
                import requests
                requests.post('http://localhost:8001/notify-subscription-update', 
                           json={'user_id': user_id, 'subscriptions': subscriptions})
            except:
                pass  # WebSocket сервер может быть недоступен
            
            return jsonify({
                'success': True,
                'message': 'Подписки обновлены'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to update subscriptions'
            }), 500
    
    except Exception as e:
        print(f'❌ Ошибка обновления подписок: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/admin/user/<user_id>/subscription/<model_id>', methods=['POST'])
@login_required
@admin_required
def grant_subscription(user_id, model_id):
    """Назначить подписку на модель пользователю"""
    try:
        data = request.get_json()
        expiry_days = data.get('expiry_days')  # None = пожизненно
        
        # Получаем ID админа из токена
        current_user = get_current_user()
        admin_id = current_user['user_id']
        
        success = auth_service.grant_subscription(user_id, model_id, admin_id, expiry_days)
        
        if success:
            # Отправляем WebSocket уведомление
            try:
                import requests
                subscriptions = auth_service.get_user_subscriptions(user_id)
                requests.post('http://localhost:8001/notify-subscription-update', 
                           json={'user_id': user_id, 'subscriptions': subscriptions})
            except:
                pass
            
            return jsonify({
                'success': True,
                'message': f'Подписка {model_id} назначена пользователю {user_id}'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to grant subscription'
            }), 500
    
    except Exception as e:
        print(f'❌ Ошибка назначения подписки: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/admin/user/<user_id>/subscription/<model_id>', methods=['DELETE'])
@login_required
@admin_required
def revoke_subscription(user_id, model_id):
    """Отменить подписку на модель у пользователя"""
    try:
        # Получаем ID админа из токена
        current_user = get_current_user()
        admin_id = current_user['user_id']
        
        success = auth_service.revoke_subscription(user_id, model_id, admin_id)
        
        if success:
            # Отправляем WebSocket уведомление
            try:
                import requests
                subscriptions = auth_service.get_user_subscriptions(user_id)
                requests.post('http://localhost:8001/notify-subscription-update', 
                           json={'user_id': user_id, 'subscriptions': subscriptions})
            except:
                pass
            
            return jsonify({
                'success': True,
                'message': f'Подписка {model_id} отменена у пользователя {user_id}'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to revoke subscription'
            }), 500
    
    except Exception as e:
        print(f'❌ Ошибка отмены подписки: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/admin/users', methods=['GET'])
@login_required
@admin_required
def get_all_users():
    """Получение всех пользователей (только для админа)"""
    try:
        users = auth_service.get_all_users()
        
        return jsonify({
            'success': True,
            'users': users,
            'total': len(users)
        })
    
    except Exception as e:
        print(f'❌ Ошибка получения пользователей: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/admin/user/<telegram_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(telegram_id):
    """Удаление пользователя (только для админа)"""
    try:
        success = auth_service.delete_user(telegram_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Пользователь удален'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to delete user'
            }), 500
    
    except Exception as e:
        print(f'❌ Ошибка удаления пользователя: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/auth/my-subscriptions', methods=['GET'])
@login_required
def get_my_subscriptions():
    """Получение подписок текущего пользователя"""
    try:
        current_user = get_current_user()
        user_id = current_user['user_id']
        
        subscriptions = auth_service.get_user_subscriptions(user_id)
        
        return jsonify({
            'success': True,
            'subscriptions': subscriptions
        })
    
    except Exception as e:
        print(f'❌ Ошибка получения подписок: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    return jsonify({
        'success': True,
        'message': 'Auth API is running',
        'version': '1.0.0'
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
    print('[START] Auth API Server')
    print('=' * 60)
    print(f'[URL] http://localhost:5001')
    print(f'[ADMIN] Admin ID: {ADMIN_TELEGRAM_ID}')
    print(f'[DIR] Bot Dir: {BOT_DIR}')
    print('=' * 60)
    
    app.run(host='0.0.0.0', port=5001, debug=True)

