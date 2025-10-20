# 🚀 РАЗВЕРТЫВАНИЕ TELEGRAM BOT В ПРОДАКШН

## 📋 Требования

### Системные требования:
- **Windows 10/11** или **Windows Server 2016+**
- **Python 3.8+** (рекомендуется Python 3.10+)
- **Интернет соединение** (для Telegram API и внешних сервисов)
- **Минимум 2GB RAM** (рекомендуется 4GB+)
- **1GB свободного места** на диске

### Программное обеспечение:
- **Python** с pip
- **curl** (обычно входит в Windows 10+)
- **Cloudflare Tunnel** (cloudflared.exe) - опционально

## 🔧 Установка

### 1. Подготовка системы

```bash
# Проверка версии Python
python --version

# Обновление pip
python -m pip install --upgrade pip
```

### 2. Копирование файлов

Скопируйте всю папку проекта на удаленный сервер:
```
📁 TelegramBot_RDP/
├── 📄 START_PRODUCTION.bat      # Главный файл запуска
├── 📄 STOP_PRODUCTION.bat       # Остановка сервисов
├── 📄 CHECK_STATUS.bat          # Проверка статуса
├── 📄 telegram_bot.py           # Основной бот
├── 📄 requirements.txt          # Зависимости
├── 📄 authorized_users.json     # Пользователи
├── 📄 signal_stats.json         # Статистика
├── 📄 access_requests.json      # Запросы доступа
├── 📄 cloudflared.exe           # Cloudflare туннель
└── 📁 home/ubuntu/forex-signals-app/
    └── 📁 backend/
        └── 📄 signal_api.py     # API сервер
```

### 3. Конфигурация

Убедитесь что все файлы конфигурации присутствуют:
- ✅ `authorized_users.json` - с актуальными пользователями
- ✅ `signal_stats.json` - с историей сигналов
- ✅ `access_requests.json` - для управления доступом
- ✅ `requirements.txt` - со всеми зависимостями

## 🚀 Запуск

### Автоматический запуск (Рекомендуется)

```bash
# Запуск всех сервисов
START_PRODUCTION.bat
```

### Ручной запуск

```bash
# 1. Установка зависимостей
pip install -r requirements.txt

# 2. Запуск API сервера
python home/ubuntu/forex-signals-app/backend/signal_api.py

# 3. Запуск Telegram бота (в новом окне)
python run_telegram_bot.py

# 4. Запуск туннеля (опционально)
cloudflared.exe tunnel --url http://localhost:5000
```

## 📊 Мониторинг

### Проверка статуса
```bash
CHECK_STATUS.bat
```

### Проверка API
```bash
# Статистика
curl http://localhost:5000/api/signal/stats

# Пользователи
curl http://localhost:5000/api/users/all

# Запросы доступа
curl http://localhost:5000/api/admin/access-requests
```

### Логи
- **Telegram Bot**: Окно "Telegram Bot"
- **API Server**: Окно "API Server"  
- **Cloudflare**: Окно "Cloudflare Tunnel"

## 🛑 Остановка

### Автоматическая остановка
```bash
STOP_PRODUCTION.bat
```

### Ручная остановка
- Закройте все окна Python
- Или используйте Task Manager для завершения процессов

## 🔗 Доступные URL

После запуска доступны:
- **API**: http://localhost:5000
- **Web App**: https://accessibility-gallery-column-olympus.trycloudflare.com
- **Telegram Bot**: @Bin_ByB1million_bot

## 🐛 Устранение неполадок

### Проблемы с Python
```bash
# Переустановка зависимостей
pip install -r requirements.txt --force-reinstall
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -an | findstr :5000

# Остановка процессов на порту 5000
taskkill /f /im python.exe
```

### Проблемы с файлами
- Убедитесь что все JSON файлы имеют корректный синтаксис
- Проверьте права доступа к файлам
- Убедитесь что файлы не заблокированы антивирусом

### Проблемы с туннелем
```bash
# Обновление Cloudflare Tunnel
# Скачайте новую версию с https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

## 📝 Важные заметки

### Безопасность
- ⚠️ **НЕ ДЕЛИТЕСЬ** токеном бота
- ⚠️ **НЕ ПУБЛИКУЙТЕ** файлы с токенами
- ⚠️ **РЕГУЛЯРНО ОБНОВЛЯЙТЕ** зависимости

### Производительность
- Мониторьте использование RAM
- Регулярно очищайте логи
- Проверяйте стабильность интернет соединения

### Резервное копирование
- Регулярно копируйте `authorized_users.json`
- Сохраняйте `signal_stats.json`
- Делайте бэкап всей папки проекта

## 📞 Поддержка

При возникновении проблем:
1. Запустите `CHECK_STATUS.bat`
2. Проверьте логи в окнах сервисов
3. Убедитесь что все файлы на месте
4. Проверьте интернет соединение

---

**🎯 Готово! Система развернута и готова к работе!**
