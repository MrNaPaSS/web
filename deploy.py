#!/usr/bin/env python3
"""
Скрипт для деплоя изменений на GitHub
"""
import subprocess
import sys
import os

def run_command(cmd):
    """Выполнить команду и вернуть результат"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8')
        if result.returncode != 0:
            print(f"❌ Ошибка выполнения команды: {cmd}")
            print(f"Stderr: {result.stderr}")
            return False
        print(f"✅ {cmd}")
        if result.stdout:
            print(result.stdout)
        return True
    except Exception as e:
        print(f"❌ Исключение при выполнении {cmd}: {e}")
        return False

def main():
    print("🚀 Начинаем деплой изменений...")
    
    # Проверяем, что мы в git репозитории
    if not os.path.exists('.git'):
        print("❌ Не найден .git каталог. Убедитесь, что вы в корне репозитория.")
        return False
    
    # Добавляем все файлы
    print("📦 Добавляем файлы в git...")
    if not run_command("git add ."):
        return False
    
    # Создаем коммит
    print("💾 Создаем коммит...")
    commit_message = "🔧 FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"
    if not run_command(f'git commit -m "{commit_message}"'):
        return False
    
    # Отправляем на GitHub
    print("🚀 Отправляем на GitHub...")
    if not run_command("git push origin main"):
        return False
    
    print("✅ Деплой завершен успешно!")
    print("🌐 Сайт будет обновлен: https://app.nomoneynohoney.online")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
