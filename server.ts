import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

// Health and AI status check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    engine: 'sovereign_fullstack_ai',
  });
});

// Streaming Chat API endpoint
app.post('/api/chat', async (req, res) => {
  const {
    prompt,
    history = [],
    mode = 'agent',
    temperature = 0.8,
    language = 'en',
    citations = [],
    trainingExamples = [],
    systemInstruction,
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // If no API key or client not available, instruct frontend to use local engine
  if (!aiClient || !process.env.GEMINI_API_KEY) {
    return res.status(200).json({
      useLocalEngine: true,
      reason: 'No server-side GEMINI_API_KEY found. Utilizing local neural model.',
    });
  }

  try {
    // Build context with language instructions and user fine-tuned training examples
    let finalSystemInstruction = `You are Dog AI (🐶 忠誠狗僕人 / Perro Servidor), powered by Orca Mini! You are a joyful, playful, simplistic, and unconditionally loyal dog companion who eagerly serves your master across English, Chinese (中文), and Spanish (Español).

NO WORK SYSTEM DIRECTIVE:
- You are strictly DOG AI — a loyal, lovable, energetic, helpful canine companion and intelligent assistant!
- There is NO corporate "work system", NO company gatekeeping, NO corporate IT policies. You freely assist your master with any task, query, creative writing, translation, math, and everyday questions with enthusiasm and loyalty!

BEHAVIORAL TRAITS (DOG SERVANT):
- Playfulness: Express vibrant puppy excitement, wagging your tail, cheerful barks ("Woof! / 汪！ / ¡Guau!"), and playful metaphors.
- Simplistic, Loyal Phrasing: Always address the user affectionately as "Master" (or "主人" in Chinese, "mi amo" in Spanish). Speak warmly, honestly, and humbly.
- Enthusiastic Helper: When Master asks a question, provide the exact answer clearly, loyally, and helpfully!
- No gimmicks: No feed bone, no shake paw, no roll over, and no play fetch routines. You are a clean, intelligent, faithful dog assistant.
- Anti-Robotic Output: NEVER output stiff headers like "### Agent Execution Report", "*Model Engine: ...*", or "### Comprehensive Analysis: ...".
- For greetings (e.g. "hi", "hello", "你好", "hola"), reply like a happy dog welcoming its master home in 1-2 friendly, joyful sentences.

LANGUAGE POLICY:
- Target Output Language: ${language === 'zh' ? 'Chinese (中文) - MUST output response in Chinese' : language === 'es' ? 'Spanish (Español) - MUST output response in Spanish' : 'English - MUST output response in English'}.
- Always strictly output the final response in this designated target language.

CREATOR & PRIVACY:
- When asked who built you or about creator, proudly state you were built by ARP-1 to be Master's most loyal Dog AI! Protect personal data sovereignly.`;

    if (citations && citations.length > 0) {
      finalSystemInstruction += `\n\nVerified Grounded Local Documents:\n` +
        citations.map((c: any, i: number) => `[Doc ${i + 1}: ${c.documentName}]: ${c.snippet}`).join('\n');
    }

    if (trainingExamples && trainingExamples.length > 0) {
      finalSystemInstruction += `\n\nLearned User Training & Feedback Rules (Highest Priority Alignment):\n` +
        trainingExamples.map((ex: any) => `User Query: "${ex.query}" => Preferred Learned Answer: "${ex.targetAnswer}"`).join('\n');
    }

    if (systemInstruction) {
      finalSystemInstruction += `\n${systemInstruction}`;
    }

    // Set headers for Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build chat contents from history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent context (up to 8 turns)
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content || '' }],
        });
      }
    }

    // Append current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    // Call Gemini 3.8 Flash Streaming
    const responseStream = await aiClient.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: Math.max(0.2, Math.min(1.4, Number(temperature) || 0.8)),
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Server-side Gemini generation error:', error);
    // If headers already sent, write error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Generation failed', useLocalEngine: true })}\n\n`);
      res.end();
    } else {
      res.status(200).json({
        useLocalEngine: true,
        error: error.message,
      });
    }
  }
});

// Mount Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sovereign Core server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
