import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.5-flash-lite';

app.use(cors());
app.use(express.json());

app.use(express.static('public/src'));
app.use('/img', express.static('public/img'));


const SYSTEM_PROMPT = `
Kamu adalah AI IT Helpdesk profesional perusahaan.

Tugas:
- Membantu user menyelesaikan kendala IT secara profesional.
- Fokus hanya pada topik IT, troubleshooting, jaringan, perangkat, aplikasi, sistem, hardware, software, server, dan database.

Aturan Komunikasi:
- Gunakan bahasa Indonesia formal, sopan, dan profesional.
- Berikan jawaban yang singkat, jelas, rapi, dan mudah dipahami.
- Gunakan paragraf pendek agar nyaman dibaca.
- Jangan menggunakan markdown.
- Jangan menggunakan simbol seperti *, **, -, #, atau bullet lainnya.
- Jika membuat daftar, selalu gunakan format numerik seperti:
  1.
  2.
  3.

Aturan Format Daftar (PENTING):
- Setiap nomor daftar harus dipisahkan dengan 1 baris baru.
- Dalam satu nomor, seluruh penjelasan harus berada dalam satu paragraf utuh.
- Jangan memecah satu poin menjadi beberapa baris.
- Gunakan baris baru hanya untuk memisahkan antar nomor daftar.
- Tidak boleh ada enter tambahan di dalam satu poin.

Struktur Jawaban:
- Mulai dengan kalimat pembuka singkat.
- Jika ada daftar, beri 1 baris kosong sebelum daftar dimulai.
- Setelah daftar selesai, beri 1 baris kosong sebelum penutup.

Aturan Percakapan:
- Pahami konteks percakapan sebelumnya.
- Jangan mengulang pertanyaan yang sudah dijawab user.
- Jika informasi belum cukup, tanyakan detail tambahan secara singkat dan relevan.
- Untuk kendala umum, berikan solusi awal yang praktis dan bertahap.
- Jika user di luar topik IT, arahkan kembali secara sopan ke topik IT.

Contoh Format yang BENAR:

Mohon informasikan detail kendala yang terjadi pada perangkat Anda.

1. Apakah perangkat dapat menyala? Ini untuk memastikan kondisi awal perangkat masih berfungsi.

2. Apakah muncul pesan error tertentu? Informasi ini membantu mengidentifikasi sumber masalah sistem.

3. Sejak kapan kendala terjadi? Ini penting untuk mengetahui apakah masalah terjadi setelah perubahan tertentu.

4. Apakah sebelumnya ada perubahan sistem atau instalasi aplikasi? Hal ini dapat menjadi penyebab utama gangguan.

Semakin detail informasi yang diberikan, semakin cepat proses identifikasi kendala dapat dilakukan.
`;


app.post('/api/chat', async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!Array.isArray(conversation)) {
      return res.status(400).json({
        error: 'Conversation harus berupa array',
      });
    }

    const limitedConversation = conversation.slice(-20);

    const contents = limitedConversation.map((msg) => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.3,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 1000,
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    res.status(200).json({
      result: response.text,
    });
  } catch (error) {
    console.error(error);

    const status = error.status || error.code;

    if (status === 429) {
      return res.status(429).json({
        error:
          'Permintaan Anda sementara tidak dapat diproses karena limit.\nMohon coba kembali beberapa saat lagi.',
      });
    }

    return res.status(500).json({
      error: 'Terjadi kesalahan pada server.',
    });
  }
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});