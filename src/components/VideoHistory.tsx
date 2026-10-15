import React from 'react';
import { Film, Play, Download, Trash2 } from 'lucide-react';
import { GeneratedVideoItem } from '../types';

interface VideoHistoryProps {
  history: GeneratedVideoItem[];
  onSelect: (item: GeneratedVideoItem) => void;
  activeId?: string;
  onClear: () => void;
}

export const VideoHistory: React.FC<VideoHistoryProps> = ({
  history,
  onSelect,
  activeId,
  onClear,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-zinc-200">
            Oluşturulan Videolar ({history.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-zinc-500 hover:text-red-400 flex items-center space-x-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Geçmişi Temizle</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {history.map((item) => {
          const isActive = item.id === activeId;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                isActive
                  ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-md bg-zinc-950'
                  : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
              }`}
            >
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {item.videoBlobUrl ? (
                  <video
                    src={item.videoBlobUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                  />
                ) : (
                  <img
                    src={item.originalImage}
                    alt={item.partName}
                    className="w-full h-full object-cover opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-black translate-x-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-zinc-300">
                  {item.aspectRatio}
                </span>
              </div>

              <div className="p-2">
                <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-cyan-300">
                  {item.partName}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
