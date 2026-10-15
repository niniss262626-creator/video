export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';

export interface HardwarePreset {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  imageUrl: string;
  defaultPrompt: string;
}

export interface MotionPreset {
  id: string;
  title: string;
  description: string;
  iconName: string;
  promptTurkish: string;
  promptEnglish: string;
}

export interface GeneratedVideoItem {
  id: string;
  operationName: string;
  createdAt: number;
  partName: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  prompt: string;
  originalImage: string;
  videoBlobUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  progressPercent?: number;
}
