/**
 * Client-side Image Optimizer for OCR & AI analysis.
 * Resizes large camera photos (e.g. 12MP-48MP, 10-25MB) to crisp, high-clarity dimensions
 * (max width/height 2048px) with optimized JPEG compression.
 * This shrinks file sizes from 15MB down to ~300KB-600KB, making network transfers 20x faster
 * while maintaining 100% crisp readability for Arabic/English text, stamps, and small print.
 */

export async function optimizeImageForAi(
  fileOrDataUrl: File | string,
  maxDimension = 2048,
  quality = 0.88
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let { width, height } = img;

        // Calculate aspect ratio preserving scale
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context is not available for image optimization.');
        }

        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

        resolve({
          dataUrl,
          base64,
          mimeType: 'image/jpeg',
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('تعذر تحميل وقراءة صورة الورقة أو الفاتورة.'));
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        reject(new Error('تعذر قراءة ملف الصورة من الذاكرة.'));
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
