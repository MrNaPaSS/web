import os
import sys
import numpy as np
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips
from pydub import AudioSegment
from pydub.silence import detect_nonsilent, split_on_silence
from pydub.effects import normalize, compress_dynamic_range
import noisereduce as nr
import librosa
import soundfile as sf
from scipy import signal

# Устанавливаем UTF-8 для корректного вывода
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

class ProAudioProcessor:
    """Профессиональная обработка аудио с AI"""
    
    def __init__(self, audio_path):
        self.audio_path = audio_path
        self.temp_files = []
    
    def load_audio(self):
        """Загрузка аудио в numpy массив"""
        print("📥 Загружаю аудио...")
        y, sr = librosa.load(self.audio_path, sr=None)
        print(f"✅ Аудио загружено: {len(y)/sr:.2f}s, sample rate: {sr}Hz")
        return y, sr
    
    def reduce_noise(self, y, sr):
        """Удаление фонового шума"""
        print("🔇 Удаляю фоновый шум...")
        
        # Находим участок тишины для профиля шума
        rms = librosa.feature.rms(y=y)[0]
        noise_threshold = np.percentile(rms, 10)
        noise_indices = np.where(rms < noise_threshold)[0]
        
        if len(noise_indices) > sr // 2:  # Минимум 0.5 секунды шума
            noise_sample = y[:sr]  # Берём первую секунду как профиль шума
        else:
            noise_sample = y[:sr//2]
        
        # Применяем шумоподавление
        reduced_noise = nr.reduce_noise(y=y, sr=sr, y_noise=noise_sample, prop_decrease=0.8)
        print("✅ Шум удалён")
        return reduced_noise
    
    def normalize_loudness(self, y):
        """Нормализация громкости"""
        print("📊 Нормализую громкость...")
        
        # Применяем пиковую нормализацию
        max_val = np.abs(y).max()
        if max_val > 0:
            y = y / max_val * 0.95  # Оставляем небольшой запас
        
        print("✅ Громкость нормализована")
        return y
    
    def remove_silence_smart(self, y, sr, threshold_db=-35, min_silence_ms=300):
        """Умное удаление пауз с сохранением естественности"""
        print("✂️ Удаляю паузы и заминки...")
        
        # Конвертируем в pydub для работы с тишиной
        temp_file = "temp_for_silence.wav"
        sf.write(temp_file, y, sr)
        self.temp_files.append(temp_file)
        
        audio = AudioSegment.from_wav(temp_file)
        
        # Находим участки без тишины
        nonsilent_ranges = detect_nonsilent(
            audio,
            min_silence_len=min_silence_ms,
            silence_thresh=threshold_db,
            seek_step=10
        )
        
        if not nonsilent_ranges:
            print("⚠️ Не найдено участков без тишины, оставляю как есть")
            return y
        
        # Склеиваем с небольшими промежутками для естественности
        cleaned_audio = AudioSegment.empty()
        short_pause = AudioSegment.silent(duration=100)  # 100мс между фразами
        
        print(f"📍 Найдено {len(nonsilent_ranges)} фрагментов речи")
        
        for i, (start, end) in enumerate(nonsilent_ranges):
            # Добавляем небольшой отступ с краёв
            start = max(0, start - 50)
            end = min(len(audio), end + 50)
            
            cleaned_audio += audio[start:end]
            
            # Добавляем паузу между фрагментами (кроме последнего)
            if i < len(nonsilent_ranges) - 1:
                cleaned_audio += short_pause
        
        # Сохраняем и загружаем обратно
        temp_cleaned = "temp_cleaned.wav"
        cleaned_audio.export(temp_cleaned, format="wav")
        self.temp_files.append(temp_cleaned)
        
        y_cleaned, _ = librosa.load(temp_cleaned, sr=sr)
        
        original_duration = len(y) / sr
        cleaned_duration = len(y_cleaned) / sr
        reduction = ((original_duration - cleaned_duration) / original_duration) * 100
        
        print(f"✅ Паузы удалены: {original_duration:.2f}s -> {cleaned_duration:.2f}s (сокращено на {reduction:.1f}%)")
        
        return y_cleaned
    
    def enhance_voice(self, y, sr):
        """Улучшение качества голоса"""
        print("🎤 Улучшаю качество голоса...")
        
        # Применяем эквализацию для голоса (усиливаем частоты речи)
        # Голос человека: 300-3400 Hz
        
        # High-pass фильтр (убираем низкие частоты до 80 Hz)
        sos_hp = signal.butter(4, 80, 'hp', fs=sr, output='sos')
        y = signal.sosfilt(sos_hp, y)
        
        # Low-pass фильтр (убираем высокие частоты выше 8000 Hz)
        sos_lp = signal.butter(4, 8000, 'lp', fs=sr, output='sos')
        y = signal.sosfilt(sos_lp, y)
        
        print("✅ Голос улучшен")
        return y
    
    def apply_compression(self, y, sr):
        """Применение динамической компрессии"""
        print("🎛️ Применяю компрессию...")
        
        # Конвертируем в pydub
        temp_file = "temp_for_compression.wav"
        sf.write(temp_file, y, sr)
        self.temp_files.append(temp_file)
        
        audio = AudioSegment.from_wav(temp_file)
        
        # Применяем компрессию
        compressed = compress_dynamic_range(audio, threshold=-20.0, ratio=4.0, attack=5.0, release=50.0)
        
        # Нормализуем после компрессии
        normalized = normalize(compressed)
        
        # Сохраняем и загружаем обратно
        temp_compressed = "temp_compressed.wav"
        normalized.export(temp_compressed, format="wav")
        self.temp_files.append(temp_compressed)
        
        y_compressed, _ = librosa.load(temp_compressed, sr=sr)
        
        print("✅ Компрессия применена")
        return y_compressed
    
    def process_audio(self, output_path="processed_audio.wav"):
        """Полная обработка аудио"""
        print("\n" + "="*60)
        print("🎵 ПРОФЕССИОНАЛЬНАЯ AI ОБРАБОТКА АУДИО")
        print("="*60 + "\n")
        
        # Загружаем
        y, sr = self.load_audio()
        
        # Удаляем шум
        y = self.reduce_noise(y, sr)
        
        # Улучшаем голос
        y = self.enhance_voice(y, sr)
        
        # Удаляем паузы
        y = self.remove_silence_smart(y, sr)
        
        # Применяем компрессию
        y = self.apply_compression(y, sr)
        
        # Финальная нормализация
        y = self.normalize_loudness(y)
        
        # Сохраняем результат
        print(f"💾 Сохраняю обработанное аудио: {output_path}")
        sf.write(output_path, y, sr)
        
        print("\n✅ АУДИО ОБРАБОТАНО ПРОФЕССИОНАЛЬНО!")
        
        # Очищаем временные файлы
        self.cleanup()
        
        return output_path
    
    def cleanup(self):
        """Удаление временных файлов"""
        for temp_file in self.temp_files:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except:
                    pass

def merge_video_audio_pro(video_path, audio_path, output_path="output_video.mp4"):
    """Профессиональное наложение аудио на видео"""
    
    if not os.path.exists(video_path):
        print(f"❌ ОШИБКА: Видео файл не найден: {video_path}")
        return False
    
    if not os.path.exists(audio_path):
        print(f"❌ ОШИБКА: Аудио файл не найден: {audio_path}")
        return False
    
    # Профессиональная обработка аудио
    processor = ProAudioProcessor(audio_path)
    processed_audio = processor.process_audio("processed_audio.wav")
    
    print("\n" + "="*60)
    print("🎬 НАЛОЖЕНИЕ АУДИО НА ВИДЕО")
    print("="*60 + "\n")
    
    print("📥 Загружаю видео...")
    video = VideoFileClip(video_path)
    print(f"✅ Видео загружено: {video.duration:.2f}s, {video.size}, {video.fps} fps")
    
    print("📥 Загружаю обработанное аудио...")
    audio = AudioFileClip(processed_audio)
    print(f"✅ Аудио загружено: {audio.duration:.2f}s")
    
    # Синхронизация видео и аудио
    if audio.duration > video.duration:
        print(f"🔄 Аудио длиннее видео, зацикливаю видео...")
        num_loops = int(np.ceil(audio.duration / video.duration))
        video = concatenate_videoclips([video] * num_loops)
        video = video.subclip(0, audio.duration)
        print(f"✅ Видео зациклено {num_loops} раз")
    elif audio.duration < video.duration:
        print(f"✂️ Видео длиннее аудио, обрезаю видео...")
        video = video.subclip(0, audio.duration)
        print(f"✅ Видео обрезано до {audio.duration:.2f}s")
    
    # Накладываем аудио
    print("🎭 Накладываю обработанное аудио на видео...")
    final_video = video.set_audio(audio)
    
    # Сохраняем с высоким качеством
    print(f"💾 Сохраняю финальное видео: {output_path}")
    print("⏳ Это может занять несколько минут...")
    
    final_video.write_videofile(
        output_path,
        codec='libx264',
        audio_codec='aac',
        audio_bitrate='320k',  # Высокое качество аудио
        fps=video.fps,
        preset='slow',  # Лучшее качество сжатия
        threads=8,
        bitrate='8000k'  # Высокий битрейт видео
    )
    
    # Закрываем клипы
    video.close()
    audio.close()
    final_video.close()
    
    # Удаляем временное аудио
    if os.path.exists(processed_audio):
        os.remove(processed_audio)
    
    print("\n" + "="*60)
    print(f"✅ ГОТОВО! Профессиональное видео: {output_path}")
    print("="*60)
    
    return True

if __name__ == "__main__":
    video_file = r"C:\Users\Admin\Desktop\IMG_5544.MOV"
    audio_file = r"C:\Users\Admin\Desktop\2025_10_12_20_32_58__audio_extractor.net__clean.mp3"
    output_file = r"C:\Users\Admin\Desktop\output_professional.mp4"
    
    print("\n" + "="*70)
    print("🎥 ПРОФЕССИОНАЛЬНАЯ ОБРАБОТКА ВИДЕО С AI")
    print("="*70)
    print(f"\n📹 Видео: {os.path.basename(video_file)}")
    print(f"🎵 Аудио: {os.path.basename(audio_file)}")
    print(f"💾 Результат: {os.path.basename(output_file)}\n")
    
    success = merge_video_audio_pro(video_file, audio_file, output_file)
    
    if success:
        print(f"\n🎉 ВИДЕО ГОТОВО: {output_file}")
    else:
        print("\n❌ ПРОИЗОШЛА ОШИБКА")

