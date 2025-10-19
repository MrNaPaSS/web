from database import SessionLocal
from models import SubscriptionTemplate

def seed_default_templates():
    db = SessionLocal()
    
    templates = [
        {
            "name": "Basic Trader",
            "description": "Базовая подписка для начинающих",
            "subscriptions": ["logistic-spy"],
            "color_scheme": "blue",
            "icon": "🎯",
            "is_premium": False
        },
        {
            "name": "Premium Trader",
            "description": "Премиум подписка для опытных",
            "subscriptions": ["logistic-spy", "shadow-stack", "forest-necromancer"],
            "color_scheme": "emerald",
            "icon": "💎",
            "is_premium": True
        },
        {
            "name": "VIP Trader",
            "description": "VIP подписка с расширенным доступом",
            "subscriptions": ["logistic-spy", "shadow-stack", "forest-necromancer", "gray-cardinal"],
            "color_scheme": "purple",
            "icon": "👑",
            "is_premium": True
        },
        {
            "name": "Ultimate Trader",
            "description": "Полный доступ ко всем ML моделям",
            "subscriptions": ["logistic-spy", "shadow-stack", "forest-necromancer", "gray-cardinal", "sniper-80x"],
            "color_scheme": "gold",
            "icon": "⚡",
            "is_premium": True
        }
    ]
    
    for template_data in templates:
        template = SubscriptionTemplate(**template_data)
        db.add(template)
    
    db.commit()
    print("✅ Шаблоны подписок созданы!")

if __name__ == '__main__':
    seed_default_templates()


