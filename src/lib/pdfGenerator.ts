import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  const {
    scale = getDeviceScale(),
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
          windowWidth: 1200,
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
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

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

        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
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

