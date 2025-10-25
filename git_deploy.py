#!/usr/bin/env python3
import subprocess
import sys
import os

def run_git_command(cmd):
    """Выполнить git команду через subprocess"""
    try:
        # Используем subprocess.run с shell=False для обхода PowerShell
        result = subprocess.run(
            cmd.split(), 
            capture_output=True, 
            text=True, 
            encoding='utf-8',
            cwd=os.getcwd()
        )
        
        if result.returncode != 0:
            print(f"❌ Ошибка выполнения: {cmd}")
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
    print("🚀 Деплой изменений через Python...")
    
    # Проверяем git статус
    if not run_git_command("git status"):
        return False
    
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
    commit_msg = "🔧 FIX: Add subscription endpoints to signal_api.py + fix hasActiveSubscription logic"
    if not run_git_command(f'git commit -m "{commit_msg}"'):
        return False
    
    # Push
    if not run_git_command("git push origin main"):
        return False
    
    print("✅ Деплой завершен успешно!")
    print("🌐 Сайт: https://app.nomoneynohoney.online")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
