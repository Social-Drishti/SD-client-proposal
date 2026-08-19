import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { existsSync, readFileSync, unlinkSync } from 'fs';

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

  // Print route - serves index.html for client-side rendering of print layout
  app.get('/print/:proposalId', (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
      // In development, Vite middleware will handle this
      res.setHeader('Content-Type', 'text/html');
      res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Print Proposal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/@vite/client"></script>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);
    } else {
      // In production, serve the built index.html
      const distPath = path.join(process.cwd(), 'dist');
      res.sendFile(path.join(distPath, 'index.html'));
    }
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

  // PDF Export Queue Setup
  let redis: Redis | null = null;
  let exportQueue: Queue | null = null;

  try {
    const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
    redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 });
    exportQueue = new Queue('pdf-export', { connection: redis });
    // Test connection
    await redis.ping();
    console.log('Redis connected successfully');
  } catch (error) {
    console.warn('Redis connection failed - PDF export functionality will be disabled');
    console.warn('Set REDIS_URL env var to connect to a Redis instance, or ignore this warning');
    redis = null;
    exportQueue = null;
  }

  // POST /api/export/pdf - Create PDF export job
  app.post('/api/export/pdf', async (req, res) => {
    try {
      if (!exportQueue) {
        return res.status(503).json({ error: 'PDF export service unavailable - Redis not configured' });
      }
      const { proposal, filename, options } = req.body;

      if (!proposal) {
        return res.status(400).json({ error: 'Proposal data is required' });
      }

      const proposalJson = JSON.stringify(proposal);
      const job = await exportQueue.add('generate-pdf', {
        proposalJson,
        filename: filename || `${proposal.client?.name || 'Proposal'}_Proposal.pdf`,
        options: options || {},
      });

      res.json({ jobId: job.id, statusUrl: `/api/export/status/${job.id}`, downloadUrl: `/api/export/download/${job.id}` });
    } catch (error: any) {
      console.error('Export job creation error:', error);
      res.status(500).json({ error: error.message || 'Failed to create export job' });
    }
  });

  // GET /api/export/status/:jobId - Check job status
  app.get('/api/export/status/:jobId', async (req, res) => {
    try {
      if (!exportQueue) {
        return res.status(503).json({ error: 'PDF export service unavailable - Redis not configured' });
      }
      const { jobId } = req.params;
      const job = await exportQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue;
      const failedReason = job.failedReason;

      res.json({
        jobId,
        status: state,
        progress: typeof progress === 'number' ? progress : 0,
        result,
        error: failedReason,
      });
    } catch (error: any) {
      console.error('Export status error:', error);
      res.status(500).json({ error: error.message || 'Failed to get job status' });
    }
  });

  // GET /api/export/download/:jobId - Download generated PDF
  app.get('/api/export/download/:jobId', async (req, res) => {
    try {
      if (!exportQueue) {
        return res.status(503).json({ error: 'PDF export service unavailable - Redis not configured' });
      }
      const { jobId } = req.params;
      const job = await exportQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const state = await job.getState();
      if (state !== 'completed') {
        return res.status(400).json({ error: `Job not completed (status: ${state})` });
      }

      const result = job.returnvalue as { pdfPath?: string } | undefined;
      if (!result?.pdfPath || !existsSync(result.pdfPath)) {
        return res.status(404).json({ error: 'PDF file not found' });
      }

      const pdfBuffer = readFileSync(result.pdfPath);
      const filename = path.basename(result.pdfPath).replace(/^[^-]+-/, '');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);

      // Cleanup temp file after download (optional, can be done by a cron job)
      // unlinkSync(result.pdfPath);
    } catch (error: any) {
      console.error('Export download error:', error);
      res.status(500).json({ error: error.message || 'Failed to download PDF' });
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
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
