import fitz  # PyMuPDF
import easyocr
from PIL import Image
import io

reader = easyocr.Reader(["en"])

def extract_text(file_path):
    text = ""
    
    # Handle text files directly
    if file_path.lower().endswith('.txt'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception:
            pass
    
    # Try PyMuPDF for PDFs
    if file_path.lower().endswith('.pdf'):
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            if text.strip():
                return text
            
            # If no text, convert PDF pages to images for OCR
            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap()
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                result = reader.readtext(img, detail=0)
                text += " ".join(result) + " "
            doc.close()
        except Exception:
            pass
    
    # For images or fallback OCR
    if not text.strip():
        try:
            result = reader.readtext(file_path, detail=0)
            text = " ".join(result)
        except Exception:
            pass
    
    return text