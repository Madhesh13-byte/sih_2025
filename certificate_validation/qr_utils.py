from pyzbar.pyzbar import decode
from PIL import Image
import requests
import fitz
import io

def extract_qr_from_pdf(file_path):
    """Extract QR code from PDF by converting pages to images"""
    try:
        doc = fitz.open(file_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap()
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            codes = decode(img)
            if codes:
                doc.close()
                return codes[0].data.decode("utf-8")
        doc.close()
    except Exception:
        pass
    return None

def validate_qr(file_path):
    qr_data = None
    
    # Try direct image QR extraction
    try:
        image = Image.open(file_path)
        codes = decode(image)
        if codes:
            qr_data = codes[0].data.decode("utf-8")
    except Exception:
        pass
    
    # If PDF or no QR found, try PDF extraction
    if not qr_data and file_path.lower().endswith('.pdf'):
        qr_data = extract_qr_from_pdf(file_path)
    
    if not qr_data:
        return {"qr_status": "not_found", "url": None}
    
    # Validate QR URL
    try:
        resp = requests.get(qr_data, timeout=5)
        if resp.status_code == 200:
            return {"qr_status": "verified", "url": qr_data}
        else:
            return {"qr_status": "invalid", "url": qr_data}
    except:
        return {"qr_status": "unreachable", "url": qr_data}