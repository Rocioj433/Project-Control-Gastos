export interface OCRResult {
  success: boolean;
  text: string;
  error?: string;
  pages: number;
}

export async function extractTextFromPDF(pdfUri: string): Promise<OCRResult> {
  return {
    success: false,
    text: '',
    error: 'Usar script Node.js: node extract-pdf.js "archivo.pdf"',
    pages: 0,
  };
}

export async function extractTextFromImage(imageUri: string): Promise<OCRResult> {
  return {
    success: false,
    text: '',
    error: 'OCR de imagen no implementado',
    pages: 0,
  };
}

export function getInstructions(): string {
  return `INSTRUCCIONES PARA EXTRAER TEXTO:
  
1. Abre una terminal en la carpeta SmartExpense

2. Copia tu PDF a esa carpeta

3. Ejecuta:
   node extract-pdf.js "nombre-del-archivo.pdf"

4. Copia el texto mostrado en consola

5. Pégalo en la app`;
}