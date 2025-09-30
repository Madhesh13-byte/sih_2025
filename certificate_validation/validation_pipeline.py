import uuid
from ocr_utils import extract_text
from simple_parser import extract_entities, calculate_score_simple
from qr_utils import validate_qr
from db_utils import save_certificate_data

def validate_certificate(file_path):
    """Main validation pipeline"""
    
    # Extract text using OCR
    raw_text = extract_text(file_path)
    
    # Extract entities using simple parsing
    entities = extract_entities(raw_text)
    
    # Calculate fuzzy score
    fuzzy_score = calculate_score_simple(entities)
    
    # Validate QR code
    qr_data = validate_qr(file_path)
    
    # Determine overall status
    overall_status = "invalid"
    if fuzzy_score > 80 or qr_data["qr_status"] == "verified":
        overall_status = "valid"
    elif 60 < fuzzy_score <= 80:
        overall_status = "suspect"
    
    # Prepare final result
    result = {
        "certificate_id": str(uuid.uuid4()),
        "raw_text": raw_text,
        "entities": entities,
        "qr_data": qr_data,
        "fuzzy_score": fuzzy_score,
        "overall_status": overall_status
    }
    
    # Save to MongoDB
    doc_id = save_certificate_data(result.copy())
    result["mongodb_id"] = doc_id
    
    return result