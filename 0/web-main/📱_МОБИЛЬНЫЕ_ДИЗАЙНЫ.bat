@echo off
chcp 65001 >nul
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║     📱 МОБИЛЬНЫЕ ПРОТОТИПЫ ВЕБ-ИНТЕРФЕЙСА                       ║
echo ║                                                                  ║
echo ║     3 ВАРИАНТА ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ                          ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo.
echo  📈 ВАРИАНТ 1: Bloomberg Terminal Mobile
echo     └─ Профессиональный терминал
echo     └─ Live тикер, компактная информация
echo     └─ Для серьёзных трейдеров
echo.
echo  ✨ ВАРИАНТ 2: Modern Minimal Mobile ⭐ РЕКОМЕНДУЕМ!
echo     └─ Крупные элементы, touch-friendly
echo     └─ Лучший UX на мобильном
echo     └─ Универсальный для всех
echo.
echo  ⚡ ВАРИАНТ 3: Cyberpunk Neon Mobile
echo     └─ Неоновые эффекты, футуристичный
echo     └─ Уникальный стиль
echo     └─ Максимальный wow-эффект
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
echo  Открываю мобильные прототипы в браузере...
echo.

cd /d "%~dp0webapp\design_prototypes"
start "" "mobile_index.html"

timeout /t 2 /nobreak >nul

echo.
echo  ✅ Готово! Все мобильные варианты открыты.
echo.
echo  💡 Все прототипы оптимизированы для экранов 360-428px
echo     Кнопки минимум 44x44px (Apple HIG стандарт)
echo     Bottom navigation для удобной навигации
echo.
echo  📱 Для лучшего просмотра:
echo     - Откройте DevTools (F12)
echo     - Переключитесь на мобильный вид
echo     - Или откройте прямо на телефоне!
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.
pause



