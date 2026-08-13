import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportProposalToPdf(
  pagesContainerElement: HTMLElement,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> {
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
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const totalPages = pageElements.length;

    for (let i = 0; i < totalPages; i++) {
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalPages) * 100));
      }

      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2, // High DPI crisp rendering
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

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    // Ensure filename has .pdf extension
    const cleanFilename = filename.toLowerCase().endsWith('.pdf')
      ? filename
      : `${filename}.pdf`;

    pdf.save(cleanFilename);
  } finally {
    // Restore transform scale back to user's canvas zoom level
    pagesContainerElement.style.transform = originalTransform;
  }
}

