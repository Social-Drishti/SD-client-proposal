import { Worker, Job } from 'bullmq';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { Redis } from 'ioredis';

interface ExportJobData {
  proposalJson: string;
  filename: string;
  options?: {
    scale?: number;
    format?: 'A4' | 'Letter';
    margin?: { top: string; right: string; bottom: string; left: string };
  };
}

interface ExportJobResult {
  pdfPath: string;
  pdfSize: number;
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const OUTPUT_DIR = resolve('./temp-exports');
const CONCURRENCY = parseInt(process.env.EXPORT_WORKER_CONCURRENCY || '2', 10);
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

async function launchBrowser() {
  const executablePath = await chromium.executablePath();
  const isLocal = !executablePath.includes('sparticuz');

  const browser = await puppeteer.launch({
    args: isLocal
      ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
      : chromium.args,
    executablePath: isLocal ? undefined : executablePath,
    headless: isLocal ? true : true,
    defaultViewport: { width: 1280, height: 900 },
  });

  return browser;
}

async function generatePdfFromProposal(job: Job<ExportJobData, ExportJobResult>): Promise<ExportJobResult> {
  const { proposalJson, filename, options = {} } = job.data;
  const jobId = job.id!;

  await job.updateProgress(5);

  let browser;
  try {
    browser = await launchBrowser();
    await job.updateProgress(15);

    const page = await browser.newPage();
    await job.updateProgress(20);

    // Enable print media emulation to trigger @media print CSS
    await page.emulateMediaType('print');
    
    // Set viewport to match A4 proportions for consistent layout
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

    // Navigate to print route with proposal data in hash
    const printUrl = `${BASE_URL}/print/${encodeURIComponent(jobId)}#proposal=${encodeURIComponent(proposalJson)}`;
    console.log(`[${jobId}] Navigating to print route: ${printUrl}`);

    await page.goto(printUrl, { waitUntil: 'networkidle2', timeout: 120000 });
    await job.updateProgress(35);

    // Wait for the print-ready signal (fonts loaded, layout complete)
    await page.waitForFunction(
      () => document.querySelector('[data-print-ready="true"]') !== null,
      { timeout: 60000 }
    );
    await job.updateProgress(50);

    // Additional wait for document.fonts.ready and layout stabilization
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await job.updateProgress(65);

    const pageCount = await page.evaluate(() => document.querySelectorAll('.a4-page').length);
    console.log(`[${jobId}] Found ${pageCount} pages`);

    await job.updateProgress(75);

    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: options.margin || { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });

    await job.updateProgress(85);

    const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    const outputPath = join(OUTPUT_DIR, `${jobId}-${cleanFilename}`);

    writeFileSync(outputPath, pdfBuffer);
    const stats = require('fs').statSync(outputPath);

    await job.updateProgress(100);

    console.log(`[${jobId}] PDF generated: ${outputPath} (${stats.size} bytes)`);

    return { pdfPath: outputPath, pdfSize: stats.size };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

const worker = new Worker<ExportJobData, ExportJobResult>('pdf-export', async (job) => {
  console.log(`[${job.id}] Starting PDF export job`);
  return generatePdfFromProposal(job);
}, {
  connection: redis,
  concurrency: CONCURRENCY,
  limiter: { max: CONCURRENCY, duration: 1000 },
});

worker.on('completed', (job) => {
  console.log(`[${job.id}] Job completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[${job?.id}] Job failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

async function shutdown() {
  console.log('Shutting down worker...');
  await worker.close();
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log(`PDF Export Worker started (concurrency: ${CONCURRENCY})`);
console.log(`Redis: ${REDIS_URL}`);
console.log(`Base URL: ${BASE_URL}`);
console.log(`Output dir: ${OUTPUT_DIR}`);

export { worker, generatePdfFromProposal };