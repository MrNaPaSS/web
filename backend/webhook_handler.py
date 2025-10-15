"""
Webhook обработчик для CryptoBot
Автоматическая обработка платежей в реальном времени
"""

from flask import Flask, request, jsonify
import json
import logging
from crypto_bot_payment import CryptoBotPayment, MLModelSubscription

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Конфигурация
CRYPTO_BOT_TOKEN = "YOUR_CRYPTO_BOT_TOKEN_HERE"

# Инициализация
crypto_bot = CryptoBotPayment(CRYPTO_BOT_TOKEN)
subscription_manager = MLModelSubscription(crypto_bot)


@app.route('/webhook/cryptobot', methods=['POST'])
def cryptobot_webhook():
    """
    Обработчик webhook от CryptoBot
    Вызывается автоматически при изменении статуса инвойса
    """
    try:
        # Получаем подпись
        signature = request.headers.get('crypto-pay-api-signature')
        
        # Получаем тело запроса
        body = request.get_data(as_text=True)
        
        # Проверяем подпись
        if not crypto_bot.verify_webhook(signature, body):
            logger.error("Невалидная подпись webhook")
            return jsonify({"error": "Invalid signature"}), 403
        
        # Парсим данные
        data = request.get_json()
        update_type = data.get('update_type')
        payload = data.get('payload')
        
        logger.info(f"Получен webhook: {update_type}")
        
        # Обрабатываем разные типы обновлений
        if update_type == 'invoice_paid':
            # Платёж успешно завершён
            handle_invoice_paid(payload)
        
        elif update_type == 'invoice_expired':
            # Инвойс истёк
            handle_invoice_expired(payload)
        
        return jsonify({"ok": True}), 200
        
    except Exception as e:
        logger.error(f"Ошибка обработки webhook: {e}")
        return jsonify({"error": str(e)}), 500


def handle_invoice_paid(invoice_data):
    """
    Обработка успешной оплаты
    """
    try:
        invoice_id = invoice_data.get('invoice_id')
        amount = invoice_data.get('amount')
        asset = invoice_data.get('asset')
        payload = invoice_data.get('payload', '')
        
        logger.info(f"✅ Платёж получен: {invoice_id}, {amount} {asset}")
        
        # Обрабатываем платёж через subscription_manager
        result = subscription_manager.process_payment(invoice_data)
        
        if result.get('ok'):
            user_id = result['user_id']
            model_id = result['model_id']
            subscription_type = result['subscription_type']
            
            logger.info(f"Подписка активирована: User {user_id}, Model {model_id}")
            
            # Здесь можно добавить:
            # - Запись в базу данных
            # - Отправку уведомления пользователю
            # - Отправку уведомления админу
            # - Активацию доступа к модели
            
        else:
            logger.error(f"Ошибка активации подписки: {result.get('error')}")
            
    except Exception as e:
        logger.error(f"Ошибка обработки платежа: {e}")


def handle_invoice_expired(invoice_data):
    """
    Обработка истёкшего инвойса
    """
    try:
        invoice_id = invoice_data.get('invoice_id')
        logger.info(f"⏰ Инвойс истёк: {invoice_id}")
        
        # Можно отправить уведомление пользователю
        # о необходимости создать новый инвойс
        
    except Exception as e:
        logger.error(f"Ошибка обработки истёкшего инвойса: {e}")


@app.route('/health', methods=['GET'])
def health_check():
    """
    Проверка работоспособности сервера
    """
    return jsonify({"status": "ok", "service": "CryptoBot Webhook Handler"}), 200


@app.route('/test', methods=['GET'])
def test_connection():
    """
    Тестирование подключения к CryptoBot
    """
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


if __name__ == '__main__':
    # ВАЖНО: В продакшене используйте Gunicorn или uWSGI
    # gunicorn -w 4 -b 0.0.0.0:5000 webhook_handler:app
    
    logger.info("🚀 Webhook сервер запущен на порту 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)

