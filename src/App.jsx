import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { TrendingUp, TrendingDown, Copy, Clock, Target, Shield, ChevronRight, Activity, BarChart3, Settings, Sparkles, Zap, Crown, CheckCircle2, ArrowRight, Users, Globe, Brain, Lock, Star, Eye, Trash2, UserCheck, Bell, BellOff, Volume2, VolumeX, Vibrate, Mail, Newspaper } from 'lucide-react'
import { TelegramAuth } from '@/components/TelegramAuth.jsx'
import './App.css'

function App() {
  // КОНФИГУРАЦИЯ АДМИНА - ЗДЕСЬ УКАЖИ СВОЙ TELEGRAM ID
  const ADMIN_TELEGRAM_ID = '511442168' // ЗАМЕНИ НА СВОЙ РЕАЛЬНЫЙ TELEGRAM ID!
  
  // Функция для определения правильного API URL
  const getApiUrl = (port) => {
    // Временно используем localhost для тестирования
    return `http://localhost:${port}`
  }
  
  const [currentScreen, setCurrentScreen] = useState('auth') // auth, language-select, welcome, menu, market-select, mode-select, main, settings, admin, premium, user-stats, admin-user-detail, ml-selector, notifications, analytics, generating, signal-selection
  const [selectedLanguage, setSelectedLanguage] = useState(null) // ru, en, es, fr, de, it, pt, zh, ja, ko, ar, hi
  const [selectedMarket, setSelectedMarket] = useState(null) // forex, otc
  const [selectedMode, setSelectedMode] = useState(null) // top3, single
  const [activeTab, setActiveTab] = useState('active')
  const [userId, setUserId] = useState(null) // Telegram User ID
  const [isAdmin, setIsAdmin] = useState(false) // Проверяется по Telegram ID
  const [isAuthorized, setIsAuthorized] = useState(false) // Флаг успешной авторизации
  const [userData, setUserData] = useState(null) // Данные пользователя из Telegram
  const [selectedMLModel, setSelectedMLModel] = useState('logistic-spy') // shadow-stack, forest-necromancer, gray-cardinal, logistic-spy, sniper-80x
  const [selectedUser, setSelectedUser] = useState(null) // Выбранный пользователь для детальной статистики
  const [userSubscriptions, setUserSubscriptions] = useState(['logistic-spy']) // Купленные модели пользователя (по умолчанию базовая)
  const [selectedSignalForAnalysis, setSelectedSignalForAnalysis] = useState(null) // Выбранный сигнал для анализа
  const [analysisResult, setAnalysisResult] = useState(null) // Результат анализа от GPT
  const [isAnalyzing, setIsAnalyzing] = useState(false) // Флаг процесса анализа
  
  // Блокировка навигации и ожидание фидбека
  const [pendingSignal, setPendingSignal] = useState(null) // Активный сигнал ожидающий фидбека
  const [signalTimer, setSignalTimer] = useState(0) // Таймер экспирации в секундах
  const [isWaitingFeedback, setIsWaitingFeedback] = useState(false) // Флаг ожидания фидбека
  const [lastTop3Generation, setLastTop3Generation] = useState(null) // Время последней генерации ТОП-3
  const [top3Cooldown, setTop3Cooldown] = useState(0) // Оставшееся время до следующей генерации ТОП-3 в секундах
  const [lastSignalGeneration, setLastSignalGeneration] = useState({}) // Время последней генерации по парам
  const [signalCooldown, setSignalCooldown] = useState(0) // Cooldown для одиночного сигнала
  const [noSignalAvailable, setNoSignalAvailable] = useState(false) // Флаг отсутствия подходящего сигнала
  const [isGenerating, setIsGenerating] = useState(false) // Флаг процесса генерации
  const [generationStage, setGenerationStage] = useState('') // Текущая стадия генерации
  const [generatedSignals, setGeneratedSignals] = useState([]) // Сгенерированные сигналы
  const [showReloadWarning, setShowReloadWarning] = useState(false) // Предупреждение при перезагрузке
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newSignals: true,
    signalResults: true,
    dailySummary: true,
    marketNews: false,
    systemUpdates: true,
    soundEnabled: true,
    vibrationEnabled: true,
    emailNotifications: false
  })

  // User statistics data - загружается из API
  const [userStats, setUserStats] = useState({
    totalSignals: 0,
    successfulSignals: 0,
    failedSignals: 0,
    winRate: 0.0,
    bestPair: 'N/A',
    worstPair: 'N/A',
    tradingDays: 0,
    avgSignalsPerDay: 0.0,
    signalsByMonth: []
  })

  // Market metrics - реальные данные по парам
  const [marketMetrics, setMarketMetrics] = useState({
    forex: [],
    otc: []
  })

  // User signals history - история сигналов пользователя для аналитики
  const [userSignalsHistory, setUserSignalsHistory] = useState([])

  // Загрузка метрик рынка
  const loadMarketMetrics = async () => {
    try {
      console.log('📊 Загружаем метрики рынка...')
      
      const response = await fetch(`${getApiUrl(5002)}/api/signal/market-metrics`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Получены метрики рынка:', data)
        
        setMarketMetrics({
          forex: data.forex || [],
          otc: data.otc || []
        })
      } else {
        console.error('❌ Ошибка загрузки метрик:', response.status)
        // Fallback - пустые массивы
        setMarketMetrics({
          forex: [],
          otc: []
        })
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки метрик:', error)
      // Fallback - пустые массивы
      setMarketMetrics({
        forex: [],
        otc: []
      })
    }
  }

  // Загрузка реальной статистики конкретного пользователя из API
  const loadUserStats = async () => {
    try {
      console.log('📊 Загружаем статистику пользователя:', userId)
      
      const response = await fetch(`${getApiUrl(5000)}/api/user/stats?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Получена статистика пользователя:', data)
        
        setUserStats({
          totalSignals: data.total_signals || 0,
          successfulSignals: data.successful_signals || 0,
          failedSignals: data.failed_signals || 0,
          winRate: data.win_rate || 0.0,
          bestPair: data.best_pair || 'N/A',
          worstPair: data.worst_pair || 'N/A',
          tradingDays: data.trading_days || 0,
          avgSignalsPerDay: data.avg_signals_per_day || 0.0,
          signalsByMonth: data.signals_by_month || []
        })
      } else {
        console.error('❌ Ошибка загрузки статистики:', response.status)
        // Fallback - пустая статистика
        setUserStats({
          totalSignals: 0,
          successfulSignals: 0,
          failedSignals: 0,
          winRate: 0.0,
          bestPair: 'N/A',
          worstPair: 'N/A',
          tradingDays: 0,
          avgSignalsPerDay: 0.0,
          signalsByMonth: []
        })
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error)
      // Fallback - пустая статистика
      setUserStats({
        totalSignals: 0,
        successfulSignals: 0,
        failedSignals: 0,
        winRate: 0.0,
        bestPair: 'N/A',
        worstPair: 'N/A',
        tradingDays: 0,
        avgSignalsPerDay: 0.0,
        signalsByMonth: []
      })
    }
  }

  // Загрузка истории сигналов пользователя для аналитики
  const loadUserSignalsHistory = async () => {
    try {
      console.log('📊 Загружаем историю сигналов пользователя:', userId)
      
      const response = await fetch(`${getApiUrl(5000)}/api/user/signals-history?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Получена история сигналов:', data)
        
        setUserSignalsHistory(data.signals || [])
      } else {
        console.error('❌ Ошибка загрузки истории сигналов:', response.status)
        // Fallback - пустая история
        setUserSignalsHistory([])
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки истории сигналов:', error)
      // Fallback - пустая история
      setUserSignalsHistory([])
    }
  }


  // Translations
  const translations = {
    ru: {
      welcome: 'Добро пожаловать',
      selectLanguage: 'Выберите язык',
      continue: 'Продолжить',
      start: 'Начать',
      menu: 'Меню',
      tradingSignals: 'Торговые сигналы',
      analytics: 'Аналитика',
      community: 'Сообщество',
      settings: 'Настройки',
      premium: 'Премиум ML',
      selectMarket: 'Выберите рынок',
      selectMode: 'Режим генерации',
      top3Signals: 'ТОП-3 сигнала',
      singleSignals: 'Одиночные сигналы',
      active: 'Активные',
      history: 'История',
      back: 'Назад',
      admin: 'Админ-панель',
      buy: 'Купить',
      monthly: 'Ежемесячно',
      lifetime: 'Пожизненно',
      welcomeTo: 'Добро пожаловать в',
      premiumSignals: 'Премиум сигналы для профессионального трейдинга',
      accurateSignals: 'Точные сигналы',
      successfulTrades: '87% успешных сделок',
      instantNotifications: 'Мгновенные уведомления',
      realTimeSignals: 'Получайте сигналы в реальном времени',
      premiumQuality: 'Премиум качество',
      professionalAnalysis: 'Профессиональный анализ рынка',
      whatSignals: 'Какие сигналы вы хотите получать?',
      forexSchedule: 'Расписание Forex рынка',
      catalogPrivate: 'КАТАЛОГ ПРИВАТНЫХ ML-МОДЕЛЕЙ',
      onlyForInsiders: 'Только для своих. Доступ по рукам.',
      consciousRisk: 'Каждый вход — осознанный риск.',
      activeModel: 'АКТИВНАЯ',
      model: 'МОДЕЛЬ:',
      modelReady: 'Модель обучена и готова к работе'
    },
    en: {
      welcome: 'Welcome',
      selectLanguage: 'Select Language',
      continue: 'Continue',
      start: 'Start',
      menu: 'Menu',
      tradingSignals: 'Trading Signals',
      analytics: 'Analytics',
      community: 'Community',
      settings: 'Settings',
      premium: 'Premium ML',
      selectMarket: 'Select Market',
      selectMode: 'Generation Mode',
      top3Signals: 'TOP-3 Signals',
      singleSignals: 'Single Signals',
      active: 'Active',
      history: 'History',
      back: 'Back',
      admin: 'Admin Panel',
      buy: 'Buy',
      monthly: 'Monthly',
      lifetime: 'Lifetime',
      welcomeTo: 'Welcome to',
      premiumSignals: 'Premium signals for professional trading',
      accurateSignals: 'Accurate signals',
      successfulTrades: '87% successful trades',
      instantNotifications: 'Instant notifications',
      realTimeSignals: 'Get signals in real time',
      premiumQuality: 'Premium quality',
      professionalAnalysis: 'Professional market analysis',
      whatSignals: 'What signals do you want to receive?',
      forexSchedule: 'Forex market schedule',
      catalogPrivate: 'PRIVATE ML-MODELS CATALOG',
      onlyForInsiders: 'Only for insiders. Access by hand.',
      consciousRisk: 'Every entry is a conscious risk.',
      activeModel: 'ACTIVE',
      model: 'MODEL:',
      modelReady: 'Model trained and ready for work'
    },
    th: {
      welcome: 'ยินดีต้อนรับ',
      selectLanguage: 'เลือกภาษา',
      continue: 'ดำเนินการต่อ',
      start: 'เริ่ม',
      menu: 'เมนู',
      tradingSignals: 'สัญญาณการซื้อขาย',
      analytics: 'การวิเคราะห์',
      community: 'ชุมชน',
      settings: 'การตั้งค่า',
      premium: 'พรีเมียม ML',
      selectMarket: 'เลือกตลาด',
      selectMode: 'โหมดการสร้าง',
      top3Signals: 'สัญญาณยอดนิยม 3 อันดับ',
      singleSignals: 'สัญญาณเดี่ยว',
      active: 'ใช้งานอยู่',
      history: 'ประวัติ',
      back: 'กลับ',
      admin: 'แผงผู้ดูแลระบบ',
      buy: 'ซื้อ',
      monthly: 'รายเดือน',
      lifetime: 'ตลอดชีพ',
      welcomeTo: 'ยินดีต้อนรับสู่',
      premiumSignals: 'สัญญาณพรีเมียมสำหรับการเทรดมืออาชีพ',
      accurateSignals: 'สัญญาณที่แม่นยำ',
      successfulTrades: '87% ของการเทรดสำเร็จ',
      instantNotifications: 'การแจ้งเตือนทันที',
      realTimeSignals: 'รับสัญญาณแบบเรียลไทม์',
      premiumQuality: 'คุณภาพพรีเมียม',
      professionalAnalysis: 'การวิเคราะห์ตลาดแบบมืออาชีพ',
      whatSignals: 'คุณต้องการรับสัญญาณแบบไหน?',
      forexSchedule: 'ตารางตลาด Forex',
      catalogPrivate: 'แคตตาล็อก ML-โมเดลส่วนตัว',
      onlyForInsiders: 'สำหรับคนในเท่านั้น ต้องเข้าถึงด้วยมือ',
      consciousRisk: 'ทุกการเข้าเป็นความเสี่ยงที่รู้ตัว',
      activeModel: 'ใช้งานอยู่',
      model: 'โมเดล:',
      modelReady: 'โมเดลได้รับการฝึกฝนและพร้อมใช้งาน'
    },
    es: {
      welcome: 'Bienvenido',
      selectLanguage: 'Seleccionar Idioma',
      continue: 'Continuar',
      start: 'Comenzar',
      menu: 'Menú',
      tradingSignals: 'Señales de Trading',
      analytics: 'Analíticas',
      community: 'Comunidad',
      settings: 'Configuración',
      premium: 'ML Premium',
      selectMarket: 'Seleccionar Mercado',
      selectMode: 'Modo de Generación',
      top3Signals: 'TOP-3 Señales',
      singleSignals: 'Señales Individuales',
      active: 'Activo',
      history: 'Historial',
      back: 'Atrás',
      admin: 'Panel Admin',
      buy: 'Comprar',
      monthly: 'Mensual',
      lifetime: 'De por vida'
    },
    fr: {
      welcome: 'Bienvenue',
      selectLanguage: 'Sélectionner la langue',
      continue: 'Continuer',
      start: 'Commencer',
      menu: 'Menu',
      tradingSignals: 'Signaux de trading',
      analytics: 'Analytique',
      community: 'Communauté',
      settings: 'Paramètres',
      premium: 'ML Premium',
      selectMarket: 'Sélectionner le marché',
      selectMode: 'Mode de génération',
      top3Signals: 'TOP-3 Signaux',
      singleSignals: 'Signaux uniques',
      active: 'Actif',
      history: 'Historique',
      back: 'Retour',
      admin: 'Panneau Admin',
      buy: 'Acheter',
      monthly: 'Mensuel',
      lifetime: 'À vie'
    },
    de: {
      welcome: 'Willkommen',
      selectLanguage: 'Sprache wählen',
      continue: 'Weiter',
      start: 'Start',
      menu: 'Menü',
      tradingSignals: 'Handelssignale',
      analytics: 'Analytik',
      community: 'Gemeinschaft',
      settings: 'Einstellungen',
      premium: 'Premium ML',
      selectMarket: 'Markt wählen',
      selectMode: 'Generierungsmodus',
      top3Signals: 'TOP-3 Signale',
      singleSignals: 'Einzelsignale',
      active: 'Aktiv',
      history: 'Verlauf',
      back: 'Zurück',
      admin: 'Admin-Panel',
      buy: 'Kaufen',
      monthly: 'Monatlich',
      lifetime: 'Lebenslang'
    },
    it: {
      welcome: 'Benvenuto',
      selectLanguage: 'Seleziona lingua',
      continue: 'Continua',
      start: 'Inizia',
      menu: 'Menu',
      tradingSignals: 'Segnali di trading',
      analytics: 'Analisi',
      community: 'Comunità',
      settings: 'Impostazioni',
      premium: 'ML Premium',
      selectMarket: 'Seleziona mercato',
      selectMode: 'Modalità di generazione',
      top3Signals: 'TOP-3 Segnali',
      singleSignals: 'Segnali singoli',
      active: 'Attivo',
      history: 'Cronologia',
      back: 'Indietro',
      admin: 'Pannello Admin',
      buy: 'Acquista',
      monthly: 'Mensile',
      lifetime: 'A vita'
    },
    pt: {
      welcome: 'Bem-vindo',
      selectLanguage: 'Selecionar idioma',
      continue: 'Continuar',
      start: 'Começar',
      menu: 'Menu',
      tradingSignals: 'Sinais de trading',
      analytics: 'Análises',
      community: 'Comunidade',
      settings: 'Configurações',
      premium: 'ML Premium',
      selectMarket: 'Selecionar mercado',
      selectMode: 'Modo de geração',
      top3Signals: 'TOP-3 Sinais',
      singleSignals: 'Sinais únicos',
      active: 'Ativo',
      history: 'Histórico',
      back: 'Voltar',
      admin: 'Painel Admin',
      buy: 'Comprar',
      monthly: 'Mensal',
      lifetime: 'Vitalício'
    },
    zh: {
      welcome: '欢迎',
      selectLanguage: '选择语言',
      continue: '继续',
      start: '开始',
      menu: '菜单',
      tradingSignals: '交易信号',
      analytics: '分析',
      community: '社区',
      settings: '设置',
      premium: '高级 ML',
      selectMarket: '选择市场',
      selectMode: '生成模式',
      top3Signals: '前3信号',
      singleSignals: '单一信号',
      active: '活跃',
      history: '历史',
      back: '返回',
      admin: '管理面板',
      buy: '购买',
      monthly: '每月',
      lifetime: '终身'
    },
    ja: {
      welcome: 'ようこそ',
      selectLanguage: '言語を選択',
      continue: '続ける',
      start: '開始',
      menu: 'メニュー',
      tradingSignals: '取引シグナル',
      analytics: '分析',
      community: 'コミュニティ',
      settings: '設定',
      premium: 'プレミアム ML',
      selectMarket: '市場を選択',
      selectMode: '生成モード',
      top3Signals: 'トップ3シグナル',
      singleSignals: '単一シグナル',
      active: 'アクティブ',
      history: '履歴',
      back: '戻る',
      admin: '管理パネル',
      buy: '購入',
      monthly: '毎月',
      lifetime: '生涯'
    },
    ko: {
      welcome: '환영합니다',
      selectLanguage: '언어 선택',
      continue: '계속',
      start: '시작',
      menu: '메뉴',
      tradingSignals: '거래 신호',
      analytics: '분석',
      community: '커뮤니티',
      settings: '설정',
      premium: '프리미엄 ML',
      selectMarket: '시장 선택',
      selectMode: '생성 모드',
      top3Signals: '상위 3개 신호',
      singleSignals: '단일 신호',
      active: '활성',
      history: '기록',
      back: '뒤로',
      admin: '관리자 패널',
      buy: '구매',
      monthly: '월간',
      lifetime: '평생'
    },
    ar: {
      welcome: 'مرحبا',
      selectLanguage: 'اختر اللغة',
      continue: 'متابعة',
      start: 'ابدأ',
      menu: 'القائمة',
      tradingSignals: 'إشارات التداول',
      analytics: 'التحليلات',
      community: 'المجتمع',
      settings: 'الإعدادات',
      premium: 'بريميوم ML',
      selectMarket: 'اختر السوق',
      selectMode: 'وضع التوليد',
      top3Signals: 'أفضل 3 إشارات',
      singleSignals: 'إشارات فردية',
      active: 'نشط',
      history: 'التاريخ',
      back: 'رجوع',
      admin: 'لوحة المشرف',
      buy: 'شراء',
      monthly: 'شهري',
      lifetime: 'مدى الحياة'
    },
    hi: {
      welcome: 'स्वागत है',
      selectLanguage: 'भाषा चुनें',
      continue: 'जारी रखें',
      start: 'शुरू करें',
      menu: 'मेनू',
      tradingSignals: 'ट्रेडिंग सिग्नल',
      analytics: 'विश्लेषण',
      community: 'समुदाय',
      settings: 'सेटिंग्स',
      premium: 'प्रीमियम ML',
      selectMarket: 'बाजार चुनें',
      selectMode: 'जनरेशन मोड',
      top3Signals: 'शीर्ष 3 सिग्नल',
      singleSignals: 'एकल सिग्नल',
      active: 'सक्रिय',
      history: 'इतिहास',
      back: 'वापस',
      admin: 'एडमिन पैनल',
      buy: 'खरीदें',
      monthly: 'मासिक',
      lifetime: 'आजीवन'
    },
    tr: {
      welcome: 'Hoş geldiniz',
      selectLanguage: 'Dil seçin',
      continue: 'Devam',
      start: 'Başla',
      menu: 'Menü',
      tradingSignals: 'Alım satım sinyalleri',
      analytics: 'Analitik',
      community: 'Topluluk',
      settings: 'Ayarlar',
      premium: 'Premium ML',
      selectMarket: 'Pazar seçin',
      selectMode: 'Üretim modu',
      top3Signals: 'İlk 3 Sinyal',
      singleSignals: 'Tekli sinyaller',
      active: 'Aktif',
      history: 'Geçmiş',
      back: 'Geri',
      admin: 'Yönetici Paneli',
      buy: 'Satın al',
      monthly: 'Aylık',
      lifetime: 'Ömür boyu'
    },
    vi: {
      welcome: 'Chào mừng',
      selectLanguage: 'Chọn ngôn ngữ',
      continue: 'Tiếp tục',
      start: 'Bắt đầu',
      menu: 'Menu',
      tradingSignals: 'Tín hiệu giao dịch',
      analytics: 'Phân tích',
      community: 'Cộng đồng',
      settings: 'Cài đặt',
      premium: 'ML Cao cấp',
      selectMarket: 'Chọn thị trường',
      selectMode: 'Chế độ tạo',
      top3Signals: 'TOP-3 Tín hiệu',
      singleSignals: 'Tín hiệu đơn',
      active: 'Hoạt động',
      history: 'Lịch sử',
      back: 'Quay lại',
      admin: 'Bảng quản trị',
      buy: 'Mua',
      monthly: 'Hàng tháng',
      lifetime: 'Trọn đời'
    },
    id: {
      welcome: 'Selamat datang',
      selectLanguage: 'Pilih bahasa',
      continue: 'Lanjutkan',
      start: 'Mulai',
      menu: 'Menu',
      tradingSignals: 'Sinyal trading',
      analytics: 'Analitik',
      community: 'Komunitas',
      settings: 'Pengaturan',
      premium: 'ML Premium',
      selectMarket: 'Pilih pasar',
      selectMode: 'Mode generasi',
      top3Signals: 'TOP-3 Sinyal',
      singleSignals: 'Sinyal tunggal',
      active: 'Aktif',
      history: 'Riwayat',
      back: 'Kembali',
      admin: 'Panel Admin',
      buy: 'Beli',
      monthly: 'Bulanan',
      lifetime: 'Seumur hidup'
    }
  }

  const t = (key) => {
    const lang = selectedLanguage || 'ru'
    return translations[lang]?.[key] || translations.ru[key] || key
  }

  // Mock data for signals
  const activeSignals = [
    {
      id: 1,
      pair: 'EUR/USD',
      type: 'BUY',
      entry: '1.0850',
      tp: ['1.0900', '1.0950', '1.1000'],
      sl: '1.0800',
      status: 'active',
      time: '2 часа назад',
      progress: 60,
      confidence: 0.87
    },
    {
      id: 2,
      pair: 'GBP/JPY',
      type: 'SELL',
      entry: '188.50',
      tp: ['188.00', '187.50', '187.00'],
      sl: '189.00',
      status: 'active',
      time: '5 часов назад',
      progress: 30,
      confidence: 0.82
    },
    {
      id: 3,
      pair: 'USD/JPY',
      type: 'BUY',
      entry: '149.80',
      tp: ['150.20', '150.50', '150.80'],
      sl: '149.50',
      status: 'pending',
      time: '1 час назад',
      progress: 0,
      confidence: 0.79
    }
  ]

  const historySignals = [
    {
      signal_id: "otc_EUR_USD_1758239200",
      id: 1,
      pair: 'EUR/USD (OTC)',
      type: 'SELL',
      direction: 'SELL',
      entry: '1.0850',
      tp: ['1.0800', '1.0750'],
      sl: '1.0900',
      closePrice: '1.0920',
      confidence: 0.7426,
      expiration: 3,
      signal_type: 'otc',
      timestamp: '2025-10-10T14:30:00',
      feedback: 'failure',
      result: 'loss',
      time: '2 дня назад'
    },
    {
      signal_id: "otc_GBP_JPY_1758240100",
      id: 2,
      pair: 'GBP/JPY (OTC)',
      type: 'BUY',
      direction: 'BUY',
      entry: '188.50',
      tp: ['189.00', '189.50'],
      sl: '188.00',
      closePrice: '189.30',
      confidence: 0.8215,
      expiration: 4,
      signal_type: 'otc',
      timestamp: '2025-10-10T16:45:00',
      feedback: 'success',
      result: 'profit',
      time: '2 дня назад'
    },
    {
      signal_id: "forex_EUR_USD_1758241500",
      id: 3,
      pair: 'EUR/USD',
      type: 'BUY',
      direction: 'BUY',
      entry: '1.0920',
      tp: ['1.0970', '1.1020'],
      sl: '1.0870',
      closePrice: '1.0860',
      confidence: 0.7891,
      expiration: 60,
      signal_type: 'forex',
      timestamp: '2025-10-11T09:20:00',
      feedback: 'failure',
      result: 'loss',
      time: '1 день назад'
    },
    {
      signal_id: "forex_USD_JPY_1758242800",
      id: 4,
      pair: 'USD/JPY',
      type: 'SELL',
      direction: 'SELL',
      entry: '149.80',
      tp: ['149.30', '148.80'],
      sl: '150.30',
      closePrice: '149.20',
      confidence: 0.8542,
      expiration: 90,
      signal_type: 'forex',
      timestamp: '2025-10-11T12:00:00',
      feedback: 'success',
      result: 'profit',
      time: '1 день назад'
    },
    {
      signal_id: "otc_XAU_USD_1758244200",
      id: 5,
      pair: 'XAU/USD (OTC)',
      type: 'BUY',
      direction: 'BUY',
      entry: '2650.00',
      tp: ['2680.00', '2700.00'],
      sl: '2630.00',
      closePrice: '2625.00',
      confidence: 0.7654,
      expiration: 5,
      signal_type: 'otc',
      timestamp: '2025-10-11T18:30:00',
      feedback: 'failure',
      result: 'loss',
      time: '12 часов назад'
    },
    {
      signal_id: "forex_GBP_USD_1758245600",
      id: 6,
      pair: 'GBP/USD',
      type: 'SELL',
      direction: 'SELL',
      entry: '1.2850',
      tp: ['1.2800', '1.2750'],
      sl: '1.2900',
      closePrice: '1.2790',
      confidence: 0.8123,
      expiration: 120,
      signal_type: 'forex',
      timestamp: '2025-10-12T08:00:00',
      feedback: 'success',
      result: 'profit',
      time: '6 часов назад'
    }
  ]

  const copyToClipboard = (signal) => {
    const text = `${signal.pair} ${signal.type}`
    navigator.clipboard.writeText(text)
  }

  // Language data
  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' }
  ]

  // ML Models data
  const mlModels = [
    {
      id: 'shadow-stack',
      name: 'ТЕНЕВОЙ СТЕК',
      emoji: '🌑',
      algorithm: 'Ensemble (RandomForest, XGBoost, ExtraTrees, HistGB, LogisticRegression)',
      winrate: '65-70%',
      description: 'Не палится, не лагает, не брешет. Просто делает грязь.',
      style: 'Среднесрок, интрадей',
      status: 'available',
      color: 'from-slate-600 to-slate-800',
      price: '$299',
      monthlyPrice: '$49',
      lifetimePrice: '$299'
    },
    {
      id: 'forest-necromancer',
      name: 'ЛЕСНОЙ НЕКРОМАНТ',
      emoji: '🌲',
      algorithm: 'RandomForest - Призванный из леса решений',
      winrate: '62-67%',
      description: 'С виду ботаник, по факту шаман рынков.',
      style: 'Информер с визуализацией импульсных зон',
      status: 'available',
      color: 'from-green-600 to-green-800',
      price: '$199',
      monthlyPrice: '$29',
      lifetimePrice: '$199'
    },
    {
      id: 'gray-cardinal',
      name: 'СЕРЫЙ КАРДИНАЛ',
      emoji: '🎭',
      algorithm: 'XGBoost - Не на слуху, зато всё под контролем',
      winrate: '~66%',
      description: 'Ты его не видишь, но он знает твой вход раньше тебя.',
      style: 'Сигналы на младших ТФ, с доп. фильтрами',
      status: 'available',
      color: 'from-gray-600 to-gray-800',
      price: '$249',
      monthlyPrice: '$39',
      lifetimePrice: '$249'
    },
    {
      id: 'logistic-spy',
      name: 'ЛОГИСТИЧЕСКИЙ ШПИОН',
      emoji: '🕵️',
      algorithm: 'LogisticRegression - Классик в мире ML',
      winrate: '~60-65%',
      description: 'Старая школа, но знает все ходы.',
      style: 'Консервативный, проверенный временем',
      status: 'active',
      color: 'from-blue-600 to-blue-800',
      price: '$99',
      monthlyPrice: '$19',
      lifetimePrice: '$99'
    },
    {
      id: 'sniper-80x',
      name: 'СНАЙПЕР 80Х',
      emoji: '🔫',
      algorithm: 'Финальная модель - Легенда среди своих',
      winrate: '80%+',
      description: 'Запускаешь — и рынок замолкает. Один вход — один труп.',
      style: 'Точный вход, позиционный, иногда скальп',
      status: 'restricted',
      color: 'from-red-600 to-red-800',
      warning: 'Только по команде. Авто не включается.',
      price: '$999',
      monthlyPrice: '$199',
      lifetimePrice: '$999'
    }
  ]

  // Mock admin data
  const adminStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalSignals: 15420,
    successfulSignals: 13461,
    failedSignals: 1959,
    newUsersToday: 23,
    topUsers: [
      { 
        id: 1, 
        name: 'User_001', 
        signals: 156, 
        successful: 139, 
        failed: 17,
        winRate: 89.1,
        bestPair: 'EUR/USD',
        worstPair: 'GBP/JPY',
        tradingDays: 42,
        avgSignalsPerDay: 3.7,
        signalsByMonth: [
          { month: 'Янв', successful: 21, failed: 2 },
          { month: 'Фев', successful: 23, failed: 3 },
          { month: 'Мар', successful: 24, failed: 3 },
          { month: 'Апр', successful: 25, failed: 4 },
          { month: 'Май', successful: 26, failed: 3 },
          { month: 'Июнь', successful: 20, failed: 2 }
        ]
      },
      { 
        id: 2, 
        name: 'Trader_Pro', 
        signals: 203, 
        successful: 185, 
        failed: 18,
        winRate: 91.1,
        bestPair: 'USD/JPY',
        worstPair: 'AUD/CAD',
        tradingDays: 55,
        avgSignalsPerDay: 3.7,
        signalsByMonth: [
          { month: 'Янв', successful: 28, failed: 2 },
          { month: 'Фев', successful: 31, failed: 3 },
          { month: 'Мар', successful: 33, failed: 4 },
          { month: 'Апр', successful: 30, failed: 3 },
          { month: 'Май', successful: 32, failed: 3 },
          { month: 'Июнь', successful: 31, failed: 3 }
        ]
      },
      { 
        id: 3, 
        name: 'FX_Master', 
        signals: 134, 
        successful: 116, 
        failed: 18,
        winRate: 86.6,
        bestPair: 'GBP/USD',
        worstPair: 'EUR/JPY',
        tradingDays: 38,
        avgSignalsPerDay: 3.5,
        signalsByMonth: [
          { month: 'Янв', successful: 18, failed: 3 },
          { month: 'Фев', successful: 20, failed: 3 },
          { month: 'Мар', successful: 19, failed: 3 },
          { month: 'Апр', successful: 21, failed: 3 },
          { month: 'Май', successful: 20, failed: 3 },
          { month: 'Июнь', successful: 18, failed: 3 }
        ]
      },
      { 
        id: 4, 
        name: 'Signal_Hunter', 
        signals: 178, 
        successful: 158, 
        failed: 20,
        winRate: 88.8,
        bestPair: 'EUR/GBP',
        worstPair: 'USD/CAD',
        tradingDays: 48,
        avgSignalsPerDay: 3.7,
        signalsByMonth: [
          { month: 'Янв', successful: 24, failed: 3 },
          { month: 'Фев', successful: 26, failed: 3 },
          { month: 'Мар', successful: 28, failed: 4 },
          { month: 'Апр', successful: 27, failed: 4 },
          { month: 'Май', successful: 28, failed: 3 },
          { month: 'Июнь', successful: 25, failed: 3 }
        ]
      },
      { 
        id: 5, 
        name: 'Forex_King', 
        signals: 245, 
        successful: 221, 
        failed: 24,
        winRate: 90.2,
        bestPair: 'USD/CHF',
        worstPair: 'NZD/USD',
        tradingDays: 62,
        avgSignalsPerDay: 4.0,
        signalsByMonth: [
          { month: 'Янв', successful: 35, failed: 4 },
          { month: 'Фев', successful: 38, failed: 4 },
          { month: 'Мар', successful: 37, failed: 4 },
          { month: 'Апр', successful: 39, failed: 4 },
          { month: 'Май', successful: 38, failed: 4 },
          { month: 'Июнь', successful: 34, failed: 4 }
        ]
      }
    ]
  }

  const deleteUser = (userId) => {
    // В реальном приложении здесь будет API запрос
    console.log(`Удаление пользователя ${userId}`)
    alert(`Пользователь ${userId} удалён из бота`)
  }

  // Функция анализа сигнала через OpenRouter GPT-4o mini
  const analyzeSignal = async (signal) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    const isLoss = signal.result === 'loss' || signal.feedback === 'failure'
    
    const prompt = `Ты строгий профессиональный аналитик Forex/OTC рынка. Проанализируй ${isLoss ? 'УБЫТОЧНУЮ' : 'успешную'} сделку трейдера.

⚠️ КРИТИЧЕСКИ ВАЖНО: ${isLoss ? 'Всегда указывай что это ВИНА ТРЕЙДЕРА (неправильный вход, плохое управление рисками, эмоциональное решение), а НЕ рынка или сигнала!' : 'Покажи что трейдер правильно применил стратегию.'}

📊 ДАННЫЕ СДЕЛКИ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID сигнала: ${signal.signal_id}
Валютная пара: ${signal.pair}
Тип рынка: ${signal.signal_type === 'otc' ? 'OTC (внебиржевой)' : 'Forex'}
Направление: ${signal.direction}
Точка входа: ${signal.entry}
Take Profit: ${signal.tp.join(', ')}
Stop Loss: ${signal.sl}
Цена закрытия: ${signal.closePrice}
Уверенность сигнала: ${(signal.confidence * 100).toFixed(1)}%
Экспирация: ${signal.expiration} мин
Время сделки: ${signal.timestamp}
Результат: ${isLoss ? '❌ УБЫТОК' : '✅ ПРИБЫЛЬ'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${isLoss ? `
🔴 АНАЛИЗ УБЫТОЧНОЙ СДЕЛКИ:

1️⃣ ЧТО ТРЕЙДЕР СДЕЛАЛ НЕПРАВИЛЬНО:
- Опиши конкретные ошибки трейдера при входе
- Почему трейдер не дождался лучшего момента
- Какие признаки разворота тренда проигнорировал

2️⃣ ОШИБКИ УПРАВЛЕНИЯ РИСКАМИ:
- Почему Stop Loss был установлен неправильно
- Как трейдер должен был защитить депозит
- Проблемы с размером позиции

3️⃣ ПСИХОЛОГИЧЕСКИЕ ОШИБКИ:
- Эмоциональное принятие решений
- FOMO (страх упустить прибыль)
- Жадность или паника при закрытии

4️⃣ РЕКОМЕНДАЦИИ:
- Что трейдер ОБЯЗАН изменить в своём подходе
- Как избежать таких ошибок в будущем
- Чему нужно научиться

⚠️ ВАЖНО: Покажи что сигнал был качественным (${(signal.confidence * 100).toFixed(1)}% уверенности), но ТРЕЙДЕР не смог его правильно использовать!
` : `
✅ АНАЛИЗ УСПЕШНОЙ СДЕЛКИ:

1️⃣ ЧТО ТРЕЙДЕР СДЕЛАЛ ПРАВИЛЬНО:
- Правильный вход по тренду
- Грамотное управление рисками
- Дисциплина в следовании стратегии

2️⃣ КЛЮЧЕВЫЕ ФАКТОРЫ УСПЕХА:
- Правильный анализ рынка
- Терпение при входе
- Соблюдение Stop Loss и Take Profit

3️⃣ РЕКОМЕНДАЦИИ:
- Продолжать использовать этот подход
- Масштабировать успешные стратегии
`}

Тон: СТРОГИЙ, ПРЯМОЙ, ПРОФЕССИОНАЛЬНЫЙ. Минимум воды, максимум конкретики!`

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Forex Signals Pro'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      const data = await response.json()
      
      if (data.choices && data.choices[0]) {
        setAnalysisResult(data.choices[0].message.content)
      } else {
        setAnalysisResult('Ошибка получения анализа. Проверьте API ключ.')
      }
    } catch (error) {
      console.error('Ошибка анализа:', error)
      setAnalysisResult('Ошибка подключения к OpenRouter API')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleNotification = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Авторизация через бэкенд API
  const authorizeUser = async (userData, initData = '') => {
    try {
      // Показываем процесс авторизации минимум 2 секунды
      const startTime = Date.now()
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initData: initData,
          userData: userData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const user = result.user
        
        // Сохраняем данные пользователя
        setUserId(user.telegram_id)
        setUserData({
          id: user.telegram_id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code,
          isPremium: user.is_premium
        })
        
        // Устанавливаем админские права
        setIsAdmin(user.is_admin)
        
        // Загружаем подписки
        setUserSubscriptions(user.subscriptions || ['logistic-spy'])
        
        // Успешная авторизация
        setIsAuthorized(true)
        
        console.log('✅ Авторизация через API успешна:', user.first_name)
        
        if (user.is_new_user) {
          console.log('🆕 Новый пользователь зарегистрирован!')
        }
        
        // Ждем минимум 2 секунды для показа экрана авторизации
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(2000 - elapsed, 0)
        
        await new Promise(resolve => setTimeout(resolve, remainingTime))
        
        // Проверяем сохраненный язык
        const savedLanguage = localStorage.getItem('selectedLanguage')
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage)
          setCurrentScreen('welcome')
        } else {
          setCurrentScreen('language-select')
        }
        
        // Проверяем активный сигнал после авторизации
        const savedSignal = localStorage.getItem('pendingSignal')
        if (savedSignal) {
          const signal = JSON.parse(savedSignal)
          const startTime = parseInt(localStorage.getItem('signalStartTime')) || Date.now()
          const waitingFeedback = localStorage.getItem('isWaitingFeedback') === 'true'
          
          // Восстанавливаем время начала
          signal.startTime = startTime
          
          // Рассчитываем оставшееся время на основе реального времени
          const remainingTime = calculateRemainingTime(signal)
          
          if (remainingTime > 0) {
            setPendingSignal(signal)
            setSignalTimer(remainingTime)
            setIsWaitingFeedback(waitingFeedback)
            setShowReloadWarning(true)
            setCurrentScreen('main')
          } else {
            // Время истекло, показываем фидбек
            setPendingSignal(signal)
            setSignalTimer(0)
            setIsWaitingFeedback(true)
            setShowReloadWarning(true)
            setCurrentScreen('main')
          }
        }
      } else {
        console.error('❌ Ошибка авторизации:', result.error)
        setIsAuthorized(false)
      }
    } catch (error) {
      console.error('❌ Ошибка подключения к API:', error)
      // В режиме разработки разрешаем доступ без бэкенда
      console.warn('⚠️ Работа без бэкенда (режим разработки)')
      
      // Показываем экран авторизации минимум 2 секунды
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsAuthorized(true)
      
      const savedLanguage = localStorage.getItem('selectedLanguage')
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage)
        setCurrentScreen('welcome')
      } else {
        setCurrentScreen('language-select')
      }
      
      // Проверяем активный сигнал после авторизации
      const savedSignal = localStorage.getItem('pendingSignal')
      if (savedSignal) {
        const signal = JSON.parse(savedSignal)
        const startTime = parseInt(localStorage.getItem('signalStartTime')) || Date.now()
        const waitingFeedback = localStorage.getItem('isWaitingFeedback') === 'true'
        
        // Восстанавливаем время начала
        signal.startTime = startTime
        
        // Рассчитываем оставшееся время на основе реального времени
        const remainingTime = calculateRemainingTime(signal)
        
        if (remainingTime > 0) {
          setPendingSignal(signal)
          setSignalTimer(remainingTime)
          setIsWaitingFeedback(waitingFeedback)
          setShowReloadWarning(true)
          setCurrentScreen('main')
        } else {
          // Время истекло, показываем фидбек
          setPendingSignal(signal)
          setSignalTimer(0)
          setIsWaitingFeedback(true)
          setShowReloadWarning(true)
          setCurrentScreen('main')
        }
      }
    }
  }

  // Получение Telegram User ID и авторизация
  // ОТКЛЮЧЕНО: Логика перенесена в компонент TelegramAuth
  /*
  useEffect(() => {
    console.log('🔍 Проверка Telegram WebApp...')
    
    // Ждем загрузки Telegram SDK
    const initTelegramAuth = () => {
      // Проверяем, запущено ли приложение в Telegram WebApp
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp
        
        console.log('✅ Telegram WebApp SDK загружен')
        console.log('📱 Platform:', tg.platform)
        console.log('🎨 Theme:', tg.colorScheme)
        
        tg.ready()
        tg.expand() // Разворачиваем приложение на весь экран
        
        // Получаем данные пользователя
        const user = tg.initDataUnsafe?.user
        const initData = tg.initData
        
        console.log('👤 User data:', user)
        console.log('🔐 Init data length:', initData?.length || 0)
        
        if (user) {
          console.log(`✅ Пользователь найден: ${user.first_name} (ID: ${user.id})`)
          
          // Авторизуемся через бэкенд
          authorizeUser({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name || '',
            username: user.username || '',
            language_code: user.language_code || 'ru',
            is_premium: user.is_premium || false
          }, initData)
        } else {
          // Нет данных пользователя
          console.error('❌ Не удалось получить данные пользователя из Telegram')
          console.log('initDataUnsafe:', tg.initDataUnsafe)
          
          // Пробуем режим разработки
          console.warn('⚠️ Переход в режим разработки...')
          const testUserData = {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'ru',
            is_premium: false
          }
          authorizeUser(testUserData)
        }
      } else {
        // Для тестирования вне Telegram (в браузере)
        console.warn('⚠️ Приложение не запущено в Telegram WebApp')
        console.warn('🧪 Режим разработки активирован')
        
        // Тестовые данные пользователя
        const testUserData = {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'ru',
          is_premium: false
        }
        
        // Авторизуемся через бэкенд с тестовыми данными
        authorizeUser(testUserData)
      }
    }
    
    // Ждем загрузку Telegram SDK
    if (document.readyState === 'complete') {
      initTelegramAuth()
    } else {
      window.addEventListener('load', initTelegramAuth)
      return () => window.removeEventListener('load', initTelegramAuth)
    }
  }, [ADMIN_TELEGRAM_ID])
  */

  // Загрузка сохраненного языка при старте приложения
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      console.log('✅ Загружен сохраненный язык:', savedLanguage)
      setSelectedLanguage(savedLanguage)
    }
  }, [])

  // Загрузка статистики при переходе на экран user-stats
  useEffect(() => {
    if (currentScreen === 'user-stats') {
      loadUserStats()
    }
  }, [currentScreen])

  // Загрузка метрик рынка при выборе режима single
  useEffect(() => {
    if (currentScreen === 'signal-selection' && selectedMode === 'single') {
      loadMarketMetrics()
    }
  }, [currentScreen, selectedMode])

  // Загрузка метрик при переходе на экран выбора пар
  useEffect(() => {
    if (currentScreen === 'signal-selection') {
      loadMarketMetrics()
    }
  }, [currentScreen])

  // Загрузка истории сигналов при переходе на экран аналитики
  useEffect(() => {
    if (currentScreen === 'analytics') {
      loadUserSignalsHistory()
    }
  }, [currentScreen])

  // Сохранение активного сигнала в localStorage
  useEffect(() => {
    if (pendingSignal) {
      localStorage.setItem('pendingSignal', JSON.stringify(pendingSignal))
      localStorage.setItem('signalTimer', signalTimer.toString())
      localStorage.setItem('isWaitingFeedback', isWaitingFeedback.toString())
      if (pendingSignal.startTime) {
        localStorage.setItem('signalStartTime', pendingSignal.startTime.toString())
      }
    } else {
      localStorage.removeItem('pendingSignal')
      localStorage.removeItem('signalTimer')
      localStorage.removeItem('isWaitingFeedback')
      localStorage.removeItem('signalStartTime')
    }
  }, [pendingSignal, signalTimer, isWaitingFeedback])

  // Таймер для сигнала
  useEffect(() => {
    let interval = null
    if (pendingSignal && !isWaitingFeedback) {
      interval = setInterval(() => {
        // Рассчитываем оставшееся время на основе реального времени
        const remainingTime = calculateRemainingTime(pendingSignal)
        
        if (remainingTime <= 0) {
          setSignalTimer(0)
          setIsWaitingFeedback(true)
        } else {
          setSignalTimer(remainingTime)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [pendingSignal, signalTimer, isWaitingFeedback])

  // Таймер cooldown для ТОП-3
  useEffect(() => {
    let interval = null
    if (top3Cooldown > 0) {
      interval = setInterval(() => {
        setTop3Cooldown(cd => Math.max(0, cd - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [top3Cooldown])

  // Таймер cooldown для одиночного сигнала
  useEffect(() => {
    let interval = null
    if (signalCooldown > 0) {
      interval = setInterval(() => {
        setSignalCooldown(cd => Math.max(0, cd - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [signalCooldown])

  // Автоскрытие уведомления "Нет подходящего сигнала"
  useEffect(() => {
    if (noSignalAvailable) {
      const timeout = setTimeout(() => {
        setNoSignalAvailable(false)
      }, 5000) // Скрыть через 5 секунд
      return () => clearTimeout(timeout)
    }
  }, [noSignalAvailable])

  // Проверка возможности генерации ТОП-3
  const canGenerateTop3 = () => {
    if (!lastTop3Generation) return true
    const now = Date.now()
    const timePassed = now - lastTop3Generation
    const tenMinutes = 10 * 60 * 1000
    return timePassed >= tenMinutes
  }

  // РЕАЛЬНАЯ генерация ТОП-3 сигналов через API бота
  const generateTop3Signals = async () => {
    setIsGenerating(true)
    setCurrentScreen('generating')
    
    // Этапы генерации
    const stages = [
      { stage: 'Подключение к рынку...', delay: 800 },
      { stage: 'Анализ технических индикаторов...', delay: 1200 },
      { stage: 'Оценка новостного фона...', delay: 1000 },
      { stage: 'Расчёт оптимальной экспирации...', delay: 900 },
      { stage: 'Применение ML моделей...', delay: 1100 },
      { stage: 'Формирование ТОП-3 сигналов...', delay: 1000 }
    ]
    
    for (const { stage, delay } of stages) {
      setGenerationStage(stage)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    try {
      // РЕАЛЬНЫЙ запрос к Signal API
      const response = await fetch(`${getApiUrl(5002)}/api/signal/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          market: selectedMarket,
          mode: 'top3'
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.signals) {
        // Преобразуем реальные сигналы в формат для UI
        const signals = result.signals.map((signal, index) => ({
          ...signal,
          id: Date.now() + index,
          status: 'generated',
          time: 'Только что'
        }))
        
        setGeneratedSignals(signals)
        setLastTop3Generation(Date.now())
        setTop3Cooldown(600)
        setIsGenerating(false)
        
        // Автоматически активируем первый сигнал из ТОП-3
        if (signals.length > 0) {
          activateSignal(signals[0])
          setCurrentScreen('main')
          console.log('✅ Автоматически активирован сигнал:', signals[0])
        } else {
          setCurrentScreen('signal-selection')
        }
        
        console.log('✅ Получены РЕАЛЬНЫЕ сигналы:', signals)
      } else {
        // Нет подходящих сигналов
        setIsGenerating(false)
        setNoSignalAvailable(true)
        setSignalCooldown(30)
        setCurrentScreen('signal-selection')
      }
    } catch (error) {
      console.error('❌ Ошибка получения сигналов:', error)
      
      // Fallback: генерируем моковые сигналы если API недоступен
      console.warn('⚠️ Используем mock сигналы (API недоступен)')
      const pairs = selectedMarket === 'forex' 
        ? ['EUR/USD', 'GBP/USD', 'USD/JPY']
        : ['EUR/USD (OTC)', 'NZD/USD (OTC)', 'USD/CHF (OTC)']
      
      const signals = []
      for (let i = 0; i < 3; i++) {
        signals.push({
          signal_id: `mock_${pairs[i].replace('/', '_')}_${Date.now()}_${i}`,
          id: Date.now() + i,
          pair: pairs[i],
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
          entry: selectedMarket === 'forex' ? (Math.random() * 2 + 1).toFixed(4) : (Math.random() * 10000 + 1000).toFixed(2),
          confidence: Math.random() * 0.3 + 0.7,
          expiration: Math.floor(Math.random() * 5) + 1,
          signal_type: selectedMarket === 'otc' ? 'otc' : 'forex',
          timestamp: new Date().toISOString(),
          status: 'generated',
          time: 'Только что'
        })
      }
      
      setGeneratedSignals(signals)
      setLastTop3Generation(Date.now())
      setTop3Cooldown(600)
      setIsGenerating(false)
      setCurrentScreen('signal-selection')
    }
  }

  // РЕАЛЬНАЯ генерация одиночного сигнала для пары через API
  const generateSignalForPair = async (pair) => {
    setIsGenerating(true)
    setCurrentScreen('generating')
    
    // Этапы генерации
    const stages = [
      { stage: 'Подключение к рынку...', delay: 600 },
      { stage: `Анализ пары ${pair}...`, delay: 800 },
      { stage: 'Расчёт технических индикаторов...', delay: 700 },
      { stage: 'Применение ML модели...', delay: 900 },
      { stage: 'Определение точки входа...', delay: 700 }
    ]
    
    for (const { stage, delay } of stages) {
      setGenerationStage(stage)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    try {
      // РЕАЛЬНЫЙ запрос к Signal API
      const response = await fetch('/api/signal/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          market: selectedMarket,
          mode: 'single',
          pair: pair
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.signals && result.signals.length > 0) {
        // Получили РЕАЛЬНЫЙ сигнал
        const signal = {
          ...result.signals[0],
          id: Date.now(),
          status: 'generated',
          time: 'Только что'
        }
        
        setGeneratedSignals([signal])
        setIsGenerating(false)
        
        // Автоматически активируем сигнал
        activateSignal(signal)
        setCurrentScreen('main')
        
        console.log('✅ Получен и активирован РЕАЛЬНЫЙ сигнал:', signal)
      } else {
        // Нет подходящего сигнала
        setIsGenerating(false)
        setNoSignalAvailable(true)
        setSignalCooldown(30)
        setCurrentScreen('signal-selection')
      }
    } catch (error) {
      console.error('❌ Ошибка получения сигнала:', error)
      
      // Fallback: генерируем моковый сигнал если API недоступен
      console.warn('⚠️ Используем mock сигнал (API недоступен)')
      
      const mockSignal = {
        signal_id: `mock_${pair.replace('/', '_')}_${Date.now()}`,
        id: Date.now(),
        pair: pair,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entry: selectedMarket === 'forex' ? (Math.random() * 2 + 1).toFixed(4) : (Math.random() * 10000 + 1000).toFixed(2),
        confidence: Math.random() * 0.3 + 0.7,
        expiration: Math.floor(Math.random() * 5) + 1,
        signal_type: pair.includes('OTC') ? 'otc' : 'forex',
        timestamp: new Date().toISOString(),
        status: 'generated',
        time: 'Только что'
      }
      
      setGeneratedSignals([mockSignal])
      setIsGenerating(false)
      setCurrentScreen('signal-selection')
    }
  }

  // Функция для расчета оставшегося времени на основе реального времени
  const calculateRemainingTime = (signal) => {
    if (!signal || !signal.startTime) return 0
    
    const startTime = signal.startTime
    const expirationSeconds = signal.expiration * 60
    const currentTime = Date.now()
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
    const remainingSeconds = Math.max(0, expirationSeconds - elapsedSeconds)
    
    return remainingSeconds
  }

  // Функция для очистки состояния сигналов
  const clearSignalState = () => {
    setGeneratedSignals([])
    setPendingSignal(null)
    setSignalTimer(0)
    setIsWaitingFeedback(false)
    // Очищаем localStorage
    localStorage.removeItem('pendingSignal')
    localStorage.removeItem('signalTimer')
    localStorage.removeItem('isWaitingFeedback')
    localStorage.removeItem('signalStartTime')
  }

  // Активация сигнала
  const activateSignal = (signal) => {
    const expirationSeconds = signal.expiration * 60 // Конвертируем минуты в секунды
    const startTime = Date.now() // Время начала сигнала
    
    setPendingSignal({
      ...signal,
      startTime: startTime
    })
    setSignalTimer(expirationSeconds)
    setIsWaitingFeedback(false)
    
    // Сохраняем время начала в localStorage
    localStorage.setItem('signalStartTime', startTime.toString())
  }

  // Отправка фидбека на бэкенд
  const submitFeedback = async (isSuccess) => {
    if (!pendingSignal) return
    
    const feedbackData = {
      user_id: userId,
      signal_id: pendingSignal.signal_id,
      feedback: isSuccess ? 'success' : 'failure'
    }
    
    try {
      // Отправляем фидбек на бэкенд
      const response = await fetch('/api/signal/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Фидбек сохранен в базу:', result.user_stats)
      }
    } catch (error) {
      console.error('❌ Ошибка отправки фидбека:', error)
      console.warn('⚠️ Фидбек не сохранен на бэкенде (работа без API)')
    }
    
    // Локально сохраняем результат
    console.log(`📊 Фидбек: ${isSuccess ? 'success' : 'failure'} для сигнала ${pendingSignal.signal_id}`)
    
    // Очищаем состояние
    clearSignalState()
    
    alert(`✅ Фидбек принят: ${isSuccess ? 'Успешная сделка' : 'Убыточная сделка'}`)
    
    // Переходим в статистику пользователя
    setCurrentScreen('user-stats')
  }

  // Проверка блокировки навигации
  const isNavigationBlocked = () => {
    return pendingSignal !== null
  }

  // Навигация с проверкой блокировки
  const navigateWithCheck = (screen) => {
    if (isNavigationBlocked()) {
      alert('⚠️ У вас есть активный сигнал!\n\nДождитесь завершения экспирации и оставьте фидбек о результате сделки.\n\nНавигация разблокируется после отправки фидбека.')
      return false
    }
    setCurrentScreen(screen)
    return true
  }

  // Обработчик успешной авторизации
  const handleAuthSuccess = (authData) => {
    setUserId(authData.userId)
    setIsAdmin(authData.isAdmin)
    setUserData(authData.userData)
    setUserSubscriptions(authData.subscriptions)
    setIsAuthorized(true)
    
    // Проверяем сохраненный язык
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
      setCurrentScreen('welcome')
    } else {
      setCurrentScreen('language-select')
    }
    
    // Проверяем активный сигнал после авторизации
    const savedSignal = localStorage.getItem('pendingSignal')
    if (savedSignal) {
      const signal = JSON.parse(savedSignal)
      const startTime = parseInt(localStorage.getItem('signalStartTime')) || Date.now()
      const waitingFeedback = localStorage.getItem('isWaitingFeedback') === 'true'
      
      // Восстанавливаем время начала
      signal.startTime = startTime
      
      // Рассчитываем оставшееся время на основе реального времени
      const remainingTime = calculateRemainingTime(signal)
      
      if (remainingTime > 0) {
        setPendingSignal(signal)
        setSignalTimer(remainingTime)
        setIsWaitingFeedback(waitingFeedback)
        setShowReloadWarning(true)
        setCurrentScreen('main')
      } else {
        // Время истекло, показываем фидбек
        setPendingSignal(signal)
        setSignalTimer(0)
        setIsWaitingFeedback(true)
        setShowReloadWarning(true)
        setCurrentScreen('main')
      }
    }
  }

  // Обработчик ошибки авторизации
  const handleAuthError = (error) => {
    console.error('❌ Ошибка авторизации:', error)
  }

  // Authorization Screen
  if (currentScreen === 'auth') {
    return (
      <TelegramAuth 
        onAuthSuccess={handleAuthSuccess}
        onAuthError={handleAuthError}
      />
    )
  }

  // Language Selection Screen
  if (currentScreen === 'language-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-4xl w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Logo with enhanced animation */}
          <div className="flex justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl blur-2xl opacity-50 animate-glow-pulse"></div>
              <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 icon-3d hover:scale-110 transition-transform duration-500">
                <Globe className="w-14 h-14 text-white animate-spin-slow" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-3xl blur-lg animate-pulse"></div>
            </div>
          </div>

          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="relative">
              <h1 className="text-5xl font-bold text-white mb-4">
                {t('selectLanguage')}
              </h1>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Select Language
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
            </div>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Выберите предпочитаемый язык для продолжения / Choose your preferred language to continue
            </p>
          </div>

          {/* Language Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {languages.map((language, index) => (
              <Card 
                key={language.code}
                onClick={() => {
                  setSelectedLanguage(language.code)
                }}
                className={`glass-effect p-6 backdrop-blur-sm cursor-pointer transition-all duration-500 group card-3d border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-110 hover:-translate-y-2 ${
                  selectedLanguage === language.code 
                    ? 'border-emerald-500/70 bg-emerald-500/10 scale-105' 
                    : 'hover:border-emerald-500/50'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className={`text-5xl transition-all duration-300 group-hover:scale-125 ${
                      selectedLanguage === language.code ? 'animate-bounce' : ''
                    }`}>
                      {language.flag}
                    </div>
                    {selectedLanguage === language.code && (
                      <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-lg animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold text-sm transition-colors duration-300 ${
                      selectedLanguage === language.code ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {language.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{language.code.toUpperCase()}</p>
                  </div>
                  {selectedLanguage === language.code && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          {selectedLanguage && (
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  localStorage.setItem('selectedLanguage', selectedLanguage)
                  setCurrentScreen('welcome')
                }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-6 px-12 text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all duration-500 hover:shadow-emerald-500/50 hover:scale-110 hover:-translate-y-2 animate-pulse-slow"
              >
                <span className="flex items-center gap-3">
                  {t('continue')} / Continue
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl blur-2xl opacity-50 animate-glow-pulse"></div>
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 icon-3d">
                <Activity className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              {t('welcomeTo')}
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mt-2">
                Forex Signals Pro
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              {t('premiumSignals')}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <Card className="glass-effect p-4 backdrop-blur-sm card-3d border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center icon-3d shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t('accurateSignals')}</h3>
                  <p className="text-slate-400 text-sm">{t('successfulTrades')}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect p-4 backdrop-blur-sm card-3d border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t('instantNotifications')}</h3>
                  <p className="text-slate-400 text-sm">{t('realTimeSignals')}</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect p-4 backdrop-blur-sm card-3d border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center icon-3d shadow-lg shadow-amber-500/20">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{t('premiumQuality')}</h3>
                  <p className="text-slate-400 text-sm">{t('professionalAnalysis')}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Start Button */}
          <Button 
            onClick={() => setCurrentScreen('menu')}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 hover:-translate-y-1"
          >
            {t('start')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  // Main Menu Screen
  if (currentScreen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">{t('menu')}</h2>
            <p className="text-slate-400">Выберите действие / Choose action</p>
          </div>

          {/* Menu Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => setCurrentScreen('market-select')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-emerald-500/20">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('tradingSignals')}</h3>
                    <p className="text-slate-400 text-sm">Получайте сигналы для торговли / Get trading signals</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => setCurrentScreen('analytics')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-cyan-500/20">
                    <BarChart3 className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('analytics')}</h3>
                    <p className="text-slate-400 text-sm">Анализ сигналов с AI / AI signal analysis</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => window.open('https://t.me/NeKnopkaBabl0', '_blank')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-purple-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-purple-500/20">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('community')}</h3>
                    <p className="text-slate-400 text-sm">Общение с другими трейдерами / Chat with other traders</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => setCurrentScreen('premium')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-yellow-500/50 transition-all duration-300 group card-3d border-yellow-500/30 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-yellow-500/20">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{t('premium')}</h3>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                        VIP
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">Приватные ML-модели</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => setCurrentScreen('settings')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-amber-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-amber-500/20">
                    <Settings className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t('settings')}</h3>
                    <p className="text-slate-400 text-sm">Управление параметрами</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </div>

          {/* Back Button */}
          <Button 
            onClick={() => setCurrentScreen('welcome')}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }

  // Generating Screen - Анимация процесса генерации
  if (currentScreen === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-2xl w-full space-y-8 animate-fade-in relative z-10">
          {/* Animated Brain Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-3xl blur-2xl opacity-50 animate-glow-pulse"></div>
              <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50 icon-3d animate-float">
                <Brain className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Generation Status */}
          <Card className="glass-effect border-cyan-500/30 p-8 card-3d shadow-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">🧠 Генерация сигналов</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                <p className="text-xl text-cyan-400 font-semibold animate-pulse">
                  {generationStage}
                </p>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
                  <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-slate-400">Анализ</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
                  <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2 animate-spin-slow" />
                  <p className="text-xs text-slate-400">ML модель</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-emerald-500/30">
                  <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-slate-400">Точность</p>
                </div>
              </div>
            </div>
          </Card>

          <p className="text-slate-400 text-center text-sm">
            Пожалуйста, подождите. Система анализирует рынок...
          </p>
        </div>
      </div>
    )
  }

  // Signal Selection Screen - Выбор сигнала из сгенерированных
  if (currentScreen === 'signal-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 icon-3d">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {selectedMode === 'top3' ? 'ТОП-3 Сигнала' : 'Сгенерированный сигнал'}
                  </h1>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                    {generatedSignals.length} сигнал{generatedSignals.length > 1 ? 'а' : ''}
                  </Badge>
                </div>
              </div>
              {/* Показываем кнопку "Назад" только если нет готовых сигналов и не идет генерация */}
              {generatedSignals.length === 0 && !isGenerating && (
                <Button 
                  onClick={() => setCurrentScreen('mode-select')}
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Content based on mode */}
        <div className="container mx-auto px-4 py-6">
          {selectedMode === 'top3' ? (
            // ТОП-3 режим: показываем готовые сигналы
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  🏆 ТОП-3 сигнала готовы!
                </h2>
                <p className="text-slate-400">Выберите сигнал для активации</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedSignals.map((signal, index) => (
                  <Card 
                    key={signal.id}
                    onClick={() => {
                      activateSignal(signal)
                      setCurrentScreen('main')
                    }}
                    className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          signal.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                        }`}>
                          {signal.type === 'BUY' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                      </div>

                      {/* Signal Type */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Направление:</span>
                        <Badge className={`${
                          signal.type === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        }`}>
                          {signal.type}
                        </Badge>
                      </div>

                      {/* Expiration Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Экспирация:</span>
                        <span className="text-white font-semibold">
                          {signal.expiration} мин
                        </span>
                      </div>

                      {/* Confidence Score */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Уверенность
                          </span>
                          <span className="text-white font-semibold">
                            {(signal.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full transition-all duration-500 shadow-lg"
                            style={{ 
                              width: `${signal.confidence * 100}%`,
                              background: `linear-gradient(to right, 
                                #ef4444 0%, 
                                #f97316 20%, 
                                #eab308 40%, 
                                #84cc16 60%, 
                                #22c55e 80%, 
                                #16a34a 100%)`
                            }}
                          />
                        </div>
                      </div>

                      {/* Click to Activate */}
                      <div className="text-center pt-2">
                        <span className="text-emerald-400 text-sm font-semibold">Нажмите для активации</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : generatedSignals.length > 0 ? (
            // Одиночный режим: показываем готовый сигнал
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  ✅ Сигнал готов!
                </h2>
                <p className="text-slate-400">Активируйте сигнал для торговли</p>
              </div>

              <div className="max-w-md mx-auto">
                {generatedSignals.map((signal, index) => (
                  <Card 
                    key={signal.id}
                    onClick={() => {
                      activateSignal(signal)
                      setCurrentScreen('main')
                    }}
                    className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{signal.pair}</h3>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          signal.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                        }`}>
                          {signal.type === 'BUY' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                      </div>

                      {/* Signal Type */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Направление:</span>
                        <Badge className={`${
                          signal.type === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        }`}>
                          {signal.type}
                        </Badge>
                      </div>

                      {/* Expiration Time */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Экспирация:</span>
                        <span className="text-white font-semibold">
                          {signal.expiration} мин
                        </span>
                      </div>

                      {/* Confidence Score */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Уверенность
                          </span>
                          <span className="text-white font-semibold">
                            {(signal.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full transition-all duration-500 shadow-lg"
                            style={{ 
                              width: `${signal.confidence * 100}%`,
                              background: `linear-gradient(to right, 
                                #ef4444 0%, 
                                #f97316 20%, 
                                #eab308 40%, 
                                #84cc16 60%, 
                                #22c55e 80%, 
                                #16a34a 100%)`
                            }}
                          />
                        </div>
                      </div>

                      {/* Click to Activate */}
                      <div className="text-center pt-2">
                        <span className="text-emerald-400 text-sm font-semibold">Нажмите для активации</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Одиночный режим: показываем пары для выбора
            <>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  📊 Состояние рынка
                </h2>
                <p className="text-slate-400">Выберите пару для генерации сигнала</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(marketMetrics[selectedMarket]?.length > 0
                  ? marketMetrics[selectedMarket]
                  : (selectedMarket === 'forex' ? [
                      { pair: 'EUR/USD', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' },
                      { pair: 'GBP/USD', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' },
                      { pair: 'USD/JPY', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' },
                      { pair: 'USD/CHF', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' }
                    ] : [
                      { pair: 'EUR/USD (OTC)', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' },
                      { pair: 'NZD/USD (OTC)', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' },
                      { pair: 'USD/CHF (OTC)', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' },
                      { pair: 'GBP/USD (OTC)', sentiment: 'Загрузка...', volatility: 0, trend: 'HOLD' }
                    ])
                ).map((market, index) => (
                  <Card 
                    key={market.pair}
                    onClick={() => {
                      // Для одиночного режима запускаем анимацию генерации
                      generateSignalForPair(market.pair)
                    }}
                    className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105"
                  >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{market.pair}</h3>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      market.sentiment === 'Бычий' ? 'bg-emerald-500/20' :
                      market.sentiment === 'Медвежий' ? 'bg-rose-500/20' :
                      'bg-amber-500/20'
                    }`}>
                      {market.sentiment === 'Бычий' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : market.sentiment === 'Медвежий' ? (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>

                  {/* Market Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 text-xs block mb-1">Настроение</span>
                      <Badge className={`${
                        market.sentiment === 'Бычий' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                        market.sentiment === 'Медвежий' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      }`}>
                        {market.sentiment}
                      </Badge>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-slate-400 text-xs block mb-1">Волатильность</span>
                      <span className="text-white font-bold">{market.volatility}%</span>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Рекомендация:</span>
                    <Badge className={`${
                      market.trend === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                      market.trend === 'SELL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    }`}>
                      {market.trend === 'HOLD' ? 'ОЖИДАНИЕ' : market.trend}
                    </Badge>
                  </div>

                  {/* Click to Generate */}
                  <div className="text-center pt-2">
                    <span className="text-emerald-400 text-sm font-semibold">Нажмите для генерации сигнала</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info */}
          <Card className="glass-effect border-cyan-500/30 p-6 mt-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Выберите сигнал</h3>
                <p className="text-slate-400 text-sm">
                  После выбора сигнала навигация будет заблокирована до экспирации. Вы должны будете оставить фидбек.
                </p>
              </div>
            </div>
          </Card>
            </>
          )}
        </div>
      </div>
    )
  }

  // Analytics Screen - List of completed signals for AI analysis
  if (currentScreen === 'analytics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 icon-3d">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI Аналитика</h1>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                    GPT-4O MINI
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('menu')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>

        {/* Analytics Content */}
        <div className="container mx-auto px-4 py-6">
          {!selectedSignalForAnalysis ? (
            // List of completed signals
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Выберите сигнал для анализа</h2>
                <p className="text-slate-400">AI проанализирует сделку и даст рекомендации</p>
              </div>

              <div className="space-y-4">
                {historySignals.map((signal) => (
                  <Card 
                    key={signal.id}
                    onClick={() => setSelectedSignalForAnalysis(signal)}
                    className="glass-effect backdrop-blur-sm overflow-hidden transition-all duration-300 card-3d border-slate-700/50 shadow-xl cursor-pointer hover:border-cyan-500/50 hover:scale-102"
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                            signal.result === 'profit'
                              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                              : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                          }`}>
                            {signal.type === 'BUY' ? (
                              <TrendingUp className={`w-6 h-6 ${signal.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                            ) : (
                              <TrendingDown className={`w-6 h-6 ${signal.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`${
                                signal.type === 'BUY' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                              } text-xs`}>
                                {signal.type}
                              </Badge>
                              <span className="text-xs text-slate-500">{signal.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            signal.result === 'profit' 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                          }`}>
                            {signal.result === 'profit' ? 'Успешно' : 'Проигрыш'}
                          </Badge>
                          <div className="text-xs text-slate-500 mt-2">
                            {signal.entry} → {signal.closePrice}
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 mt-2" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Signal analysis view
            <>
              <div className="mb-6">
                <Button 
                  onClick={() => {
                    setSelectedSignalForAnalysis(null)
                    setAnalysisResult(null)
                  }}
                  variant="ghost"
                  className="text-slate-400 hover:text-white mb-4"
                >
                  <ChevronRight className="w-5 h-5 rotate-180 mr-2" />
                  Назад к списку
                </Button>
              </div>

              {/* Signal Details Card */}
              <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                    selectedSignalForAnalysis.result === 'profit'
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                      : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                  }`}>
                    {selectedSignalForAnalysis.type === 'BUY' ? (
                      <TrendingUp className={`w-8 h-8 ${selectedSignalForAnalysis.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                    ) : (
                      <TrendingDown className={`w-8 h-8 ${selectedSignalForAnalysis.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedSignalForAnalysis.pair}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${
                        selectedSignalForAnalysis.type === 'BUY' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      }`}>
                        {selectedSignalForAnalysis.type}
                      </Badge>
                      <Badge className={`${
                        selectedSignalForAnalysis.result === 'profit' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      }`}>
                        {selectedSignalForAnalysis.result === 'profit' ? 'Успешно' : 'Проигрыш'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 text-xs block mb-1">Вход</span>
                    <span className="text-white font-bold">{selectedSignalForAnalysis.entry}</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 text-xs block mb-1">Take Profit</span>
                    <span className="text-white font-bold">{selectedSignalForAnalysis.tp.join(', ')}</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 text-xs block mb-1">Stop Loss</span>
                    <span className="text-white font-bold">{selectedSignalForAnalysis.sl}</span>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                    <span className="text-slate-400 text-xs block mb-1">Закрытие</span>
                    <span className="text-white font-bold">{selectedSignalForAnalysis.closePrice}</span>
                  </div>
                </div>
              </Card>

              {/* Analyze Button */}
              {!analysisResult && !isAnalyzing && (
                <Button
                  onClick={() => analyzeSignal(selectedSignalForAnalysis)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-6 text-lg font-bold shadow-xl shadow-cyan-500/30 mb-6"
                >
                  <Brain className="w-6 h-6 mr-2" />
                  Запустить AI анализ
                </Button>
              )}

              {/* Loading state */}
              {isAnalyzing && (
                <Card className="glass-effect border-cyan-500/30 p-8 card-3d shadow-2xl text-center mb-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
                      <Brain className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Анализирую сделку...</h3>
                    <p className="text-slate-400">GPT-4o mini обрабатывает данные</p>
                  </div>
                </Card>
              )}

              {/* Analysis Result */}
              {analysisResult && (
                <Card className="glass-effect border-cyan-500/30 p-6 card-3d shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center icon-3d shadow-xl shadow-cyan-500/20">
                      <Brain className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AI Анализ</h3>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                        GPT-4O MINI
                      </Badge>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {analysisResult}
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedSignalForAnalysis(null)
                      setAnalysisResult(null)
                    }}
                    variant="outline"
                    className="w-full mt-6 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Закрыть анализ
                  </Button>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Main Screen - активный сигнал с блокировкой навигации
  if (currentScreen === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header с блокировкой */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-red-950/80 border-b border-red-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">СДЕЛКА АКТИВИРОВАНА</h1>
                  <p className="text-red-400 text-sm">Навигация заблокирована</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {pendingSignal && (
            <>
              {/* Активный сигнал */}
              <Card className="glass-effect backdrop-blur-sm border-emerald-500/50 p-6 mb-6 shadow-xl shadow-emerald-500/20">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{pendingSignal.pair}</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      pendingSignal.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                    }`}>
                      {pendingSignal.type === 'BUY' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <Badge className={`${
                      pendingSignal.type === 'BUY' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    }`}>
                      {pendingSignal.type}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Таймер */}
              <Card className="glass-effect backdrop-blur-sm border-amber-500/50 p-6 mb-6 shadow-xl shadow-amber-500/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-amber-400" />
                    <span className="text-3xl font-bold text-white">
                      {Math.floor(signalTimer / 60)}:{(signalTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-4">Осталось до экспирации</p>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${((pendingSignal.expiration * 60 - signalTimer) / (pendingSignal.expiration * 60)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* Предупреждение о блокировке */}
              <Card className="glass-effect backdrop-blur-sm border-red-500/50 p-6 mb-6 shadow-xl shadow-red-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-blue-400 font-semibold">Навигация заблокирована</span>
                </div>
                <p className="text-slate-400">
                  Дождитесь экспирации сигнала и оставьте фидбек
                </p>
              </Card>

              {/* Кнопки фидбека */}
              {isWaitingFeedback && (
                <Card className="glass-effect backdrop-blur-sm border-cyan-500/50 p-6 shadow-xl shadow-cyan-500/20">
                  <div className="text-center">
                    <p className="text-white mb-4 text-lg">Как прошла сделка?</p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => submitFeedback(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3"
                      >
                        ✅ Успешно
                      </Button>
                      <Button 
                        onClick={() => submitFeedback(false)}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3"
                      >
                        ❌ Убыток
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Notifications Settings Screen
  if (currentScreen === 'notifications') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 icon-3d">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Уведомления</h1>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                    NOTIFICATIONS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>

        {/* Notification Settings */}
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-6">
            {/* Signal Notifications */}
            <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Торговые сигналы
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.newSignals ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Bell className={`w-5 h-5 ${notificationSettings.newSignals ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Новые сигналы</h4>
                      <p className="text-slate-400 text-sm">Уведомления о новых сигналах</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('newSignals')}
                    variant={notificationSettings.newSignals ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.newSignals 
                      ? 'bg-emerald-500 hover:bg-emerald-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.newSignals ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.signalResults ? 'bg-cyan-500/20' : 'bg-slate-700/50'
                    }`}>
                      <CheckCircle2 className={`w-5 h-5 ${notificationSettings.signalResults ? 'text-cyan-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Результаты сигналов</h4>
                      <p className="text-slate-400 text-sm">Уведомления о закрытии сделок</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('signalResults')}
                    variant={notificationSettings.signalResults ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.signalResults 
                      ? 'bg-cyan-500 hover:bg-cyan-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.signalResults ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.dailySummary ? 'bg-purple-500/20' : 'bg-slate-700/50'
                    }`}>
                      <BarChart3 className={`w-5 h-5 ${notificationSettings.dailySummary ? 'text-purple-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Ежедневная сводка</h4>
                      <p className="text-slate-400 text-sm">Итоги дня в 21:00</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('dailySummary')}
                    variant={notificationSettings.dailySummary ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.dailySummary 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.dailySummary ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* System Notifications */}
            <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-400" />
                Системные уведомления
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.marketNews ? 'bg-blue-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Newspaper className={`w-5 h-5 ${notificationSettings.marketNews ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Новости рынка</h4>
                      <p className="text-slate-400 text-sm">Важные события на рынке</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('marketNews')}
                    variant={notificationSettings.marketNews ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.marketNews 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.marketNews ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.systemUpdates ? 'bg-green-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Settings className={`w-5 h-5 ${notificationSettings.systemUpdates ? 'text-green-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Обновления системы</h4>
                      <p className="text-slate-400 text-sm">Новые функции и исправления</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('systemUpdates')}
                    variant={notificationSettings.systemUpdates ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.systemUpdates 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.systemUpdates ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Sound & Vibration */}
            <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                Звук и вибрация
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.soundEnabled ? 'bg-purple-500/20' : 'bg-slate-700/50'
                    }`}>
                      {notificationSettings.soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-purple-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Звук</h4>
                      <p className="text-slate-400 text-sm">Звуковые уведомления</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('soundEnabled')}
                    variant={notificationSettings.soundEnabled ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.soundEnabled 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.vibrationEnabled ? 'bg-pink-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Vibrate className={`w-5 h-5 ${notificationSettings.vibrationEnabled ? 'text-pink-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Вибрация</h4>
                      <p className="text-slate-400 text-sm">Вибро-сигнал при уведомлениях</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('vibrationEnabled')}
                    variant={notificationSettings.vibrationEnabled ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.vibrationEnabled 
                      ? 'bg-pink-500 hover:bg-pink-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.vibrationEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notificationSettings.emailNotifications ? 'bg-indigo-500/20' : 'bg-slate-700/50'
                    }`}>
                      <Mail className={`w-5 h-5 ${notificationSettings.emailNotifications ? 'text-indigo-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Email уведомления</h4>
                      <p className="text-slate-400 text-sm">Дублировать на почту</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleNotification('emailNotifications')}
                    variant={notificationSettings.emailNotifications ? 'default' : 'outline'}
                    size="sm"
                    className={notificationSettings.emailNotifications 
                      ? 'bg-indigo-500 hover:bg-indigo-600' 
                      : 'border-slate-600 text-slate-400'
                    }
                  >
                    {notificationSettings.emailNotifications ? 'ВКЛ' : 'ВЫКЛ'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="glass-effect border-cyan-500/30 p-6 card-3d shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                  <Bell className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Умные уведомления</h3>
                  <p className="text-slate-400 text-sm">
                    Получайте своевременные уведомления о важных событиях. Вы можете настроить каждый тип отдельно.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Market Selection Screen
  if (currentScreen === 'market-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">{t('selectMarket')}</h2>
            <p className="text-slate-400">{t('whatSignals')}</p>
          </div>

          {/* Market Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => {
                setSelectedMarket('forex')
                setCurrentScreen('mode-select')
              }}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-emerald-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-emerald-500/20">
                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Forex</h3>
                    <p className="text-slate-400 text-sm">Расписание Forex рынка</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs">
                        EUR/USD
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs">
                        GBP/JPY
                      </Badge>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => {
                setSelectedMarket('otc')
                setCurrentScreen('mode-select')
              }}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-cyan-500/20">
                    <BarChart3 className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">OTC</h3>
                    <p className="text-slate-400 text-sm">24/7</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </div>

          {/* Back Button */}
          <Button 
            onClick={() => setCurrentScreen('menu')}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }

  // Mode Selection Screen
  if (currentScreen === 'mode-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Режим генерации</h2>
            <p className="text-slate-400">Как вы хотите получать сигналы?</p>
          </div>

          {/* Mode Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => {
                setSelectedMode('top3')
                // Очищаем состояние сгенерированных сигналов
                clearSignalState()
                generateTop3Signals()
              }}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-amber-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-amber-500/20">
                    <Crown className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">ТОП-3 сигнала</h3>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                        Популярно
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">Лучшие возможности дня</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>3 лучших сигнала одновременно</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Высокая вероятность успеха</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Диверсификация рисков</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => {
                setSelectedMode('single')
                // Очищаем состояние сгенерированных сигналов
                clearSignalState()
                setCurrentScreen('signal-selection')
              }}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-purple-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-purple-500/20">
                    <Zap className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Одиночные сигналы</h3>
                    <p className="text-slate-400 text-sm mb-3">По одному сигналу за раз</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Фокус на одной сделке</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Простое управление</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Идеально для начинающих</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>
          </div>

          {/* Back Button */}
          <Button 
            onClick={() => setCurrentScreen('market-select')}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }

  // Settings Screen
  if (currentScreen === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10 perspective-container">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">{t('settings')}</h2>
            <p className="text-slate-400">Управление параметрами приложения</p>
          </div>

          {/* Settings Options */}
          <div className="space-y-4">
            <Card 
              onClick={() => setCurrentScreen('ml-selector')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-purple-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-purple-500/20">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">ML Модель</h3>
                    <p className="text-slate-400 text-sm">
                      {mlModels.find(m => m.id === selectedMLModel)?.name || 'Не выбрана'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => setCurrentScreen('user-stats')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-cyan-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-cyan-500/20">
                    <BarChart3 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Статистика</h3>
                    <p className="text-slate-400 text-sm">Просмотр детальной статистики</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            <Card 
              onClick={() => setCurrentScreen('notifications')}
              className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-amber-500/50 transition-all duration-300 group card-3d border-slate-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-amber-500/20">
                    <Bell className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Уведомления</h3>
                    <p className="text-slate-400 text-sm">Настройка push-уведомлений</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Card>

            {/* Admin Panel - Only visible for admins */}
            {isAdmin && (
              <Card 
                onClick={() => setCurrentScreen('admin')}
                className="glass-effect p-6 backdrop-blur-sm cursor-pointer hover:border-red-500/50 transition-all duration-300 group card-3d border-red-500/30 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 icon-3d shadow-xl shadow-red-500/20">
                      <Shield className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">{t('admin')}</h3>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                          ADMIN
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">Статистика всех пользователей</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Card>
            )}
          </div>

          {/* Back Button */}
          <Button 
            onClick={() => setCurrentScreen('menu')}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }

  // ML Model Selector Screen
  if (currentScreen === 'ml-selector') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 icon-3d">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Выбор ML модели</h1>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs">
                    SELECT MODEL
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 w-10 h-10"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        </header>

        {/* ML Models List */}
        <div className="container mx-auto px-3 py-4">
          <div className="space-y-3">
            {mlModels.map((model) => {
              const isOwned = userSubscriptions.includes(model.id)
              const isActive = selectedMLModel === model.id
              const isRestricted = model.status === 'restricted'
              
              return (
                <Card 
                  key={model.id}
                  onClick={() => {
                    if (isOwned && !isRestricted) {
                      setSelectedMLModel(model.id)
                    } else if (isRestricted) {
                      alert('Эта модель заблокирована и доступна только по команде')
                    } else {
                      // Переход на страницу премиум для покупки
                      setCurrentScreen('premium')
                    }
                  }}
                  className={`glass-effect p-4 backdrop-blur-sm transition-all duration-300 card-3d border-slate-700/50 shadow-xl cursor-pointer ${
                    isActive 
                      ? 'border-emerald-500/70 bg-emerald-500/10' 
                      : isOwned
                      ? 'hover:border-purple-500/50 hover:scale-102'
                      : isRestricted
                      ? 'border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed'
                      : 'hover:border-yellow-500/50 hover:scale-102'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    {/* Top row: Icon and title */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center icon-3d shadow-xl`}>
                          <span className="text-2xl">{model.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{model.name}</h3>
                          <p className="text-slate-300 text-sm">{model.algorithm}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isActive && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                            ✓ АКТИВНА
                          </Badge>
                        )}
                        {isRestricted && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            ЗАБЛОКИРОВАНА
                          </Badge>
                        )}
                        {!isOwned && !isRestricted && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            ТРЕБУЕТСЯ ПОДПИСКА
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">{model.winrate}</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{model.style}</span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-slate-400 text-sm italic">💬 {model.description}</p>
                    
                    {model.warning && (
                      <p className="text-red-400 text-sm font-semibold">⚠️ {model.warning}</p>
                    )}
                    
                    {/* Bottom row: Pricing and button */}
                    <div className="flex items-center justify-between">
                      {!isOwned && !isRestricted && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-yellow-400 font-bold">{model.monthlyPrice}/мес</span>
                          <span className="text-slate-600">или</span>
                          <span className="text-green-400 font-bold">{model.lifetimePrice} навсегда</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        {isActive ? (
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          </div>
                        ) : isOwned && !isRestricted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 h-8 px-3"
                          >
                            Выбрать
                          </Button>
                        ) : isRestricted ? (
                          <Lock className="w-5 h-5 text-red-400" />
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 h-8 px-3"
                          >
                            Купить
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Info */}
          <Card className="glass-effect border-cyan-500/30 p-4 mt-4 card-3d shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">О ML моделях</h3>
                <p className="text-slate-400 text-sm">
                  Вы можете переключаться между купленными моделями в любое время. Каждая модель имеет свой уникальный алгоритм и винрейт.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // User Statistics Screen
  if (currentScreen === 'user-stats') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 icon-3d">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Моя статистика</h1>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                    PERSONAL STATS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>

        {/* User Stats Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 perspective-container mb-8">
            <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-emerald-400 text-xs font-medium mb-1">Всего сигналов</span>
                <span className="text-2xl font-bold text-white">{userStats.totalSignals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-green-500/20 p-4 card-3d shadow-xl shadow-green-500/10">
              <div className="flex flex-col">
                <span className="text-green-400 text-xs font-medium mb-1">Успешных</span>
                <span className="text-2xl font-bold text-white">{userStats.successfulSignals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-rose-500/20 p-4 card-3d shadow-xl shadow-rose-500/10">
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-medium mb-1">Проигрышных</span>
                <span className="text-2xl font-bold text-white">{userStats.failedSignals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
              <div className="flex flex-col">
                <span className="text-cyan-400 text-xs font-medium mb-1">Win Rate</span>
                <span className="text-2xl font-bold text-white">{userStats.winRate}%</span>
              </div>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center icon-3d shadow-lg shadow-purple-500/20">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Детальная информация</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Дней торговли</span>
                <span className="text-purple-400 font-bold text-xl">{userStats.tradingDays}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Сигналов в день</span>
                <span className="text-cyan-400 font-bold text-xl">{userStats.avgSignalsPerDay}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Лучшая пара</span>
                <span className="text-emerald-400 font-bold text-xl">{userStats.bestPair}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Худшая пара</span>
                <span className="text-rose-400 font-bold text-xl">{userStats.worstPair}</span>
              </div>
            </div>
          </Card>

          {/* Signals Chart */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center icon-3d shadow-lg shadow-amber-500/20">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">График сигналов по месяцам</h3>
            </div>
            
            <div className="space-y-4">
              {userStats.signalsByMonth.map((item, index) => {
                const totalSignals = item.successful + item.failed
                const successPercentage = (item.successful / totalSignals) * 100
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">{item.successful} успешных</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-400 font-bold">{item.failed} проигрышных</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/30 flex">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${successPercentage}%` }}
                      >
                        {successPercentage > 15 && (
                          <span className="text-white text-xs font-bold">{successPercentage.toFixed(0)}%</span>
                        )}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${100 - successPercentage}%` }}
                      >
                        {(100 - successPercentage) > 15 && (
                          <span className="text-white text-xs font-bold">{(100 - successPercentage).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Admin Panel Screen
  if (currentScreen === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 icon-3d">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{t('admin')}</h1>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                    ADMIN ACCESS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('settings')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>

        {/* Admin Stats */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 perspective-container mb-8">
            <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-emerald-400 text-xs font-medium mb-1">Всего пользователей</span>
                <span className="text-2xl font-bold text-white">{adminStats.totalUsers.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
              <div className="flex flex-col">
                <span className="text-cyan-400 text-xs font-medium mb-1">Активных</span>
                <span className="text-2xl font-bold text-white">{adminStats.activeUsers.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-purple-500/20 p-4 card-3d shadow-xl shadow-purple-500/10">
              <div className="flex flex-col">
                <span className="text-purple-400 text-xs font-medium mb-1">Всего сигналов</span>
                <span className="text-2xl font-bold text-white">{adminStats.totalSignals.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-green-500/20 p-4 card-3d shadow-xl shadow-green-500/10">
              <div className="flex flex-col">
                <span className="text-green-400 text-xs font-medium mb-1">Успешных</span>
                <span className="text-2xl font-bold text-white">{adminStats.successfulSignals.toLocaleString()}</span>
              </div>
            </Card>
            <Card className="glass-effect border-rose-500/20 p-4 card-3d shadow-xl shadow-rose-500/10">
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-medium mb-1">Проигрышных</span>
                <span className="text-2xl font-bold text-white">{adminStats.failedSignals.toLocaleString()}</span>
              </div>
            </Card>
          </div>

          {/* Top Users */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center icon-3d shadow-lg shadow-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Топ пользователи</h3>
            </div>
            
            <div className="space-y-3">
              {adminStats.topUsers.map((user, index) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setSelectedUser(user)
                    setCurrentScreen('admin-user-detail')
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100' :
                      'bg-gradient-to-br from-slate-600 to-slate-800 text-slate-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-semibold group-hover:text-cyan-400 transition-colors">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.signals} сигналов</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400 font-semibold">{user.successful}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-rose-400 font-semibold">{user.failed}</span>
                      </div>
                      <div className="text-xs text-slate-400">успешных/проигрышных</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedUser(user)
                          setCurrentScreen('admin-user-detail')
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-cyan-400 hover:text-white hover:bg-cyan-500/20 hover:scale-110 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteUser(user.id)
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-rose-400 hover:text-white hover:bg-rose-500/20 hover:scale-110 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Admin User Detail Screen
  if (currentScreen === 'admin-user-detail' && selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 icon-3d">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{selectedUser.name}</h1>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                    USER STATS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('admin')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>

        {/* User Stats Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 perspective-container mb-8">
            <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
              <div className="flex flex-col">
                <span className="text-emerald-400 text-xs font-medium mb-1">Всего сигналов</span>
                <span className="text-2xl font-bold text-white">{selectedUser.signals}</span>
              </div>
            </Card>
            <Card className="glass-effect border-green-500/20 p-4 card-3d shadow-xl shadow-green-500/10">
              <div className="flex flex-col">
                <span className="text-green-400 text-xs font-medium mb-1">Успешных</span>
                <span className="text-2xl font-bold text-white">{selectedUser.successful}</span>
              </div>
            </Card>
            <Card className="glass-effect border-rose-500/20 p-4 card-3d shadow-xl shadow-rose-500/10">
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-medium mb-1">Проигрышных</span>
                <span className="text-2xl font-bold text-white">{selectedUser.failed}</span>
              </div>
            </Card>
            <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
              <div className="flex flex-col">
                <span className="text-cyan-400 text-xs font-medium mb-1">Win Rate</span>
                <span className="text-2xl font-bold text-white">{selectedUser.winRate}%</span>
              </div>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center icon-3d shadow-lg shadow-purple-500/20">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Детальная информация</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Дней торговли</span>
                <span className="text-purple-400 font-bold text-xl">{selectedUser.tradingDays}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Сигналов в день</span>
                <span className="text-cyan-400 font-bold text-xl">{selectedUser.avgSignalsPerDay}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Лучшая пара</span>
                <span className="text-emerald-400 font-bold text-xl">{selectedUser.bestPair}</span>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
                <span className="text-slate-400 text-xs block mb-2">Худшая пара</span>
                <span className="text-rose-400 font-bold text-xl">{selectedUser.worstPair}</span>
              </div>
            </div>
          </Card>

          {/* Signals Chart */}
          <Card className="glass-effect border-slate-700/50 p-6 card-3d shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center icon-3d shadow-lg shadow-amber-500/20">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">График сигналов по месяцам</h3>
            </div>
            
            <div className="space-y-4">
              {selectedUser.signalsByMonth.map((item, index) => {
                const totalSignals = item.successful + item.failed
                const successPercentage = (item.successful / totalSignals) * 100
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-medium">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold">{item.successful} успешных</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-400 font-bold">{item.failed} проигрышных</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700/30 flex">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${successPercentage}%` }}
                      >
                        {successPercentage > 15 && (
                          <span className="text-white text-xs font-bold">{successPercentage.toFixed(0)}%</span>
                        )}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${100 - successPercentage}%` }}
                      >
                        {(100 - successPercentage) > 15 && (
                          <span className="text-white text-xs font-bold">{(100 - successPercentage).toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Premium ML Models Screen
  if (currentScreen === 'premium') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 icon-3d">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Премиум ML-модели</h1>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs">
                    VIP ACCESS
                  </Badge>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentScreen('menu')}
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
            </div>
          </div>
        </header>

        {/* Premium Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                🧠 КАТАЛОГ ПРИВАТНЫХ ML-МОДЕЛЕЙ
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl blur-xl"></div>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              💀 Только для своих. Доступ по рукам. Каждый вход — осознанный риск.
            </p>
          </div>

          {/* Active Model Status */}
          <Card className="glass-effect border-emerald-500/30 p-6 mb-8 card-3d shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center icon-3d shadow-xl shadow-emerald-500/20">
                  <Brain className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    🎯 АКТИВНАЯ МОДЕЛЬ: {mlModels.find(m => m.status === 'active')?.emoji} {mlModels.find(m => m.status === 'active')?.name}
                  </h3>
                  <p className="text-emerald-400 text-sm">✅ Модель обучена и готова к работе</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                АКТИВНА
              </Badge>
            </div>
          </Card>

          {/* ML Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mlModels.sort((a, b) => {
              // Сначала активная модель, затем остальные
              if (a.status === 'active') return -1
              if (b.status === 'active') return 1
              return 0
            }).map((model, index) => (
              <Card 
                key={model.id}
                onClick={() => model.status !== 'restricted' && setSelectedMLModel(model.id)}
                className={`glass-effect p-6 backdrop-blur-sm transition-all duration-300 card-3d border-slate-700/50 shadow-xl hover:scale-105 ${
                  model.status === 'active' 
                    ? 'border-emerald-500/50 bg-emerald-500/10 cursor-default' 
                    : model.status === 'restricted'
                    ? 'border-red-500/30 bg-red-500/5 cursor-not-allowed opacity-60'
                    : selectedMLModel === model.id
                    ? 'border-yellow-500/50 bg-yellow-500/10 cursor-pointer hover:border-yellow-500/70'
                    : 'cursor-pointer hover:border-yellow-500/30'
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Header with emoji and title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center icon-3d shadow-xl`}>
                        <span className="text-3xl">{model.emoji}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{model.name}</h3>
                        {model.status === 'active' && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                            АКТИВНА
                          </Badge>
                        )}
                        {model.status === 'restricted' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            BLOCKED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Algorithm */}
                  <p className="text-slate-300 text-xs mb-3 line-clamp-2">{model.algorithm}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold text-sm">{model.winrate}</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 text-xs">{model.style}</span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-xs mb-3 italic line-clamp-2">💬 {model.description}</p>

                  {/* Warning */}
                  {model.warning && (
                    <p className="text-red-400 text-xs mb-3 font-semibold">⚠️ {model.warning}</p>
                  )}

                  {/* Pricing */}
                  <div className="mt-auto">
                    {model.status === 'restricted' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-red-500/50 text-red-400 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Заблокировано - {model.price}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">{t('monthly')}</span>
                          <span className="text-yellow-400 font-bold text-sm">{model.monthlyPrice}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-700"></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500">{t('lifetime')}</span>
                          <span className="text-green-400 font-bold text-sm">{model.lifetimePrice}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Main App Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 icon-3d">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Forex Signals Pro</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                    {selectedMarket === 'forex' ? 'Forex' : 'OTC'}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                    {selectedMode === 'top3' ? 'ТОП-3' : 'Одиночные'}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              onClick={() => {
                if (isNavigationBlocked()) {
                  alert('⚠️ Дождитесь завершения активного сигнала и оставьте фидбек перед переходом!')
                } else {
                  setCurrentScreen('settings')
                }
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3 perspective-container">
          <Card className="glass-effect border-emerald-500/20 p-4 card-3d shadow-xl shadow-emerald-500/10">
            <div className="flex flex-col">
              <span className="text-emerald-400 text-xs font-medium mb-1">Win Rate</span>
              <span className="text-2xl font-bold text-white">87%</span>
            </div>
          </Card>
          <Card className="glass-effect border-cyan-500/20 p-4 card-3d shadow-xl shadow-cyan-500/10">
            <div className="flex flex-col">
              <span className="text-cyan-400 text-xs font-medium mb-1">Активных сигналов</span>
              <span className="text-2xl font-bold text-white">{selectedMode === 'top3' ? '3' : '1'}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-effect border-slate-800/50 p-1 shadow-lg">
            <TabsTrigger value="active" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg">
              Активные
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg">
              История
            </TabsTrigger>
          </TabsList>

          {/* Active Signals */}
          <TabsContent value="active" className="mt-6 space-y-4 perspective-container">
            {(selectedMode === 'top3' ? activeSignals : [activeSignals[0]]).map((signal) => (
              <Card key={signal.id} className="glass-effect backdrop-blur-sm overflow-hidden transition-all duration-300 card-3d border-slate-700/50 shadow-xl">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                        signal.type === 'BUY' 
                          ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                          : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                      }`}>
                        {signal.type === 'BUY' ? (
                          <TrendingUp className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`${
                              signal.type === 'BUY' 
                                ? 'border-emerald-500/50 text-emerald-400' 
                                : 'border-rose-500/50 text-rose-400'
                            } text-xs`}
                          >
                            {signal.type}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {signal.time}
                          </span>
                        </div>
                        
                        {/* Confidence Score Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Уверенность
                            </span>
                            <span className="text-white font-semibold">
                              {(signal.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full transition-all duration-500 shadow-lg"
                              style={{ 
                                width: `${signal.confidence * 100}%`,
                                background: `linear-gradient(to right, 
                                  #ef4444 0%, 
                                  #f97316 20%, 
                                  #eab308 40%, 
                                  #84cc16 60%, 
                                  #22c55e 80%, 
                                  #16a34a 100%)`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => copyToClipboard(signal)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800/50 hover:scale-110 transition-transform"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>


                  {/* Progress Bar */}
                  {signal.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Прогресс к TP1</span>
                        <span className="text-emerald-400 font-semibold">{signal.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 shadow-lg shadow-emerald-500/50"
                          style={{ width: `${signal.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {signal.status === 'pending' && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Ожидание входа</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 text-slate-400 hover:text-white hover:bg-slate-800/50 group hover:scale-105 transition-all"
                  >
                    <span>Подробнее</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            ))}

            {/* Single Mode Generation Buttons */}
            {selectedMode === 'single' && (
              <div className="mt-6">
                <Card className="glass-effect border-cyan-500/30 p-6 card-3d shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">
                    🎯 Сгенерировать сигнал для пары
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMarket === 'forex' ? (
                      <>
                        <Button 
                          onClick={() => generateSignalForPair('EUR/USD')}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          EUR/USD
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('GBP/JPY')}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          GBP/JPY
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('USD/JPY')}
                          className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          USD/JPY
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('AUD/USD')}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          AUD/USD
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => generateSignalForPair('EUR/USD (OTC)')}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          EUR/USD (OTC)
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('NZD/USD (OTC)')}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          NZD/USD (OTC)
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('USD/CHF (OTC)')}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          USD/CHF (OTC)
                        </Button>
                        <Button 
                          onClick={() => generateSignalForPair('GBP/USD (OTC)')}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          GBP/USD (OTC)
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm text-center mt-4">
                    Выберите пару для генерации сигнала
                  </p>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* History Signals */}
          <TabsContent value="history" className="mt-6 space-y-4 perspective-container">
            {historySignals.map((signal) => (
              <Card key={signal.id} className="glass-effect backdrop-blur-sm overflow-hidden transition-all duration-300 card-3d border-slate-700/50 shadow-xl">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                        signal.result === 'profit'
                          ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                          : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                      }`}>
                        {signal.type === 'BUY' ? (
                          <TrendingUp className={`w-6 h-6 ${signal.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                        ) : (
                          <TrendingDown className={`w-6 h-6 ${signal.result === 'profit' ? 'text-emerald-400' : 'text-rose-400'}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{signal.pair}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{signal.type}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">{signal.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${
                        signal.result === 'profit' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      }`}>
                        {signal.result === 'profit' ? 'Успешно' : 'Проигрыш'}
                      </Badge>
                      <div className="text-xs text-slate-500 mt-2">
                        {signal.entry} → {signal.closePrice}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Stats Summary */}
            <Card className="glass-effect border-slate-700/50 p-6 mt-6 card-3d shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center icon-3d shadow-lg shadow-cyan-500/20">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Статистика за месяц</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Всего сигналов</span>
                  <div className="text-2xl font-bold text-white mt-1">47</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Успешных</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">41</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Проигрышных</span>
                  <div className="text-2xl font-bold text-rose-400 mt-1">6</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Win Rate</span>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">87.2%</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back Button */}
        <Button 
          onClick={() => {
            if (isNavigationBlocked()) {
              alert('⚠️ Дождитесь завершения активного сигнала и оставьте фидбек перед переходом!')
            } else {
              setCurrentScreen('mode-select')
            }
          }}
          variant="ghost"
          className="w-full mt-6 text-slate-400 hover:text-white hover:bg-slate-800/50"
        >
          {t('back')}
        </Button>
      </div>

      {/* Pending Signal Overlay - Блокировка навигации */}
      {pendingSignal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="glass-effect border-slate-700/50 p-8 max-w-2xl w-full card-3d shadow-2xl">
            {!isWaitingFeedback ? (
              // Показываем активный сигнал и таймер
              <>
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-red-400" />
                  <h1 className="text-2xl font-bold text-white">СДЕЛКА АКТИВИРОВАНА</h1>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center icon-3d shadow-xl ${
                    pendingSignal.type === 'BUY'
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-emerald-500/30' 
                      : 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 shadow-rose-500/30'
                  }`}>
                    {pendingSignal.type === 'BUY' ? (
                      <TrendingUp className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-10 h-10 text-rose-400" />
                    )}
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{pendingSignal.pair}</h2>
                    <Badge className={`${
                      pendingSignal.type === 'BUY' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                    }`}>
                      {pendingSignal.type}
                    </Badge>
                  </div>
                </div>

                {/* Timer */}
                <Card className="glass-effect border-amber-500/30 p-6 mb-6 card-3d shadow-xl text-center">
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="text-4xl font-bold text-white">
                        {Math.floor(signalTimer / 60)}:{(signalTimer % 60).toString().padStart(2, '0')}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">Осталось до экспирации</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000"
                      style={{ width: `${(signalTimer / (pendingSignal.expiration * 60)) * 100}%` }}
                    ></div>
                  </div>
                </Card>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🚫</span>
                    </div>
                    <p className="text-cyan-400 font-semibold">Навигация заблокирована</p>
                  </div>
                  <p className="text-slate-400 text-sm">Дождитесь экспирации сигнала и оставьте фидбек</p>
                </div>
              </>
            ) : (
              // Запрашиваем фидбек
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Clock className="w-10 h-10 text-amber-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">⏰ Время истекло!</h2>
                  <p className="text-slate-400">Оставьте фидбек о результате сделки</p>
                </div>

                <Card className="glass-effect border-slate-700/50 p-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Пара:</span>
                      <span className="text-white font-bold">{pendingSignal.pair}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Направление:</span>
                      <Badge className={pendingSignal.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                        {pendingSignal.type}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Instructions */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">💡</span>
                    </div>
                    <p className="text-amber-400 font-semibold">Кнопки результата стали активными</p>
                  </div>
                  <p className="text-slate-400 text-sm">После истечения времени укажите результат торговли</p>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => submitFeedback(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 hover:from-emerald-600 hover:via-green-700 hover:to-emerald-600 text-white py-8 text-xl font-bold shadow-2xl shadow-emerald-500/40 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                    <span className="relative flex items-center justify-center gap-3">
                      <span className="text-3xl animate-bounce">✅</span>
                      <span>Успешная сделка</span>
                      <TrendingUp className="w-6 h-6" />
                    </span>
                  </Button>
                  <Button
                    onClick={() => submitFeedback(false)}
                    className="w-full bg-gradient-to-r from-rose-500 via-red-600 to-rose-500 hover:from-rose-600 hover:via-red-700 hover:to-rose-600 text-white py-8 text-xl font-bold shadow-2xl shadow-rose-500/40 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                    <span className="relative flex items-center justify-center gap-3">
                      <span className="text-3xl animate-pulse">❌</span>
                      <span>Убыточная сделка</span>
                      <TrendingDown className="w-6 h-6" />
                    </span>
                  </Button>
                </div>

                <p className="text-amber-400 text-sm text-center mt-4">
                  ⚠️ Оставьте фидбек чтобы разблокировать навигацию
                </p>
              </>
            )}
          </Card>
        </div>
      )}

      {/* No Signal Available Notification */}
      {noSignalAvailable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card className="glass-effect border-amber-500/50 p-8 card-3d shadow-2xl max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Activity className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">⚠️ Нет подходящей точки входа</h3>
              <p className="text-slate-400 text-base mb-2">
                Текущие рыночные условия не оптимальны для открытия позиции
              </p>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-sm">
                Анализ завершён
              </Badge>
            </div>

            <Card className="glass-effect border-slate-700/50 p-6 mb-6 bg-slate-900/50">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                Рекомендации
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Попробуйте другую пару</p>
                    <p className="text-slate-400 text-sm">Выберите другую валютную пару с более благоприятными условиями</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1">Подождите оптимальных условий</p>
                    <p className="text-slate-400 text-sm">Попробуйте снова через {signalCooldown} секунд, когда рынок стабилизируется</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button
              onClick={() => {
                setNoSignalAvailable(false)
                setGeneratedSignals([])
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-6 text-lg font-bold shadow-lg shadow-amber-500/30"
            >
              <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
              Вернуться к выбору пары
            </Button>

            <p className="text-slate-500 text-xs text-center mt-4">
              💡 Терпение — ключ к успешной торговле
            </p>
          </Card>
        </div>
      )}

      {/* Reload Warning Modal */}
      {showReloadWarning && pendingSignal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <Card className="glass-effect border-red-500/50 p-8 max-w-lg w-full card-3d shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Shield className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">⚠️ ВНИМАНИЕ!</h2>
              <p className="text-red-400 text-lg font-semibold mb-2">
                Обнаружена попытка обхода системы
              </p>
              <p className="text-slate-400">
                У вас есть активный сигнал, который требует завершения. 
                Перезагрузка страницы не поможет обойти блокировку навигации.
              </p>
            </div>

            <Card className="glass-effect border-slate-700/50 p-6 mb-6 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Активный сигнал
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Пара:</span>
                  <span className="text-white font-bold text-lg">{pendingSignal.pair}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Направление:</span>
                  <Badge className={`${
                    pendingSignal.type === 'BUY' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  }`}>
                    {pendingSignal.type === 'BUY' ? '📈 BUY' : '📉 SELL'}
                  </Badge>
                </div>
                {!isWaitingFeedback && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Осталось времени:</span>
                    <span className="text-amber-400 font-bold text-lg">
                      {Math.floor(signalTimer / 60)}:{(signalTimer % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                {isWaitingFeedback && (
                  <div className="text-center py-2">
                    <span className="text-red-400 font-semibold">⏰ Требуется фидбек!</span>
                  </div>
                )}
              </div>
            </Card>

            <Button
              onClick={() => {
                setShowReloadWarning(false)
                setCurrentScreen('main')
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg font-bold shadow-lg shadow-cyan-500/30"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Вернуться к открытой сделке
            </Button>

            <p className="text-slate-500 text-xs text-center mt-4">
              Система защиты от обхода блокировки навигации активирована
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

// Глобальная обёртка для проверки блокировки навигации на ВСЕХ экранах
function AppWrapper() {
  return <App />
}

export default AppWrapper


