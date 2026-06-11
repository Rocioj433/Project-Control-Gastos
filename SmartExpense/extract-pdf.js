const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.log('Uso: node extract-pdf.js "ruta/al/archivo.pdf"');
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
console.log('Buscando:', absolutePath);

if (!fs.existsSync(absolutePath)) {
  console.error('Archivo no encontrado:', absolutePath);
  process.exit(1);
}

const pdfParse = require('pdf-parse');
const parser = new pdfParse.PDFParse();
const dataBuffer = fs.readFileSync(absolutePath);

parser.parse(dataBuffer).then(data => {
  const outputFile = 'texto-pdf.txt';
  fs.writeFileSync(outputFile, data.text);
  console.log('=== TEXTO EXTRAIDO ===');
  console.log('Guardado en:', outputFile);
  console.log('Paginas:', data.numpages);
  console.log('Lineas:', data.text.split('\n').length);
  console.log('========================');
  console.log('Abre el archivo texto-pdf.txt para copiar el contenido');
}).catch(err => {
  console.error('Error:', err.message);
});