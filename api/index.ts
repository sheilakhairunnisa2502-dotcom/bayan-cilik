import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// AI Quiz Generator for Elementary School Kids
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { category = 'umum', count = 3, level = 'pemula' } = req.body;

    if (!ai) {
      // Fallback structured questions if API key is not ready
      return res.json({
        success: true,
        source: 'local-fallback',
        questions: getFallbackQuestions(category),
      });
    }

    const prompt = `Buatkan ${count} soal kuis interaktif Bahasa Arab untuk anak Sekolah Dasar (SD kelas 1-6) dengan kategori: "${category}" dan tingkat: "${level}".
Setiap soal harus:
1. Memiliki teks bahasa Arab berharakat lengkap dan jelas (contoh: قِطٌّ, كِتَابٌ, تُفَّاحَةٌ).
2. Memiliki pertanyaan dalam Bahasa Indonesia yang ramah anak.
3. 4 pilihan jawaban (salah satu benar).
4. Indeks jawaban benar (0-3).
5. Arti bahasa Indonesia dan tips makhraj/lafal singkat yang ceria.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Kamu adalah guru Bahasa Arab ramah dan ceria untuk anak SD di Indonesia. Selalu berikan harakat lengkap pada semua kata Arab.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: 'Pertanyaan dalam bahasa Indonesia ramah anak',
              },
              arabicWord: {
                type: Type.STRING,
                description: 'Kata Arab berharakat lengkap',
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 pilihan jawaban',
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: 'Indeks jawaban yang benar (0-3)',
              },
              meaning: {
                type: Type.STRING,
                description: 'Arti kata dalam bahasa Indonesia',
              },
              funFact: {
                type: Type.STRING,
                description: 'Pesan penyemangat atau cara pengucapan',
              },
            },
            required: ['question', 'arabicWord', 'options', 'correctAnswerIndex', 'meaning'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    res.json({
      success: true,
      source: 'gemini-3.8-flash',
      questions: parsed,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.json({
      success: true,
      source: 'local-fallback',
      questions: getFallbackQuestions(req.body.category || 'umum'),
    });
  }
});

// AI Arabic Story Maker for Kids
app.post('/api/arabic-story', async (req: Request, res: Response) => {
  try {
    const { topic = 'persahabatan hewan di kebun' } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        story: {
          titleArabic: 'الأَرْنَبُ وَالسُّلَحْفَاةُ',
          titleIndo: 'Kelinci dan Kura-kura',
          sentences: [
            {
              arabic: 'كَانَ الأَرْنَبُ يَجْرِي فِي الغَابَةِ سَرِيعًا.',
              indonesian: 'Dahulu kelinci berlari di hutan dengan cepat.',
            },
            {
              arabic: 'وَالسُّلَحْفَاةُ تَمْشِي بِبُطْءٍ وَصَبْرٍ.',
              indonesian: 'Dan kura-kura berjalan perlahan dengan sabar.',
            },
            {
              arabic: 'فَازَتِ السُّلَحْفَاةُ لِأَنَّهَا مُجْتَهِدَةٌ.',
              indonesian: 'Kura-kura menang karena ia giat berusaha.',
            },
          ],
          moral: 'Jangan sombong dan selalu pantang menyerah!',
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Buatkan cerita dongeng mini bahasa Arab yang sangat pendek (3 kalimat) untuk anak SD tentang "${topic}".
Sertakan harakat lengkap pada bahasa Arab, terjemahan Indonesia per kalimat, dan pesan moral.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleArabic: { type: Type.STRING },
            titleIndo: { type: Type.STRING },
            sentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  arabic: { type: Type.STRING },
                  indonesian: { type: Type.STRING },
                },
                required: ['arabic', 'indonesian'],
              },
            },
            moral: { type: Type.STRING },
          },
          required: ['titleArabic', 'titleIndo', 'sentences', 'moral'],
        },
      },
    });

    const storyData = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, story: storyData });
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ error: 'Gagal membuat cerita bahasa Arab' });
  }
});

// AI Pronunciation & Makhraj Tips
app.post('/api/pronunciation-tips', async (req: Request, res: Response) => {
  try {
    const { word = 'شُكْرًا' } = req.body;
    if (!ai) {
      return res.json({
        tips: `Lafalkan "${word}" dengan makhraj huruf yang tepat dan senyum ceria!`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Berikan tips pengucapan makhraj huruf ramah anak SD untuk kata Arab: "${word}". Maksimal 2 kalimat singkat, ceria, dan mudah dipahami.`,
    });

    res.json({
      word,
      tips: response.text?.trim() || `Lafalkan ${word} dengan fasih dan riang!`,
    });
  } catch (error) {
    res.json({
      word: req.body.word,
      tips: `Bagus sekali! Lafalkan kata ini dengan suara lantang dan jelas ya!`,
    });
  }
});

// In-memory audio cache for zero latency and instant repeated playback
const ttsAudioCache = new Map<string, string>();

// Text-to-Speech endpoint (Gemini Flash Lite TTS) with native Arabic voice
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const rawText = String(req.body.text || 'مَرْحَبًا');
    
    // Extract only pure Arabic letters, numbers, and harakat (tashkeel)
    // Arabic unicode ranges: 0600-06FF, 0750-077F, 08A0-08FF
    const cleanArabic = rawText
      .replace(/[a-zA-Z0-9_()\-–—:;,\.\!\?\"\'\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const targetText = cleanArabic.length > 0 ? cleanArabic : rawText.trim();

    // Check memory cache first
    if (ttsAudioCache.has(targetText)) {
      return res.json({
        fallback: false,
        audioBase64: ttsAudioCache.get(targetText),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    if (!ai) {
      return res.json({ fallback: true, message: 'SpeechSynthesis fallback' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: targetText,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      ttsAudioCache.set(targetText, base64Audio);
      res.json({
        fallback: false,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      res.json({ fallback: true });
    }
  } catch (error) {
    console.warn('Gemini TTS error:', error);
    res.json({ fallback: true });
  }
});

// Fallback questions when offline or API key is unset
function getFallbackQuestions(category: string) {
  const bank: Record<string, any[]> = {
    hewan: [
      {
        question: 'Apakah arti dari kata أَرْنَبٌ (Arnabun)?',
        arabicWord: 'أَرْنَبٌ',
        options: ['Kucing', 'Kelinci', 'Singa', 'Gajah'],
        correctAnswerIndex: 1,
        meaning: 'Kelinci yang suka melompat',
        funFact: 'Kelinci suka makan wortel!',
      },
      {
        question: 'Manakah bahasa Arab untuk "Kucing"?',
        arabicWord: 'قِطٌّ',
        options: ['قِطٌّ (Qitthun)', 'كَلْبٌ (Kalbun)', 'فِيلٌ (Fiilun)', 'أَسَدٌ (Asadun)'],
        correctAnswerIndex: 0,
        meaning: 'Kucing',
        funFact: 'Nabi Muhammad SAW sangat menyayangi kucing!',
      },
      {
        question: 'Apakah arti dari kata أَسَدٌ (Asadun)?',
        arabicWord: 'أَسَدٌ',
        options: ['Harimau', 'Singa si Raja Hutan', 'Kuda', 'Unta'],
        correctAnswerIndex: 1,
        meaning: 'Singa',
        funFact: 'Singa memiliki surai yang gagah!',
      },
    ],
    buah: [
      {
        question: 'Apakah arti dari kata تُفَّاحَةٌ (Tuffaahatun)?',
        arabicWord: 'تُفَّاحَةٌ',
        options: ['Pisang', 'Apel', 'Jeruk', 'Anggur'],
        correctAnswerIndex: 1,
        meaning: 'Apel manis dan renyah',
        funFact: 'Apel kaya akan vitamin C!',
      },
      {
        question: 'Manakah bahasa Arab untuk "Pisang"?',
        arabicWord: 'مَوْزٌ',
        options: ['عِنَبٌ (Inabun)', 'مَوْزٌ (Mauzun)', 'تَمْرٌ (Tamrun)', 'بِطِّيخٌ (Bitthiikhun)'],
        correctAnswerIndex: 1,
        meaning: 'Pisang',
        funFact: 'Monyet juga sangat suka makan buah ini!',
      },
    ],
    kelas: [
      {
        question: 'Apakah arti dari kata قَلَمٌ (Qalamun)?',
        arabicWord: 'قَلَمٌ',
        options: ['Buku tulis', 'Pulpen / Pena', 'Penghapus', 'Penggaris'],
        correctAnswerIndex: 1,
        meaning: 'Pena untuk menulis',
        funFact: 'Surat pertama Al-Qur\'an juga menyebutkan Qalam!',
      },
      {
        question: 'Apakah arti dari كِتَابٌ (Kitaabun)?',
        arabicWord: 'كِتَابٌ',
        options: ['Buku pelajaran', 'Meja', 'Tas sekolah', 'Papan tulis'],
        correctAnswerIndex: 0,
        meaning: 'Buku',
        funFact: 'Membaca buku membuka jendela dunia!',
      },
    ],
  };

  return bank[category] || bank.hewan;
}

export default app;
