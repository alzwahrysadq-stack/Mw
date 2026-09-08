import * as pdfjsLib from 'pdfjs-dist';

// Point worker to bundled or unpkg/cdnjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Renders each page of a PDF file to high-resolution base64 JPEG image
 */
export async function renderPdfPagesToImages(
  file: File,
  maxPages = 25,
  onProgress?: (current: number, total: number) => void
): Promise<RenderedPdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const numPages = Math.min(pdf.numPages, maxPages);
  const pages: RenderedPdfPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.(pageNum, numPages);
    const page = await pdf.getPage(pageNum);

    // Scale 1.5 to 2.0 provides sharp OCR text rendering
    const viewport = page.getViewport({ scale: 1.6 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) continue;

    await (page.render as any)({
      canvasContext: context,
      canvas,
      viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    pages.push({
      pageNumber: pageNum,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });
  }

  return pages;
}
