import React, { useState } from 'react';
import {
  RotateCw,
  Zap,
  Cpu,
  Sparkles,
  Layers,
  Wand2,
  Tv,
  Smartphone,
  ChevronDown,
  Info,
  Check,
} from 'lucide-react';
import { AspectRatio, Resolution, MotionPreset } from '../types';
import { MOTION_PRESETS } from '../constants/presets';

interface PromptSettingsProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  resolution: Resolution;
  onResolutionChange: (res: Resolution) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: MotionPreset) => void;
  partName?: string;
  disabled?: boolean;
}

export const PromptSettings: React.FC<PromptSettingsProps> = ({
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  prompt,
  onPromptChange,
  selectedPresetId,
  onSelectPreset,
  partName,
  disabled = false,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceSuccess, setEnhanceSuccess] = useState(false);

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'RotateCw':
        return <RotateCw className="w-4 h-4 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-blue-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleEnhancePrompt = async () => {
    if (disabled || isEnhancing) return;
    setIsEnhancing(true);
    setEnhanceSuccess(false);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partName: partName || 'computer hardware component',
          originalPrompt: prompt,
          style: 'cinematic',
        }),
      });

      if (!res.ok) throw new Error('İstem zenginleştirilemedi');
      const data = await res.json();
      if (data.prompt) {
        onPromptChange(data.prompt);
        setEnhanceSuccess(true);
        setTimeout(() => setEnhanceSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Enhance failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="w-full space-y-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
      {/* Aspect Ratio and Resolution Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Aspect Ratio Selector (Mandatory 16:9 or 9:16) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Video En-Boy Oranı (Aspect Ratio)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAspectRatioChange('16:9')}
              className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                aspectRatio === '16:9'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400/40 shadow-sm shadow-cyan-500/20'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Tv className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <div className="leading-tight">16:9 Yatay</div>
                <div className="text-[10px] text-zinc-500">YouTube, Monitör</div>
              </div>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onAspectRatioChange('9:16')}
              className={`flex items-center justify-center space-x-2.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                aspectRatio === '9:16'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400/40 shadow-sm shadow-cyan-500/20'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <div className="text-left">
                <div className="leading-tight">9:16 Dikey</div>
                <div className="text-[10px] text-zinc-500">Reels, Shorts, TikTok</div>
              </div>
            </button>
          </div>
        </div>

        {/* Resolution Selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Çözünürlük (Resolution)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onResolutionChange('720p')}
              className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                resolution === '720p'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400/40'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-center">
                <div className="leading-tight font-semibold">720p HD</div>
                <div className="text-[10px] text-zinc-500">Hızlı & Akıcı</div>
              </div>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onResolutionChange('1080p')}
              className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                resolution === '1080p'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-400/40'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-center">
                <div className="leading-tight font-semibold">1080p FHD</div>
                <div className="text-[10px] text-zinc-500">Yüksek Netlik</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Cinematic Motion Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Sinematik Hareket & Animasyon Stili
          </label>
          <span className="text-[11px] text-zinc-500">Parçaya özel efektler</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {MOTION_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectPreset(preset)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400/50 shadow-md'
                    : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800/70 hover:border-zinc-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700/60">
                    {getPresetIcon(preset.iconName)}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 truncate">
                    {preset.title}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Prompt Text Area */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Veo Video İstemi (Prompt)
          </label>

          <button
            type="button"
            disabled={disabled || isEnhancing || !prompt.trim()}
            onClick={handleEnhancePrompt}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              enhanceSuccess
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60'
            } ${disabled || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title="Gemini ile istemi donanım sinematik video standartlarına uyarla"
          >
            {isEnhancing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>İyileştiriliyor...</span>
              </>
            ) : enhanceSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zenginleştirildi!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>✨ AI ile Zenginleştir</span>
              </>
            )}
          </button>
        </div>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={disabled}
          placeholder="Örnek: Ekran kartının fanları hızla dönüyor, neon RGB ışıklar renk değiştiriyor ve kamera etrafında 360 derece dönüyor..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all resize-y min-h-[75px]"
        />

        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
          <span className="flex items-center space-x-1">
            <Info className="w-3 h-3 text-zinc-500" />
            <span>Kamera hareketi, RGB ışıkları ve fan devri gibi detaylar ekleyebilirsiniz.</span>
          </span>
          <span>{prompt.length} karakter</span>
        </div>
      </div>
    </div>
  );
};
