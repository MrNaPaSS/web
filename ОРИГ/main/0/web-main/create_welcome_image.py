#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from PIL import Image, ImageDraw, ImageFont
import os

# Создаем изображение с размерами Telegram
width, height = 1200, 800

# Создаем изображение с темно-зеленым фоном (Matrix стиль)
img = Image.new('RGB', (width, height), color=(0, 20, 0))
draw = ImageDraw.Draw(img)

# Рисуем "цифровой дождь" - вертикальные линии
for x in range(0, width, 20):
    for y in range(0, height, 30):
        draw.line([(x, y), (x, y + 15)], fill=(0, 100, 0), width=2)

# Рисуем Pepe (упрощенная версия)
# Голова Pepe (зеленый круг)
head_x, head_y = 800, 200
draw.ellipse([head_x-60, head_y-60, head_x+60, head_y+60], fill=(50, 150, 50))

# Глаза
draw.ellipse([head_x-30, head_y-20, head_x-10, head_y], fill=(0, 0, 255))
draw.ellipse([head_x+10, head_y-20, head_x+30, head_y], fill=(0, 0, 255))

# Рот
draw.arc([head_x-20, head_y+10, head_x+20, head_y+30], 0, 180, fill=(255, 0, 0), width=3)

# Капюшон
draw.polygon([(head_x-80, head_y-40), (head_x-60, head_y-80), (head_x+60, head_y-80), (head_x+80, head_y-40)], fill=(0, 0, 0))

# Мешок с деньгами
bag_x, bag_y = 700, 300
draw.rectangle([bag_x-40, bag_y-60, bag_x+40, bag_y+60], fill=(139, 69, 19))
draw.text((bag_x-15, bag_y-15), "$", fill=(255, 255, 0))

# Текст "NO MONEY - No HONEY"
try:
    # Пытаемся использовать системный шрифт
    font_large = ImageFont.truetype("arial.ttf", 60)
    font_medium = ImageFont.truetype("arial.ttf", 40)
except:
    # Если не найден, используем стандартный
    font_large = ImageFont.load_default()
    font_medium = ImageFont.load_default()

# Рисуем текст неоновым зеленым
draw.text((50, 50), "NO MONEY-", fill=(0, 255, 0), font=font_large)
draw.text((50, 120), "No HONEY", fill=(0, 255, 0), font=font_large)

# QR код (упрощенный)
qr_x, qr_y = 50, 600
for i in range(10):
    for j in range(10):
        if (i + j) % 3 == 0:
            draw.rectangle([qr_x + i*8, qr_y + j*8, qr_x + i*8 + 6, qr_y + j*8 + 6], fill=(255, 255, 255))

# Telegram handle
draw.text((qr_x, qr_y + 100), "@NEKNOPKABABLO", fill=(255, 255, 255), font=font_medium)

# Сохраняем изображение
img.save('welcome.jpg', 'JPEG', quality=85)
print("Image welcome.jpg created!")
