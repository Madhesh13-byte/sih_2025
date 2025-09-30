# Certificate Validation System

A Python-based certificate validation system that uses OCR, NER, QR code validation, and fuzzy matching to verify certificate authenticity.

## Features

- **OCR Text Extraction**: PyMuPDF for PDFs, EasyOCR fallback for images
- **NER Entity Extraction**: Hugging Face dslim/bert-base-NER model
- **QR Code Validation**: Extract and validate QR codes from certificates
- **Fuzzy Matching**: Handle OCR errors with RapidFuzz
- **MongoDB Storage**: Store validation results as structured JSON

## Installation

```bash
pip install -r requirements.txt
```

## Usage

1. Place certificate files (.pdf, .jpg, .png) in the `uploads/` directory
2. Update the file path in `main.py`
3. Run the validation:

```bash
python main.py
```

## Validation Logic

- **Valid**: Fuzzy score > 80 OR QR status = verified
- **Suspect**: 60 < Fuzzy score ≤ 80
- **Invalid**: All other cases

## MongoDB Schema

```json
{
  "certificate_id": "uuid",
  "raw_text": "extracted text",
  "entities": {
    "name": "person name",
    "course": "course name", 
    "certificate_id": "cert ID",
    "date": "issue date"
  },
  "qr_data": {
    "qr_status": "verified|invalid|unreachable|not_found",
    "url": "qr code url"
  },
  "fuzzy_score": 85,
  "overall_status": "valid|suspect|invalid",
  "validated_at": "ISO timestamp"
}
```