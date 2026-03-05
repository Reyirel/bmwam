import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Convierte la primera página de un PDF a una imagen JPG
 * @param {File} pdfFile - El archivo PDF a convertir
 * @param {number} scale - Factor de escala para la calidad (default: 2)
 * @param {number} quality - Calidad del JPG de 0 a 1 (default: 0.85)
 * @returns {Promise<File>} - El archivo convertido a JPG
 */
export async function convertPdfToJpg(pdfFile, scale = 2, quality = 0.85) {
  // Leer el archivo PDF como ArrayBuffer
  const arrayBuffer = await pdfFile.arrayBuffer();
  
  // Cargar el documento PDF
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  // Obtener la primera página
  const page = await pdf.getPage(1);
  
  // Configurar el viewport con escala
  const viewport = page.getViewport({ scale });
  
  // Crear canvas para renderizar
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  // Renderizar la página en el canvas
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  // Convertir canvas a blob JPG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Error al convertir PDF a imagen'));
          return;
        }
        
        // Crear un nuevo archivo con nombre .jpg
        const originalName = pdfFile.name.replace(/\.pdf$/i, '');
        const jpgFile = new File([blob], `${originalName}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        resolve(jpgFile);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Verifica si un archivo es PDF
 * @param {File} file - El archivo a verificar
 * @returns {boolean}
 */
export function isPdfFile(file) {
  return file.type === 'application/pdf' || 
         file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Procesa un archivo: si es PDF lo convierte a JPG, si no lo retorna tal cual
 * @param {File} file - El archivo a procesar
 * @returns {Promise<File>} - El archivo procesado (convertido si era PDF)
 */
export async function processFileForUpload(file) {
  if (isPdfFile(file)) {
    return await convertPdfToJpg(file);
  }
  return file;
}
