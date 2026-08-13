import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client lazily
  let genAI: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    if (!genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        genAI = new GoogleGenAI({ apiKey });
      }
    }
    return genAI;
  }

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Proposal Scope Generator
  app.post('/api/ai/generate-scope', async (req, res) => {
    try {
      const { clientName, clientRole, serviceType, prompt } = req.body;

      const ai = getGenAI();
      if (!ai) {
        return res.status(400).json({
          error: 'Gemini API Key is not configured. You can still create and edit proposals manually.'
        });
      }

      const aiPrompt = `You are a world-class proposal strategist for top creative, tech, and consulting agencies.
  Generate a structured, high-converting client proposal scope for:
  Client: ${clientName || 'Client'} (${clientRole || 'Business Owner'})
  Service / Industry: ${serviceType || 'Digital Services'}
  User Instructions: ${prompt || 'Create a comprehensive proposal with categories and details.'}

  Return JSON strictly in this structure:
  {
    "title": "Proposal Title",
    "categories": [
      {
        "category": "Category Name (e.g., Platforms, Strategy, Deliverables, Production)",
        "details": "Detailed scope items with bullet points (e.g. • Item 1\\n• Item 2)"
      }
    ],
    "investment": {
      "priceText": "Monthly – $X,XXX or Flat Fee $XX,XXX",
      "terms": "(e.g., Minimum Lock-in Period 6 Months / 50% Deposit)",
      "notes": [
        {
          "title": "Out of Scope",
          "description": "Clear explanation of extra billing conditions."
        }
      ]
    }
  }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: aiPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '{}';
      const jsonResult = JSON.parse(responseText);

      return res.json({ success: true, data: jsonResult });
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate proposal scope' });
    }
  });

  // AI Text Polisher / Rewriter
  app.post('/api/ai/polish-text', async (req, res) => {
    try {
      const { text, tone } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.status(400).json({ error: 'Gemini API Key not configured' });
      }

      const aiPrompt = `Rewrite the following proposal text to sound professional, executive, persuasive, and clear for a client contract proposal.
  Tone: ${tone || 'Executive & Persuasive'}
  Text:
  ${text}

  Return only the improved text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: aiPrompt
      });

      return res.json({ success: true, improvedText: response.text?.trim() || text });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to polish text' });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
