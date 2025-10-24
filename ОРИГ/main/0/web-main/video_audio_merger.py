import os
import sys
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips
from pydub import AudioSegment
from pydub.silence import detect_nonsilent
import numpy as np

def remove_silence_from_audio(audio_path, silence_thresh=-40, min_silence_len=500):
    """Удаляет тишину из аудио файла"""
    print(f"Обрабатываю аудио: {audio_path}")
    audio = AudioSegment.from_file(audio_path)
    
    # Находим участки без тишины
    nonsilent_ranges = detect_nonsilent(
        audio,
        min_silence_len=min_silence_len,
        silence_thresh=silence_thresh
    )
    
    if not nonsilent_ranges:
        print("Не найдено участков без тишины")
        return audio_path
    
    # Склеиваем участки без тишины
    print(f"Найдено {len(nonsilent_ranges)} участков без тишины")
    cleaned_audio = AudioSegment.empty()
    for start, end in nonsilent_ranges:
        cleaned_audio += audio[start:end]
    
    # Сохраняем очищенное аудио
    temp_audio = "temp_cleaned_audio.mp3"
    cleaned_audio.export(temp_audio, format="mp3")
    print(f"Аудио очищено: {len(audio)/1000:.2f}s -> {len(cleaned_audio)/1000:.2f}s")
    
    return temp_audio

def merge_video_audio(video_path, audio_path, output_path="output_video.mp4", remove_silence=True):
    """Накладывает аудио на видео"""
    
    if not os.path.exists(video_path):
        print(f"ОШИБКА: Видео файл не найден: {video_path}")
        return False
    
    if not os.path.exists(audio_path):
        print(f"ОШИБКА: Аудио файл не найден: {audio_path}")
        return False
    
    print("Загружаю видео...")
    video = VideoFileClip(video_path)
    print(f"Видео загружено: {video.duration:.2f}s, {video.size}")
    
    # Обрабатываем аудио
    if remove_silence:
        processed_audio_path = remove_silence_from_audio(audio_path)
    else:
        processed_audio_path = audio_path
    
    print("Загружаю аудио...")
    audio = AudioFileClip(processed_audio_path)
    print(f"Аудио загружено: {audio.duration:.2f}s")
    
    # Если аудио короче видео - повторяем видео под аудио
    # Если аудио длиннее видео - обрезаем видео под аудио
    if audio.duration > video.duration:
        print(f"Аудио длиннее видео, зацикливаю видео...")
        num_loops = int(np.ceil(audio.duration / video.duration))
        video = concatenate_videoclips([video] * num_loops)
        video = video.subclip(0, audio.duration)
    elif audio.duration < video.duration:
        print(f"Видео длиннее аудио, обрезаю видео...")
        video = video.subclip(0, audio.duration)
    
    # Накладываем аудио на видео
    print("Накладываю аудио на видео...")
    final_video = video.set_audio(audio)
    
    # Сохраняем результат
    print(f"Сохраняю результат: {output_path}")
    final_video.write_videofile(
        output_path,
        codec='libx264',
        audio_codec='aac',
        fps=video.fps,
        preset='medium',
        threads=4
    )
    
    # Закрываем клипы
    video.close()
    audio.close()
    final_video.close()
    
    # Удаляем временный файл
    if remove_silence and os.path.exists("temp_cleaned_audio.mp3"):
        os.remove("temp_cleaned_audio.mp3")
    
    print(f"\n✅ ГОТОВО! Файл сохранён: {output_path}")
    return True

if __name__ == "__main__":
    video_file = r"C:\Users\Admin\Desktop\IMG_5544.MOV"
    audio_file = r"C:\Users\Admin\Desktop\2025_10_12_20_32_58__audio_extractor.net__clean.mp3"
    output_file = r"C:\Users\Admin\Desktop\output_video.mp4"
    
    print("="*60)
    print("НАЛОЖЕНИЕ АУДИО НА ВИДЕО С УДАЛЕНИЕМ ЗАМИНОК")
    print("="*60)
    
    success = merge_video_audio(video_file, audio_file, output_file, remove_silence=True)
    
    if success:
        print(f"\n✅ Видео готово: {output_file}")
    else:
        print("\n❌ Произошла ошибка при обработке")

