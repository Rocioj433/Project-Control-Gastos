from fastapi import FastAPI, UploadFile, File
import pdfplumber
import io

app = FastAPI(title="API Control de Gastos")

@app.get("/")
def read_root():
    return {"mensaje": "¡Hola Mundo! El backend de Control de Gastos está funcionando correctamente."}

# Nueva ruta de tipo POST para recibir archivos
@app.post("/procesar-resumen/")
async def procesar_resumen(file: UploadFile = File(...)):
    # 1. Leemos el contenido del archivo subido en memoria (en bytes)
    contenido = await file.read()
    
    # 2. Verificamos de forma muy básica que sea un PDF por la extensión
    if not file.filename.lower().endswith('.pdf'):
        return {"error": "Por favor, sube un archivo PDF."}
        
    # 3. Usamos pdfplumber para extraer el texto
    texto_extraido = ""
    
    # Convertimos los bytes en un archivo "virtual" (BytesIO) para que pdfplumber lo pueda abrir
    with pdfplumber.open(io.BytesIO(contenido)) as pdf:
        for pagina in pdf.pages:
            # Extraemos el texto de cada página que tenga el PDF
            texto = pagina.extract_text()
            if texto:
                texto_extraido += texto + "\n"
                
    # 4. Devolvemos el nombre del archivo y todo el texto que pudimos sacar
    return {
        "nombre_archivo": file.filename,
        "texto_extraido": texto_extraido
    }
