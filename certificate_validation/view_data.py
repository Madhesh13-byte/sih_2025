from db_utils import view_all_certificates

if __name__ == "__main__":
    print("=== STORED CERTIFICATES ===")
    certificates = view_all_certificates()
    print(f"\nTotal certificates: {len(certificates)}")