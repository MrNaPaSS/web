#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Система мультиязычности для Signal Bot
МИНИМАЛЬНАЯ интеграция - переводы применяются ТОЛЬКО если язык выбран явно
"""

import json
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

LANGUAGES = {
    "ru": {"name": "Русский", "flag": "🇷🇺"},
    "en": {"name": "English", "flag": "🇬🇧"},
    "th": {"name": "ไทย", "flag": "🇹🇭"},
    "es": {"name": "Español", "flag": "🇪🇸"},
    "ar": {"name": "العربية", "flag": "🇸🇦"}
}

DIRECTION_NAMES = {
    "BUY": {"ru": "ПОКУПКА", "en": "BUY", "th": "ซื้อ", "es": "COMPRA", "ar": "شراء"},
    "SELL": {"ru": "ПРОДАЖА", "en": "SELL", "th": "ขาย", "es": "VENTA", "ar": "بيع"}
}

# Переводы для запроса доступа
ACCESS_TEXTS = {
    "request_sent": {
        "ru": "📝 <b>Запрос на доступ отправлен!</b>\n\n🔄 Ваш запрос передан администратору на рассмотрение.\n⏳ Ожидайте уведомления о результате.\n\n📞 Администратор: @kaktotakxm",
        "en": "📝 <b>Access request sent!</b>\n\n🔄 Your request has been sent to administrator.\n⏳ Wait for notification about result.\n\n📞 Administrator: @kaktotakxm",
        "th": "📝 <b>ส่งคำขอการเข้าถึงแล้ว!</b>\n\n🔄 คำขอของคุณถูกส่งไปยังผู้ดูแลระบบแล้ว\n⏳ รอการแจ้งเตือนเกี่ยวกับผลลัพธ์\n\n📞 ผู้ดูแลระบบ: @kaktotakxm",
        "es": "📝 <b>¡Solicitud de acceso enviada!</b>\n\n🔄 Tu solicitud ha sido enviada al administrador.\n⏳ Espera la notificación del resultado.\n\n📞 Administrador: @kaktotakxm",
        "ar": "📝 <b>تم إرسال طلب الوصول!</b>\n\n🔄 تم إرسال طلبك إلى المسؤول.\n⏳ انتظر الإشعار بالنتيجة.\n\n📞 المسؤول: @kaktotakxm"
    },
    "request_pending": {
        "ru": "⏳ <b>Ваш запрос уже на рассмотрении</b>\n\n🔄 Запрос был отправлен ранее.\n⏳ Ожидайте уведомления о результате.\n\n📞 Администратор: @kaktotakxm",
        "en": "⏳ <b>Your request is already pending</b>\n\n🔄 Request was sent earlier.\n⏳ Wait for notification about result.\n\n📞 Administrator: @kaktotakxm",
        "th": "⏳ <b>คำขอของคุณอยู่ระหว่างการพิจารณา</b>\n\n🔄 คำขอถูกส่งไปก่อนหน้านี้แล้ว\n⏳ รอการแจ้งเตือนเกี่ยวกับผลลัพธ์\n\n📞 ผู้ดูแลระบบ: @kaktotakxm",
        "es": "⏳ <b>Tu solicitud ya está pendiente</b>\n\n🔄 La solicitud fue enviada anteriormente.\n⏳ Espera la notificación del resultado.\n\n📞 Administrador: @kaktotakxm",
        "ar": "⏳ <b>طلبك قيد الانتظار بالفعل</b>\n\n🔄 تم إرسال الطلب مسبقاً.\n⏳ انتظر الإشعار بالنتيجة.\n\n📞 المسؤول: @kaktotakxm"
    },
    "language_changed": {
        "ru": "✅ Язык изменён на Русский",
        "en": "✅ Language changed to English",
        "th": "✅ เปลี่ยนภาษาเป็นไทยแล้ว",
        "es": "✅ Idioma cambiado a Español",
        "ar": "✅ تم تغيير اللغة إلى العربية"
    },
    "welcome": {
        "ru": "🚀 <b>Добро пожаловать в систему генерации торговых сигналов!</b>\n\n🔹 <b>Возможности:</b>\n• 💱 Форекс сигналы (Пн-Пт, 06:00-22:00 CET/CEST)\n• ⚡ ОТС сигналы (круглосуточно 24/7)\n• 📈 Технический анализ с множественными индикаторами\n• 🎯 Система скоринга качества сигналов\n• 🌐 Реальные рыночные данные\n\n👇 <b>Выберите тип торговли:</b>",
        "en": "🚀 <b>Welcome to Trading Signals System!</b>\n\n🔹 <b>Features:</b>\n• 💱 Forex signals (Mon-Fri, 06:00-22:00 CET/CEST)\n• ⚡ OTC signals (24/7 non-stop)\n• 📈 Technical analysis with multiple indicators\n• 🎯 Signal quality scoring system\n• 🌐 Real-time market data\n\n👇 <b>Choose trading type:</b>",
        "th": "🚀 <b>ยินดีต้อนรับสู่ระบบสัญญาณการเทรด!</b>\n\n🔹 <b>คุณสมบัติ:</b>\n• 💱 สัญญาณฟอเร็กซ์ (จันทร์-ศุกร์, 06:00-22:00 CET/CEST)\n• ⚡ สัญญาณ OTC (24/7 ตลอดเวลา)\n• 📈 การวิเคราะห์ทางเทคนิคด้วยตัวชี้วัดหลายตัว\n• 🎯 ระบบให้คะแนนคุณภาพสัญญาณ\n• 🌐 ข้อมูลตลาดแบบเรียลไทม์\n\n👇 <b>เลือกประเภทการเทรด:</b>",
        "es": "🚀 <b>¡Bienvenido al Sistema de Señales de Trading!</b>\n\n🔹 <b>Características:</b>\n• 💱 Señales Forex (Lun-Vie, 06:00-22:00 CET/CEST)\n• ⚡ Señales OTC (24/7 sin parar)\n• 📈 Análisis técnico con múltiples indicadores\n• 🎯 Sistema de puntuación de calidad de señales\n• 🌐 Datos de mercado en tiempo real\n\n👇 <b>Elige el tipo de trading:</b>",
        "ar": "🚀 <b>مرحباً بك في نظام إشارات التداول!</b>\n\n🔹 <b>الميزات:</b>\n• 💱 إشارات الفوركس (الاثنين-الجمعة، 06:00-22:00 CET/CEST)\n• ⚡ إشارات OTC (24/7 بدون توقف)\n• 📈 التحليل الفني مع مؤشرات متعددة\n• 🎯 نظام تقييم جودة الإشارات\n• 🌐 بيانات السوق في الوقت الفعلي\n\n👇 <b>اختر نوع التداول:</b>"
    },
    "main_menu_title": {
        "ru": "🚀 <b>Система генерации форекс сигналов</b>\n\n👇 <b>Выберите действие:</b>",
        "en": "🚀 <b>Forex Signal Generation System</b>\n\n👇 <b>Choose action:</b>",
        "th": "🚀 <b>ระบบสร้างสัญญาณฟอเร็กซ์</b>\n\n👇 <b>เลือกการดำเนินการ:</b>",
        "es": "🚀 <b>Sistema de Generación de Señales Forex</b>\n\n👇 <b>Elige acción:</b>",
        "ar": "🚀 <b>نظام إنشاء إشارات الفوركس</b>\n\n👇 <b>اختر الإجراء:</b>"
    },
    "btn_forex": {
        "ru": "💱 Форекс",
        "en": "💱 Forex",
        "th": "💱 ฟอเร็กซ์",
        "es": "💱 Forex",
        "ar": "💱 فوركس"
    },
    "btn_otc": {
        "ru": "⚡ ОТС",
        "en": "⚡ OTC",
        "th": "⚡ OTC",
        "es": "⚡ OTC",
        "ar": "⚡ OTC"
    },
    "btn_schedule": {
        "ru": "📅 Расписание работы",
        "en": "📅 Market Schedule",
        "th": "📅 ตารางตลาด",
        "es": "📅 Horario del Mercado",
        "ar": "📅 جدول السوق"
    },
    "btn_help": {
        "ru": "❓ Помощь",
        "en": "❓ Help",
        "th": "❓ ความช่วยเหลือ",
        "es": "❓ Ayuda",
        "ar": "❓ مساعدة"
    },
    # ФОРЕКС МЕНЮ
    "forex_title": {
        "ru": "📊 <b>ФОРЕКС СИГНАЛЫ</b>\n\n",
        "en": "📊 <b>FOREX SIGNALS</b>\n\n",
        "th": "📊 <b>สัญญาณฟอเร็กซ์</b>\n\n",
        "es": "📊 <b>SEÑALES FOREX</b>\n\n",
        "ar": "📊 <b>إشارات الفوركس</b>\n\n"
    },
    "market_open": {
        "ru": {
            "title": "Рынок ОТКРЫТ",
            "description": "Можно получать актуальные сигналы!"
        },
        "en": {
            "title": "Market OPEN",
            "description": "Real signals with live data available!"
        },
        "th": {
            "title": "ตลาดเปิด",
            "description": "มีสัญญาณจริงพร้อมข้อมูลสด!"
        },
        "es": {
            "title": "Mercado ABIERTO",
            "description": "¡Señales reales con datos en vivo disponibles!"
        },
        "ar": {
            "title": "السوق مفتوح",
            "description": "إشارات حقيقية مع بيانات حية متاحة!"
        }
    },
    "market_closed": {
        "ru": {
            "title": "Рынок ЗАКРЫТ",
            "description": "Форекс рынок закрыт до открытия торговых сессий."
        },
        "en": {
            "title": "Market CLOSED",
            "description": "Forex market is closed until trading sessions open."
        },
        "th": {
            "title": "ตลาดปิด",
            "description": "ตลาดฟอเร็กซ์ปิดจนกว่าจะเปิดเซสชันการซื้อขาย"
        },
        "es": {
            "title": "Mercado CERRADO",
            "description": "El mercado Forex está cerrado hasta que se abran las sesiones de trading."
        },
        "ar": {
            "title": "السوق مغلق",
            "description": "سوق الفوركس مغلق حتى فتح جلسات التداول."
        }
    },
    "market_status": {
        "ru": {
            "current_time": "Текущее время",
            "open_until": "Работает до",
            "until_close": "До закрытия",
            "working_days": "Рабочие дни",
            "working_hours": "Рабочие часы",
            "until_open": "До открытия"
        },
        "en": {
            "current_time": "Current time",
            "open_until": "Open until",
            "until_close": "Until close",
            "working_days": "Working days",
            "working_hours": "Working hours",
            "until_open": "Until open"
        },
        "th": {
            "current_time": "เวลาปัจจุบัน",
            "open_until": "เปิดจนถึง",
            "until_close": "จนกว่าจะปิด",
            "working_days": "วันทำงาน",
            "working_hours": "ชั่วโมงทำงาน",
            "until_open": "จนกว่าจะเปิด"
        },
        "es": {
            "current_time": "Hora actual",
            "open_until": "Abierto hasta",
            "until_close": "Hasta cerrar",
            "working_days": "Días laborables",
            "working_hours": "Horario de trabajo",
            "until_open": "Hasta abrir"
        },
        "ar": {
            "current_time": "الوقت الحالي",
            "open_until": "مفتوح حتى",
            "until_close": "حتى الإغلاق",
            "working_days": "أيام العمل",
            "working_hours": "ساعات العمل",
            "until_open": "حتى الفتح"
        }
    },
    "btn_forex_signal": {
        "ru": "📊 Форекс сигнал",
        "en": "📊 Forex signal",
        "th": "📊 สัญญาณฟอเร็กซ์",
        "es": "📊 Señal Forex",
        "ar": "📊 إشارة فوركس"
    },
    "btn_top3_forex": {
        "ru": "🏆 ТОП-3 форекс",
        "en": "🏆 TOP-3 forex",
        "th": "🏆 TOP-3 ฟอเร็กซ์",
        "es": "🏆 TOP-3 forex",
        "ar": "🏆 أفضل 3 فوركس"
    },
    "btn_back": {
        "ru": "⬅️ Назад",
        "en": "⬅️ Back",
        "th": "⬅️ กลับ",
        "es": "⬅️ Atrás",
        "ar": "⬅️ رجوع"
    },
    # ОТС МЕНЮ
    "otc_title": {
        "ru": "⚡ <b>ОТС СИГНАЛЫ</b>\n\n",
        "en": "⚡ <b>OTC SIGNALS</b>\n\n",
        "th": "⚡ <b>สัญญาณ OTC</b>\n\n",
        "es": "⚡ <b>SEÑALES OTC</b>\n\n",
        "ar": "⚡ <b>إشارات OTC</b>\n\n"
    },
    "otc_open": {
        "ru": "🟢 <b>ОТС рынок ОТКРЫТ 24/7</b>\n💡 Доступны реальные сигналы круглосуточно\n📊 5 основных ОТС пар",
        "en": "🟢 <b>OTC market OPEN 24/7</b>\n💡 Real signals available 24/7\n📊 5 main OTC pairs",
        "th": "🟢 <b>ตลาด OTC เปิด 24/7</b>\n💡 มีสัญญาณจริงตลอด 24 ชั่วโมง\n📊 5 คู่ OTC หลัก",
        "es": "🟢 <b>Mercado OTC ABIERTO 24/7</b>\n💡 Señales reales disponibles 24/7\n📊 5 pares OTC principales",
        "ar": "🟢 <b>سوق OTC مفتوح 24/7</b>\n💡 إشارات حقيقية متاحة على مدار الساعة\n📊 5 أزواج OTC رئيسية"
    },
    "btn_otc_signal": {
        "ru": "⚡ ОТС сигнал",
        "en": "⚡ OTC signal",
        "th": "⚡ สัญญาณ OTC",
        "es": "⚡ Señal OTC",
        "ar": "⚡ إشارة OTC"
    },
    "btn_top3_otc": {
        "ru": "🏆 ТОП-3 ОТС",
        "en": "🏆 TOP-3 OTC",
        "th": "🏆 TOP-3 OTC",
        "es": "🏆 TOP-3 OTC",
        "ar": "🏆 أفضل 3 OTC"
    },
    # HELP
    "help": {
        "ru": "❓ <b>ПОМОЩЬ</b>\n\n🤖 Доступные команды:\n• /start - Запуск бота\n• /help - Показать помощь\n• /market - Расписание рынка\n\n📊 Функции бота:\n• 💱 Форекс сигналы - Работают в часы торгов\n• ⚡ ОТС сигналы - Работают круглосуточно 24/7\n• 📈 Технический анализ - RSI, EMA, MACD, Bollinger Bands\n• 🎯 Система скоринга - Оценка качества сигналов\n\n💡 Как пользоваться:\n1. Выберите тип торговли (Форекс или ОТС)\n2. Выберите нужную функцию в меню\n3. Получите сигнал с детальным анализом\n\n📞 Поддержка: @kaktotakxm\n🔒 Доступ: Только для авторизованных пользователей",
        "en": "❓ <b>HELP</b>\n\n🤖 Available commands:\n• /start - Start bot\n• /help - Show help\n• /market - Market schedule\n\n📊 Bot functions:\n• 💱 Forex signals - Work during trading hours\n• ⚡ OTC signals - Work 24/7\n• 📈 Technical analysis - RSI, EMA, MACD, Bollinger Bands\n• 🎯 Scoring system - Signal quality assessment\n\n💡 How to use:\n1. Choose trading type (Forex or OTC)\n2. Select desired function\n3. Get signal with detailed analysis\n\n📞 Support: @kaktotakxm\n🔒 Access: Only for authorized users",
        "th": "❓ <b>ความช่วยเหลือ</b>\n\n🤖 คำสั่งที่มี:\n• /start - เริ่มบอท\n• /help - แสดงความช่วยเหลือ\n• /market - ตารางเวลาตลาด\n\n📊 ฟังก์ชั่นบอท:\n• 💱 สัญญาณฟอเร็กซ์ - ทำงานในช่วงเวลาการซื้อขาย\n• ⚡ สัญญาณ OTC - ทำงานตลอด 24/7\n• 📈 การวิเคราะห์ทางเทคนิค - RSI, EMA, MACD, Bollinger Bands\n• 🎯 ระบบให้คะแนน - การประเมินคุณภาพสัญญาณ\n\n💡 วิธีใช้:\n1. เลือกประเภทการซื้อขาย (ฟอเร็กซ์หรือ OTC)\n2. เลือกฟังก์ชั่นที่ต้องการ\n3. รับสัญญาณพร้อมการวิเคราะห์โดยละเอียด\n\n📞 การสนับสนุน: @kaktotakxm\n🔒 การเข้าถึง: เฉพาะผู้ใช้ที่ได้รับอนุญาต",
        "es": "❓ <b>AYUDA</b>\n\n🤖 Comandos disponibles:\n• /start - Iniciar bot\n• /help - Mostrar ayuda\n• /market - Horario del mercado\n\n📊 Funciones del bot:\n• 💱 Señales Forex - Funcionan en horario de trading\n• ⚡ Señales OTC - Funcionan 24/7\n• 📈 Análisis técnico - RSI, EMA, MACD, Bollinger Bands\n• 🎯 Sistema de puntuación - Evaluación de calidad\n\n💡 Cómo usar:\n1. Elige el tipo de trading (Forex u OTC)\n2. Selecciona la función deseada\n3. Obtén señal con análisis detallado\n\n📞 Soporte: @kaktotakxm\n🔒 Acceso: Solo usuarios autorizados",
        "ar": "❓ <b>مساعدة</b>\n\n🤖 الأوامر المتاحة:\n• /start - بدء البوت\n• /help - عرض المساعدة\n• /market - جدول السوق\n\n📊 وظائف البوت:\n• 💱 إشارات الفوركس - تعمل خلال ساعات التداول\n• ⚡ إشارات OTC - تعمل 24/7\n• 📈 التحليل الفني - RSI, EMA, MACD, Bollinger Bands\n• 🎯 نظام التسجيل - تقييم جودة الإشارات\n\n💡 كيفية الاستخدام:\n1. اختر نوع التداول (الفوركس أو OTC)\n2. اختر الوظيفة المطلوبة\n3. احصل على إشارة مع تحليل مفصل\n\n📞 الدعم: @kaktotakxm\n🔒 الوصول: للمستخدمين المصرح لهم فقط"
    },
    # MARKET
    "market": {
        "ru": "📅 <b>РАСПИСАНИЕ РАБОТЫ РЫНКОВ</b>\n\n💱 <b>ФОРЕКС (Forex):</b>\n🕕 <b>Время работы:</b> Понедельник - Пятница\n⏰ <b>Часы:</b> 06:00 - 22:00 (CET/CEST)\n🌍 <b>Пары:</b> EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD\n\n⚡ <b>ОТС (Over-The-Counter):</b>\n🕐 <b>Время работы:</b> Круглосуточно 24/7\n📅 <b>Дни:</b> Понедельник - Воскресенье\n🌐 <b>Пары:</b> Те же 6 основных пар в ОТС режиме\n\n💡 <b>Примечание:</b>\n• В часы работы форекса - реальные рыночные данные\n• Вне часов форекса - сигналы недоступны\n• ОТС пары всегда работают с реальными данными",
        "en": "📅 <b>MARKET SCHEDULE</b>\n\n💱 <b>FOREX (Forex):</b>\n🕕 <b>Working hours:</b> Monday - Friday\n⏰ <b>Hours:</b> 06:00 - 22:00 (CET/CEST)\n🌍 <b>Pairs:</b> EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD\n\n⚡ <b>OTC (Over-The-Counter):</b>\n🕐 <b>Working hours:</b> 24/7 non-stop\n📅 <b>Days:</b> Monday - Sunday\n🌐 <b>Pairs:</b> Same 6 main pairs in OTC mode\n\n💡 <b>Note:</b>\n• During forex hours - real market data\n• Outside forex hours - signals unavailable\n• OTC pairs always work with real data",
        "th": "📅 <b>ตารางเวลาตลาด</b>\n\n💱 <b>ฟอเร็กซ์ (Forex):</b>\n🕕 <b>เวลาทำการ:</b> จันทร์ - ศุกร์\n⏰ <b>ชั่วโมง:</b> 06:00 - 22:00 (CET/CEST)\n🌍 <b>คู่:</b> EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD\n\n⚡ <b>OTC (Over-The-Counter):</b>\n🕐 <b>เวลาทำการ:</b> ตลอด 24/7\n📅 <b>วัน:</b> จันทร์ - อาทิตย์\n🌐 <b>คู่:</b> คู่หลัก 6 คู่เดียวกันในโหมด OTC\n\n💡 <b>หมายเหตุ:</b>\n• ในช่วงเวลาฟอเร็กซ์ - ข้อมูลตลาดจริง\n• นอกเวลาฟอเร็กซ์ - สัญญาณไม่พร้อมใช้งาน\n• คู่ OTC ทำงานกับข้อมูลจริงเสมอ",
        "es": "📅 <b>HORARIO DEL MERCADO</b>\n\n💱 <b>FOREX (Forex):</b>\n🕕 <b>Horario:</b> Lunes - Viernes\n⏰ <b>Horas:</b> 06:00 - 22:00 (CET/CEST)\n🌍 <b>Pares:</b> EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD\n\n⚡ <b>OTC (Over-The-Counter):</b>\n🕐 <b>Horario:</b> 24/7 sin parar\n📅 <b>Días:</b> Lunes - Domingo\n🌐 <b>Pares:</b> Los mismos 6 pares principales en modo OTC\n\n💡 <b>Nota:</b>\n• Durante horario forex - datos de mercado reales\n• Fuera de horario forex - señales no disponibles\n• Los pares OTC siempre funcionan con datos reales",
        "ar": "📅 <b>جدول السوق</b>\n\n💱 <b>الفوركس (Forex):</b>\n🕕 <b>ساعات العمل:</b> الاثنين - الجمعة\n⏰ <b>الساعات:</b> 06:00 - 22:00 (CET/CEST)\n🌍 <b>الأزواج:</b> EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD\n\n⚡ <b>OTC (Over-The-Counter):</b>\n🕐 <b>ساعات العمل:</b> 24/7 بدون توقف\n📅 <b>الأيام:</b> الاثنين - الأحد\n🌐 <b>الأزواج:</b> نفس 6 أزواج رئيسية في وضع OTC\n\n💡 <b>ملاحظة:</b>\n• خلال ساعات الفوركس - بيانات السوق الحقيقية\n• خارج ساعات الفوركس - الإشارات غير متاحة\n• أزواج OTC تعمل دائماً ببيانات حقيقية"
    },
    # ДОПОЛНИТЕЛЬНЫЕ КНОПКИ
    "btn_win": {
        "ru": "✅ ВЫИГРАШ",
        "en": "✅ WIN",
        "th": "✅ ชนะ",
        "es": "✅ GANAR",
        "ar": "✅ فوز"
    },
    "btn_loss": {
        "ru": "❌ ПРОИГРАШ",
        "en": "❌ LOSS",
        "th": "❌ แพ้",
        "es": "❌ PERDER",
        "ar": "❌ خسارة"
    },
    "btn_refresh": {
        "ru": "🔄 Обновить",
        "en": "🔄 Refresh",
        "th": "🔄 รีเฟรช",
        "es": "🔄 Actualizar",
        "ar": "🔄 تحديث"
    },
    "btn_main_menu": {
        "ru": "🔙 Главное меню",
        "en": "🔙 Main menu",
        "th": "🔙 เมนูหลัก",
        "es": "🔙 Menú principal",
        "ar": "🔙 القائمة الرئيسية"
    },
    "btn_otc_menu": {
        "ru": "⬅️ ОТС меню",
        "en": "⬅️ OTC menu",
        "th": "⬅️ เมนู OTC",
        "es": "⬅️ Menú OTC",
        "ar": "⬅️ قائمة OTC"
    },
    "btn_approve": {
        "ru": "✅ Принять",
        "en": "✅ Approve",
        "th": "✅ อนุมัติ",
        "es": "✅ Aprobar",
        "ar": "✅ موافقة"
    },
    "btn_reject": {
        "ru": "❌ Отклонить",
        "en": "❌ Reject",
        "th": "❌ ปฏิเสธ",
        "es": "❌ Rechazar",
        "ar": "❌ رفض"
    },
    "btn_all_requests": {
        "ru": "📋 Все запросы",
        "en": "📋 All requests",
        "th": "📋 คำขอทั้งหมด",
        "es": "📋 Todas las solicitudes",
        "ar": "📋 جميع الطلبات"
    },
    "btn_users": {
        "ru": "👥 Пользователи",
        "en": "👥 Users",
        "th": "👥 ผู้ใช้",
        "es": "👥 Usuarios",
        "ar": "👥 المستخدمون"
    },
    "btn_requests": {
        "ru": "📋 Запросы",
        "en": "📋 Requests",
        "th": "📋 คำขอ",
        "es": "📋 Solicitudes",
        "ar": "📋 الطلبات"
    },
    "btn_status": {
        "ru": "⚙️ Статус системы",
        "en": "⚙️ System status",
        "th": "⚙️ สถานะระบบ",
        "es": "⚙️ Estado del sistema",
        "ar": "⚙️ حالة النظام"
    },
    "btn_clear_signal": {
        "ru": "🗑️ Очистить сигнал",
        "en": "🗑️ Clear signal",
        "th": "🗑️ ล้างสัญญาณ",
        "es": "🗑️ Limpiar señal",
        "ar": "🗑️ مسح الإشارة"
    },
    # СООБЩЕНИЯ ОДОБРЕНИЯ
    "request_approved": {
        "ru": "🎉 <b>Ваш запрос одобрен!</b>\n\n✅ Теперь у вас есть доступ к боту генерации форекс сигналов.\n🚀 Напишите /start для начала работы.\n\n💡 Добро пожаловать!",
        "en": "🎉 <b>Your request approved!</b>\n\n✅ Now you have access to the forex signal generation bot.\n🚀 Write /start to begin work.\n\n💡 Welcome!",
        "th": "🎉 <b>คำขอของคุณได้รับการอนุมัติ!</b>\n\n✅ ตอนนี้คุณมีสิทธิ์เข้าถึงบอทสร้างสัญญาณฟอเร็กซ์\n🚀 พิมพ์ /start เพื่อเริ่มทำงาน\n\n💡 ยินดีต้อนรับ!",
        "es": "🎉 <b>¡Tu solicitud aprobada!</b>\n\n✅ Ahora tienes acceso al bot de generación de señales forex.\n🚀 Escribe /start para comenzar a trabajar.\n\n💡 ¡Bienvenido!",
        "ar": "🎉 <b>تم الموافقة على طلبك!</b>\n\n✅ الآن لديك حق الوصول إلى بوت إنشاء إشارات الفوركس.\n🚀 اكتب /start للبدء في العمل.\n\n💡 مرحباً بك!"
    },
    # СООБЩЕНИЯ ОТЗЫВА ДОСТУПА
    "access_revoked": {
        "ru": "🚫 <b>Ваш доступ к боту отозван</b>\n\n❌ Администратор отозвал ваш доступ к боту генерации сигналов.\n📞 Для уточнения обратитесь: @kaktotakxm\n\n💡 Вы можете подать новый запрос на доступ.",
        "en": "🚫 <b>Your access to the bot has been revoked</b>\n\n❌ Administrator has revoked your access to the signal generation bot.\n📞 For clarification contact: @kaktotakxm\n\n💡 You can submit a new access request.",
        "th": "🚫 <b>การเข้าถึงบอทของคุณถูกยกเลิก</b>\n\n❌ ผู้ดูแลระบบได้ยกเลิกการเข้าถึงบอทสร้างสัญญาณของคุณ\n📞 สำหรับการชี้แจงติดต่อ: @kaktotakxm\n\n💡 คุณสามารถส่งคำขอการเข้าถึงใหม่ได้",
        "es": "🚫 <b>Tu acceso al bot ha sido revocado</b>\n\n❌ El administrador ha revocado tu acceso al bot de generación de señales.\n📞 Para aclaraciones contacta: @kaktotakxm\n\n💡 Puedes enviar una nueva solicitud de acceso.",
        "ar": "🚫 <b>تم سحب وصولك إلى البوت</b>\n\n❌ قام المسؤول بسحب وصولك إلى بوت إنشاء الإشارات.\n📞 للتوضيح اتصل: @kaktotakxm\n\n💡 يمكنك تقديم طلب وصول جديد."
    },
    # СИГНАЛЫ
    "deal_activated": {
        "ru": "СДЕЛКА АКТИВИРОВАНА",
        "en": "DEAL ACTIVATED",
        "th": "เปิดใช้งานการเทรด",
        "es": "OPERACIÓN ACTIVADA",
        "ar": "تم تفعيل الصفقة"
    },
    "pair": {
        "ru": "Пара",
        "en": "Pair",
        "th": "คู่",
        "es": "Par",
        "ar": "زوج"
    },
    "direction": {
        "ru": "Направление",
        "en": "Direction",
        "th": "ทิศทาง",
        "es": "Dirección",
        "ar": "الاتجاه"
    },
    "score": {
        "ru": "Скор",
        "en": "Score",
        "th": "คะแนน",
        "es": "Puntuación",
        "ar": "النقاط"
    },
    "expiration": {
        "ru": "Экспирация",
        "en": "Expiration",
        "th": "หมดอายุ",
        "es": "Expiración",
        "ar": "انتهاء الصلاحية"
    },
    "navigation_blocked": {
        "ru": "Навигация заблокирована до",
        "en": "Navigation blocked until",
        "th": "การนำทางถูกบล็อกจนถึง",
        "es": "Navegación bloqueada hasta",
        "ar": "تم حظر التنقل حتى"
    },
    "remaining": {
        "ru": "Осталось",
        "en": "Remaining",
        "th": "เหลือ",
        "es": "Restante",
        "ar": "متبقي"
    },
    "timer_updates": {
        "ru": "Таймер обновляется автоматически каждые 30с",
        "en": "Timer updates automatically every 30s",
        "th": "ตัวจับเวลาอัปเดตอัตโนมัติทุก 30 วินาที",
        "es": "El temporizador se actualiza automáticamente cada 30s",
        "ar": "يتم تحديث المؤقت تلقائياً كل 30 ثانية"
    },
    "after_expiration": {
        "ru": "После истечения времени укажите результат торговли",
        "en": "After time expires, indicate trading result",
        "th": "หลังจากหมดเวลา ให้ระบุผลการเทรด",
        "es": "Después de que expire el tiempo, indica el resultado de la operación",
        "ar": "بعد انتهاء الوقت، حدد نتيجة التداول"
    },
    "win_unavailable": {
        "ru": "Выиграш (недоступно)",
        "en": "Win (unavailable)",
        "th": "ชนะ (ไม่พร้อมใช้งาน)",
        "es": "Ganar (no disponible)",
        "ar": "فوز (غير متاح)"
    },
    "loss_unavailable": {
        "ru": "Проиграш (недоступно)",
        "en": "Loss (unavailable)",
        "th": "แพ้ (ไม่พร้อมใช้งาน)",
        "es": "Perder (no disponible)",
        "ar": "خسارة (غير متاح)"
    },
    "refresh_now": {
        "ru": "Обновить сейчас",
        "en": "Refresh now",
        "th": "รีเฟรชตอนนี้",
        "es": "Actualizar ahora",
        "ar": "تحديث الآن"
    },
    # Сообщения об отсутствии сигналов
    "no_entry_point": {
        "ru": "⚠️ <b>Нет подходящей точки входа для {pair}</b>",
        "en": "⚠️ <b>No suitable entry point for {pair}</b>",
        "th": "⚠️ <b>ไม่มีจุดเข้าที่เหมาะสมสำหรับ {pair}</b>",
        "es": "⚠️ <b>No hay punto de entrada adecuado para {pair}</b>",
        "ar": "⚠️ <b>لا توجد نقطة دخول مناسبة لـ {pair}</b>"
    },
    "current_confidence": {
        "ru": "📊 Текущая уверенность: {confidence}",
        "en": "📊 Current confidence: {confidence}",
        "th": "📊 ความมั่นใจปัจจุบัน: {confidence}",
        "es": "📊 Confianza actual: {confidence}",
        "ar": "📊 الثقة الحالية: {confidence}"
    },
    "required_minimum": {
        "ru": "🎯 Требуется минимум: {minimum}",
        "en": "🎯 Minimum required: {minimum}",
        "th": "🎯 ต้องการขั้นต่ำ: {minimum}",
        "es": "🎯 Mínimo requerido: {minimum}",
        "ar": "🎯 الحد الأدنى المطلوب: {minimum}"
    },
    "recommendations_title": {
        "ru": "💡 <b>Рекомендации:</b>",
        "en": "💡 <b>Recommendations:</b>",
        "th": "💡 <b>คำแนะนำ:</b>",
        "es": "💡 <b>Recomendaciones:</b>",
        "ar": "💡 <b>توصيات:</b>"
    },
    "recommendation_change_pair": {
        "ru": "• Смените пару",
        "en": "• Change the pair",
        "th": "• เปลี่ยนคู่",
        "es": "• Cambia el par",
        "ar": "• غيّر الزوج"
    },
    "recommendation_try_later": {
        "ru": "• Попробуйте позже",
        "en": "• Try later",
        "th": "• ลองใหม่ภายหลัง",
        "es": "• Inténtalo más tarde",
        "ar": "• حاول لاحقاً"
    },
    "recommendation_wait_conditions": {
        "ru": "• Дождитесь лучших рыночных условий",
        "en": "• Wait for better market conditions",
        "th": "• รอสภาวะตลาดที่ดีกว่า",
        "es": "• Espera mejores condiciones de mercado",
        "ar": "• انتظر ظروف سوق أفضل"
    },
    "signal_not_generated": {
        "ru": "⚠️ <b>Сигнал для {pair} не сгенерирован</b>",
        "en": "⚠️ <b>Signal for {pair} not generated</b>",
        "th": "⚠️ <b>ไม่สามารถสร้างสัญญาณสำหรับ {pair}</b>",
        "es": "⚠️ <b>Señal para {pair} no generada</b>",
        "ar": "⚠️ <b>لم يتم إنشاء إشارة لـ {pair}</b>"
    },
    "possible_reasons": {
        "ru": "Возможные причины:",
        "en": "Possible reasons:",
        "th": "สาเหตุที่เป็นไปได้:",
        "es": "Posibles razones:",
        "ar": "الأسباب المحتملة:"
    },
    "reason_insufficient_data": {
        "ru": "• Недостаточно рыночных данных",
        "en": "• Insufficient market data",
        "th": "• ข้อมูลตลาดไม่เพียงพอ",
        "es": "• Datos de mercado insuficientes",
        "ar": "• بيانات السوق غير كافية"
    },
    "reason_low_confidence": {
        "ru": "• Низкая уверенность в анализе",
        "en": "• Low confidence in analysis",
        "th": "• ความมั่นใจในการวิเคราะห์ต่ำ",
        "es": "• Baja confianza en el análisis",
        "ar": "• ثقة منخفضة في التحليل"
    },
    "reason_neutral_conditions": {
        "ru": "• Нейтральные рыночные условия",
        "en": "• Neutral market conditions",
        "th": "• สภาวะตลาดเป็นกลาง",
        "es": "• Condiciones de mercado neutrales",
        "ar": "• ظروف السوق محايدة"
    },
    "try_other_or_later": {
        "ru": "Попробуйте другую пару или повторите позже.",
        "en": "Try another pair or repeat later.",
        "th": "ลองคู่อื่นหรือลองอีกครั้งในภายหลัง",
        "es": "Prueba otro par o repite más tarde.",
        "ar": "جرب زوجاً آخر أو أعد المحاولة لاحقاً."
    },
    "btn_other_pair": {
        "ru": "🔄 Другая пара",
        "en": "🔄 Another pair",
        "th": "🔄 คู่อื่น",
        "es": "🔄 Otro par",
        "ar": "🔄 زوج آخر"
    },
    "error_generation": {
        "ru": "❌ Ошибка генерации сигнала. Попробуйте позже.",
        "en": "❌ Signal generation error. Try later.",
        "th": "❌ เกิดข้อผิดพลาดในการสร้างสัญญาณ ลองใหม่ภายหลัง",
        "es": "❌ Error en la generación de señal. Inténtalo más tarde.",
        "ar": "❌ خطأ في إنشاء الإشارة. حاول لاحقاً."
    },
    "error_generation_pair": {
        "ru": "❌ Ошибка генерации сигнала для {pair}. Попробуйте позже.",
        "en": "❌ Signal generation error for {pair}. Try later.",
        "th": "❌ เกิดข้อผิดพลาดในการสร้างสัญญาณสำหรับ {pair} ลองใหม่ภายหลัง",
        "es": "❌ Error en la generación de señal para {pair}. Inténtalo más tarde.",
        "ar": "❌ خطأ في إنشاء الإشارة لـ {pair}. حاول لاحقاً."
    }
}

def get_welcome_text(lang: str = "ru") -> str:
    """Получение приветственного текста"""
    return ACCESS_TEXTS.get("welcome", {}).get(lang, ACCESS_TEXTS["welcome"]["ru"])

def get_button_text(key: str, lang: str = "ru") -> str:
    """Получение текста кнопки"""
    return ACCESS_TEXTS.get(key, {}).get(lang, ACCESS_TEXTS.get(key, {}).get("ru", key))

def get_text(key: str, lang: str = "ru") -> str:
    """Получение перевода"""
    if lang not in LANGUAGES:
        lang = "ru"
    if key in ACCESS_TEXTS:
        return ACCESS_TEXTS[key].get(lang, ACCESS_TEXTS[key]["ru"])
    return key

def get_language_keyboard():
    """Клавиатура выбора языка"""
    from telegram import InlineKeyboardButton
    keyboard = []
    for lang_code, lang_info in LANGUAGES.items():
        button_text = f"{lang_info['flag']} {lang_info['name']}"
        keyboard.append([InlineKeyboardButton(button_text, callback_data=f"lang_{lang_code}")])
    return keyboard

# Переводы для команд бота
COMMAND_DESCRIPTIONS = {
    "start": {
        "ru": "🚀 Запустить бота",
        "en": "🚀 Start bot", 
        "th": "🚀 เริ่มบอท",
        "es": "🚀 Iniciar bot",
        "ar": "🚀 بدء البوت"
    },
    "help": {
        "ru": "❓ Помощь",
        "en": "❓ Help",
        "th": "❓ ความช่วยเหลือ", 
        "es": "❓ Ayuda",
        "ar": "❓ مساعدة"
    },
    "market": {
        "ru": "📅 Расписание работы",
        "en": "📅 Market schedule",
        "th": "📅 ตารางเวลาตลาด",
        "es": "📅 Horario del mercado", 
        "ar": "📅 جدول السوق"
    },
    "function_unavailable": {
        "ru": "⚠️ Функция недоступна - рынок закрыт",
        "en": "⚠️ Function unavailable - market closed",
        "th": "⚠️ ฟังก์ชันไม่พร้อมใช้งาน - ตลาดปิด",
        "es": "⚠️ Función no disponible - mercado cerrado",
        "ar": "⚠️ الوظيفة غير متاحة - السوق مغلق"
    },
    "status": {
        "ru": "📊 Статус системы",
        "en": "📊 System status",
        "th": "📊 สถานะระบบ",
        "es": "📊 Estado del sistema",
        "ar": "📊 حالة النظام"
    },
    "adduser": {
        "ru": "👥 Добавить пользователя",
        "en": "👥 Add user",
        "th": "👥 เพิ่มผู้ใช้",
        "es": "👥 Agregar usuario",
        "ar": "👥 إضافة مستخدم"
    }
}

def get_command_description(command: str, lang: str = "ru") -> str:
    """Получает описание команды на указанном языке"""
    return COMMAND_DESCRIPTIONS.get(command, {}).get(lang, COMMAND_DESCRIPTIONS.get(command, {}).get("ru", command))

# Переводы для интерфейсов сигналов
INTERFACE_TEXTS = {
    "otc_pair_selection": {
        "ru": {
            "title": "⚡ <b>Выберите ОТС пару:</b>",
            "subtitle1": "💡 ОТС пары работают 24/7",
            "subtitle2": "📊 Выберите пару для генерации сигнала",
            "back": "⬅️ Назад"
        },
        "en": {
            "title": "⚡ <b>Choose OTC pair:</b>",
            "subtitle1": "💡 OTC pairs work 24/7",
            "subtitle2": "📊 Choose a pair for signal generation",
            "back": "⬅️ Back"
        },
        "th": {
            "title": "⚡ <b>เลือกคู่ OTC:</b>",
            "subtitle1": "💡 คู่ OTC ทำงาน 24/7",
            "subtitle2": "📊 เลือกคู่สำหรับการสร้างสัญญาณ",
            "back": "⬅️ กลับ"
        },
        "es": {
            "title": "⚡ <b>Elige par OTC:</b>",
            "subtitle1": "💡 Los pares OTC funcionan 24/7",
            "subtitle2": "📊 Elige un par para generar señal",
            "back": "⬅️ Atrás"
        },
        "ar": {
            "title": "⚡ <b>اختر زوج OTC:</b>",
            "subtitle1": "💡 أزواج OTC تعمل 24/7",
            "subtitle2": "📊 اختر زوج لإنتاج الإشارة",
            "back": "⬅️ رجوع"
        }
    },
    "loading_signal": {
        "ru": {
            "waiting": "⏳ <b>Ожидайте...</b>",
            "searching": "🔍 Ищем наилучшую точку входа для ОТС пары",
            "analyzing": "📊 Анализируем рыночные данные",
            "calculating": "🎯 Рассчитываем оптимальный сигнал",
            "time_info": "💡 Это займет несколько секунд...",
            "error": "❌ Не удалось сгенерировать ОТС сигнал. Попробуйте позже."
        },
        "en": {
            "waiting": "⏳ <b>Please wait...</b>",
            "searching": "🔍 Looking for the best entry point for OTC pair",
            "analyzing": "📊 Analyzing market data",
            "calculating": "🎯 Calculating optimal signal",
            "time_info": "💡 This will take a few seconds...",
            "error": "❌ Failed to generate OTC signal. Try again later."
        },
        "th": {
            "waiting": "⏳ <b>กรุณารอ...</b>",
            "searching": "🔍 ค้นหาจุดเข้าเทรดที่ดีที่สุดสำหรับคู่ OTC",
            "analyzing": "📊 วิเคราะห์ข้อมูลตลาด",
            "calculating": "🎯 คำนวณสัญญาณที่เหมาะสม",
            "time_info": "💡 จะใช้เวลาสักครู่...",
            "error": "❌ ไม่สามารถสร้างสัญญาณ OTC ได้ ลองใหม่อีกครั้ง"
        },
        "es": {
            "waiting": "⏳ <b>Por favor espera...</b>",
            "searching": "🔍 Buscando el mejor punto de entrada para par OTC",
            "analyzing": "📊 Analizando datos del mercado",
            "calculating": "🎯 Calculando señal óptima",
            "time_info": "💡 Esto tomará unos segundos...",
            "error": "❌ No se pudo generar la señal OTC. Inténtalo de nuevo más tarde."
        },
        "ar": {
            "waiting": "⏳ <b>يرجى الانتظار...</b>",
            "searching": "🔍 نبحث عن أفضل نقطة دخول لزوج OTC",
            "analyzing": "📊 نحلل بيانات السوق",
            "calculating": "🎯 نحسب الإشارة المثلى",
            "time_info": "💡 سيستغرق هذا بضع ثوانٍ...",
            "error": "❌ فشل في إنشاء إشارة OTC. حاول مرة أخرى لاحقاً."
        }
    },
    "signal_result": {
        "ru": {
            "powerful_otc": "🟢 <b>МОЩНЫЙ ОТС СИГНАЛ</b>",
            "pair": "💱 <b>Пара:</b>",
            "direction": "📊 <b>Направление:</b>",
            "confidence": "🎯 <b>Уверенность:</b>",
            "trend": "📈 <b>Тренд:</b>",
            "time": "🕒 <b>Время:</b>",
            "expiration": "⏰ <b>Экспирация:</b>",
            "technical_analysis": "🔬 <b>Технический анализ (22+ индикаторов):</b>",
            "otc_mode": "⚡ <b>ОТС режим:</b> 24/7 с полным анализом трендов",
            "update_timer": "🔄 Обновить таймер"
        },
        "en": {
            "powerful_otc": "🟢 <b>POWERFUL OTC SIGNAL</b>",
            "pair": "💱 <b>Pair:</b>",
            "direction": "📊 <b>Direction:</b>",
            "confidence": "🎯 <b>Confidence:</b>",
            "trend": "📈 <b>Trend:</b>",
            "time": "🕒 <b>Time:</b>",
            "expiration": "⏰ <b>Expiration:</b>",
            "technical_analysis": "🔬 <b>Technical analysis (22+ indicators):</b>",
            "otc_mode": "⚡ <b>OTC mode:</b> 24/7 with full trend analysis",
            "update_timer": "🔄 Update timer"
        },
        "th": {
            "powerful_otc": "🟢 <b>สัญญาณ OTC ที่ทรงพลัง</b>",
            "pair": "💱 <b>คู่:</b>",
            "direction": "📊 <b>ทิศทาง:</b>",
            "confidence": "🎯 <b>ความมั่นใจ:</b>",
            "trend": "📈 <b>เทรนด์:</b>",
            "time": "🕒 <b>เวลา:</b>",
            "expiration": "⏰ <b>หมดอายุ:</b>",
            "technical_analysis": "🔬 <b>การวิเคราะห์ทางเทคนิค (22+ ตัวบ่งชี้):</b>",
            "otc_mode": "⚡ <b>โหมด OTC:</b> 24/7 พร้อมการวิเคราะห์เทรนด์แบบเต็ม",
            "update_timer": "🔄 อัปเดตไทเมอร์"
        },
        "es": {
            "powerful_otc": "🟢 <b>SEÑAL OTC PODEROSA</b>",
            "pair": "💱 <b>Par:</b>",
            "direction": "📊 <b>Dirección:</b>",
            "confidence": "🎯 <b>Confianza:</b>",
            "trend": "📈 <b>Tendencia:</b>",
            "time": "🕒 <b>Tiempo:</b>",
            "expiration": "⏰ <b>Expiración:</b>",
            "technical_analysis": "🔬 <b>Análisis técnico (22+ indicadores):</b>",
            "otc_mode": "⚡ <b>Modo OTC:</b> 24/7 con análisis completo de tendencias",
            "update_timer": "🔄 Actualizar temporizador"
        },
        "ar": {
            "powerful_otc": "🟢 <b>إشارة OTC قوية</b>",
            "pair": "💱 <b>الزوج:</b>",
            "direction": "📊 <b>الاتجاه:</b>",
            "confidence": "🎯 <b>الثقة:</b>",
            "trend": "📈 <b>الاتجاه:</b>",
            "time": "🕒 <b>الوقت:</b>",
            "expiration": "⏰ <b>انتهاء الصلاحية:</b>",
            "technical_analysis": "🔬 <b>التحليل الفني (22+ مؤشر):</b>",
            "otc_mode": "⚡ <b>وضع OTC:</b> 24/7 مع تحليل كامل للاتجاهات",
            "update_timer": "🔄 تحديث المؤقت"
        }
    },
    "deal_activated": {
        "ru": {
            "title": "🔒 <b>СДЕЛКА АКТИВИРОВАНА</b>",
            "pair": "📊 <b>Пара:</b>",
            "direction": "📈 <b>Направление:</b>",
            "score": "🎯 <b>Скор:</b>",
            "expiration": "⏰ <b>Экспирация:</b>",
            "navigation_blocked": "🚫 <b>Навигация заблокирована до",
            "remaining": "⏳ <b>Осталось:",
            "result_buttons": "🔘 <b>Кнопки результата станут активными в",
            "after_time": "💡 После этого времени укажите результат торговли",
            "win_unavailable": "⚪ Выигрыш (недоступно)",
            "loss_unavailable": "⚪ Проигрыш (недоступно)",
            "update_timer": "🔄 Обновить таймер"
        },
        "en": {
            "title": "🔒 <b>DEAL ACTIVATED</b>",
            "pair": "📊 <b>Pair:</b>",
            "direction": "📈 <b>Direction:</b>",
            "score": "🎯 <b>Score:</b>",
            "expiration": "⏰ <b>Expiration:</b>",
            "navigation_blocked": "🚫 <b>Navigation blocked until",
            "remaining": "⏳ <b>Remaining:",
            "result_buttons": "🔘 <b>Result buttons will become active at",
            "after_time": "💡 After this time indicate the trading result",
            "win_unavailable": "⚪ Win (unavailable)",
            "loss_unavailable": "⚪ Loss (unavailable)",
            "update_timer": "🔄 Update timer"
        },
        "th": {
            "title": "🔒 <b>เปิดการเทรดแล้ว</b>",
            "pair": "📊 <b>คู่:</b>",
            "direction": "📈 <b>ทิศทาง:</b>",
            "score": "🎯 <b>คะแนน:</b>",
            "expiration": "⏰ <b>หมดอายุ:</b>",
            "navigation_blocked": "🚫 <b>การนำทางถูกบล็อกจนถึง",
            "remaining": "⏳ <b>เหลือ:",
            "result_buttons": "🔘 <b>ปุ่มผลลัพธ์จะใช้งานได้ที่",
            "after_time": "💡 หลังจากเวลานี้ระบุผลการเทรด",
            "win_unavailable": "⚪ ชนะ (ไม่พร้อมใช้งาน)",
            "loss_unavailable": "⚪ แพ้ (ไม่พร้อมใช้งาน)",
            "update_timer": "🔄 อัปเดตไทเมอร์"
        },
        "es": {
            "title": "🔒 <b>OPERACIÓN ACTIVADA</b>",
            "pair": "📊 <b>Par:</b>",
            "direction": "📈 <b>Dirección:</b>",
            "score": "🎯 <b>Puntuación:</b>",
            "expiration": "⏰ <b>Expiración:</b>",
            "navigation_blocked": "🚫 <b>Navegación bloqueada hasta",
            "remaining": "⏳ <b>Restante:",
            "result_buttons": "🔘 <b>Los botones de resultado estarán activos en",
            "after_time": "💡 Después de este tiempo indica el resultado de la operación",
            "win_unavailable": "⚪ Ganar (no disponible)",
            "loss_unavailable": "⚪ Perder (no disponible)",
            "update_timer": "🔄 Actualizar temporizador"
        },
        "ar": {
            "title": "🔒 <b>تم تفعيل الصفقة</b>",
            "pair": "📊 <b>الزوج:</b>",
            "direction": "📈 <b>الاتجاه:</b>",
            "score": "🎯 <b>النقاط:</b>",
            "expiration": "⏰ <b>انتهاء الصلاحية:</b>",
            "navigation_blocked": "🚫 <b>التنقل محظور حتى",
            "remaining": "⏳ <b>المتبقي:",
            "result_buttons": "🔘 <b>أزرار النتيجة ستصبح نشطة في",
            "after_time": "💡 بعد هذا الوقت حدد نتيجة التداول",
            "win_unavailable": "⚪ فوز (غير متاح)",
            "loss_unavailable": "⚪ خسارة (غير متاح)",
            "update_timer": "🔄 تحديث المؤقت"
        }
    },
    "forex_signal": {
        "ru": {
            "trading_signal": "📊 <b>Торговый сигнал для",
            "direction": "<b>Направление:</b>",
            "score": "🎯 <b>Скор:</b>",
            "expiration": "⏰ <b>Экспирация:</b>",
            "time": "🕒 <b>Время:</b>",
            "technical_indicators": "📊 <b>Технические индикаторы:</b>",
            "rsi": "RSI (14):",
            "ema": "EMA (21):",
            "macd": "MACD:",
            "bollinger_bands": "Bollinger Bands:",
            "confidence_bar": "█",
            "empty_bar": "░",
            "memory_boost": "🧠",
            "compact_format": "<b>",
            "compact_score": "Скор:",
            "compact_expiration": "Экспирация:"
        },
        "en": {
            "trading_signal": "📊 <b>Trading signal for",
            "direction": "<b>Direction:</b>",
            "score": "🎯 <b>Score:</b>",
            "expiration": "⏰ <b>Expiration:</b>",
            "time": "🕒 <b>Time:</b>",
            "technical_indicators": "📊 <b>Technical indicators:</b>",
            "rsi": "RSI (14):",
            "ema": "EMA (21):",
            "macd": "MACD:",
            "bollinger_bands": "Bollinger Bands:",
            "confidence_bar": "█",
            "empty_bar": "░",
            "memory_boost": "🧠",
            "compact_format": "<b>",
            "compact_score": "Score:",
            "compact_expiration": "Expiration:"
        },
        "th": {
            "trading_signal": "📊 <b>สัญญาณเทรดสำหรับ",
            "direction": "<b>ทิศทาง:</b>",
            "score": "🎯 <b>คะแนน:</b>",
            "expiration": "⏰ <b>หมดอายุ:</b>",
            "time": "🕒 <b>เวลา:</b>",
            "technical_indicators": "📊 <b>ตัวบ่งชี้ทางเทคนิค:</b>",
            "rsi": "RSI (14):",
            "ema": "EMA (21):",
            "macd": "MACD:",
            "bollinger_bands": "Bollinger Bands:",
            "confidence_bar": "█",
            "empty_bar": "░",
            "memory_boost": "🧠",
            "compact_format": "<b>",
            "compact_score": "คะแนน:",
            "compact_expiration": "หมดอายุ:"
        },
        "es": {
            "trading_signal": "📊 <b>Señal de trading para",
            "direction": "<b>Dirección:</b>",
            "score": "🎯 <b>Puntuación:</b>",
            "expiration": "⏰ <b>Expiración:</b>",
            "time": "🕒 <b>Tiempo:</b>",
            "technical_indicators": "📊 <b>Indicadores técnicos:</b>",
            "rsi": "RSI (14):",
            "ema": "EMA (21):",
            "macd": "MACD:",
            "bollinger_bands": "Bollinger Bands:",
            "confidence_bar": "█",
            "empty_bar": "░",
            "memory_boost": "🧠",
            "compact_format": "<b>",
            "compact_score": "Puntuación:",
            "compact_expiration": "Expiración:"
        },
        "ar": {
            "trading_signal": "📊 <b>إشارة تداول لـ",
            "direction": "<b>الاتجاه:</b>",
            "score": "🎯 <b>النقاط:</b>",
            "expiration": "⏰ <b>انتهاء الصلاحية:</b>",
            "time": "🕒 <b>الوقت:</b>",
            "technical_indicators": "📊 <b>المؤشرات الفنية:</b>",
            "rsi": "RSI (14):",
            "ema": "EMA (21):",
            "macd": "MACD:",
            "bollinger_bands": "Bollinger Bands:",
            "confidence_bar": "█",
            "empty_bar": "░",
            "memory_boost": "🧠",
            "compact_format": "<b>",
            "compact_score": "النقاط:",
            "compact_expiration": "انتهاء الصلاحية:"
        }
    },
    "time_expired": {
        "ru": {
            "title": "✅ <b>ВРЕМЯ ИСТЕКЛО - УКАЖИТЕ РЕЗУЛЬТАТ</b>",
            "pair": "📊 <b>Пара:</b>",
            "direction": "📈 <b>Направление:</b>",
            "score": "🎯 <b>Скор:</b>",
            "expiration": "⏰ <b>Экспирация:</b>",
            "time_expired": "🎯 <b>Время истекло! Укажите результат торговли:</b>",
            "win": "✅ Выигрыш",
            "loss": "❌ Проигрыш"
        },
        "en": {
            "title": "✅ <b>TIME EXPIRED - INDICATE RESULT</b>",
            "pair": "📊 <b>Pair:</b>",
            "direction": "📈 <b>Direction:</b>",
            "score": "🎯 <b>Score:</b>",
            "expiration": "⏰ <b>Expiration:</b>",
            "time_expired": "🎯 <b>Time expired! Indicate trading result:</b>",
            "win": "✅ Win",
            "loss": "❌ Loss"
        },
        "th": {
            "title": "✅ <b>หมดเวลาแล้ว - ระบุผลลัพธ์</b>",
            "pair": "📊 <b>คู่:</b>",
            "direction": "📈 <b>ทิศทาง:</b>",
            "score": "🎯 <b>คะแนน:</b>",
            "expiration": "⏰ <b>หมดอายุ:</b>",
            "time_expired": "🎯 <b>หมดเวลาแล้ว! ระบุผลการเทรด:</b>",
            "win": "✅ ชนะ",
            "loss": "❌ แพ้"
        },
        "es": {
            "title": "✅ <b>TEMPO EXPIRADO - INDICAR RESULTADO</b>",
            "pair": "📊 <b>Par:</b>",
            "direction": "📈 <b>Dirección:</b>",
            "score": "🎯 <b>Puntuación:</b>",
            "expiration": "⏰ <b>Expiración:</b>",
            "time_expired": "🎯 <b>¡Tiempo expirado! Indica el resultado de la operación:</b>",
            "win": "✅ Ganar",
            "loss": "❌ Perder"
        },
        "ar": {
            "title": "✅ <b>انتهى الوقت - حدد النتيجة</b>",
            "pair": "📊 <b>الزوج:</b>",
            "direction": "📈 <b>الاتجاه:</b>",
            "score": "🎯 <b>النقاط:</b>",
            "expiration": "⏰ <b>انتهاء الصلاحية:</b>",
            "time_expired": "🎯 <b>انتهى الوقت! حدد نتيجة التداول:</b>",
            "win": "✅ فوز",
            "loss": "❌ خسارة"
        }
    },
    # Переводы направлений торговли
    "directions": {
        "ru": {
            "BUY": "ПОКУПКА",
            "SELL": "ПРОДАЖА",
            "NEUTRAL": "НЕЙТРАЛЬНО"
        },
        "en": {
            "BUY": "BUY",
            "SELL": "SELL", 
            "NEUTRAL": "NEUTRAL"
        },
        "th": {
            "BUY": "ซื้อ",
            "SELL": "ขาย",
            "NEUTRAL": "กลาง"
        },
        "es": {
            "BUY": "COMPRA",
            "SELL": "VENTA",
            "NEUTRAL": "NEUTRAL"
        },
        "ar": {
            "BUY": "شراء",
            "SELL": "بيع",
            "NEUTRAL": "محايد"
        }
    },
    # Переводы трендов
    "trends": {
        "ru": {
            "UPTREND": "ВОСХОДЯЩИЙ",
            "DOWNTREND": "НИСХОДЯЩИЙ",
            "SIDEWAYS": "БОКОВОЙ",
            "NEUTRAL": "НЕЙТРАЛЬНЫЙ"
        },
        "en": {
            "UPTREND": "UPTREND",
            "DOWNTREND": "DOWNTREND",
            "SIDEWAYS": "SIDEWAYS",
            "NEUTRAL": "NEUTRAL"
        },
        "th": {
            "UPTREND": "ขาขึ้น",
            "DOWNTREND": "ขาลง",
            "SIDEWAYS": "ข้าง",
            "NEUTRAL": "กลาง"
        },
        "es": {
            "UPTREND": "ALCISTA",
            "DOWNTREND": "BAJISTA",
            "SIDEWAYS": "LATERAL",
            "NEUTRAL": "NEUTRAL"
        },
        "ar": {
            "UPTREND": "صاعد",
            "DOWNTREND": "هابط",
            "SIDEWAYS": "جانبي",
            "NEUTRAL": "محايد"
        }
    },
    # Переводы единиц времени
    "time_units": {
        "ru": {
            "min": "мин",
            "mins": "мин",
            "hour": "ч",
            "hours": "ч"
        },
        "en": {
            "min": "min",
            "mins": "mins",
            "hour": "h",
            "hours": "h"
        },
        "th": {
            "min": "นาที",
            "mins": "นาที",
            "hour": "ชม",
            "hours": "ชม"
        },
        "es": {
            "min": "min",
            "mins": "mins",
            "hour": "h",
            "hours": "h"
        },
        "ar": {
            "min": "دقيقة",
            "mins": "دقائق",
            "hour": "ساعة",
            "hours": "ساعات"
        }
    },
    # Переводы результата обратной связи
    "feedback_result": {
        "ru": {
            "your_feedback": "Ваш отзыв:",
            "success": "успешная сделка",
            "failure": "неудачная сделка",
            "thank_you": "Спасибо за обратную связь!",
            "marked_as": "Сигнал отмечен как",
            "will_improve": "Ваш отзыв поможет улучшить качество сигналов.",
            "keep_trading": "Продолжайте торговать!"
        },
        "en": {
            "your_feedback": "Your feedback:",
            "success": "successful trade",
            "failure": "unsuccessful trade",
            "thank_you": "Thank you for your feedback!",
            "marked_as": "Signal marked as",
            "will_improve": "Your feedback will help improve signal quality.",
            "keep_trading": "Keep trading!"
        },
        "th": {
            "your_feedback": "ความคิดเห็นของคุณ:",
            "success": "การเทรดสำเร็จ",
            "failure": "การเทรดไม่สำเร็จ",
            "thank_you": "ขอบคุณสำหรับความคิดเห็น!",
            "marked_as": "สัญญาณถูกทำเครื่องหมายว่า",
            "will_improve": "ความคิดเห็นของคุณจะช่วยปรับปรุงคุณภาพสัญญาณ",
            "keep_trading": "เทรดต่อไป!"
        },
        "es": {
            "your_feedback": "Tu opinión:",
            "success": "operación exitosa",
            "failure": "operación fallida",
            "thank_you": "¡Gracias por tu opinión!",
            "marked_as": "Señal marcada como",
            "will_improve": "Tu opinión ayudará a mejorar la calidad de las señales.",
            "keep_trading": "¡Sigue operando!"
        },
        "ar": {
            "your_feedback": "رأيك:",
            "success": "صفقة ناجحة",
            "failure": "صفقة فاشلة",
            "thank_you": "شكراً لك على رأيك!",
            "marked_as": "تم وضع علامة على الإشارة",
            "will_improve": "رأيك سيساعد في تحسين جودة الإشارات.",
            "keep_trading": "استمر في التداول!"
        }
    },
    # Переводы сообщений кулдауна
    "cooldown": {
        "ru": {
            "wait_message": "Подождите 30 секунд и выберите другую пару",
            "remaining_time": "Осталось:",
            "recommendation": "Рекомендация:",
            "try_other_pair": "Попробуйте другую ОТС пару",
            "wait_market_change": "Дождитесь изменения рыночных условий",
            "choose_best_pair": "Выберите пару с лучшими условиями для торговли!"
        },
        "en": {
            "wait_message": "Wait 30 seconds and choose another pair",
            "remaining_time": "Remaining:",
            "recommendation": "Recommendation:",
            "try_other_pair": "Try another OTC pair",
            "wait_market_change": "Wait for market conditions to change",
            "choose_best_pair": "Choose a pair with the best trading conditions!"
        },
        "th": {
            "wait_message": "รอ 30 วินาที และเลือกคู่อื่น",
            "remaining_time": "เหลือ:",
            "recommendation": "คำแนะนำ:",
            "try_other_pair": "ลองคู่ OTC อื่น",
            "wait_market_change": "รอให้สภาวะตลาดเปลี่ยนแปลง",
            "choose_best_pair": "เลือกคู่ที่มีเงื่อนไขการเทรดที่ดีที่สุด!"
        },
        "es": {
            "wait_message": "Espera 30 segundos y elige otro par",
            "remaining_time": "Quedan:",
            "recommendation": "Recomendación:",
            "try_other_pair": "Prueba otro par OTC",
            "wait_market_change": "Espera a que cambien las condiciones del mercado",
            "choose_best_pair": "¡Elige un par con las mejores condiciones para operar!"
        },
        "ar": {
            "wait_message": "انتظر 30 ثانية واختر زوج آخر",
            "remaining_time": "متبقي:",
            "recommendation": "التوصية:",
            "try_other_pair": "جرب زوج OTC آخر",
            "wait_market_change": "انتظر تغيير ظروف السوق",
            "choose_best_pair": "اختر الزوج بأفضل ظروف للتداول!"
        }
    },
    # Переводы блокировки навигации
    "navigation_blocked": {
        "ru": {
            "title": "ОБЯЗАТЕЛЬНАЯ ОБРАТНАЯ СВЯЗЬ",
            "navigation_blocked": "Навигация заблокирована до получения результата",
            "pending_feedback": "Ожидается обратная связь по",
            "signals": "сигналам",
            "specify_result": "Укажите результат ВСЕХ сделок для разблокировки",
            "why_mandatory": "Почему это обязательно?",
            "improve_quality": "Улучшение качества сигналов",
            "analyze_effectiveness": "Анализ эффективности стратегий",
            "personalize_recommendations": "Персонализация рекомендаций",
            "without_feedback": "Без обратной связи навигация невозможна!",
            "show_pending": "Показать ожидающие сигналы"
        },
        "en": {
            "title": "MANDATORY FEEDBACK",
            "navigation_blocked": "Navigation is blocked until a result is received",
            "pending_feedback": "Feedback is expected for",
            "signals": "signals",
            "specify_result": "Specify the result of ALL trades to unlock",
            "why_mandatory": "Why is this mandatory?",
            "improve_quality": "Improving signal quality",
            "analyze_effectiveness": "Analysis of strategy effectiveness",
            "personalize_recommendations": "Personalization of recommendations",
            "without_feedback": "Navigation is impossible without feedback!",
            "show_pending": "Show pending signals"
        },
        "th": {
            "title": "ความคิดเห็นบังคับ",
            "navigation_blocked": "การนำทางถูกบล็อกจนกว่าจะได้รับผลลัพธ์",
            "pending_feedback": "รอความคิดเห็นสำหรับ",
            "signals": "สัญญาณ",
            "specify_result": "ระบุผลลัพธ์ของการเทรดทั้งหมดเพื่อปลดล็อก",
            "why_mandatory": "ทำไมถึงจำเป็น?",
            "improve_quality": "ปรับปรุงคุณภาพสัญญาณ",
            "analyze_effectiveness": "วิเคราะห์ประสิทธิภาพของกลยุทธ์",
            "personalize_recommendations": "ปรับแต่งคำแนะนำส่วนบุคคล",
            "without_feedback": "ไม่สามารถนำทางได้โดยไม่มีความคิดเห็น!",
            "show_pending": "แสดงสัญญาณที่รอผล"
        },
        "es": {
            "title": "RETROALIMENTACIÓN OBLIGATORIA",
            "navigation_blocked": "La navegación está bloqueada hasta recibir un resultado",
            "pending_feedback": "Se espera retroalimentación para",
            "signals": "señales",
            "specify_result": "Especifica el resultado de TODAS las operaciones para desbloquear",
            "why_mandatory": "¿Por qué es obligatorio?",
            "improve_quality": "Mejorar la calidad de las señales",
            "analyze_effectiveness": "Análisis de la efectividad de las estrategias",
            "personalize_recommendations": "Personalización de las recomendaciones",
            "without_feedback": "¡La navegación es imposible sin retroalimentación!",
            "show_pending": "Mostrar señales pendientes"
        },
        "ar": {
            "title": "التعليقات الإلزامية",
            "navigation_blocked": "التنقل محظور حتى الحصول على النتيجة",
            "pending_feedback": "يُتوقع تعليق على",
            "signals": "إشارة",
            "specify_result": "حدد نتيجة جميع الصفقات لإلغاء القفل",
            "why_mandatory": "لماذا هذا إلزامي؟",
            "improve_quality": "تحسين جودة الإشارات",
            "analyze_effectiveness": "تحليل فعالية الاستراتيجيات",
            "personalize_recommendations": "تخصيص التوصيات",
            "without_feedback": "التنقل مستحيل بدون التعليقات!",
            "show_pending": "إظهار الإشارات المعلقة"
        }
    },
    # Переводы сообщений "нет ожидающих сделок"
    "no_pending": {
        "ru": {
            "no_pending_trades": "Нет ожидающих сделок",
            "all_processed": "Все ваши сигналы обработаны.",
            "continue_navigation": "Можете продолжить навигацию по боту."
        },
        "en": {
            "no_pending_trades": "No pending trades",
            "all_processed": "All your signals have been processed.",
            "continue_navigation": "You can continue navigating the bot."
        },
        "th": {
            "no_pending_trades": "ไม่มีสัญญาณรอผล",
            "all_processed": "สัญญาณทั้งหมดของคุณได้รับการประมวลผลแล้ว",
            "continue_navigation": "คุณสามารถนำทางในบอทต่อไปได้"
        },
        "es": {
            "no_pending_trades": "No hay operaciones pendientes",
            "all_processed": "Todas tus señales han sido procesadas.",
            "continue_navigation": "Puedes continuar navegando por el bot."
        },
        "ar": {
            "no_pending_trades": "لا توجد صفقات معلقة",
            "all_processed": "تم معالجة جميع إشاراتك.",
            "continue_navigation": "يمكنك متابعة التنقل في البوت."
        }
    },
    # Сообщения блокировки ТОП-3 сигналов
    "top3_blocked": {
        "ru": {
            "forex_wait": "Подождите перед ТОП-3 сигналами",
            "otc_wait": "Подождите перед ТОП-3 ОТС сигналами",
            "time_left": "Осталось: {minutes}м {seconds}с",
            "blocking_reason": "Блокировка после {block_type} сигналов:",
            "just_generated": "Только что сгенерирован сигнал",
            "api_limits": "Экономия API лимитов",
            "quality_analysis": "Качественный анализ требует времени",
            "wait_timer": "Дождитесь окончания таймера!"
        },
        "en": {
            "forex_wait": "Wait before TOP-3 signals",
            "otc_wait": "Wait before TOP-3 OTC signals", 
            "time_left": "Time left: {minutes}m {seconds}s",
            "blocking_reason": "Blocking after {block_type} signals:",
            "just_generated": "Signal just generated",
            "api_limits": "Saving API limits",
            "quality_analysis": "Quality analysis takes time",
            "wait_timer": "Wait for the timer to end!"
        },
        "th": {
            "forex_wait": "รอก่อนสัญญาณ TOP-3",
            "otc_wait": "รอก่อนสัญญาณ TOP-3 OTC",
            "time_left": "เหลือ: {minutes}นาที {seconds}วินาที",
            "blocking_reason": "บล็อกหลังสัญญาณ {block_type}:",
            "just_generated": "เพิ่งสร้างสัญญาณ",
            "api_limits": "ประหยัดขีดจำกัด API",
            "quality_analysis": "การวิเคราะห์คุณภาพใช้เวลา",
            "wait_timer": "รอให้จบเวลา!"
        },
        "es": {
            "forex_wait": "Espere antes de las señales TOP-3",
            "otc_wait": "Espere antes de las señales TOP-3 OTC",
            "time_left": "Tiempo restante: {minutes}m {seconds}s",
            "blocking_reason": "Bloqueo después de señales {block_type}:",
            "just_generated": "Señal recién generada",
            "api_limits": "Ahorro de límites API",
            "quality_analysis": "El análisis de calidad requiere tiempo",
            "wait_timer": "¡Espere a que termine el temporizador!"
        },
        "ar": {
            "forex_wait": "انتظر قبل إشارات TOP-3",
            "otc_wait": "انتظر قبل إشارات TOP-3 OTC",
            "time_left": "الوقت المتبقي: {minutes}د {seconds}ث",
            "blocking_reason": "الحظر بعد إشارات {block_type}:",
            "just_generated": "تم إنشاء الإشارة للتو",
            "api_limits": "توفير حدود API",
            "quality_analysis": "التحليل الجيد يتطلب وقت",
            "wait_timer": "انتظر انتهاء المؤقت!"
        }
    },
    # Типы блокировки
    "block_types": {
        "ru": {
            "bulk": "массовых",
            "single": "одиночных"
        },
        "en": {
            "bulk": "bulk",
            "single": "single"
        },
        "th": {
            "bulk": "จำนวนมาก",
            "single": "เดี่ยว"
        },
        "es": {
            "bulk": "masivos",
            "single": "individuales"
        },
        "ar": {
            "bulk": "الجماعية",
            "single": "الفردية"
        }
    },
    # Сообщения генерации сигналов
    "signal_generation": {
        "ru": {
            "analyzing_otc": "Анализ 5 основных ОТС пар...",
            "generating_signals": "Генерируем ОТС сигналы и ищем лучшие по скору...",
            "top3_otc_signals": "ТОП-3 ОТС сигнала по скору",
            "analyzed_pairs": "Проанализировано: {count} основных ОТС пар",
            "generation_time": "Время генерации: {time}",
            "sorted_by_score": "ОТС сигналы отсортированы по скору (лучшие сверху)",
            "select_pairs": "Выберите пары в которые вошли:",
            "score": "Скор: {score}%",
            "expiration": "Экспирация: {time} мин"
        },
        "en": {
            "analyzing_otc": "Analyzing 5 main OTC pairs...",
            "generating_signals": "Generating OTC signals and finding the best by score...",
            "top3_otc_signals": "TOP-3 OTC signals by score",
            "analyzed_pairs": "Analyzed: {count} main OTC pairs",
            "generation_time": "Generation time: {time}",
            "sorted_by_score": "OTC signals sorted by score (best on top)",
            "select_pairs": "Select pairs you entered:",
            "score": "Score: {score}%",
            "expiration": "Expiration: {time} min"
        },
        "th": {
            "analyzing_otc": "วิเคราะห์คู่ OTC หลัก 5 คู่...",
            "generating_signals": "สร้างสัญญาณ OTC และหาสัญญาณที่ดีที่สุดตามคะแนน...",
            "top3_otc_signals": "สัญญาณ TOP-3 OTC ตามคะแนน",
            "analyzed_pairs": "วิเคราะห์แล้ว: {count} คู่ OTC หลัก",
            "generation_time": "เวลาสร้าง: {time}",
            "sorted_by_score": "สัญญาณ OTC เรียงตามคะแนน (ดีที่สุดอยู่ด้านบน)",
            "select_pairs": "เลือกคู่ที่คุณเข้าสู่:",
            "score": "คะแนน: {score}%",
            "expiration": "หมดอายุ: {time} นาที"
        },
        "es": {
            "analyzing_otc": "Analizando 5 pares OTC principales...",
            "generating_signals": "Generando señales OTC y buscando las mejores por puntuación...",
            "top3_otc_signals": "Señales TOP-3 OTC por puntuación",
            "analyzed_pairs": "Analizados: {count} pares OTC principales",
            "generation_time": "Tiempo de generación: {time}",
            "sorted_by_score": "Señales OTC ordenadas por puntuación (mejores arriba)",
            "select_pairs": "Selecciona pares en los que entraste:",
            "score": "Puntuación: {score}%",
            "expiration": "Expiración: {time} min"
        },
        "ar": {
            "analyzing_otc": "تحليل 5 أزواج OTC رئيسية...",
            "generating_signals": "إنشاء إشارات OTC والعثور على الأفضل حسب النقاط...",
            "top3_otc_signals": "إشارات TOP-3 OTC حسب النقاط",
            "analyzed_pairs": "تم تحليل: {count} أزواج OTC رئيسية",
            "generation_time": "وقت الإنشاء: {time}",
            "sorted_by_score": "إشارات OTC مرتبة حسب النقاط (الأفضل في الأعلى)",
            "select_pairs": "اختر الأزواج التي دخلت فيها:",
            "score": "النقاط: {score}%",
            "expiration": "انتهاء الصلاحية: {time} دقيقة"
        }
    },
    # Сообщения для форекс раздела
    "forex_messages": {
        "ru": {
            "select_pair": "Выберите валютную пару для генерации сигнала",
            "select_pair_desc": "Нажмите на пару, для которой хотите получить торговый сигнал:",
            "top3_cooldown_title": "ТОП-3 Форекс сигналы доступны раз в 10 минут",
            "top3_cooldown_time": "Осталось ждать: {minutes}м {seconds}с",
            "top3_cooldown_why": "Почему такое ограничение?",
            "top3_cooldown_reasons": [
                "Качественный анализ требует времени",
                "Предотвращение спама запросов", 
                "Более точные сигналы"
            ],
            "top3_cooldown_tip": "Используйте время для анализа текущих сигналов!",
            "market_closed_title": "Форекс сигналы недоступны",
            "market_closed_wait": "Форекс рынок закрыт до открытия торговых сессий",
            "market_closed_otc_tip": "Вы можете использовать ОТС сигналы (работают 24/7)",
            "analyzing_pairs": "Анализ 6 основных форекс пар...",
            "generating_signals": "Генерируем сигналы и ищем лучшие по скору...",
            "top3_signals_title": "ТОП-3 сигнала по скору",
            "analyzed_pairs": "Проанализировано: 6 основных пар",
            "generation_time": "Время генерации: {time}",
            "sorted_by_score": "Сигналы отсортированы по скору (лучшие сверху)",
            "no_signals_title": "Нет сигналов с высоким скором",
            "no_signals_reasons": [
                "Все 6 основных пар проанализированы, но:",
                "Скор всех сигналов < 75%",
                "Рыночные условия не благоприятны",
                "Недостаточно данных для уверенного анализа"
            ],
            "no_signals_tip": "Попробуйте позже или проверьте отдельные пары.",
            "cooldown_completed": "Кулдаун завершён",
            "cooldown_completed_desc": "Выберите новую пару для генерации сигнала:",
            "cooldown_tips": [
                "Попробуйте другую валютную пару",
                "Дождитесь изменения рыночных условий"
            ],
            "choose_best_pair": "Выберите лучшую пару для входа",
            "error_generation": "Ошибка генерации сигналов. Попробуйте позже.",
            "try_again_10min": "Попробовать снова через 10 мин"
        },
        "en": {
            "select_pair": "Select currency pair for signal generation",
            "select_pair_desc": "Click on the pair you want to get a trading signal for:",
            "top3_cooldown_title": "TOP-3 Forex signals available every 10 minutes",
            "top3_cooldown_time": "Time left to wait: {minutes}m {seconds}s",
            "top3_cooldown_why": "Why this limitation?",
            "top3_cooldown_reasons": [
                "Quality analysis requires time",
                "Prevents spam requests",
                "More accurate signals"
            ],
            "top3_cooldown_tip": "Use this time to analyze current signals!",
            "market_closed_title": "Forex signals unavailable",
            "market_closed_wait": "Forex market is closed until trading sessions open",
            "market_closed_otc_tip": "You can use OTC signals (work 24/7)",
            "analyzing_pairs": "Analyzing 6 main forex pairs...",
            "generating_signals": "Generating signals and finding the best by score...",
            "top3_signals_title": "TOP-3 signals by score",
            "analyzed_pairs": "Analyzed: 6 main pairs",
            "generation_time": "Generation time: {time}",
            "sorted_by_score": "Signals sorted by score (best on top)",
            "no_signals_title": "No signals with high score",
            "no_signals_reasons": [
                "All 6 main pairs analyzed, but:",
                "All signals score < 75%",
                "Market conditions are not favorable",
                "Insufficient data for confident analysis"
            ],
            "no_signals_tip": "Try later or check individual pairs.",
            "cooldown_completed": "Cooldown completed",
            "cooldown_completed_desc": "Select a new pair for signal generation:",
            "cooldown_tips": [
                "Try another currency pair",
                "Wait for market conditions to change"
            ],
            "choose_best_pair": "Choose the best pair to enter",
            "error_generation": "Signal generation error. Try later.",
            "try_again_10min": "Try again in 10 min"
        },
        "th": {
            "select_pair": "เลือกคู่สกุลเงินสำหรับสร้างสัญญาณ",
            "select_pair_desc": "คลิกที่คู่ที่คุณต้องการรับสัญญาณการซื้อขาย:",
            "top3_cooldown_title": "สัญญาณ TOP-3 Forex ใช้ได้ทุก 10 นาที",
            "top3_cooldown_time": "เหลือเวลารอ: {minutes}นาที {seconds}วินาที",
            "top3_cooldown_why": "ทำไมต้องจำกัด?",
            "top3_cooldown_reasons": [
                "การวิเคราะห์คุณภาพใช้เวลา",
                "ป้องกันคำขอสแปม",
                "สัญญาณที่แม่นยำกว่า"
            ],
            "top3_cooldown_tip": "ใช้เวลานี้วิเคราะห์สัญญาณปัจจุบัน!",
            "market_closed_title": "สัญญาณ Forex ไม่พร้อมใช้งาน",
            "market_closed_wait": "ตลาดฟอเร็กซ์ปิดจนกว่าจะเปิดเซสชันการซื้อขาย",
            "market_closed_otc_tip": "คุณสามารถใช้สัญญาณ OTC (ทำงาน 24/7)",
            "analyzing_pairs": "วิเคราะห์คู่ Forex หลัก 6 คู่...",
            "generating_signals": "สร้างสัญญาณและหาสัญญาณที่ดีที่สุดตามคะแนน...",
            "top3_signals_title": "สัญญาณ TOP-3 ตามคะแนน",
            "analyzed_pairs": "วิเคราะห์แล้ว: 6 คู่หลัก",
            "generation_time": "เวลาสร้าง: {time}",
            "sorted_by_score": "สัญญาณเรียงตามคะแนน (ดีที่สุดอยู่ด้านบน)",
            "no_signals_title": "ไม่มีสัญญาณที่มีคะแนนสูง",
            "no_signals_reasons": [
                "วิเคราะห์คู่หลัก 6 คู่แล้ว แต่:",
                "คะแนนสัญญาณทั้งหมด < 75%",
                "สภาวะตลาดไม่เอื้ออำนวย",
                "ข้อมูลไม่เพียงพอสำหรับการวิเคราะห์ที่มั่นใจ"
            ],
            "no_signals_tip": "ลองใหม่ภายหลังหรือตรวจสอบคู่เดี่ยว",
            "cooldown_completed": "คูลดาวน์เสร็จสิ้น",
            "cooldown_completed_desc": "เลือกคู่ใหม่สำหรับสร้างสัญญาณ:",
            "cooldown_tips": [
                "ลองคู่สกุลเงินอื่น",
                "รอให้สภาวะตลาดเปลี่ยนแปลง"
            ],
            "choose_best_pair": "เลือกคู่ที่ดีที่สุดเพื่อเข้า",
            "error_generation": "เกิดข้อผิดพลาดในการสร้างสัญญาณ ลองใหม่ภายหลัง",
            "try_again_10min": "ลองใหม่ใน 10 นาที"
        },
        "es": {
            "select_pair": "Selecciona par de divisas para generación de señales",
            "select_pair_desc": "Haz clic en el par para el que quieres obtener una señal de trading:",
            "top3_cooldown_title": "Señales TOP-3 Forex disponibles cada 10 minutos",
            "top3_cooldown_time": "Tiempo restante: {minutes}m {seconds}s",
            "top3_cooldown_why": "¿Por qué esta limitación?",
            "top3_cooldown_reasons": [
                "El análisis de calidad requiere tiempo",
                "Previene solicitudes de spam",
                "Señales más precisas"
            ],
            "top3_cooldown_tip": "¡Usa este tiempo para analizar señales actuales!",
            "market_closed_title": "Señales Forex no disponibles",
            "market_closed_wait": "El mercado Forex está cerrado hasta que se abran las sesiones de trading",
            "market_closed_otc_tip": "Puedes usar señales OTC (funcionan 24/7)",
            "analyzing_pairs": "Analizando 6 pares forex principales...",
            "generating_signals": "Generando señales y buscando las mejores por puntuación...",
            "top3_signals_title": "Señales TOP-3 por puntuación",
            "analyzed_pairs": "Analizados: 6 pares principales",
            "generation_time": "Tiempo de generación: {time}",
            "sorted_by_score": "Señales ordenadas por puntuación (mejores arriba)",
            "no_signals_title": "No hay señales con puntuación alta",
            "no_signals_reasons": [
                "Todos los 6 pares principales analizados, pero:",
                "Puntuación de todas las señales < 75%",
                "Condiciones del mercado no son favorables",
                "Datos insuficientes para análisis confiable"
            ],
            "no_signals_tip": "Inténtalo más tarde o revisa pares individuales.",
            "cooldown_completed": "Cooldown completado",
            "cooldown_completed_desc": "Selecciona un nuevo par para generación de señales:",
            "cooldown_tips": [
                "Prueba otro par de divisas",
                "Espera a que cambien las condiciones del mercado"
            ],
            "choose_best_pair": "Elige el mejor par para entrar",
            "error_generation": "Error en generación de señales. Inténtalo más tarde.",
            "try_again_10min": "Intentar de nuevo en 10 min"
        },
        "ar": {
            "select_pair": "اختر زوج العملات لتوليد الإشارة",
            "select_pair_desc": "انقر على الزوج الذي تريد الحصول على إشارة تداول له:",
            "top3_cooldown_title": "إشارات TOP-3 الفوركس متاحة كل 10 دقائق",
            "top3_cooldown_time": "الوقت المتبقي للانتظار: {minutes}د {seconds}ث",
            "top3_cooldown_why": "لماذا هذا القيد؟",
            "top3_cooldown_reasons": [
                "التحليل الجيد يتطلب وقت",
                "يمنع طلبات البريد العشوائي",
                "إشارات أكثر دقة"
            ],
            "top3_cooldown_tip": "استخدم هذا الوقت لتحليل الإشارات الحالية!",
            "market_closed_title": "إشارات الفوركس غير متاحة",
            "market_closed_wait": "سوق الفوركس مغلق حتى فتح جلسات التداول",
            "market_closed_otc_tip": "يمكنك استخدام إشارات OTC (تعمل 24/7)",
            "analyzing_pairs": "تحليل 6 أزواج فوركس رئيسية...",
            "generating_signals": "إنشاء الإشارات والعثور على الأفضل حسب النقاط...",
            "top3_signals_title": "إشارات TOP-3 حسب النقاط",
            "analyzed_pairs": "تم تحليل: 6 أزواج رئيسية",
            "generation_time": "وقت الإنشاء: {time}",
            "sorted_by_score": "الإشارات مرتبة حسب النقاط (الأفضل في الأعلى)",
            "no_signals_title": "لا توجد إشارات بنقاط عالية",
            "no_signals_reasons": [
                "تم تحليل جميع الأزواج الـ 6 الرئيسية، لكن:",
                "نقاط جميع الإشارات < 75%",
                "ظروف السوق غير مواتية",
                "بيانات غير كافية للتحليل الواثق"
            ],
            "no_signals_tip": "جرب لاحقاً أو تحقق من الأزواج الفردية.",
            "cooldown_completed": "تم إكمال فترة التبريد",
            "cooldown_completed_desc": "اختر زوج جديد لتوليد الإشارة:",
            "cooldown_tips": [
                "جرب زوج عملات آخر",
                "انتظر تغيير ظروف السوق"
            ],
            "choose_best_pair": "اختر أفضل زوج للدخول",
            "error_generation": "خطأ في توليد الإشارات. جرب لاحقاً.",
            "try_again_10min": "جرب مرة أخرى خلال 10 دقائق"
        }
    },
    # Сообщения доступа
    "access_messages": {
        "ru": {
            "no_access": "❌ У вас нет доступа к этому боту.",
            "admin_only_status": "❌ Доступ к статусу системы только для администратора.",
            "admin_only_access": "❌ Доступ только для администратора.",
            "cannot_remove_admin": "❌ Нельзя удалить администратора.",
            "user_not_found": "❌ Пользователь не найден в списке авторизованных.",
            "user_removed": "🗑️ Пользователь удален!",
            "user_removed_id": "🔢 ID:",
            "removal_time": "🕒 Время удаления:",
            "users_remaining": "👥 Осталось пользователей:",
            "user_notified": "💡 Пользователь уведомлен об удалении.",
            "back_to_users": "👥 Назад к пользователям",
            "system_status": "📊 Статус системы",
            "error_getting_users": "❌ Ошибка получения списка пользователей.",
            "authorized_users": "👥 Авторизованные пользователи",
            "no_authorized_users": "❌ Нет авторизованных пользователей.",
            "user_count": "👥 Авторизованные пользователи ({count})",
            "admin_role": "👑 Администратор",
            "user_role": "👤 Пользователь",
               "remove_user": "🗑️ Удалить #{number}",
               "can_remove_any": "💡 Вы можете удалить любого пользователя, кроме себя.",
               "back_to_status": "🔙 Статус системы",
               "access_requests": "Запросы на доступ",
               "no_pending_requests": "Нет ожидающих запросов.",
               "all_requests_processed": "Все запросы обработаны.",
               "view_requests": "Просмотреть запросы ({count})",
               "error_getting_status": "Ошибка получения статуса системы. Попробуйте позже.",
               "pending_requests": "Ожидающие запросы",
               "time": "Время",
               "approve": "Принять",
               "reject": "Отклонить",
               "error_getting_requests": "Ошибка получения запросов.",
               "error_removing_user": "Ошибка удаления пользователя.",
               "user_stats": "Статистика пользователей",
               "no_stats_data": "Нет данных о генерации сигналов",
               "stats_will_appear": "Статистика появится после первых сигналов",
               "user_generation_stats": "Статистика генерации по пользователям",
               "you": "Вы",
               "admin": "Админ",
               "forex": "Форекс",
               "otc": "ОТС",
               "total_signals": "Всего сигналов",
               "successful": "Успешных",
               "failed": "Проигрышных",
               "win_rate": "Процент побед",
               "trade_results": "Результатов торговли",
               "error_loading_user_stats": "Ошибка загрузки статистики пользователей."
        },
        "en": {
            "no_access": "❌ You don't have access to this bot.",
            "admin_only_status": "❌ System status access only for administrator.",
            "admin_only_access": "❌ Access only for administrator.",
            "cannot_remove_admin": "❌ Cannot remove administrator.",
            "user_not_found": "❌ User not found in authorized list.",
            "user_removed": "🗑️ User removed!",
            "user_removed_id": "🔢 ID:",
            "removal_time": "🕒 Removal time:",
            "users_remaining": "👥 Users remaining:",
            "user_notified": "💡 User notified of removal.",
            "back_to_users": "👥 Back to users",
            "system_status": "📊 System status",
            "error_getting_users": "❌ Error getting user list.",
            "authorized_users": "👥 Authorized users",
            "no_authorized_users": "❌ No authorized users.",
            "user_count": "👥 Authorized users ({count})",
            "admin_role": "👑 Administrator",
            "user_role": "👤 User",
               "remove_user": "🗑️ Remove #{number}",
               "can_remove_any": "💡 You can remove any user except yourself.",
               "back_to_status": "🔙 System status",
               "access_requests": "Access requests",
               "no_pending_requests": "No pending requests.",
               "all_requests_processed": "All requests processed.",
               "view_requests": "View requests ({count})",
               "error_getting_status": "Error getting system status. Try later.",
               "pending_requests": "Pending requests",
               "time": "Time",
               "approve": "Approve",
               "reject": "Reject",
               "error_getting_requests": "Error getting requests.",
               "error_removing_user": "Error removing user.",
               "user_stats": "User statistics",
               "no_stats_data": "No signal generation data",
               "stats_will_appear": "Statistics will appear after first signals",
               "user_generation_stats": "User generation statistics",
               "you": "You",
               "admin": "Admin",
               "forex": "Forex",
               "otc": "OTC",
               "total_signals": "Total signals",
               "successful": "Successful",
               "failed": "Failed",
               "win_rate": "Win rate",
               "trade_results": "Trade results",
               "error_loading_user_stats": "Error loading user statistics."
        },
        "th": {
            "no_access": "❌ คุณไม่มีสิทธิ์เข้าถึงบอทนี้",
            "admin_only_status": "❌ การเข้าถึงสถานะระบบเฉพาะสำหรับผู้ดูแลระบบ",
            "admin_only_access": "❌ การเข้าถึงเฉพาะสำหรับผู้ดูแลระบบ",
            "cannot_remove_admin": "❌ ไม่สามารถลบผู้ดูแลระบบได้",
            "user_not_found": "❌ ไม่พบผู้ใช้ในรายการที่ได้รับอนุญาต",
            "user_removed": "🗑️ ลบผู้ใช้แล้ว!",
            "user_removed_id": "🔢 ID:",
            "removal_time": "🕒 เวลาลบ:",
            "users_remaining": "👥 ผู้ใช้ที่เหลือ:",
            "user_notified": "💡 ผู้ใช้ได้รับการแจ้งเตือนการลบ",
            "back_to_users": "👥 กลับไปยังผู้ใช้",
            "system_status": "📊 สถานะระบบ",
            "error_getting_users": "❌ เกิดข้อผิดพลาดในการรับรายการผู้ใช้",
            "authorized_users": "👥 ผู้ใช้ที่ได้รับอนุญาต",
            "no_authorized_users": "❌ ไม่มีผู้ใช้ที่ได้รับอนุญาต",
            "user_count": "👥 ผู้ใช้ที่ได้รับอนุญาต ({count})",
            "admin_role": "👑 ผู้ดูแลระบบ",
            "user_role": "👤 ผู้ใช้",
               "remove_user": "🗑️ ลบ #{number}",
               "can_remove_any": "💡 คุณสามารถลบผู้ใช้คนใดก็ได้ยกเว้นตัวคุณเอง",
               "back_to_status": "🔙 สถานะระบบ",
               "access_requests": "คำขอการเข้าถึง",
               "no_pending_requests": "ไม่มีคำขอที่รอดำเนินการ",
               "all_requests_processed": "คำขอทั้งหมดได้รับการดำเนินการแล้ว",
               "view_requests": "ดูคำขอ ({count})",
               "error_getting_status": "เกิดข้อผิดพลาดในการรับสถานะระบบ ลองใหม่ภายหลัง",
               "pending_requests": "คำขอที่รอดำเนินการ",
               "time": "เวลา",
               "approve": "อนุมัติ",
               "reject": "ปฏิเสธ",
               "error_getting_requests": "เกิดข้อผิดพลาดในการรับคำขอ",
               "error_removing_user": "เกิดข้อผิดพลาดในการลบผู้ใช้",
               "user_stats": "สถิติผู้ใช้",
               "no_stats_data": "ไม่มีข้อมูลการสร้างสัญญาณ",
               "stats_will_appear": "สถิติจะปรากฏหลังจากสัญญาณแรก",
               "user_generation_stats": "สถิติการสร้างสัญญาณของผู้ใช้",
               "you": "คุณ",
               "admin": "ผู้ดูแลระบบ",
               "forex": "ฟอเร็กซ์",
               "otc": "OTC",
               "total_signals": "สัญญาณทั้งหมด",
               "successful": "สำเร็จ",
               "failed": "ล้มเหลว",
               "win_rate": "อัตราชนะ",
               "trade_results": "ผลการซื้อขาย",
               "error_loading_user_stats": "เกิดข้อผิดพลาดในการโหลดสถิติผู้ใช้"
        },
        "es": {
            "no_access": "❌ No tienes acceso a este bot.",
            "admin_only_status": "❌ Acceso al estado del sistema solo para administrador.",
            "admin_only_access": "❌ Acceso solo para administrador.",
            "cannot_remove_admin": "❌ No se puede eliminar al administrador.",
            "user_not_found": "❌ Usuario no encontrado en la lista autorizada.",
            "user_removed": "🗑️ Usuario eliminado!",
            "user_removed_id": "🔢 ID:",
            "removal_time": "🕒 Hora de eliminación:",
            "users_remaining": "👥 Usuarios restantes:",
            "user_notified": "💡 Usuario notificado de la eliminación.",
            "back_to_users": "👥 Volver a usuarios",
            "system_status": "📊 Estado del sistema",
            "error_getting_users": "❌ Error obteniendo lista de usuarios.",
            "authorized_users": "👥 Usuarios autorizados",
            "no_authorized_users": "❌ No hay usuarios autorizados.",
            "user_count": "👥 Usuarios autorizados ({count})",
            "admin_role": "👑 Administrador",
            "user_role": "👤 Usuario",
               "remove_user": "🗑️ Eliminar #{number}",
               "can_remove_any": "💡 Puedes eliminar a cualquier usuario excepto a ti mismo.",
               "back_to_status": "🔙 Estado del sistema",
               "access_requests": "Solicitudes de acceso",
               "no_pending_requests": "No hay solicitudes pendientes.",
               "all_requests_processed": "Todas las solicitudes procesadas.",
               "view_requests": "Ver solicitudes ({count})",
               "error_getting_status": "Error obteniendo estado del sistema. Inténtalo más tarde.",
               "pending_requests": "Solicitudes pendientes",
               "time": "Hora",
               "approve": "Aprobar",
               "reject": "Rechazar",
               "error_getting_requests": "Error obteniendo solicitudes.",
               "error_removing_user": "Error eliminando usuario.",
               "user_stats": "Estadísticas de usuarios",
               "no_stats_data": "No hay datos de generación de señales",
               "stats_will_appear": "Las estadísticas aparecerán después de las primeras señales",
               "user_generation_stats": "Estadísticas de generación de usuarios",
               "you": "Tú",
               "admin": "Admin",
               "forex": "Forex",
               "otc": "OTC",
               "total_signals": "Total de señales",
               "successful": "Exitosos",
               "failed": "Fallidos",
               "win_rate": "Tasa de éxito",
               "trade_results": "Resultados de trading",
               "error_loading_user_stats": "Error cargando estadísticas de usuarios."
        },
        "ar": {
            "no_access": "❌ ليس لديك وصول إلى هذا البوت.",
            "admin_only_status": "❌ الوصول إلى حالة النظام فقط للمسؤول.",
            "admin_only_access": "❌ الوصول فقط للمسؤول.",
            "cannot_remove_admin": "❌ لا يمكن حذف المسؤول.",
            "user_not_found": "❌ المستخدم غير موجود في القائمة المصرح بها.",
            "user_removed": "🗑️ تم حذف المستخدم!",
            "user_removed_id": "🔢 المعرف:",
            "removal_time": "🕒 وقت الحذف:",
            "users_remaining": "👥 المستخدمون المتبقون:",
            "user_notified": "💡 تم إشعار المستخدم بالحذف.",
            "back_to_users": "👥 العودة إلى المستخدمين",
            "system_status": "📊 حالة النظام",
            "error_getting_users": "❌ خطأ في الحصول على قائمة المستخدمين.",
            "authorized_users": "👥 المستخدمون المصرح لهم",
            "no_authorized_users": "❌ لا يوجد مستخدمون مصرح لهم.",
            "user_count": "👥 المستخدمون المصرح لهم ({count})",
            "admin_role": "👑 المسؤول",
            "user_role": "👤 مستخدم",
               "remove_user": "🗑️ حذف #{number}",
               "can_remove_any": "💡 يمكنك حذف أي مستخدم باستثناء نفسك.",
               "back_to_status": "🔙 حالة النظام",
               "access_requests": "طلبات الوصول",
               "no_pending_requests": "لا توجد طلبات في الانتظار.",
               "all_requests_processed": "تمت معالجة جميع الطلبات.",
               "view_requests": "عرض الطلبات ({count})",
               "error_getting_status": "خطأ في الحصول على حالة النظام. جرب لاحقاً.",
               "pending_requests": "الطلبات المعلقة",
               "time": "الوقت",
               "approve": "موافقة",
               "reject": "رفض",
               "error_getting_requests": "خطأ في الحصول على الطلبات.",
               "error_removing_user": "خطأ في حذف المستخدم.",
               "user_stats": "إحصائيات المستخدمين",
               "no_stats_data": "لا توجد بيانات توليد الإشارات",
               "stats_will_appear": "ستظهر الإحصائيات بعد الإشارات الأولى",
               "user_generation_stats": "إحصائيات توليد المستخدمين",
               "you": "أنت",
               "admin": "المسؤول",
               "forex": "الفوركس",
               "otc": "OTC",
               "total_signals": "إجمالي الإشارات",
               "successful": "ناجحة",
               "failed": "فاشلة",
               "win_rate": "معدل الفوز",
               "trade_results": "نتائج التداول",
               "error_loading_user_stats": "خطأ في تحميل إحصائيات المستخدمين."
        }
    }
}

def get_interface_text(category: str, key: str, lang: str = "ru") -> str:
    """Получает текст интерфейса на указанном языке"""
    return INTERFACE_TEXTS.get(category, {}).get(lang, {}).get(key, INTERFACE_TEXTS.get(category, {}).get("ru", {}).get(key, key))

def get_direction_translation(direction: str, lang: str = "ru") -> str:
    """Получает перевод направления торговли"""
    return INTERFACE_TEXTS.get("directions", {}).get(lang, {}).get(direction, INTERFACE_TEXTS.get("directions", {}).get("ru", {}).get(direction, direction))

def get_trend_translation(trend: str, lang: str = "ru") -> str:
    """Получает перевод тренда"""
    return INTERFACE_TEXTS.get("trends", {}).get(lang, {}).get(trend, INTERFACE_TEXTS.get("trends", {}).get("ru", {}).get(trend, trend))

def get_time_unit_translation(unit: str, lang: str = "ru") -> str:
    """Получает перевод единицы времени"""
    return INTERFACE_TEXTS.get("time_units", {}).get(lang, {}).get(unit, INTERFACE_TEXTS.get("time_units", {}).get("ru", {}).get(unit, unit))

# Переводы для кнопок
BUTTON_TEXTS = {
    "ru": {
        "btn_forex": "📈 Форекс",
        "btn_otc": "⚡ ОТС",
        "btn_forex_signal": "📊 Сигнал",
        "btn_otc_signal": "⚡ Сигнал ОТС",
        "btn_top3_forex": "🏆 ТОП-3",
        "btn_top3_otc": "🏆 ТОП-3 ОТС",
        "btn_schedule": "🕒 Расписание",
        "btn_help": "❓ Помощь",
        "btn_back": "⬅️ Назад",
        "btn_main_menu": "🏠 Главное меню",
        "btn_refresh": "🔄 Обновить",
        "btn_win": "✅ Выигрыш",
        "btn_loss": "❌ Проигрыш",
        "btn_clear_signal": "🗑️ Очистить сигнал",
        "btn_status": "📊 Статус",
        "btn_users": "👥 Пользователи",
        "btn_requests": "📋 Запросы",
        "btn_forex_menu": "🔙 Форекс меню"
    },
    "en": {
        "btn_forex": "📈 Forex",
        "btn_otc": "⚡ OTC",
        "btn_forex_signal": "📊 Signal",
        "btn_otc_signal": "⚡ OTC Signal",
        "btn_top3_forex": "🏆 TOP-3",
        "btn_top3_otc": "🏆 TOP-3 OTC",
        "btn_schedule": "🕒 Schedule",
        "btn_help": "❓ Help",
        "btn_back": "⬅️ Back",
        "btn_main_menu": "🏠 Main Menu",
        "btn_refresh": "🔄 Refresh",
        "btn_win": "✅ Win",
        "btn_loss": "❌ Loss",
        "btn_clear_signal": "🗑️ Clear Signal",
        "btn_status": "📊 Status",
        "btn_users": "👥 Users",
        "btn_requests": "📋 Requests",
        "btn_forex_menu": "🔙 Forex menu"
    },
    "th": {
        "btn_forex": "📈 ฟอเร็กซ์",
        "btn_otc": "⚡ OTC",
        "btn_forex_signal": "📊 สัญญาณ",
        "btn_otc_signal": "⚡ สัญญาณ OTC",
        "btn_top3_forex": "🏆 TOP-3",
        "btn_top3_otc": "🏆 TOP-3 OTC",
        "btn_schedule": "🕒 ตารางเวลา",
        "btn_help": "❓ ช่วยเหลือ",
        "btn_back": "⬅️ กลับ",
        "btn_main_menu": "🏠 เมนูหลัก",
        "btn_refresh": "🔄 รีเฟรช",
        "btn_win": "✅ ชนะ",
        "btn_loss": "❌ แพ้",
        "btn_clear_signal": "🗑️ ล้างสัญญาณ",
        "btn_status": "📊 สถานะ",
        "btn_users": "👥 ผู้ใช้",
        "btn_requests": "📋 คำขอ",
        "btn_forex_menu": "🔙 เมนูฟอเร็กซ์"
    },
    "es": {
        "btn_forex": "📈 Forex",
        "btn_otc": "⚡ OTC",
        "btn_forex_signal": "📊 Señal",
        "btn_otc_signal": "⚡ Señal OTC",
        "btn_top3_forex": "🏆 TOP-3",
        "btn_top3_otc": "🏆 TOP-3 OTC",
        "btn_schedule": "🕒 Horario",
        "btn_help": "❓ Ayuda",
        "btn_back": "⬅️ Atrás",
        "btn_main_menu": "🏠 Menú Principal",
        "btn_refresh": "🔄 Actualizar",
        "btn_win": "✅ Ganar",
        "btn_loss": "❌ Perder",
        "btn_clear_signal": "🗑️ Limpiar Señal",
        "btn_status": "📊 Estado",
        "btn_users": "👥 Usuarios",
        "btn_requests": "📋 Solicitudes",
        "btn_forex_menu": "🔙 Menú Forex"
    },
    "ar": {
        "btn_forex": "📈 فوركس",
        "btn_otc": "⚡ OTC",
        "btn_forex_signal": "📊 إشارة",
        "btn_otc_signal": "⚡ إشارة OTC",
        "btn_top3_forex": "🏆 TOP-3",
        "btn_top3_otc": "🏆 TOP-3 OTC",
        "btn_schedule": "🕒 الجدول",
        "btn_help": "❓ مساعدة",
        "btn_back": "⬅️ رجوع",
        "btn_main_menu": "🏠 القائمة الرئيسية",
        "btn_refresh": "🔄 تحديث",
        "btn_win": "✅ فوز",
        "btn_loss": "❌ خسارة",
        "btn_clear_signal": "🗑️ مسح الإشارة",
        "btn_status": "📊 الحالة",
        "btn_users": "👥 المستخدمون",
        "btn_requests": "📋 الطلبات",
        "btn_forex_menu": "🔙 قائمة الفوركس"
    }
}

def get_button_text(button_key: str, lang: str = "ru") -> str:
    """Получает текст кнопки на указанном языке"""
    return BUTTON_TEXTS.get(lang, {}).get(button_key, BUTTON_TEXTS.get("ru", {}).get(button_key, button_key))

def load_user_languages(filename: str = "user_languages.json") -> Dict:
    """Загрузка языков из файла"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {int(k): v for k, v in data.items()}
    except:
        return {}

def save_user_languages(user_languages: Dict, filename: str = "user_languages.json"):
    """Сохранение языков в файл"""
    try:
        data = {str(k): v for k, v in user_languages.items()}
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Ошибка сохранения языков: {e}")

