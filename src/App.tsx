/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Film,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ImageUploader, SelectedImageInfo } from './components/ImageUploader';
import { PromptSettings } from './components/PromptSettings';
import { GenerationProgress } from './components/GenerationProgress';
import { VideoResultPlayer } from './components/VideoResultPlayer';
import { VideoHistory } from './components/VideoHistory';
import { AspectRatio, Resolution, MotionPreset, GeneratedVideoItem } from './types';
import { MOTION_PRESETS } from './constants/presets';

export default function App() {
  // Image & Config State
  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [prompt, setPrompt] = useState<string>(
    MOTION_PRESETS[0].promptTurkish
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    MOTION_PRESETS[0].id
  );

  // Generation Lifecycle State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentOperationName, setCurrentOperationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Result & History State
  const [activeVideoItem, setActiveVideoItem] = useState<GeneratedVideoItem | null>(null);
  const [history, setHistory] = useState<GeneratedVideoItem[]>([]);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Polling ref to prevent interval leaks
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const handleSelectPreset = (preset: MotionPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.promptTurkish);
  };

  const handleStartGeneration = async () => {
    if (!selectedImage) {
      setError('Lütfen önce bir bilgisayar parçası görseli yükleyin veya seçin.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setElapsedSeconds(0);
    setActiveVideoItem(null);

    // Start elapsed time counter
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      // 1. Start generation on backend (calls Veo 3.1 Fast)
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || 'Cinematic video of computer hardware component with realistic reflections and fan rotation',
          imageBase64: selectedImage.dataUrl,
          mimeType: selectedImage.mimeType,
          aspectRatio,
          resolution,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Video oluşturma işlemi başlatılamadı.');
      }

      const data = await res.json();
      const operationName = data.operationName;
      if (!operationName) {
        throw new Error('Sunucudan geçerli bir işlem kimliği alınamadı.');
      }

      setCurrentOperationName(operationName);

      // 2. Poll video status until done
      pollVideoStatus(operationName);
    } catch (err: any) {
      console.error('Generation start failed:', err);
      stopTimers();
      setIsGenerating(false);
      setError(err?.message || 'Video üretimi başlatılırken beklenmedik bir hata oluştu.');
    }
  };

  const pollVideoStatus = (operationName: string) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    pollingTimerRef.current = setInterval(async () => {
      try {
        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        if (!statusRes.ok) {
          throw new Error('İşlem durumu sorgulanamadı.');
        }

        const statusData = await statusRes.json();

        if (statusData.error) {
          throw new Error(statusData.error);
        }

        if (statusData.done) {
          // Finished! Clear polling timer and proceed to download
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          await downloadGeneratedVideo(operationName);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        stopTimers();
        setIsGenerating(false);
        setError(err?.message || 'Video işlenirken bir sorun oluştu.');
      }
    }, 4000);
  };

  const downloadGeneratedVideo = async (operationName: string) => {
    try {
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });

      if (!downloadRes.ok) {
        throw new Error('Oluşturulan video dosyası indirilemedi.');
      }

      const videoBlob = await downloadRes.blob();
      const videoBlobUrl = URL.createObjectURL(videoBlob);

      const newItem: GeneratedVideoItem = {
        id: `vid-${Date.now()}`,
        operationName,
        createdAt: Date.now(),
        partName: selectedImage?.fileName.replace(/\.[^/.]+$/, '') || 'Donanım Parçası',
        aspectRatio,
        resolution,
        prompt,
        originalImage: selectedImage?.dataUrl || '',
        videoBlobUrl,
        status: 'completed',
      };

      setActiveVideoItem(newItem);
      setHistory((prev) => [newItem, ...prev]);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err?.message || 'Video indirilirken hata oluştu.');
    } finally {
      stopTimers();
      setIsGenerating(false);
    }
  };

  const stopTimers = () => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
  };

  const handleResetForNew = () => {
    setActiveVideoItem(null);
    setError(null);
  };

  const clearHistory = () => {
    history.forEach((item) => {
      if (item.videoBlobUrl) URL.revokeObjectURL(item.videoBlobUrl);
    });
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Glow Header Accent */}
      <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent z-50 opacity-70" />

      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  PC Parça Video Stüdyosu
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80">
                  Veo 3.1 AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Bilgisayar donanımı fotoğraflarını sinematik 3D videoya dönüştürün
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Nasıl Çalışır?</span>
            </button>
          </div>
        </div>
      </header>

      {/* Quick Help Modal/Accordion */}
      {showGuide && (
        <div className="border-b border-zinc-800 bg-zinc-900/90 px-4 py-4 text-xs text-zinc-300">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <strong className="text-white block mb-0.5">Donanım Fotoğrafı Seçin</strong>
                Ekran kartı, işlemci, anakart veya soğutucu fotoğrafınızı yükleyin veya hazır örneklerden birine tıklayın.
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <strong className="text-white block mb-0.5">En-Boy & Animasyon Stili</strong>
                16:9 (Yatay) veya 9:16 (Dikey Reels/Shorts) oranını seçin, 360° dönüş veya RGB fan hızlanması gibi hareket şablonunu belirleyin.
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <strong className="text-white block mb-0.5">Veo 3.1 ile Canlandırın</strong>
                Fizik tabanlı sinematik render tamamlandığında videonuzu tam ekranda izleyin, karşılaştırın ve MP4 olarak indirin.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-start space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block mb-0.5">İşlem Başarısız Oldu</strong>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-white text-xs underline font-medium"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Video Result View (If active) */}
        {activeVideoItem && (
          <VideoResultPlayer
            videoItem={activeVideoItem}
            onGenerateNew={handleResetForNew}
          />
        )}

        {/* Generation In-Progress View */}
        {isGenerating && (
          <GenerationProgress
            elapsedSeconds={elapsedSeconds}
            aspectRatio={aspectRatio === '9:16' ? '9:16 Dikey' : '16:9 Yatay'}
            partName={selectedImage?.fileName || 'Donanım Parçası'}
          />
        )}

        {/* Studio Workspace (Always available or when ready to generate) */}
        {!isGenerating && !activeVideoItem && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Uploader & Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                    Adım 1: Donanım Görseli
                  </h2>
                </div>
                <span className="text-xs text-zinc-500">Yerel dosya veya hazır donanım</span>
              </div>

              {/* File Input Component for PC Part */}
              <ImageUploader
                selectedImage={selectedImage}
                onImageSelected={(info) => {
                  setSelectedImage(info);
                  setError(null);
                }}
                disabled={isGenerating}
              />
            </div>

            {/* Right Column: Settings & Action (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                  Adım 2: Video Ayarları & İstem
                </h2>
                <span className="text-xs text-zinc-500">Veo 3.1 Fast</span>
              </div>

              {/* Prompt & Aspect Ratio Settings */}
              <PromptSettings
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                resolution={resolution}
                onResolutionChange={setResolution}
                prompt={prompt}
                onPromptChange={setPrompt}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                partName={selectedImage?.fileName}
                disabled={isGenerating}
              />

              {/* Generate Video Action Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  disabled={isGenerating || !selectedImage}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2.5 transition-all shadow-xl ${
                    selectedImage
                      ? 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer active:scale-[0.98]'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Film className="w-5 h-5" />
                  <span>
                    {selectedImage
                      ? '🎬 Veo ile Bilgisayar Parçasını Canlandır'
                      : 'Lütfen Önce Bir Görsel Seçin'}
                  </span>
                </button>

                <p className="text-[11px] text-zinc-500 text-center">
                  Model: <span className="text-zinc-300 font-mono">veo-3.1-fast-generate-preview</span> • En-Boy Oranı: <span className="text-zinc-300 font-mono">{aspectRatio}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Video History Reel */}
        <VideoHistory
          history={history}
          onSelect={(item) => setActiveVideoItem(item)}
          activeId={activeVideoItem?.id}
          onClear={clearHistory}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PC Parça Video Stüdyosu • Google AI Studio</span>
          <span className="text-[11px] text-zinc-600">
            Veo 3.1 video modeli ile yüksek kare hızında sinematik donanım canlandırmaları
          </span>
        </div>
      </footer>
    </div>
  );
}
