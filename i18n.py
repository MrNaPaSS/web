#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Модуль мультиязычности для Telegram бота
Поддерживаемые языки: русский, английский, тайский, испанский, арабский
"""

from typing import Dict, Any

# Конфигурация языков
LANGUAGES = {
    "ru": {"name": "Русский", "flag": "🇷🇺"},
    "en": {"name": "English", "flag": "🇬🇧"},
    "th": {"name": "ไทย", "flag": "🇹🇭"},
    "es": {"name": "Español", "flag": "🇪🇸"},
    "ar": {"name": "العربية", "flag": "🇸🇦"}
}

DEFAULT_LANGUAGE = "en"

# Словарь переводов
TEXTS = {
    # Команда /start
    "welcome_title": {
        "ru": "🤖 *Добро пожаловать, {}!*",
        "en": "🤖 *Welcome, {}!*",
        "th": "🤖 *ยินดีต้อนรับ {}!*",
        "es": "🤖 *¡Bienvenido, {}!*",
        "ar": "🤖 *مرحباً {}!*"
    },
    
    "welcome_intro": {
        "ru": "Я бот для получения доступа к *профессиональным торговым сигналам*!",
        "en": "I'm a bot for accessing *professional trading signals*!",
        "th": "ฉันเป็นบอทสำหรับเข้าถึง *สัญญาณการเทรดมืออาชีพ*!",
        "es": "¡Soy un bot para acceder a *señales de trading profesionales*!",
        "ar": "أنا بوت للوصول إلى *إشارات التداول الاحترافية*!"
    },
    
    "welcome_features_title": {
        "ru": "📊 *Что вы получите:*",
        "en": "📊 *What you'll get:*",
        "th": "📊 *สิ่งที่คุณจะได้รับ:*",
        "es": "📊 *Lo que obtendrás:*",
        "ar": "📊 *ما ستحصل عليه:*"
    },
    
    "welcome_feature_1": {
        "ru": "• Точные сигналы на вход",
        "en": "• Accurate entry signals",
        "th": "• สัญญาณการเข้าที่แม่นยำ",
        "es": "• Señales de entrada precisas",
        "ar": "• إشارات دخول دقيقة"
    },
    
    "welcome_feature_2": {
        "ru": "• Высокую прибыльность (80%+)",
        "en": "• High profitability (80%+)",
        "th": "• ความสามารถในการทำกำไรสูง (80%+)",
        "es": "• Alta rentabilidad (80%+)",
        "ar": "• ربحية عالية (80%+)"
    },
    
    "welcome_feature_3": {
        "ru": "• Поддержку 24/7",
        "en": "• 24/7 support",
        "th": "• การสนับสนุน 24/7",
        "es": "• Soporte 24/7",
        "ar": "• دعم 24/7"
    },
    
    "welcome_feature_4": {
        "ru": "• Профессиональную аналитику",
        "en": "• Professional analytics",
        "th": "• การวิเคราะห์แบบมืออาชีพ",
        "es": "• Análisis profesional",
        "ar": "• تحليلات احترافية"
    },
    
    "welcome_how_title": {
        "ru": "🚀 *Как получить доступ:*",
        "en": "🚀 *How to get access:*",
        "th": "🚀 *วิธีการเข้าถึง:*",
        "es": "🚀 *Cómo obtener acceso:*",
        "ar": "🚀 *كيفية الحصول على الوصول:*"
    },
    
    "welcome_step_1": {
        "ru": "1️⃣ *Зарегистрируйтесь* по нашей ссылке:",
        "en": "1️⃣ *Register* using our link:",
        "th": "1️⃣ *ลงทะเบียน* โดยใช้ลิงก์ของเรา:",
        "es": "1️⃣ *Regístrese* usando nuestro enlace:",
        "ar": "1️⃣ *سجل* باستخدام رابطنا:"
    },
    
    "welcome_step_2": {
        "ru": "2️⃣ *Пополните баланс* минимум на $50",
        "en": "2️⃣ *Deposit* minimum $50",
        "th": "2️⃣ *ฝากเงิน* อย่างน้อย $50",
        "es": "2️⃣ *Deposite* mínimo $50",
        "ar": "2️⃣ *أودع* $50 كحد أدنى"
    },
    
    "welcome_step_2_bonus": {
        "ru": "• Получите +50% бонус к депозиту",
        "en": "• Get +50% bonus on deposit",
        "th": "• รับโบนัส +50% จากการฝาก",
        "es": "• Obtenga +50% de bonificación en depósito",
        "ar": "• احصل على +50% مكافأة على الإيداع"
    },
    
    "welcome_step_2_promo": {
        "ru": "• Промокод: 50START",
        "en": "• Promo code: 50START",
        "th": "• รหัสโปรโมชั่น: 50START",
        "es": "• Código promocional: 50START",
        "ar": "• رمز الترويج: 50START"
    },
    
    "welcome_step_3": {
        "ru": "3️⃣ *Отправьте ваш ID* аккаунта PocketOption",
        "en": "3️⃣ *Send your* PocketOption account ID",
        "th": "3️⃣ *ส่ง ID* บัญชี PocketOption ของคุณ",
        "es": "3️⃣ *Envíe su ID* de cuenta PocketOption",
        "ar": "3️⃣ *أرسل معرف* حساب PocketOption الخاص بك"
    },
    
    "welcome_step_4": {
        "ru": "4️⃣ *Получите доступ* к сигналам!",
        "en": "4️⃣ *Get access* to signals!",
        "th": "4️⃣ *เข้าถึง* สัญญาณ!",
        "es": "4️⃣ *Obtenga acceso* a las señales!",
        "ar": "4️⃣ *احصل على وصول* للإشارات!"
    },
    
    "welcome_traders_only": {
        "ru": "💎 *Только для серьезных трейдеров!*",
        "en": "💎 *Only for serious traders!*",
        "th": "💎 *สำหรับเทรดเดอร์ที่จริงจังเท่านั้น!*",
        "es": "💎 *¡Solo para traders serios!*",
        "ar": "💎 *للمتداولين الجادين فقط!*"
    },
    
    "welcome_support": {
        "ru": "👨‍💻 *Поддержка:* @kaktotakxm",
        "en": "👨‍💻 *Support:* @kaktotakxm",
        "th": "👨‍💻 *การสนับสนุน:* @kaktotakxm",
        "es": "👨‍💻 *Soporte:* @kaktotakxm",
        "ar": "👨‍💻 *الدعم:* @kaktotakxm"
    },
    
    # Кнопки главного меню
    "btn_instruction": {
        "ru": "📝 Инструкция",
        "en": "📝 Instructions",
        "th": "📝 คำแนะนำ",
        "es": "📝 Instrucciones",
        "ar": "📝 التعليمات"
    },
    
    "btn_registration": {
        "ru": "🔗 Регистрация",
        "en": "🔗 Registration",
        "th": "🔗 ลงทะเบียน",
        "es": "🔗 Registro",
        "ar": "🔗 التسجيل"
    },
    
    "btn_check_access": {
        "ru": "✅ Проверить доступ",
        "en": "✅ Check access",
        "th": "✅ ตรวจสอบการเข้าถึง",
        "es": "✅ Verificar acceso",
        "ar": "✅ التحقق من الوصول"
    },
    
    "btn_support": {
        "ru": "📞 Поддержка",
        "en": "📞 Support",
        "th": "📞 การสนับสนุน",
        "es": "📞 Soporte",
        "ar": "📞 الدعم"
    },
    
    "btn_language": {
        "ru": "🌐 Язык / Language",
        "en": "🌐 Language / Язык",
        "th": "🌐 ภาษา / Language",
        "es": "🌐 Idioma / Language",
        "ar": "🌐 اللغة / Language"
    },
    
    "btn_back": {
        "ru": "🔙 Назад",
        "en": "🔙 Back",
        "th": "🔙 กลับ",
        "es": "🔙 Atrás",
        "ar": "🔙 رجوع"
    },
    
    # Инструкция
    "instruction_title": {
        "ru": "📋 *ПОДРОБНАЯ ИНСТРУКЦИЯ:*",
        "en": "📋 *DETAILED INSTRUCTIONS:*",
        "th": "📋 *คำแนะนำโดยละเอียด:*",
        "es": "📋 *INSTRUCCIONES DETALLADAS:*",
        "ar": "📋 *تعليمات مفصلة:*"
    },
    
    "instruction_step1_title": {
        "ru": "*ШАГ 1: Регистрация*",
        "en": "*STEP 1: Registration*",
        "th": "*ขั้นตอนที่ 1: การลงทะเบียน*",
        "es": "*PASO 1: Registro*",
        "ar": "*الخطوة 1: التسجيل*"
    },
    
    "instruction_step1_1": {
        "ru": "• Нажмите кнопку \"🔗 Регистрация\"",
        "en": "• Click the \"🔗 Registration\" button",
        "th": "• คลิกปุ่ม \"🔗 ลงทะเบียน\"",
        "es": "• Haga clic en el botón \"🔗 Registro\"",
        "ar": "• انقر على زر \"🔗 التسجيل\""
    },
    
    "instruction_step1_2": {
        "ru": "• Зарегистрируйтесь на PocketOption",
        "en": "• Register on PocketOption",
        "th": "• ลงทะเบียนบน PocketOption",
        "es": "• Regístrese en PocketOption",
        "ar": "• سجل على PocketOption"
    },
    
    "instruction_step1_3": {
        "ru": "• Обязательно используйте нашу ссылку!",
        "en": "• Be sure to use our link!",
        "th": "• ตรวจสอบให้แน่ใจว่าใช้ลิงก์ของเรา!",
        "es": "• ¡Asegúrese de usar nuestro enlace!",
        "ar": "• تأكد من استخدام رابطنا!"
    },
    
    "instruction_step2_title": {
        "ru": "*ШАГ 2: Пополнение*",
        "en": "*STEP 2: Deposit*",
        "th": "*ขั้นตอนที่ 2: การฝากเงิน*",
        "es": "*PASO 2: Depósito*",
        "ar": "*الخطوة 2: الإيداع*"
    },
    
    "instruction_step2_1": {
        "ru": "• Пополните баланс минимум на $50",
        "en": "• Deposit at least $50",
        "th": "• ฝากเงินอย่างน้อย $50",
        "es": "• Deposite al menos $50",
        "ar": "• أودع ما لا يقل عن $50"
    },
    
    "instruction_step2_2": {
        "ru": "• Получите +50% бонус к депозиту",
        "en": "• Get +50% bonus on deposit",
        "th": "• รับโบนัส +50% จากการฝาก",
        "es": "• Obtenga +50% de bonificación",
        "ar": "• احصل على +50% مكافأة"
    },
    
    "instruction_step2_3": {
        "ru": "• Промокод: 50START",
        "en": "• Promo code: 50START",
        "th": "• รหัสโปรโมชั่น: 50START",
        "es": "• Código promocional: 50START",
        "ar": "• رمز الترويج: 50START"
    },
    
    "instruction_step3_title": {
        "ru": "*ШАГ 3: Отправка ID*",
        "en": "*STEP 3: Send ID*",
        "th": "*ขั้นตอนที่ 3: ส่ง ID*",
        "es": "*PASO 3: Enviar ID*",
        "ar": "*الخطوة 3: إرسال المعرف*"
    },
    
    "instruction_step3_1": {
        "ru": "• Скопируйте ваш ID аккаунта",
        "en": "• Copy your account ID",
        "th": "• คัดลอก ID บัญชีของคุณ",
        "es": "• Copie su ID de cuenta",
        "ar": "• انسخ معرف حسابك"
    },
    
    "instruction_step3_2": {
        "ru": "• Отправьте его боту в сообщении",
        "en": "• Send it to the bot in a message",
        "th": "• ส่งไปยังบอทในข้อความ",
        "es": "• Envíelo al bot en un mensaje",
        "ar": "• أرسله للبوت في رسالة"
    },
    
    "instruction_step3_3": {
        "ru": "• Формат: 37525432 (только цифры)",
        "en": "• Format: 37525432 (numbers only)",
        "th": "• รูปแบบ: 37525432 (ตัวเลขเท่านั้น)",
        "es": "• Formato: 37525432 (solo números)",
        "ar": "• التنسيق: 37525432 (أرقام فقط)"
    },
    
    "instruction_step4_title": {
        "ru": "*ШАГ 4: Проверка*",
        "en": "*STEP 4: Verification*",
        "th": "*ขั้นตอนที่ 4: การตรวจสอบ*",
        "es": "*PASO 4: Verificación*",
        "ar": "*الخطوة 4: التحقق*"
    },
    
    "instruction_step4_1": {
        "ru": "• Мы проверим вашу регистрацию",
        "en": "• We'll verify your registration",
        "th": "• เราจะตรวจสอบการลงทะเบียนของคุณ",
        "es": "• Verificaremos su registro",
        "ar": "• سنتحقق من تسجيلك"
    },
    
    "instruction_step4_2": {
        "ru": "• Подтвердим пополнение",
        "en": "• Confirm deposit",
        "th": "• ยืนยันการฝากเงิน",
        "es": "• Confirmar depósito",
        "ar": "• تأكيد الإيداع"
    },
    
    "instruction_step4_3": {
        "ru": "• Предоставим доступ к сигналам",
        "en": "• Grant access to signals",
        "th": "• ให้สิทธิ์เข้าถึงสัญญาณ",
        "es": "• Otorgar acceso a señales",
        "ar": "• منح الوصول إلى الإشارات"
    },
    
    "instruction_time": {
        "ru": "⏰ *Время обработки:* до 24 часов",
        "en": "⏰ *Processing time:* up to 24 hours",
        "th": "⏰ *เวลาในการประมวลผล:* สูงสุด 24 ชั่วโมง",
        "es": "⏰ *Tiempo de procesamiento:* hasta 24 horas",
        "ar": "⏰ *وقت المعالجة:* حتى 24 ساعة"
    },
    
    "instruction_questions": {
        "ru": "❓ *Вопросы?* Пишите @kaktotakxm",
        "en": "❓ *Questions?* Write @kaktotakxm",
        "th": "❓ *คำถาม?* เขียน @kaktotakxm",
        "es": "❓ *¿Preguntas?* Escriba @kaktotakxm",
        "ar": "❓ *أسئلة؟* اكتب @kaktotakxm"
    },
    
    # Проверка доступа
    "access_status_title": {
        "ru": "📊 *ВАШ СТАТУС:*",
        "en": "📊 *YOUR STATUS:*",
        "th": "📊 *สถานะของคุณ:*",
        "es": "📊 *SU ESTADO:*",
        "ar": "📊 *حالتك:*"
    },
    
    "access_user": {
        "ru": "👤 *Пользователь:* {}",
        "en": "👤 *User:* {}",
        "th": "👤 *ผู้ใช้:* {}",
        "es": "👤 *Usuario:* {}",
        "ar": "👤 *المستخدم:* {}"
    },
    
    "access_registration": {
        "ru": "📅 *Регистрация:* {}",
        "en": "📅 *Registration:* {}",
        "th": "📅 *การลงทะเบียน:* {}",
        "es": "📅 *Registro:* {}",
        "ar": "📅 *التسجيل:* {}"
    },
    
    "access_referral_link": {
        "ru": "🔗 *Реферальная ссылка:* {}",
        "en": "🔗 *Referral link:* {}",
        "th": "🔗 *ลิงก์อ้างอิง:* {}",
        "es": "🔗 *Enlace de referencia:* {}",
        "ar": "🔗 *رابط الإحالة:* {}"
    },
    
    "access_referral_used": {
        "ru": "✅ Использована",
        "en": "✅ Used",
        "th": "✅ ใช้แล้ว",
        "es": "✅ Usado",
        "ar": "✅ مستخدم"
    },
    
    "access_referral_not_used": {
        "ru": "❌ Не использована",
        "en": "❌ Not used",
        "th": "❌ ยังไม่ได้ใช้",
        "es": "❌ No usado",
        "ar": "❌ غير مستخدم"
    },
    
    "access_deposit": {
        "ru": "💰 *Пополнение:* {}",
        "en": "💰 *Deposit:* {}",
        "th": "💰 *การฝากเงิน:* {}",
        "es": "💰 *Depósito:* {}",
        "ar": "💰 *الإيداع:* {}"
    },
    
    "access_deposit_confirmed": {
        "ru": "✅ Подтверждено",
        "en": "✅ Confirmed",
        "th": "✅ ยืนยันแล้ว",
        "es": "✅ Confirmado",
        "ar": "✅ مؤكد"
    },
    
    "access_deposit_not_confirmed": {
        "ru": "❌ Не подтверждено",
        "en": "❌ Not confirmed",
        "th": "❌ ยังไม่ได้ยืนยัน",
        "es": "❌ No confirmado",
        "ar": "❌ غير مؤكد"
    },
    
    "access_account_id": {
        "ru": "🆔 *ID аккаунта:* {}",
        "en": "🆔 *Account ID:* {}",
        "th": "🆔 *ID บัญชี:* {}",
        "es": "🆔 *ID de cuenta:* {}",
        "ar": "🆔 *معرف الحساب:* {}"
    },
    
    "access_id_not_sent": {
        "ru": "Не отправлен",
        "en": "Not sent",
        "th": "ยังไม่ได้ส่ง",
        "es": "No enviado",
        "ar": "لم يتم الإرسال"
    },
    
    "access_status": {
        "ru": "✅ *Доступ:* {}",
        "en": "✅ *Access:* {}",
        "th": "✅ *การเข้าถึง:* {}",
        "es": "✅ *Acceso:* {}",
        "ar": "✅ *الوصول:* {}"
    },
    
    "access_active": {
        "ru": "Активен",
        "en": "Active",
        "th": "ใช้งานอยู่",
        "es": "Activo",
        "ar": "نشط"
    },
    
    "access_not_granted": {
        "ru": "Не предоставлен",
        "en": "Not granted",
        "th": "ไม่ได้รับอนุญาต",
        "es": "No otorgado",
        "ar": "غير ممنوح"
    },
    
    "access_granted_message": {
        "ru": "\n\n🎉 *ДОСТУП ПРЕДОСТАВЛЕН!*\nВы получаете все торговые сигналы!",
        "en": "\n\n🎉 *ACCESS GRANTED!*\nYou're receiving all trading signals!",
        "th": "\n\n🎉 *ได้รับอนุญาต!*\nคุณกำลังได้รับสัญญาณการซื้อขายทั้งหมด!",
        "es": "\n\n🎉 *¡ACCESO OTORGADO!*\n¡Está recibiendo todas las señales de trading!",
        "ar": "\n\n🎉 *تم منح الوصول!*\nأنت تتلقى جميع إشارات التداول!"
    },
    
    "access_not_granted_message": {
        "ru": "\n\n⚠️ *ДОСТУП НЕ ПРЕДОСТАВЛЕН*\n\nВыполните все шаги:\n1. Регистрация по ссылке\n2. Пополнение $50+\n3. Отправка ID аккаунта",
        "en": "\n\n⚠️ *ACCESS NOT GRANTED*\n\nComplete all steps:\n1. Register via link\n2. Deposit $50+\n3. Send account ID",
        "th": "\n\n⚠️ *ไม่ได้รับอนุญาต*\n\nทำตามขั้นตอนทั้งหมด:\n1. ลงทะเบียนผ่านลิงก์\n2. ฝากเงิน $50+\n3. ส่ง ID บัญชี",
        "es": "\n\n⚠️ *ACCESO NO OTORGADO*\n\nComplete todos los pasos:\n1. Registrarse vía enlace\n2. Depositar $50+\n3. Enviar ID de cuenta",
        "ar": "\n\n⚠️ *لم يتم منح الوصول*\n\nأكمل جميع الخطوات:\n1. التسجيل عبر الرابط\n2. إيداع $50+\n3. إرسال معرف الحساب"
    },
    
    "access_checks_info": {
        "ru": "\n\n🔄 *Проверок сегодня:* {}\n💡 Выполните действия вместо повторных проверок!",
        "en": "\n\n🔄 *Checks today:* {}\n💡 Take action instead of repeated checks!",
        "th": "\n\n🔄 *การตรวจสอบวันนี้:* {}\n💡 ดำเนินการแทนการตรวจสอบซ้ำ!",
        "es": "\n\n🔄 *Verificaciones hoy:* {}\n💡 ¡Actúe en lugar de verificaciones repetidas!",
        "ar": "\n\n🔄 *عمليات التحقق اليوم:* {}\n💡 اتخذ إجراء بدلاً من الفحوصات المتكررة!"
    },
    
    # Предупреждения
    "warning_first_title": {
        "ru": "⚠️ *ПЕРВОЕ ПРЕДУПРЕЖДЕНИЕ!*",
        "en": "⚠️ *FIRST WARNING!*",
        "th": "⚠️ *คำเตือนครั้งแรก!*",
        "es": "⚠️ *¡PRIMERA ADVERTENCIA!*",
        "ar": "⚠️ *تحذير أول!*"
    },
    
    "warning_last_title": {
        "ru": "🚨 *ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ!*",
        "en": "🚨 *FINAL WARNING!*",
        "th": "🚨 *คำเตือนสุดท้าย!*",
        "es": "🚨 *¡ADVERTENCIA FINAL!*",
        "ar": "🚨 *تحذير نهائي!*"
    },
    
    "warning_checks_count": {
        "ru": "Вы проверяете доступ уже {} раз подряд!",
        "en": "You've checked access {} times in a row!",
        "th": "คุณตรวจสอบการเข้าถึงแล้ว {} ครั้งติดต่อกัน!",
        "es": "¡Ha verificado el acceso {} veces seguidas!",
        "ar": "لقد تحققت من الوصول {} مرة متتالية!"
    },
    
    "warning_block_threat": {
        "ru": "Следующее нарушение приведет к **ПОСТОЯННОЙ БЛОКИРОВКЕ НАВСЕГДА**!",
        "en": "Next violation will result in **PERMANENT BAN FOREVER**!",
        "th": "การละเมิดครั้งต่อไปจะทำให้ **ถูกแบนถาวรตลอดไป**!",
        "es": "¡La próxima violación resultará en **PROHIBICIÓN PERMANENTE PARA SIEMPRE**!",
        "ar": "الانتهاك التالي سيؤدي إلى **حظر دائم للأبد**!"
    },
    
    "warning_status_wont_change": {
        "ru": "🚫 *Статус не изменится автоматически!*",
        "en": "🚫 *Status won't change automatically!*",
        "th": "🚫 *สถานะจะไม่เปลี่ยนแปลงโดยอัตโนมัติ!*",
        "es": "🚫 *¡El estado no cambiará automáticamente!*",
        "ar": "🚫 *لن تتغير الحالة تلقائيًا!*"
    },
    
    "warning_steps_required": {
        "ru": "📋 *Для получения доступа выполните:*\n1️⃣ Регистрация по нашей ссылке\n2️⃣ Пополнение баланса ${}+\n3️⃣ Отправка ID аккаунта",
        "en": "📋 *To get access, complete:*\n1️⃣ Register via our link\n2️⃣ Deposit ${}+\n3️⃣ Send account ID",
        "th": "📋 *เพื่อเข้าถึง ให้ทำให้เสร็จ:*\n1️⃣ ลงทะเบียนผ่านลิงก์ของเรา\n2️⃣ ฝากเงิน ${}+\n3️⃣ ส่ง ID บัญชี",
        "es": "📋 *Para obtener acceso, complete:*\n1️⃣ Regístrese vía nuestro enlace\n2️⃣ Deposite ${}+\n3️⃣ Envíe ID de cuenta",
        "ar": "📋 *للحصول على الوصول، أكمل:*\n1️⃣ سجل عبر رابطنا\n2️⃣ أودع ${}+\n3️⃣ أرسل معرف الحساب"
    },
    
    "warning_cooldown": {
        "ru": "⏰ *Следующая проверка доступна через:* {} мин.",
        "en": "⏰ *Next check available in:* {} min.",
        "th": "⏰ *การตรวจสอบครั้งต่อไปพร้อมใช้งานใน:* {} นาที",
        "es": "⏰ *Próxima verificación disponible en:* {} min.",
        "ar": "⏰ *الفحص التالي متاح في:* {} دقيقة."
    },
    
    "warning_advice": {
        "ru": "💡 *Совет:* Вместо повторных проверок выполните необходимые действия!",
        "en": "💡 *Advice:* Instead of repeated checks, complete the required actions!",
        "th": "💡 *คำแนะนำ:* แทนที่จะตรวจสอบซ้ำ ให้ทำการกระทำที่จำเป็น!",
        "es": "💡 *Consejo:* ¡En lugar de verificaciones repetidas, complete las acciones requeridas!",
        "ar": "💡 *نصيحة:* بدلاً من الفحوصات المتكررة، أكمل الإجراءات المطلوبة!"
    },
    
    # Блокировка
    "blocked_title": {
        "ru": "🚫 *ВАША УЧЕТНАЯ ЗАПИСЬ ЗАБЛОКИРОВАНА*",
        "en": "🚫 *YOUR ACCOUNT IS BLOCKED*",
        "th": "🚫 *บัญชีของคุณถูกบล็อก*",
        "es": "🚫 *SU CUENTA ESTÁ BLOQUEADA*",
        "ar": "🚫 *حسابك محظور*"
    },
    
    "blocked_reason": {
        "ru": "❌ *Причина:* Многократные нарушения правил использования",
        "en": "❌ *Reason:* Multiple violations of usage rules",
        "th": "❌ *เหตุผล:* การละเมิดกฎการใช้งานหลายครั้ง",
        "es": "❌ *Razón:* Múltiples violaciones de las reglas de uso",
        "ar": "❌ *السبب:* انتهاكات متعددة لقواعد الاستخدام"
    },
    
    "blocked_permanent": {
        "ru": "⚠️ *Блокировка действует навсегда*",
        "en": "⚠️ *Ban is permanent*",
        "th": "⚠️ *การแบนเป็นการถาวร*",
        "es": "⚠️ *La prohibición es permanente*",
        "ar": "⚠️ *الحظر دائم*"
    },
    
    "blocked_contact": {
        "ru": "📞 *Для разблокировки обратитесь:* @kaktotakxm",
        "en": "📞 *To unblock, contact:* @kaktotakxm",
        "th": "📞 *เพื่อปลดบล็อก ติดต่อ:* @kaktotakxm",
        "es": "📞 *Para desbloquear, contacte:* @kaktotakxm",
        "ar": "📞 *لإلغاء الحظر، اتصل بـ:* @kaktotakxm"
    },
    
    "blocked_user_id": {
        "ru": "💬 *Укажите ваш ID:* {}",
        "en": "💬 *Provide your ID:* {}",
        "th": "💬 *ระบุ ID ของคุณ:* {}",
        "es": "💬 *Proporcione su ID:* {}",
        "ar": "💬 *قدم معرفك:* {}"
    },
    
    # ID аккаунта
    "id_received_title": {
        "ru": "✅ *ID получен:* {}",
        "en": "✅ *ID received:* {}",
        "th": "✅ *ได้รับ ID แล้ว:* {}",
        "es": "✅ *ID recibido:* {}",
        "ar": "✅ *تم استلام المعرف:* {}"
    },
    
    "id_checking": {
        "ru": "🔍 *Проверяем ваши данные...*",
        "en": "🔍 *Checking your data...*",
        "th": "🔍 *กำลังตรวจสอบข้อมูลของคุณ...*",
        "es": "🔍 *Verificando sus datos...*",
        "ar": "🔍 *جاري التحقق من بياناتك...*"
    },
    
    "id_processing_time": {
        "ru": "⏰ *Время обработки:* до 24 часов",
        "en": "⏰ *Processing time:* up to 24 hours",
        "th": "⏰ *เวลาในการประมวลผล:* สูงสุด 24 ชั่วโมง",
        "es": "⏰ *Tiempo de procesamiento:* hasta 24 horas",
        "ar": "⏰ *وقت المعالجة:* حتى 24 ساعة"
    },
    
    "id_what_checked": {
        "ru": "📋 *Что проверяется:*\n• Регистрация по нашей ссылке\n• Пополнение баланса\n• Активность аккаунта",
        "en": "📋 *What's being checked:*\n• Registration via our link\n• Balance deposit\n• Account activity",
        "th": "📋 *สิ่งที่กำลังตรวจสอบ:*\n• การลงทะเบียนผ่านลิงก์ของเรา\n• การฝากเงิน\n• กิจกรรมบัญชี",
        "es": "📋 *Lo que se está verificando:*\n• Registro vía nuestro enlace\n• Depósito de saldo\n• Actividad de cuenta",
        "ar": "📋 *ما يتم التحقق منه:*\n• التسجيل عبر رابطنا\n• إيداع الرصيد\n• نشاط الحساب"
    },
    
    "id_after_verification": {
        "ru": "✅ *После проверки вы получите доступ к сигналам!*",
        "en": "✅ *After verification you'll get access to signals!*",
        "th": "✅ *หลังจากการตรวจสอบคุณจะได้รับการเข้าถึงสัญญาณ!*",
        "es": "✅ *¡Después de la verificación obtendrá acceso a las señales!*",
        "ar": "✅ *بعد التحقق ستحصل على الوصول إلى الإشارات!*"
    },
    
    "id_questions": {
        "ru": "📞 *Вопросы?* @kaktotakxm",
        "en": "📞 *Questions?* @kaktotakxm",
        "th": "📞 *คำถาม?* @kaktotakxm",
        "es": "📞 *¿Preguntas?* @kaktotakxm",
        "ar": "📞 *أسئلة؟* @kaktotakxm"
    },
    
    # Ошибки
    "error_not_registered": {
        "ru": "❌ Вы не зарегистрированы в системе!\n\nИспользуйте /start для начала.",
        "en": "❌ You're not registered in the system!\n\nUse /start to begin.",
        "th": "❌ คุณไม่ได้ลงทะเบียนในระบบ!\n\nใช้ /start เพื่อเริ่มต้น",
        "es": "❌ ¡No está registrado en el sistema!\n\nUse /start para comenzar.",
        "ar": "❌ أنت غير مسجل في النظام!\n\nاستخدم /start للبدء."
    },
    
    "error_use_start": {
        "ru": "❌ Сначала используйте команду /start",
        "en": "❌ First use the /start command",
        "th": "❌ ใช้คำสั่ง /start ก่อน",
        "es": "❌ Primero use el comando /start",
        "ar": "❌ استخدم أمر /start أولاً"
    },
    
    "error_unknown_message": {
        "ru": "❓ *Не понимаю ваше сообщение*\n\n📋 *Доступные команды:*\n• /start - Начать работу с ботом\n• /help - Помощь\n• /status - Проверить статус\n• /language - Выбор языка\n\n🆔 *Для отправки ID:* напишите ваш ID аккаунта\nПримеры: 37525432 или PO37525432\n\n📞 *Поддержка:* @kaktotakxm",
        "en": "❓ *I don't understand your message*\n\n📋 *Available commands:*\n• /start - Start working with the bot\n• /help - Help\n• /status - Check status\n• /language - Choose language\n\n🆔 *To send ID:* write your account ID\nExamples: 37525432 or PO37525432\n\n📞 *Support:* @kaktotakxm",
        "th": "❓ *ฉันไม่เข้าใจข้อความของคุณ*\n\n📋 *คำสั่งที่พร้อมใช้งาน:*\n• /start - เริ่มทำงานกับบอท\n• /help - ความช่วยเหลือ\n• /status - ตรวจสอบสถานะ\n• /language - เลือกภาษา\n\n🆔 *เพื่อส่ง ID:* เขียน ID บัญชีของคุณ\nตัวอย่าง: 37525432 หรือ PO37525432\n\n📞 *การสนับสนุน:* @kaktotakxm",
        "es": "❓ *No entiendo su mensaje*\n\n📋 *Comandos disponibles:*\n• /start - Comenzar a trabajar con el bot\n• /help - Ayuda\n• /status - Verificar estado\n• /language - Elegir idioma\n\n🆔 *Para enviar ID:* escriba su ID de cuenta\nEjemplos: 37525432 o PO37525432\n\n📞 *Soporte:* @kaktotakxm",
        "ar": "❓ *لا أفهم رسالتك*\n\n📋 *الأوامر المتاحة:*\n• /start - ابدأ العمل مع البوت\n• /help - المساعدة\n• /status - التحقق من الحالة\n• /language - اختر اللغة\n\n🆔 *لإرسال المعرف:* اكتب معرف حسابك\nأمثلة: 37525432 أو PO37525432\n\n📞 *الدعم:* @kaktotakxm"
    },
    
    # Команда /help
    "help_title": {
        "ru": "🆘 *ПОМОЩЬ*",
        "en": "🆘 *HELP*",
        "th": "🆘 *ความช่วยเหลือ*",
        "es": "🆘 *AYUDA*",
        "ar": "🆘 *المساعدة*"
    },
    
    "help_commands": {
        "ru": "📋 *Доступные команды:*\n• /start - Начать работу с ботом\n• /help - Эта справка\n• /status - Проверить ваш статус\n• /language - Выбрать язык",
        "en": "📋 *Available commands:*\n• /start - Start working with bot\n• /help - This help\n• /status - Check your status\n• /language - Choose language",
        "th": "📋 *คำสั่งที่พร้อมใช้งาน:*\n• /start - เริ่มทำงานกับบอท\n• /help - ความช่วยเหลือนี้\n• /status - ตรวจสอบสถานะของคุณ\n• /language - เลือกภาษา",
        "es": "📋 *Comandos disponibles:*\n• /start - Comenzar a trabajar con bot\n• /help - Esta ayuda\n• /status - Verificar su estado\n• /language - Elegir idioma",
        "ar": "📋 *الأوامر المتاحة:*\n• /start - ابدأ العمل مع البوت\n• /help - هذه المساعدة\n• /status - تحقق من حالتك\n• /language - اختر اللغة"
    },
    
    "help_send_id": {
        "ru": "🆔 *Как отправить ID аккаунта:*\nНапишите: PO + ваш ID\nПример: PO123456789",
        "en": "🆔 *How to send account ID:*\nWrite: PO + your ID\nExample: PO123456789",
        "th": "🆔 *วิธีส่ง ID บัญชี:*\nเขียน: PO + ID ของคุณ\nตัวอย่าง: PO123456789",
        "es": "🆔 *Cómo enviar ID de cuenta:*\nEscriba: PO + su ID\nEjemplo: PO123456789",
        "ar": "🆔 *كيفية إرسال معرف الحساب:*\nاكتب: PO + معرفك\nمثال: PO123456789"
    },
    
    "help_min_deposit": {
        "ru": "💰 *Минимальный депозит:* ${}",
        "en": "💰 *Minimum deposit:* ${}",
        "th": "💰 *การฝากเงินขั้นต่ำ:* ${}",
        "es": "💰 *Depósito mínimo:* ${}",
        "ar": "💰 *الحد الأدنى للإيداع:* ${}"
    },
    
    "help_response_time": {
        "ru": "⏰ *Время ответа:* до 24 часов",
        "en": "⏰ *Response time:* up to 24 hours",
        "th": "⏰ *เวลาตอบกลับ:* สูงสุด 24 ชั่วโมง",
        "es": "⏰ *Tiempo de respuesta:* hasta 24 horas",
        "ar": "⏰ *وقت الاستجابة:* حتى 24 ساعة"
    },
    
    # Команда /status
    "status_title": {
        "ru": "📊 *ВАШ СТАТУС:*",
        "en": "📊 *YOUR STATUS:*",
        "th": "📊 *สถานะของคุณ:*",
        "es": "📊 *SU ESTADO:*",
        "ar": "📊 *حالتك:*"
    },
    
    "status_not_verified": {
        "ru": "\n\n⚠️ *Для получения доступа:*\n1. Регистрация по ссылке\n2. Пополнение ${}+\n3. Отправка ID аккаунта",
        "en": "\n\n⚠️ *To get access:*\n1. Register via link\n2. Deposit ${}+\n3. Send account ID",
        "th": "\n\n⚠️ *เพื่อเข้าถึง:*\n1. ลงทะเบียนผ่านลิงก์\n2. ฝากเงิน ${}+\n3. ส่ง ID บัญชี",
        "es": "\n\n⚠️ *Para obtener acceso:*\n1. Registrarse vía enlace\n2. Depositar ${}+\n3. Enviar ID de cuenta",
        "ar": "\n\n⚠️ *للحصول على الوصول:*\n1. التسجيل عبر الرابط\n2. إيداع ${}+\n3. إرسال معرف الحساب"
    },
    
    # Команда /language
    "language_select": {
        "ru": "🌐 *Выберите язык / Choose language*\n\nВыберите предпочитаемый язык интерфейса:",
        "en": "🌐 *Choose language / Выберите язык*\n\nSelect your preferred interface language:",
        "th": "🌐 *เลือกภาษา / Choose language*\n\nเลือกภาษาที่คุณต้องการ:",
        "es": "🌐 *Elegir idioma / Choose language*\n\nSeleccione su idioma preferido:",
        "ar": "🌐 *اختر اللغة / Choose language*\n\nحدد لغتك المفضلة:"
    },
    
    "language_changed": {
        "ru": "✅ Язык изменен на Русский",
        "en": "✅ Language changed to English",
        "th": "✅ เปลี่ยนภาษาเป็น ไทย แล้ว",
        "es": "✅ Idioma cambiado a Español",
        "ar": "✅ تم تغيير اللغة إلى العربية"
    },
    
    # Новые ключи для Web App
    "loadingInterface": {
        "ru": "Загрузка интерфейса...",
        "en": "Loading interface...",
        "th": "กำลังโหลดอินเทอร์เฟซ...",
        "es": "Cargando interfaz...",
        "ar": "جاري تحميل الواجهة..."
    },
    
    "loginError": {
        "ru": "Ошибка входа",
        "en": "Login error",
        "th": "ข้อผิดพลาดในการเข้าสู่ระบบ",
        "es": "Error de inicio de sesión",
        "ar": "خطأ في تسجيل الدخول"
    },
    
    "tryAgain": {
        "ru": "Попробовать снова",
        "en": "Try again",
        "th": "ลองอีกครั้ง",
        "es": "Intentar de nuevo",
        "ar": "حاول مرة أخرى"
    },
    
    "appName": {
        "ru": "Forex Signals Pro",
        "en": "Forex Signals Pro",
        "th": "Forex Signals Pro",
        "es": "Forex Signals Pro",
        "ar": "Forex Signals Pro"
    }
}


def t(key: str, lang: str = DEFAULT_LANGUAGE, **kwargs) -> str:
    """
    Получает перевод для указанного ключа и языка
    
    Args:
        key: Ключ перевода
        lang: Код языка (ru, en, th, es, ar)
        **kwargs: Параметры для форматирования строки
    
    Returns:
        Переведенная строка
    """
    # Проверяем валидность языка
    if lang not in LANGUAGES:
        lang = DEFAULT_LANGUAGE
    
    # Получаем перевод
    translation = TEXTS.get(key, {}).get(lang)
    
    # Если перевод не найден, используем английский как fallback
    if translation is None:
        translation = TEXTS.get(key, {}).get(DEFAULT_LANGUAGE, f"[{key}]")
    
    # Форматируем строку если есть параметры
    if kwargs:
        try:
            translation = translation.format(**kwargs)
        except (KeyError, ValueError):
            pass
    
    return translation


def get_user_language(user_id: int, users_db: Dict, telegram_lang: str = None) -> str:
    """
    Получает язык пользователя
    
    Args:
        user_id: ID пользователя
        users_db: База данных пользователей
        telegram_lang: Язык из Telegram профиля (опционально)
    
    Returns:
        Код языка
    """
    # Проверяем сохраненный язык пользователя
    if user_id in users_db and 'language' in users_db[user_id]:
        return users_db[user_id]['language']
    
    # Пытаемся использовать язык из Telegram профиля
    if telegram_lang:
        # Telegram возвращает языки в формате 'ru', 'en', 'th', 'es', 'ar' и т.д.
        if telegram_lang in LANGUAGES:
            return telegram_lang
    
    # Возвращаем язык по умолчанию
    return DEFAULT_LANGUAGE


def set_user_language(user_id: int, users_db: Dict, language: str) -> bool:
    """
    Устанавливает язык пользователя
    
    Args:
        user_id: ID пользователя
        users_db: База данных пользователей
        language: Код языка
    
    Returns:
        True если успешно, False если язык не поддерживается
    """
    if language not in LANGUAGES:
        return False
    
    if user_id not in users_db:
        users_db[user_id] = {}
    
    users_db[user_id]['language'] = language
    return True


def get_language_keyboard():
    """
    Создает клавиатуру выбора языка
    
    Returns:
        List[List[str]]: Список кнопок для InlineKeyboardMarkup
    """
    from telegram import InlineKeyboardButton
    
    buttons = []
    for lang_code, lang_info in LANGUAGES.items():
        button_text = f"{lang_info['flag']} {lang_info['name']}"
        buttons.append([InlineKeyboardButton(button_text, callback_data=f"lang_{lang_code}")])
    
    return buttons





