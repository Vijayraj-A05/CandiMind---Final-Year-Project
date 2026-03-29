import spacy
from typing import Dict, List

# Load the model outside to be reused
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    print(f"Failed to load spaCy model: {e}")
    nlp = None

# A basic predefined list of tech skills to look for.
COMMON_SKILLS = [
    "python", "java", "react", "javascript", "typescript", "c++", "c#", 
    "sql", "nosql", "aws", "gcp", "azure", "docker", "kubernetes", 
    "machine learning", "deep learning", "nlp", "fastapi", "django", 
    "flask", "html", "css", "node.js", "next.js", "tailwind", "git"
]

def extract_entities(text: str) -> Dict[str, any]:
    """
    Extracts basic entities like skills, experience, and education from a resume text.
    Uses spaCy for basic NER and a keyword match for common tech skills.
    """
    if not nlp:
        return {"name": "Unknown candidate", "skills": [], "experience": "Unknown", "education": "Unknown"}
    
    doc = nlp(text)
    
    skills = []
    education = []
    experience_years = []
    name = "Unknown Candidate"
    
    text_lower = text.lower()
    
    # Named Entity Recognition
    for ent in doc.ents:
        if ent.label_ == "PERSON" and name == "Unknown Candidate":
            name = ent.text
        elif ent.label_ == "ORG" and any(word in ent.text.lower() for word in ["university", "college", "institute", "school"]):
            education.append(ent.text)
        elif ent.label_ == "DATE" and any(word in ent.text.lower() for word in ["year", "month"]):
            experience_years.append(ent.text)
            
    # Skill Extraction
    for skill in COMMON_SKILLS:
        if skill in text_lower:
            skills.append(skill)
            
    return {
        "name": name,
        "skills": list(set(skills)),
        "experience": experience_years[0] if experience_years else "Unknown",
        "education": education[0] if education else "Unknown"
    }

def extract_skills_from_jd(jd_text: str) -> List[str]:
    """
    Extracts required skills from the job description to calculate skill match.
    """
    skills = []
    jd_lower = jd_text.lower()
    for skill in COMMON_SKILLS:
        if skill in jd_lower:
            skills.append(skill)
    return skills

def generate_summary(skills: List[str], experience: str) -> str:
    """
    Generates a short AI-style summary of the candidate.
    """
    exp_text = experience if experience and experience != "Unknown" else "an unknown amount of"
    
    if not skills:
        return f"Candidate has {exp_text} experience, but no specific technical skills were extracted."
        
    top_skills = skills[:4] # Take up to top 4 skills
    if len(top_skills) > 1:
        skills_text = ", ".join(top_skills[:-1]) + f" and {top_skills[-1]}"
    else:
        skills_text = top_skills[0]
        
    return f"Candidate has {exp_text} experience with key proficiency in {skills_text}."

