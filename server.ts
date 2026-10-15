import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Generate Video Endpoint
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType, aspectRatio, resolution } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Resim verisi (imageBase64) gereklidir.' });
    }

    // Strip data URL header if present
    const cleanedBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const selectedAspectRatio: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
    const selectedResolution: '720p' | '1080p' = resolution === '1080p' ? '1080p' : '720p';

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Cinematic 3D camera pan around this computer hardware part with vivid RGB illumination, clean reflections, and spinning cooling fans',
      image: {
        imageBytes: cleanedBase64,
        mimeType: mimeType || 'image/jpeg',
      },
      config: {
        numberOfVideos: 1,
        aspectRatio: selectedAspectRatio,
        resolution: selectedResolution,
      },
    });

    if (!operation || !operation.name) {
      return res.status(500).json({ error: 'Video işlemi başlatılamadı (isimsiz işlem).' });
    }

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Error starting video generation:', error);
    res.status(500).json({
      error: error?.message || 'Video oluşturma işlemi başlatılırken hata oluştu.',
    });
  }
});

// 2. Poll Video Operation Status Endpoint
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName gereklidir' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (updated.error) {
      return res.json({
        done: true,
        error: updated.error.message || 'Video render edilirken hata oluştu',
      });
    }

    res.json({
      done: Boolean(updated.done),
      metadata: updated.metadata,
    });
  } catch (error: any) {
    console.error('Error polling video operation:', error);
    res.status(500).json({
      error: error?.message || 'İşlem durumu sorgulanırken hata oluştu.',
    });
  }
});

// 3. Download/Stream Generated Video Endpoint
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName gereklidir' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Oluşturulan videonun indirme adresi bulunamadı.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey || '' },
    });

    if (!videoRes.ok) {
      throw new Error(`Video kaynağından alınamadı (${videoRes.status} ${videoRes.statusText})`);
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', arrayBuffer.byteLength.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Error downloading video:', error);
    res.status(500).json({
      error: error?.message || 'Video indirilemedi.',
    });
  }
});

// 4. Enhance Video Prompt with Gemini
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { partName, originalPrompt, style } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert cinematic director and 3D visual effects artist for high-end computer hardware product videos (commercial grade, CES style).
Hardware part: "${partName || 'computer hardware component'}"
Motion style: "${style || 'cinematic'}"
User initial thought: "${originalPrompt || ''}"

Write a concise, ultra-vivid Veo video motion prompt in English (2-3 sentences max).
Include details on:
1. Dynamic physical motion (e.g. spinning cooling fans, glowing heatpipes, fluid in transparent cooling tubes, 360 camera orbit, subtle micro vibration).
2. Lighting atmosphere (e.g. addressable RGB lighting pulsation, brushed aluminum metallic glints, illuminated trace pathways on PCB, volumetric smoke/vapor).
3. Cinematic camera movement (dolly zoom, slow rotational roll, shallow depth of field).

Return ONLY the plain English prompt text without markdown, quotes or intro phrases.`,
    });

    const enhanced = response.text?.trim() || originalPrompt;
    res.json({ prompt: enhanced });
  } catch (error: any) {
    console.error('Error enhancing prompt:', error);
    res.status(500).json({ error: 'İstem iyileştirilemedi' });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
