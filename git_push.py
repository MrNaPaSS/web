#!/usr/bin/env python3
import subprocess
import sys

def run_git_command(cmd):
    """Выполнить git команду"""
    try:
        # Используем cmd вместо PowerShell
        result = subprocess.run(f'cmd /c "{cmd}"', shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Ошибка: {cmd}")
            print(f"Stderr: {result.stderr}")
            return False
        print(f"✅ {cmd}")
        if result.stdout:
            print(result.stdout)
        return True
    except Exception as e:
        print(f"❌ Исключение: {e}")
        return False

def main():
    print("🚀 Деплой изменений...")
    
    # Добавляем файлы
    files = [
        "backend/signal_api.py",
        "src/components/admin/UserSubscriptionManager.jsx", 
        "src/App.jsx"
    ]
    
    for file in files:
        if not run_git_command(f"git add {file}"):
            return False
    
    # Коммит
    if not run_git_command('git commit -m "FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"'):
        return False
    
    # Push
    if not run_git_command("git push origin main"):
        return False
    
    print("✅ Деплой завершен!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
