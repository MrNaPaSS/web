"""
API сервер для интеграции CryptoBot с веб-приложением
Работает через REST API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import logging
from datetime import datetime, timedelta
from crypto_bot_payment import CryptoBotPayment, MLModelSubscription

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['https://app.nomoneynohoney.online'], 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'])

# Конфигурация
TELEGRAM_BOT_TOKEN = "7812637462:AAEAC-GizoyEczsNeb3IJgo8mCcKbhPnWLg"
CRYPTO_BOT_TOKEN = "YOUR_CRYPTO_BOT_TOKEN_HERE"  # Получите от @CryptoBot
ADMIN_TELEGRAM_ID = 123456789  # Замените на ваш ID

# Инициализация
crypto_bot = CryptoBotPayment(CRYPTO_BOT_TOKEN)
subscription_manager = MLModelSubscription(crypto_bot)

# База данных подписок (в продакшене используйте реальную БД)
USER_SUBSCRIPTIONS = {}
PENDING_INVOICES = {}


@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    return jsonify({
        "status": "ok",
        "service": "CryptoBot Payment API",
        "timestamp": datetime.now().isoformat()
    }), 200


@app.route('/api/cryptobot/status', methods=['GET'])
def cryptobot_status():
    """Проверка подключения к CryptoBot"""
    try:
        me = crypto_bot.get_me()
        if me.get('ok'):
            return jsonify({
                "status": "connected",
                "app_id": me['result']['app_id'],
                "name": me['result']['name']
            }), 200
        else:
            return jsonify({
                "status": "error",
                "error": me.get('error')
            }), 500
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@app.route('/api/currencies', methods=['GET'])
def get_currencies():
    """Получить доступные криптовалюты"""
    try:
        currencies = crypto_bot.get_currencies()
        if currencies.get('ok'):
            return jsonify({
                "ok": True,
                "currencies": currencies['result']
            }), 200
        else:
            return jsonify({
                "ok": False,
                "error": currencies.get('error')
            }), 500
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


@app.route('/api/payment/create', methods=['POST', 'OPTIONS'])
def create_payment():
    """
    Создать инвойс для оплаты
    
    Body:
    {
        "user_id": "telegram_user_id_or_web_session_id",
        "model_id": "logistic-spy",
        "subscription_type": "monthly",
        "currency": "USDT"
    }
    """
    # Обработка CORS preflight запроса
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        model_id = data.get('model_id')
        subscription_type = data.get('subscription_type', 'monthly')
        currency = data.get('currency', 'USDT')
        
        if not all([user_id, model_id, subscription_type, currency]):
            return jsonify({
                "ok": False,
                "error": "Missing required parameters"
            }), 400
        
        # Создаём инвойс
        invoice = subscription_manager.create_subscription_invoice(
            user_id=hash(user_id),  # Хешируем для безопасности
            model_id=model_id,
            subscription_type=subscription_type,
            currency=currency
        )
        
        if not invoice.get('ok'):
            return jsonify(invoice), 500
        
        invoice_data = invoice['result']
        invoice_id = invoice_data['invoice_id']
        
        # Сохраняем инвойс
        PENDING_INVOICES[invoice_id] = {
            "user_id": user_id,
            "model_id": model_id,
            "subscription_type": subscription_type,
            "currency": currency,
            "amount": invoice_data['amount'],
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat()
        }
        
        # Отправляем уведомление админу через Telegram
        send_admin_notification_telegram(
            user_id=user_id,
            model_id=model_id,
            subscription_type=subscription_type,
            currency=currency,
            amount=invoice_data['amount'],
            invoice_id=invoice_id
        )
        
        return jsonify({
            "ok": True,
            "invoice_id": invoice_id,
            "pay_url": invoice_data['pay_url'],
            "mini_app_url": invoice_data.get('mini_app_invoice_url'),
            "web_app_url": invoice_data.get('web_app_invoice_url'),
            "amount": invoice_data['amount'],
            "currency": currency,
            "expires_in": 600
        }), 200
        
    except Exception as e:
        logger.error(f"Ошибка создания платежа: {e}")
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


@app.route('/api/payment/check/<invoice_id>', methods=['GET'])
def check_payment(invoice_id):
    """
    Проверить статус платежа
    """
    try:
        # Получаем информацию об инвойсе
        invoice_info = crypto_bot.get_invoice(invoice_id)
        
        if not invoice_info.get('ok'):
            return jsonify({
                "ok": False,
                "error": "Invoice not found"
            }), 404
        
        invoices = invoice_info.get('result', {}).get('items', [])
        
        if not invoices:
            return jsonify({
                "ok": False,
                "error": "Invoice not found"
            }), 404
        
        invoice = invoices[0]
        status = invoice.get('status')
        
        # Если оплачен - активируем подписку
        if status == 'paid' and invoice_id in PENDING_INVOICES:
            pending = PENDING_INVOICES[invoice_id]
            
            # Активируем подписку
            user_id = pending['user_id']
            model_id = pending['model_id']
            subscription_type = pending['subscription_type']
            
            if user_id not in USER_SUBSCRIPTIONS:
                USER_SUBSCRIPTIONS[user_id] = []
            
            USER_SUBSCRIPTIONS[user_id].append({
                "model_id": model_id,
                "type": subscription_type,
                "activated_at": datetime.now().isoformat(),
                "expires_at": (datetime.now() + timedelta(days=30)).isoformat() if subscription_type == "monthly" else None,
                "invoice_id": invoice_id
            })
            
            # Удаляем из pending
            del PENDING_INVOICES[invoice_id]
            
            # Уведомляем админа об успешной оплате
            send_admin_success_telegram(
                user_id=user_id,
                model_id=model_id,
                subscription_type=subscription_type,
                invoice=invoice
            )
            
            logger.info(f"✅ Подписка активирована: User {user_id}, Model {model_id}")
        
        return jsonify({
            "ok": True,
            "status": status,
            "paid": status == 'paid',
            "invoice": invoice
        }), 200
        
    except Exception as e:
        logger.error(f"Ошибка проверки платежа: {e}")
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


@app.route('/api/subscriptions/<user_id>', methods=['GET'])
def get_subscriptions(user_id):
    """
    Получить подписки пользователя
    """
    try:
        subscriptions = USER_SUBSCRIPTIONS.get(user_id, [])
        
        return jsonify({
            "ok": True,
            "subscriptions": subscriptions
        }), 200
        
    except Exception as e:
        logger.error(f"Ошибка получения подписок: {e}")
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


@app.route('/webhook/cryptobot', methods=['POST', 'OPTIONS'])
def cryptobot_webhook():
    """
    Webhook от CryptoBot для автоматической обработки
    """
    # Обработка CORS preflight запроса
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        signature = request.headers.get('crypto-pay-api-signature')
        body = request.get_data(as_text=True)
        
        # Проверяем подпись
        if not crypto_bot.verify_webhook(signature, body):
            logger.error("Невалидная подпись webhook")
            return jsonify({"error": "Invalid signature"}), 403
        
        data = request.get_json()
        update_type = data.get('update_type')
        payload = data.get('payload')
        
        logger.info(f"Webhook: {update_type}")
        
        if update_type == 'invoice_paid':
            invoice_id = payload.get('invoice_id')
            
            # Автоматически активируем подписку
            if invoice_id in PENDING_INVOICES:
                pending = PENDING_INVOICES[invoice_id]
                user_id = pending['user_id']
                model_id = pending['model_id']
                subscription_type = pending['subscription_type']
                
                if user_id not in USER_SUBSCRIPTIONS:
                    USER_SUBSCRIPTIONS[user_id] = []
                
                USER_SUBSCRIPTIONS[user_id].append({
                    "model_id": model_id,
                    "type": subscription_type,
                    "activated_at": datetime.now().isoformat(),
                    "expires_at": (datetime.now() + timedelta(days=30)).isoformat() if subscription_type == "monthly" else None,
                    "invoice_id": invoice_id
                })
                
                del PENDING_INVOICES[invoice_id]
                
                logger.info(f"✅ Автоактивация: User {user_id}, Model {model_id}")
        
        return jsonify({"ok": True}), 200
        
    except Exception as e:
        logger.error(f"Ошибка webhook: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin-notification', methods=['POST', 'OPTIONS'])
def admin_notification():
    """
    API endpoint для отправки уведомлений администратору
    """
    # Обработка CORS preflight запроса
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        user_name = data.get('user_name', 'Пользователь')
        model_name = data.get('model_name', 'Неизвестная модель')
        subscription_type = data.get('subscription_type', 'monthly')
        message = data.get('message', '')
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "user_id is required"
            }), 400
        
        # Отправляем уведомление в Telegram
        try:
            import requests
            
            text = f"""
🔔 НОВЫЙ ЗАПРОС НА ПОДПИСКУ

👤 Пользователь: {user_name}
🆔 ID: {user_id}
🧠 Модель: {model_name}
💳 Тип: {'Ежемесячная подписка' if subscription_type == 'monthly' else 'Пожизненная покупка'}
⏰ Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

📝 Сообщение:
{message}
            """
            
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            response = requests.post(url, json={
                "chat_id": ADMIN_TELEGRAM_ID,
                "text": text
            })
            
            if response.status_code == 200:
                return jsonify({
                    "success": True,
                    "message": "Notification sent successfully"
                })
            else:
                return jsonify({
                    "success": False,
                    "error": f"Telegram API error: {response.status_code}"
                }), 500
                
        except Exception as e:
            logger.error(f"Ошибка отправки уведомления в Telegram: {e}")
            return jsonify({
                "success": False,
                "error": f"Failed to send notification: {str(e)}"
            }), 500
        
    except Exception as e:
        logger.error(f"Ошибка в admin_notification endpoint: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


def send_admin_notification_telegram(user_id, model_id, subscription_type, currency, amount, invoice_id):
    """
    Отправка уведомления админу в Telegram
    """
    try:
        import requests
        
        models = subscription_manager.models
        model = models.get(model_id, {})
        model_name = model.get('name', model_id)
        
        text = f"""
🔔 НОВЫЙ ЗАПРОС ОПЛАТЫ (WEB)

👤 User ID: {user_id}
🧠 Модель: {model_name}
💳 Тип: {'Ежемесячная подписка' if subscription_type == 'monthly' else 'Пожизненная покупка'}
💰 Цена: {amount} {currency}
🔑 Invoice ID: {invoice_id}
⏰ Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

⏳ Ожидание оплаты...
        """
        
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(url, json={
            "chat_id": ADMIN_TELEGRAM_ID,
            "text": text
        })
        
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления: {e}")


def send_admin_success_telegram(user_id, model_id, subscription_type, invoice):
    """
    Уведомление админу об успешной оплате
    """
    try:
        import requests
        
        models = subscription_manager.models
        model = models.get(model_id, {})
        model_name = model.get('name', model_id)
        
        text = f"""
✅ ОПЛАТА ПОДТВЕРЖДЕНА! (WEB)

👤 User ID: {user_id}
🧠 Модель: {model_name}
💳 Тип: {'Ежемесячная подписка' if subscription_type == 'monthly' else 'Пожизненная покупка'}
💰 Сумма: {invoice.get('amount')} {invoice.get('asset')}
🔑 Invoice ID: {invoice.get('invoice_id')}
⏰ Оплачено: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

🎉 Подписка активирована!
        """
        
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        requests.post(url, json={
            "chat_id": ADMIN_TELEGRAM_ID,
            "text": text
        })
        
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления: {e}")


if __name__ == '__main__':
    logger.info("🚀 Payment API сервер запущен на порту 5000")
    logger.info("📡 Endpoint: http://localhost:5000")
    logger.info("💳 CryptoBot интеграция активна")
    
    # ВАЖНО: В продакшене используйте Gunicorn
    # gunicorn -w 4 -b 0.0.0.0:5000 api_payment_server:app
    
    app.run(host='0.0.0.0', port=5000, debug=True)

