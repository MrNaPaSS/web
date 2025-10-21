# ENTERPRISE SUBSCRIPTION SYSTEM

## 🚀 Быстрый запуск

### 1. Установка зависимостей
```bash
cd backend
pip install -r requirements.txt
```

### 2. Запуск системы
```bash
# Windows
START_ENTERPRISE_SYSTEM.bat

# Linux/Mac
python signal_api.py &
python websocket_server.py
```

### 3. Проверка работы
- API: http://localhost:5000/health
- WebSocket: ws://localhost:8001/ws/{user_id}

## 🐳 Docker развертывание

### 1. Подготовка
```bash
# Создайте .env файл из env.example
cp env.example .env

# Отредактируйте .env файл
nano .env
```

### 2. Запуск с Docker
```bash
docker-compose up -d
```

### 3. Проверка контейнеров
```bash
docker-compose ps
docker-compose logs -f
```

## 📊 Мониторинг

### Логи аудита
```bash
tail -f backend/logs/audit.log
```

### Проверка API
```bash
curl http://localhost:5000/api/health
```

### WebSocket тестирование
```javascript
const ws = new WebSocket('ws://localhost:8001/ws/123456');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
```

## 🔧 Конфигурация

### Основные параметры
- `API_PORT`: Порт основного API (по умолчанию 5000)
- `WEBSOCKET_PORT`: Порт WebSocket сервера (по умолчанию 8001)
- `DB_PASSWORD`: Пароль PostgreSQL
- `ADMIN_TELEGRAM_ID`: ID администратора в Telegram

### Файлы конфигурации
- `backend/config.py` - Основная конфигурация
- `backend/database.py` - Настройки базы данных
- `backend/audit_logger.py` - Настройки логирования

## 📈 API Endpoints

### Пользовательские
- `GET /api/user/subscriptions?user_id={id}` - Получить подписки
- `POST /api/user/subscriptions` - Обновить подписки
- `GET /api/user/subscriptions/status?user_id={id}` - Статус подписки

### Административные
- `GET /api/admin/subscription-templates` - Шаблоны подписок
- `POST /api/admin/bulk-subscription-update` - Массовое обновление
- `GET /api/admin/subscription-history` - История изменений

### WebSocket
- `ws://localhost:8001/ws/{user_id}` - Real-time обновления

## 🔒 Безопасность

### Аудит
- Все изменения подписок логируются в `logs/audit.log`
- Логируется IP адрес, время, старые и новые подписки
- Массовые операции логируются отдельно

### Админские права
- Проверка по `ADMIN_TELEGRAM_ID` в конфигурации
- Все административные действия логируются

## 🚨 Troubleshooting

### Проблемы с WebSocket
```bash
# Проверьте, что порт 8001 свободен
netstat -an | grep 8001

# Перезапустите WebSocket сервер
python websocket_server.py
```

### Проблемы с базой данных
```bash
# Проверьте подключение к PostgreSQL
psql -h localhost -U subscription_user -d subscription_db

# Выполните миграцию
python migrate_to_db.py
```

### Проблемы с логами
```bash
# Проверьте права на запись
ls -la backend/logs/

# Создайте директорию логов
mkdir -p backend/logs
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в `backend/logs/audit.log`
2. Убедитесь, что все порты свободны
3. Проверьте конфигурацию в `.env` файле
4. Перезапустите систему через Docker или скрипты





