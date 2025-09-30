import os
from validation_pipeline import validate_certificate

def main():
    # Sample certificate path
    sample_file = "uploads/1.pdf"  # Change to your file
    
    if not os.path.exists(sample_file):
        print(f"File not found: {sample_file}")
        print("Please place a certificate file in the uploads/ directory")
        return
    
    print(f"Validating certificate: {sample_file}")
    
    try:
        # Run validation pipeline
        report = validate_certificate(sample_file)
        
        # Print validation report
        print("\n" + "="*50)
        print("CERTIFICATE VALIDATION REPORT")
        print("="*50)
        
        print(f"Certificate ID: {report['certificate_id']}")
        print(f"Overall Status: {report['overall_status'].upper()}")
        print(f"Fuzzy Score: {report['fuzzy_score']}/100")
        
        print("\nExtracted Entities:")
        for key, value in report['entities'].items():
            print(f"  {key.title()}: {value or 'Not found'}")
        
        print(f"\nQR Code Status: {report['qr_data']['qr_status']}")
        if report['qr_data']['url']:
            print(f"  URL: {report['qr_data']['url']}")
        
        print(f"\nSaved to MongoDB with ID: {report['mongodb_id']}")
        
        print("\nRaw OCR Text (first 200 chars):")
        print(f"  {report['raw_text'][:200]}...")
        
    except Exception as e:
        print(f"Error during validation: {str(e)}")

if __name__ == "__main__":
    main()