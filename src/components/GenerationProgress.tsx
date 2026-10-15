import React, { useEffect, useState } from 'react';
import {
  Film,
  Cpu,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface GenerationProgressProps {
  elapsedSeconds: number;
  aspectRatio: string;
  partName: string;
}

const STAGES = [
  {
    seconds: 0,
    title: 'Donanım Görüntüsü Analiz Ediliyor',
    desc: 'Bileşen kenarları, soğutma blokları ve devre yapısı taranıyor...',
    icon: Cpu,
  },
  {
    seconds: 15,
    title: 'Veo 3.1 Video Modeli Başlatıldı',
    desc: '3D derinlik haritası ve kamera yörüngesi hesaplanıyor...',
    icon: Film,
  },
  {
    seconds: 35,
    title: 'Fizik & Hareket Dinamikleri İşleniyor',
    desc: 'Fan devirleri, hava akımı simülasyonu ve RGB ışık geçişleri sentezleniyor...',
    icon: Zap,
  },
  {
    seconds: 60,
    title: 'Yüksek Çözünürlüklü Kareler Render Ediliyor',
    desc: 'Yansımalar, gölgeler ve sinematik ışık süzmeleri birleştiriliyor...',
    icon: Sparkles,
  },
  {
    seconds: 90,
    title: 'Son Renk & H.264 Video Kodlaması',
    desc: 'Video çıktısı tamamlanmak üzere, son optimizasyonlar uygulanıyor...',
    icon: Layers,
  },
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  elapsedSeconds,
  aspectRatio,
  partName,
}) => {
  // Determine current stage index based on elapsed seconds
  const currentStageIndex = STAGES.reduce((acc, stage, index) => {
    return elapsedSeconds >= stage.seconds ? index : acc;
  }, 0);

  const currentStage = STAGES[currentStageIndex];
  const CurrentIcon = currentStage.icon;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-zinc-950/80 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
        {/* Animated Icon Ring */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-cyan-400/20 flex items-center justify-center animate-spin [animation-duration:8s]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-950 to-blue-900 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-inner">
              <CurrentIcon className="w-7 h-7 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status Headings */}
        <div className="space-y-1.5 mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[11px] font-semibold text-cyan-300 mb-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Veo 3.1 Video Üretimi Devam Ediyor ({aspectRatio})</span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-wide">
            {currentStage.title}
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            {currentStage.desc}
          </p>
        </div>

        {/* Progress Timeline steps */}
        <div className="w-full grid grid-cols-5 gap-1.5 mb-6">
          {STAGES.map((s, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                    isDone
                      ? 'bg-cyan-400'
                      : isCurrent
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse'
                      : 'bg-zinc-800'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Live Metrics bar */}
        <div className="flex items-center justify-center space-x-6 text-xs text-zinc-400 border-t border-zinc-800/80 pt-4 w-full">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Geçen Süre: <strong className="text-white font-mono">{formatTime(elapsedSeconds)}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Film className="w-4 h-4 text-purple-400" />
            <span>Hedef: <strong className="text-zinc-200">{partName}</strong></span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-zinc-500">
            <span>Model: veo-3.1-fast-generate-preview</span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 mt-4">
          💡 Veo sinematik video üretimi fizik tabanlı render yaptığı için genellikle 1-2 dakika sürer. Lütfen sayfayı kapatmayın.
        </p>
      </div>
    </div>
  );
};
