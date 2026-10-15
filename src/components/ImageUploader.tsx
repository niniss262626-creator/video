import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  FileCheck,
  Sparkles,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { HARDWARE_PRESETS } from '../constants/presets';
import { HardwarePreset } from '../types';

export interface SelectedImageInfo {
  dataUrl: string;
  mimeType: string;
  fileName: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
  isPreset?: boolean;
  partCategory?: string;
}

interface ImageUploaderProps {
  selectedImage: SelectedImageInfo | null;
  onImageSelected: (info: SelectedImageInfo | null) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  onImageSelected,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingPreset, setIsLoadingPreset] = useState<string | null>(null);

  // Listen for paste event to allow pasting screenshots directly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled]);

  const processFile = (file: File) => {
    setErrorMsg(null);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Resim boyutu 20 MB sınırını aşıyor. Lütfen daha küçük bir dosya seçin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Extract image dimensions
      const img = new Image();
      img.onload = () => {
        onImageSelected({
          dataUrl: result,
          mimeType: file.type || 'image/jpeg',
          fileName: file.name,
          fileSizeBytes: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          isPreset: false,
        });
      };
      img.src = result;
    };

    reader.onerror = () => {
      setErrorMsg('Resim dosyası okunurken bir hata oluştu.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectPreset = async (preset: HardwarePreset) => {
    if (disabled) return;
    setIsLoadingPreset(preset.id);
    setErrorMsg(null);

    try {
      const response = await fetch(preset.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          onImageSelected({
            dataUrl,
            mimeType: blob.type || 'image/jpeg',
            fileName: `${preset.name}.jpg`,
            fileSizeBytes: blob.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
            isPreset: true,
            partCategory: preset.category,
          });
          setIsLoadingPreset(null);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Preset loading error:', err);
      // Fallback: use direct URL in data
      onImageSelected({
        dataUrl: preset.imageUrl,
        mimeType: 'image/jpeg',
        fileName: `${preset.name}.jpg`,
        fileSizeBytes: 150000,
        isPreset: true,
        partCategory: preset.category,
      });
      setIsLoadingPreset(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* File Upload / Display Zone */}
      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 backdrop-blur-sm ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-500/10 scale-[1.01]'
              : 'border-zinc-700/80 hover:border-cyan-500/60 bg-zinc-900/60 hover:bg-zinc-900/80'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            id="pc-part-image-input"
          />

          <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white tracking-wide">
                Bilgisayar Parçası Fotoğrafı Yükle
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Görseli buraya sürükleyin veya bilgisayarınızdan seçmek için{' '}
                <span className="text-cyan-400 underline font-medium">tıklayın</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-zinc-500">
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/50">
                GPU / Ekran Kartı
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/50">
                CPU / İşlemci
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/50">
                Anakart
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/50">
                RAM & Sıvı Soğutma
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 pt-1">
              Desteklenen formatlar: PNG, JPG, WEBP (Panodan yapıştırma desteği <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">Ctrl+V</kbd>)
            </p>
          </div>
        </div>
      ) : (
        /* Image Preview Box */
        <div className="relative rounded-2xl border border-zinc-700/80 bg-zinc-900/80 overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Top metadata strip */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-medium text-zinc-200 truncate">{selectedImage.fileName}</span>
              {selectedImage.partCategory && (
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px]">
                  {selectedImage.partCategory}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-zinc-400 flex-shrink-0">
              {selectedImage.width && selectedImage.height && (
                <span>
                  {selectedImage.width}×{selectedImage.height} px
                </span>
              )}
              <span>{formatFileSize(selectedImage.fileSizeBytes)}</span>
              <button
                type="button"
                onClick={() => onImageSelected(null)}
                disabled={disabled}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
                title="Resmi kaldır"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Preview Container */}
          <div className="relative w-full bg-black/60 flex items-center justify-center p-4 sm:p-6 min-h-[280px] max-h-[460px] overflow-hidden">
            <img
              src={selectedImage.dataUrl}
              alt={selectedImage.fileName}
              className="max-h-[380px] max-w-full object-contain rounded-xl shadow-2xl border border-zinc-800/80 transition-transform duration-300 hover:scale-[1.02]"
            />

            {/* Quick action overlay buttons */}
            <div className="absolute bottom-4 right-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 shadow-lg backdrop-blur-sm transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Değiştir</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error message if any */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hardware Presets Quick Selector */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Veya test etmek için hazır donanım seçin:</span>
          </span>
          <span className="text-[11px] text-zinc-500">Tek tıkla yükle</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {HARDWARE_PRESETS.map((preset) => {
            const isSelected = selectedImage?.fileName === `${preset.name}.jpg`;
            const isLoading = isLoadingPreset === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={disabled || isLoading}
                className={`group relative flex flex-col items-center p-2 rounded-xl border text-left transition-all overflow-hidden ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400/50'
                    : 'border-zinc-800/90 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="relative w-full h-16 rounded-lg overflow-hidden mb-2 bg-zinc-950">
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 border border-zinc-700/60">
                    {preset.badge}
                  </span>
                </div>

                <div className="w-full truncate">
                  <p className="text-[11px] font-medium text-zinc-200 truncate group-hover:text-cyan-300">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">{preset.category}</p>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
