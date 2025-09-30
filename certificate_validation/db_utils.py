from pymongo import MongoClient
import datetime

def get_mongo_collection():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["certificate_db"]
    return db["certificates"]

def save_certificate_data(data):
    collection = get_mongo_collection()
    data["validated_at"] = datetime.datetime.utcnow().isoformat()
    result = collection.insert_one(data)
    return str(result.inserted_id)

def save_certificate_fields(entities):
    """Save only specific certificate fields to MongoDB"""
    collection = get_mongo_collection()
    
    certificate_doc = {
        "name": entities.get("Name", ""),
        "course": entities.get("Course", ""),
        "course_type": entities.get("Course_Type", ""),
        "certification_id": entities.get("Certificate_Id", ""),
        "date": entities.get("Date", ""),
        "course_hours": entities.get("Course_Hours", ""),
        "duration": entities.get("Duration", ""),
        "institution": entities.get("Institution", ""),
        "grade": entities.get("Grade", ""),
        "scores": entities.get("Scores", ""),
        "semester": entities.get("Semester", ""),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    result = collection.insert_one(certificate_doc)
    return str(result.inserted_id)

def view_all_certificates():
    """View all stored certificates"""
    collection = get_mongo_collection()
    certificates = list(collection.find())
    
    for cert in certificates:
        print(f"\nID: {cert['_id']}")
        print(f"Name: {cert.get('name', 'N/A')}")
        print(f"Course: {cert.get('course', 'N/A')}")
        print(f"Institution: {cert.get('institution', 'N/A')}")
        print(f"Grade: {cert.get('grade', 'N/A')}")
        print("-" * 40)
    
    return certificates