-- Создание таблиц для системы подписок
-- Миграция 001: Основные таблицы

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10) DEFAULT 'en',
    role VARCHAR(20) DEFAULT 'user',
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица ML моделей (справочник)
CREATE TABLE IF NOT EXISTS subscription_models (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    accuracy_range VARCHAR(50),
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица подписок пользователей
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(telegram_id),
    model_id VARCHAR(50) NOT NULL REFERENCES subscription_models(id),
    granted_by BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Таблица истории изменений подписок
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    old_subscriptions JSONB,
    new_subscriptions JSONB NOT NULL,
    reason VARCHAR(500),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица шаблонов подписок
CREATE TABLE IF NOT EXISTS subscription_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subscriptions JSONB NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    color_scheme VARCHAR(50),
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_users_subscription_version ON users(subscription_version);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_model_id ON user_subscriptions(model_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiry ON user_subscriptions(expiry_date);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at);

-- Seed данные: 5 ML моделей
INSERT INTO subscription_models (id, name, description, accuracy_range, is_free) VALUES
('logistic-spy', 'Logistic Regression Spy', 'Базовая модель логистической регрессии для анализа трендов', '60-65%', true),
('shadow-stack', 'Shadow Stack', 'Продвинутая модель стекинга с теневой архитектурой', '70-75%', false),
('forest-necromancer', 'Forest Necromancer', 'Ансамбль случайных лесов с глубоким обучением', '65-70%', false),
('gray-cardinal', 'Gray Cardinal', 'Скрытая модель с машинным обучением', '68-72%', false),
('sniper-80x', 'Sniper 80x', 'Премиум модель с высокой точностью', '75-80%', false)
ON CONFLICT (id) DO NOTHING;

-- Создание админа (если не существует)
INSERT INTO users (telegram_id, first_name, last_name, username, role, is_premium) VALUES
(511442168, 'Admin', '', '', 'admin', true)
ON CONFLICT (telegram_id) DO NOTHING;

-- Выдача базовой подписки админу
INSERT INTO user_subscriptions (user_id, model_id, granted_by, is_active) VALUES
(511442168, 'logistic-spy', 511442168, true)
ON CONFLICT DO NOTHING;
