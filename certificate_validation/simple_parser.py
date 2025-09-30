import re

def extract_entities(raw_text: str):
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    # ---------- 1. Extract Duration ----------
    duration_match = re.search(r'\((\d+)\s*week', raw_text, re.IGNORECASE)
    duration = duration_match.group(1) if duration_match else ""

    # ---------- 2. Extract Credits ----------
    credits_match = re.search(r'No\. of credits recommended:\s*([\d\sorOR]+)', raw_text, re.IGNORECASE)
    credits = credits_match.group(1).strip() if credits_match else ""

    # ---------- 3. Combine Course_Hours ----------
    course_hours = ""
    if duration and credits:
        course_hours = f"{duration} weeks / {credits} credits"
    elif duration:
        course_hours = f"{duration} weeks"
    elif credits:
        course_hours = f"{credits} credits"

    # ---------- 4. Extract Semester / Date ----------
    semester_match = re.search(
        r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-–]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4}',
        raw_text,
        re.IGNORECASE
    )
    semester = semester_match.group(0) if semester_match else ""

    # ---------- 5. Extract Course Name ----------
    course_name = ""
    for i, line in enumerate(lines):
        if re.search(r'\d+\s*week', line, re.IGNORECASE):
            # Look at next 2 lines for course name
            for j in [1, 2]:
                if i+j < len(lines):
                    candidate = lines[i+j]
                    # skip if candidate is all caps (likely name) or mostly numeric
                    if not re.search(r'\d', candidate) and len(candidate.split()) > 1:
                        course_name = candidate
                        break
            break

    # ---------- 6. Extract Name ----------
    name = ""
    if course_name:
        idx = lines.index(course_name)
        if idx+1 < len(lines):
            candidate = lines[idx+1]
            # Ensure it's not numbers or scores
            if not re.search(r'\d+/\d+', candidate):
                name = candidate.title()
    else:
        # fallback: find first line before scores that looks like a name
        for i, line in enumerate(lines):
            if re.search(r'\d+/?\d+', line):
                candidate = lines[i-1] if i > 0 else ""
                if candidate and not re.search(r'\d', candidate):
                    name = candidate.title()
                break

    # ---------- 7. Extract Roll Number ----------
    roll_no = ""
    for i, line in enumerate(lines):
        if "Roll No" in line:
            if i+1 < len(lines):
                candidate = lines[i+1]
                # exclude if it's month
                if not re.match(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', candidate):
                    roll_no = candidate
            break

    # ---------- 8. Extract Scores ----------
    scores = ", ".join(re.findall(r'\d+\.?\d*/\d+', raw_text))

    # ---------- 9. Extract Certificate ID ----------
    cert_match = re.search(r'(NPTEL\d+[A-Z]+)', raw_text)
    cert_id = cert_match.group(1) if cert_match else ""

    # ---------- 10. Extract Grade ----------
    grade = ""
    # Look for letter grades (A-F, S, O) with optional +
    letter_grade = re.search(r'\b([ABCDEFSO][+]?)\b', raw_text, re.IGNORECASE)
    if letter_grade:
        grade = letter_grade.group(1).upper()
    else:
        # Look for numeric grades (0-100)
        numeric_grade = re.search(r'\b(\d{1,3})\b', raw_text)
        if numeric_grade:
            num = int(numeric_grade.group(1))
            if 0 <= num <= 100:
                grade = str(num)

    return {
        "Name": name,
        "Course": course_name,
        "Course_Type": "course certificate",
        "Certificate_Id": cert_id,
        "Date": semester,
        "Course_Hours": course_hours,
        "Duration": duration,
        "Institution": "NPTEL" if "NPTEL" in raw_text else "",
        "Grade": grade,
        "Roll_No": roll_no,
        "Semester": semester,
        "Scores": scores
    }

def calculate_score_simple(entities):
    score = 0
    weights = {
        "Name": 15, "Course": 15, "Certificate_Id": 20, "Date": 10,
        "Course_Hours": 10, "Institution": 10, "Semester": 10, "Scores": 10
    }
    
    for field, weight in weights.items():
        if entities.get(field) and entities[field].strip():
            score += weight
    
    return score