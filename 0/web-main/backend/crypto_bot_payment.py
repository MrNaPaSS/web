"""
Интеграция CryptoBot для приёма платежей в криптовалюте
Документация: https://help.crypt.bot/crypto-pay-api
"""

import requests
import time
import hashlib
import hmac
from typing import Optional, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CryptoBotPayment:
    """
    Класс для работы с CryptoBot Payment API
    """
    
    def __init__(self, crypto_bot_token: str):
        """
        Инициализация клиента CryptoBot
        
        Args:
            crypto_bot_token: API токен от @CryptoBot
        """
        self.api_token = crypto_bot_token
        self.base_url = "https://pay.crypt.bot/api"
        self.headers = {
            "Crypto-Pay-API-Token": self.api_token,
            "Content-Type": "application/json"
        }
    
    def get_me(self) -> Dict[str, Any]:
        """
        Получить информацию о приложении
        """
        try:
            response = requests.get(
                f"{self.base_url}/getMe",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ошибка получения информации: {e}")
            return {"ok": False, "error": str(e)}
    
    def create_invoice(
        self,
        amount: float,
        currency: str = "USDT",
        description: str = "",
        payload: str = "",
        expires_in: int = 600  # 10 минут
    ) -> Dict[str, Any]:
        """
        Создать инвойс для оплаты
        
        Args:
            amount: Сумма платежа
            currency: Валюта (BTC, ETH, USDT, TON)
            description: Описание платежа
            payload: Полезная нагрузка (до 4KB)
            expires_in: Время жизни инвойса в секундах
            
        Returns:
            Данные инвойса с ссылкой для оплаты
        """
        try:
            data = {
                "amount": str(amount),
                "asset": currency,
                "description": description,
                "payload": payload,
                "expires_in": expires_in
            }
            
            response = requests.post(
                f"{self.base_url}/createInvoice",
                headers=self.headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            
            if result.get("ok"):
                logger.info(f"Инвойс создан: {result['result']['invoice_id']}")
                return result
            else:
                logger.error(f"Ошибка создания инвойса: {result}")
                return result
                
        except Exception as e:
            logger.error(f"Ошибка создания инвойса: {e}")
            return {"ok": False, "error": str(e)}
    
    def get_invoice(self, invoice_id: str) -> Dict[str, Any]:
        """
        Получить информацию об инвойсе
        
        Args:
            invoice_id: ID инвойса
            
        Returns:
            Данные инвойса
        """
        try:
            response = requests.get(
                f"{self.base_url}/getInvoices",
                headers=self.headers,
                params={"invoice_ids": invoice_id}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ошибка получения инвойса: {e}")
            return {"ok": False, "error": str(e)}
    
    def get_balance(self) -> Dict[str, Any]:
        """
        Получить баланс по всем валютам
        """
        try:
            response = requests.get(
                f"{self.base_url}/getBalance",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ошибка получения баланса: {e}")
            return {"ok": False, "error": str(e)}
    
    def get_currencies(self) -> Dict[str, Any]:
        """
        Получить список доступных валют
        """
        try:
            response = requests.get(
                f"{self.base_url}/getCurrencies",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ошибка получения валют: {e}")
            return {"ok": False, "error": str(e)}
    
    def verify_webhook(self, signature: str, body: str) -> bool:
        """
        Проверка подписи webhook от CryptoBot
        
        Args:
            signature: Подпись из заголовка crypto-pay-api-signature
            body: Тело запроса
            
        Returns:
            True если подпись валидна
        """
        try:
            secret = hashlib.sha256(self.api_token.encode()).digest()
            check_string = body
            hmac_hash = hmac.new(secret, check_string.encode(), hashlib.sha256).hexdigest()
            return hmac_hash == signature
        except Exception as e:
            logger.error(f"Ошибка проверки подписи: {e}")
            return False


class MLModelSubscription:
    """
    Управление подписками на ML-модели
    """
    
    def __init__(self, crypto_bot: CryptoBotPayment):
        self.crypto_bot = crypto_bot
        
        # Данные о моделях и ценах
        self.models = {
            "shadow-stack": {
                "name": "ТЕНЕВОЙ СТЕК",
                "monthly": 29.99,
                "lifetime": 299.99
            },
            "forest-necromancer": {
                "name": "ЛЕСНОЙ НЕКРОМАНТ",
                "monthly": 24.99,
                "lifetime": 249.99
            },
            "grey-cardinal": {
                "name": "СЕРЫЙ КАРДИНАЛ",
                "monthly": 34.99,
                "lifetime": 349.99
            },
            "logistic-spy": {
                "name": "ЛОГИСТИЧЕСКИЙ ШПИОН",
                "monthly": 19.99,
                "lifetime": 199.99
            },
            "sniper-80x": {
                "name": "СНАЙПЕР 80Х",
                "monthly": 99.99,
                "lifetime": 999.99
            }
        }
    
    def create_subscription_invoice(
        self,
        user_id: int,
        model_id: str,
        subscription_type: str,  # "monthly" или "lifetime"
        currency: str = "USDT"
    ) -> Dict[str, Any]:
        """
        Создать инвойс для подписки на ML-модель
        
        Args:
            user_id: ID пользователя Telegram
            model_id: ID модели
            subscription_type: Тип подписки (monthly/lifetime)
            currency: Валюта оплаты
            
        Returns:
            Данные инвойса
        """
        if model_id not in self.models:
            return {"ok": False, "error": "Модель не найдена"}
        
        if subscription_type not in ["monthly", "lifetime"]:
            return {"ok": False, "error": "Неверный тип подписки"}
        
        model = self.models[model_id]
        amount = model[subscription_type]
        
        subscription_text = "Ежемесячная подписка" if subscription_type == "monthly" else "Пожизненная покупка"
        
        description = f"{model['name']} - {subscription_text}"
        
        # Payload содержит данные для обработки после оплаты
        payload = f"user:{user_id}|model:{model_id}|type:{subscription_type}"
        
        # Создаём инвойс
        invoice = self.crypto_bot.create_invoice(
            amount=amount,
            currency=currency,
            description=description,
            payload=payload,
            expires_in=600  # 10 минут
        )
        
        return invoice
    
    def process_payment(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Обработка успешного платежа
        
        Args:
            invoice_data: Данные инвойса из webhook
            
        Returns:
            Результат обработки
        """
        try:
            payload = invoice_data.get("payload", "")
            parts = dict(item.split(":") for item in payload.split("|"))
            
            user_id = int(parts.get("user", 0))
            model_id = parts.get("model", "")
            subscription_type = parts.get("type", "")
            
            # Здесь должна быть логика активации подписки
            # Например, запись в базу данных
            
            logger.info(f"Оплата обработана: User {user_id}, Model {model_id}, Type {subscription_type}")
            
            return {
                "ok": True,
                "user_id": user_id,
                "model_id": model_id,
                "subscription_type": subscription_type,
                "status": "activated"
            }
            
        except Exception as e:
            logger.error(f"Ошибка обработки платежа: {e}")
            return {"ok": False, "error": str(e)}


# Пример использования
if __name__ == "__main__":
    # ВАЖНО: Получите токен от @CryptoBot
    # 1. Напишите @CryptoBot
    # 2. Создайте приложение командой /newapp
    # 3. Получите API токен
    
    CRYPTO_BOT_TOKEN = "YOUR_CRYPTO_BOT_TOKEN_HERE"
    
    # Инициализация
    crypto_bot = CryptoBotPayment(CRYPTO_BOT_TOKEN)
    subscription_manager = MLModelSubscription(crypto_bot)
    
    # Проверка подключения
    me = crypto_bot.get_me()
    print("Информация о боте:", me)
    
    # Получение доступных валют
    currencies = crypto_bot.get_currencies()
    print("Доступные валюты:", currencies)
    
    # Пример создания инвойса для подписки
    invoice = subscription_manager.create_subscription_invoice(
        user_id=123456789,
        model_id="logistic-spy",
        subscription_type="monthly",
        currency="USDT"
    )
    
    if invoice.get("ok"):
        print("\n✅ Инвойс создан!")
        print(f"ID: {invoice['result']['invoice_id']}")
        print(f"Ссылка для оплаты: {invoice['result']['pay_url']}")
        print(f"Mini App ссылка: {invoice['result']['mini_app_invoice_url']}")
        print(f"Web App ссылка: {invoice['result']['web_app_invoice_url']}")
    else:
        print("\n❌ Ошибка создания инвойса:", invoice)

