import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mengompres dan memperkecil resolusi file gambar menggunakan HTML Canvas.
 * Menghasilkan Data URL ringan (< 30 KB) agar aman disimpan di LocalStorage
 * dan tidak menimbulkan galat QuotaExceededError.
 */
export function compressImageFile(
  file: File,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Gagal memproses gambar'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan rasio aspek gambar
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Gambar ke kanvas dengan resolusi optimal
        ctx.drawImage(img, 0, 0, width, height);

        // Jika PNG dan memiliki transparansi, gunakan PNG, jika tidak JPEG dengan kompresi
        const isPng = file.type === 'image/png';
        const outputFormat = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Sanitasi string input pengguna untuk mencegah serangan Cross-Site Scripting (XSS)
 * dan injeksi tag HTML berbahaya.
 */
export function sanitizeText(input?: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
