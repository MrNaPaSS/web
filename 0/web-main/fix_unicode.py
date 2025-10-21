#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import os

def fix_unicode_in_file(filepath):
    """Исправляет Unicode символы в файле"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Заменяем все emoji символы на текст
    replacements = {
        '🔍': '',
        '💰': '',
        '📊': '',
        '🔑': '',
        '🎯': '',
        '⚠️': '',
        '❌': '',
        '✅': '',
        '📈': '',
        '🔒': '',
        '🔓': '',
        '📋': '',
        '🔧': '',
        '⚙️': '',
        '🔄': '',
        '🚀': '',
        '💡': '',
        '📝': '',
        '🔔': '',
        '🎉': '',
        '🔥': '',
        '⭐': '',
        '💯': '',
        '🎪': '',
        '🏆': '',
        '🥇': '',
        '🥈': '',
        '🥉': '',
        '🎭': '',
        '🎨': '',
        '🎬': '',
        '🎵': '',
        '🎶': '',
        '🎸': '',
        '🎺': '',
        '🎻': '',
        '🎹': '',
        '🥁': '',
        '🎤': '',
        '🎧': '',
        '📻': '',
        '📺': '',
        '📷': '',
        '📹': '',
        '🎥': '',
        '💻': '',
        '🖥️': '',
        '🖨️': '',
        '⌨️': '',
        '🖱️': '',
        '🖲️': '',
        '💽': '',
        '💾': '',
        '💿': '',
        '📀': '',
        '🧮': '',
        '🎲': '',
        '♠️': '',
        '♥️': '',
        '♦️': '',
        '♣️': '',
        '🃏': '',
        '🀄': '',
        '🎴': '',
        '🎯': '',
        '🎳': '',
        '🎮': '',
        '🕹️': '',
        '🎰': '',
        '🧩': '',
        '🎪': '',
        '🛹': '',
        '🛷': '',
        '⛸️': '',
        '🥌': '',
        '🎿': '',
        '🛼': '',
        '🛹': '',
        '🛷': '',
        '⛸️': '',
        '🥌': '',
        '🎿': '',
        '🛼': '',
        '🛹': '',
        '🛷': '',
        '⛸️': '',
        '🥌': '',
        '🎿': '',
        '🛼': '',
        '🛹': '',
        '🛷': '',
        '⛸️': '',
        '🥌': '',
        '🎿': '',
        '🛼': ''
    }
    
    for emoji, replacement in replacements.items():
        content = content.replace(emoji, replacement)
    
    # Убираем лишние пробелы
    content = re.sub(r'\s+', ' ', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Исправлен файл: {filepath}")

if __name__ == "__main__":
    files_to_fix = [
        "fixed_comprehensive_analysis.py",
        "test_otc_generator.py",
        "test_api.py"
    ]
    
    for filename in files_to_fix:
        if os.path.exists(filename):
            fix_unicode_in_file(filename)
        else:
            print(f"Файл не найден: {filename}")
