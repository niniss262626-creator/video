import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Maximize2,
  Sliders,
  Check,
  Sparkles,
  Share2,
  Film,
  Eye,
  Layers,
} from 'lucide-react';
import { GeneratedVideoItem } from '../types';

interface VideoResultPlayerProps {
  videoItem: GeneratedVideoItem;
  onGenerateNew: () => void;
}

export const VideoResultPlayer: React.FC<VideoResultPlayerProps> = ({
  videoItem,
  onGenerateNew,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'video' | 'compare' | 'split'>('video');
  const [sliderPos, setSliderPos] = useState(50);
  const [copied, setCopied] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleDownload = () => {
    if (!videoItem.videoBlobUrl) return;
    const a = document.createElement('a');
    a.href = videoItem.videoBlobUrl;
    a.download = `${videoItem.partName.replace(/[^a-zA-Z0-9]/g, '_')}_Veo_Video.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(videoItem.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPortrait = videoItem.aspectRatio === '9:16';

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Video Başarıyla Oluşturuldu</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs">
              {videoItem.aspectRatio === '9:16' ? '9:16 Dikey' : '16:9 Yatay'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            {videoItem.partName} - Sinematik Video
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('video')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'video'
                  ? 'bg-cyan-500 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compare')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'compare'
                  ? 'bg-cyan-500 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Yan Yana
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>MP4 İndir</span>
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex flex-col items-center justify-center bg-black/80 rounded-2xl p-3 sm:p-6 border border-zinc-800/80 min-h-[380px] overflow-hidden">
        {viewMode === 'video' && (
          <div
            className={`relative rounded-xl overflow-hidden bg-black shadow-2xl border border-zinc-800 ${
              isPortrait ? 'w-[320px] max-w-full aspect-[9/16]' : 'w-full max-w-3xl aspect-[16/9]'
            }`}
          >
            <video
              ref={videoRef}
              src={videoItem.videoBlobUrl}
              autoPlay
              loop={isLooping}
              playsInline
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Custom Overlay Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isLooping ? 'text-cyan-400 bg-cyan-950/60' : 'text-zinc-400 hover:bg-white/20'
                  }`}
                  title="Döngü Modu"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {[0.5, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => changeSpeed(speed)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'compare' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
            {/* Original Static Image */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold text-zinc-300">1. Orijinal Donanım Fotoğrafı</span>
                <span>Kaynak</span>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black border border-zinc-800 aspect-[16/9] flex items-center justify-center">
                <img
                  src={videoItem.originalImage}
                  alt={videoItem.partName}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Generated Animated Video */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-semibold text-cyan-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Veo 3.1 Sinematik Video Çıktısı</span>
                </span>
                <span className="text-emerald-400">Canlandırıldı</span>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black border border-cyan-500/40 aspect-[16/9] flex items-center justify-center">
                <video
                  src={videoItem.videoBlobUrl}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Details & Prompt Info */}
      <div className="bg-zinc-950/60 rounded-2xl p-4 sm:p-5 border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Kullanılan Veo İstemi (Prompt)
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Kopyalandı!' : 'İstemi Kopyala'}</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
          "{videoItem.prompt}"
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 pt-2 border-t border-zinc-800/50">
          <div className="flex items-center space-x-4">
            <span>Model: <strong>veo-3.1-fast-generate-preview</strong></span>
            <span>Oran: <strong>{videoItem.aspectRatio}</strong></span>
            <span>Çözünürlük: <strong>{videoItem.resolution}</strong></span>
          </div>

          <button
            type="button"
            onClick={onGenerateNew}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
          >
            Farklı Bir Parça ile Dene
          </button>
        </div>
      </div>
    </div>
  );
};
