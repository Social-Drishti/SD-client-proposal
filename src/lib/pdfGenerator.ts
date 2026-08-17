import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Proposal } from '../types';

export interface ExportProgressDetail {
  progress: number;
  currentPage: number;
  totalPages: number;
  status: 'idle' | 'rendering' | 'generating' | 'downloading' | 'complete' | 'error';
  estimatedTimeRemaining?: number;
  errorMessage?: string;
}

export interface ExportOptions {
  scale?: number;
  chunkSize?: number;
  onProgress?: (detail: ExportProgressDetail) => void;
  signal?: AbortSignal;
  imageTimeout?: number; // timeout for image loading in ms
}

function getDeviceScale(): number {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  
  if (isMobile) {
    return deviceMemory && deviceMemory < 4 ? 1 : 1.5;
  }
  if (isTablet) {
    return deviceMemory && deviceMemory < 4 ? 1.5 : 2;
  }
  return 2;
}

function getChunkSize(totalPages: number): number {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  
  if (isMobile || (deviceMemory && deviceMemory < 4)) {
    return Math.min(2, totalPages);
  }
  return Math.min(3, totalPages);
}

export function getExportRecommendation(pageCount: number): {
  recommendedMethod: 'highres' | 'print';
  reason: string;
  warning?: string;
} {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  
  if (isMobile && (deviceMemory && deviceMemory < 4 || pageCount > 10)) {
    return {
      recommendedMethod: 'print',
      reason: 'Native print is faster and more reliable on this device',
      warning: `High-res export may be slow or fail (${pageCount} pages, ${deviceMemory || 'unknown'}GB RAM)`
    };
  }
  if (pageCount > 20) {
    return {
      recommendedMethod: 'print',
      reason: 'Large proposals export faster via native print',
      warning: `${pageCount} pages may take several minutes at high resolution`
    };
  }
  return {
    recommendedMethod: 'highres',
    reason: 'High-res PDF provides best quality for final delivery'
  };
}

// Helper to load image with timeout and CORS handling
function loadImageWithTimeout(src: string, timeout: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timer = setTimeout(() => {
      reject(new Error(`Image load timeout: ${src}`));
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
}

// Helper to convert blob to download
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportProposalToPdf(
  pagesContainerElement: HTMLElement,
  filename: string,
  options: ExportOptions = {}
): Promise<void> {
  // LAST RESORT FALLBACK: Only used when both server-side Puppeteer and native window.print() fail.
  // html2canvas has known limitations with Flex/Grid layouts, font rendering, and CSS transforms.
  // Prefer server-side Puppeteer (via exportProposalToPdfViaServer) or browser native print (window.print()).
  const {
    scale = 3,
    chunkSize = getChunkSize(
      Array.from(pagesContainerElement.querySelectorAll<HTMLElement>('.a4-page')).length
    ),
    onProgress,
    signal,
    imageTimeout = 15000
  } = options;

  const pageElements = Array.from(
    pagesContainerElement.querySelectorAll<HTMLElement>('.a4-page')
  );

  if (pageElements.length === 0) {
    throw new Error('No proposal pages found to export.');
  }

  // Temporarily reset zoom transform scale during capture so bounding box is exact A4 size
  const originalTransform = pagesContainerElement.style.transform;
  pagesContainerElement.style.transform = 'none';

  // Ensure all images are fully loaded before capturing
  const images = Array.from(pagesContainerElement.querySelectorAll('img'));
  const imagePromises = images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), imageTimeout);
      img.onload = () => { clearTimeout(timeout); resolve(); };
      img.onerror = () => { clearTimeout(timeout); resolve(); };
    });
  });
  await Promise.all(imagePromises);

  // Wait for fonts to load (critical for preventing text overlap)
  try {
    await document.fonts.ready;
  } catch (e) {
    console.warn('Font loading wait failed:', e);
  }

  const checkAbort = () => {
    if (signal?.aborted) {
      throw new DOMException('Export cancelled', 'AbortError');
    }
  };

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const totalPages = pageElements.length;
    const startTime = Date.now();
    let completedPages = 0;

    // Process in chunks to avoid memory issues on mobile
    for (let chunkStart = 0; chunkStart < totalPages; chunkStart += chunkSize) {
      checkAbort();
      
      const chunkEnd = Math.min(chunkStart + chunkSize, totalPages);
      
      for (let i = chunkStart; i < chunkEnd; i++) {
        checkAbort();
        
        const pageStartTime = Date.now();
        
        onProgress?.({
          progress: Math.round((completedPages / totalPages) * 100),
          currentPage: i + 1,
          totalPages,
          status: 'rendering',
          estimatedTimeRemaining: completedPages > 0 
            ? Math.round(((Date.now() - startTime) / completedPages) * (totalPages - completedPages) / 1000)
            : undefined
        });

        const pageEl = pageElements[i];

        const canvas = await html2canvas(pageEl, {
          scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 793,
          removeContainer: true,
          onclone: (clonedDoc) => {
            // Fix html2canvas error "Attempting to parse an unsupported color function oklch"
            const styleEls = Array.from(clonedDoc.querySelectorAll('style'));
            styleEls.forEach((style) => {
              if (style.textContent && style.textContent.includes('oklch')) {
                style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, '#808080');
              }
            });

            const allElements = Array.from(clonedDoc.querySelectorAll<HTMLElement>('*'));
            allElements.forEach((el) => {
              if (el.style && el.style.cssText && el.style.cssText.includes('oklch')) {
                el.style.cssText = el.style.cssText.replace(/oklch\([^)]+\)/g, '#808080');
              }
            });

            // Apply font smoothing for thinner, cleaner text rendering in PDF
            const htmlEl = clonedDoc.documentElement;
            if (htmlEl) {
              const style = htmlEl.style as CSSStyleDeclaration & Record<string, string>;
              style.webkitFontSmoothing = 'antialiased';
              style.mozOsxFontSmoothing = 'grayscale';
              style.textRendering = 'optimizeLegibility';
            }
          }
        });

        const imgData = canvas.toDataURL('image/png', 1.0);

        onProgress?.({
          progress: Math.round(((completedPages + 1) / totalPages) * 100),
          currentPage: i + 1,
          totalPages,
          status: 'generating',
          estimatedTimeRemaining: completedPages > 0
            ? Math.round(((Date.now() - startTime) / (completedPages + 1)) * (totalPages - completedPages - 1) / 1000)
            : undefined
        });

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
        completedPages++;

        // Yield to main thread between pages to keep UI responsive
        if (i < chunkEnd - 1) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Yield between chunks
      if (chunkEnd < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    onProgress?.({
      progress: 95,
      currentPage: totalPages,
      totalPages,
      status: 'downloading'
    });

    // Ensure filename has .pdf extension
    const cleanFilename = filename.toLowerCase().endsWith('.pdf')
      ? filename
      : `${filename}.pdf`;

    // Try pdf.save() first, fallback to blob download if it fails
    try {
      pdf.save(cleanFilename);
    } catch (saveError) {
      // Fallback: generate blob and trigger download manually
      const blob = pdf.output('blob');
      downloadBlob(blob, cleanFilename);
    }

    onProgress?.({
      progress: 100,
      currentPage: totalPages,
      totalPages,
      status: 'complete'
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Export failed';
    onProgress?.({
      progress: 0,
      currentPage: 0,
      totalPages: pageElements.length,
      status: 'error',
      errorMessage
    });
    throw error;
  } finally {
    // Restore transform scale back to user's canvas zoom level
    pagesContainerElement.style.transform = originalTransform;
  }
}

export interface ServerExportOptions {
  onProgress?: (detail: ExportProgressDetail) => void;
  signal?: AbortSignal;
  apiBaseUrl?: string;
}

export interface ExportJobResponse {
  jobId: string;
  statusUrl: string;
  downloadUrl: string;
}

export interface ExportJobStatus {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  progress: number;
  result?: { pdfPath: string; pdfSize: number };
  error?: string;
}

async function pollJobStatus(
  statusUrl: string,
  options: { onProgress?: (detail: ExportProgressDetail) => void; signal?: AbortSignal; apiBaseUrl?: string } = {}
): Promise<ExportJobStatus> {
  const { onProgress, signal, apiBaseUrl = '' } = options;
  const fullUrl = `${apiBaseUrl}${statusUrl}`;

  while (true) {
    if (signal?.aborted) {
      throw new DOMException('Export cancelled', 'AbortError');
    }

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to check job status: ${response.statusText}`);
    }

    const data: ExportJobStatus = await response.json();

    onProgress?.({
      progress: data.progress,
      currentPage: 0,
      totalPages: 0,
      status: data.status === 'completed' ? 'downloading' : data.status === 'failed' ? 'error' : 'generating',
      errorMessage: data.error,
    });

    if (data.status === 'completed') {
      return data;
    }
    if (data.status === 'failed') {
      throw new Error(data.error || 'PDF generation failed on server');
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function downloadPdf(downloadUrl: string, filename: string, apiBaseUrl: string = ''): Promise<void> {
  const fullUrl = `${apiBaseUrl}${downloadUrl}`;
  const response = await fetch(fullUrl);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportProposalToPdfViaServer(
  proposal: Proposal,
  filename: string,
  options: ServerExportOptions = {}
): Promise<void> {
  const { onProgress, signal, apiBaseUrl = '' } = options;

  onProgress?.({
    progress: 0,
    currentPage: 0,
    totalPages: 0,
    status: 'generating',
  });

  const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    const createResponse = await fetch(`${apiBaseUrl}/api/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposal, filename: cleanFilename }),
      signal,
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create export job: ${createResponse.statusText}`);
    }

    const jobData: ExportJobResponse = await createResponse.json();

    onProgress?.({
      progress: 10,
      currentPage: 0,
      totalPages: 0,
      status: 'generating',
    });

    const jobStatus = await pollJobStatus(jobData.statusUrl, { onProgress, signal, apiBaseUrl });

    if (!jobStatus.result) {
      throw new Error('PDF generation completed but no result returned');
    }

    onProgress?.({
      progress: 95,
      currentPage: 0,
      totalPages: 0,
      status: 'downloading',
    });

    await downloadPdf(jobData.downloadUrl, cleanFilename, apiBaseUrl);

    onProgress?.({
      progress: 100,
      currentPage: 0,
      totalPages: 0,
      status: 'complete',
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Server export failed';
    onProgress?.({
      progress: 0,
      currentPage: 0,
      totalPages: 0,
      status: 'error',
      errorMessage,
    });
    throw error;
  }
}

