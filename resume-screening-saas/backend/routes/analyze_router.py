from fastapi import APIRouter, File, UploadFile, Form
from typing import List
from models.schemas import AnalyzeRequest, CandidateResult
from services.pdf_parser import extract_text_from_pdf
from services.nlp_processor import extract_entities, extract_skills_from_jd, generate_summary
from services.matcher import compute_semantic_similarity, calculate_scores

router = APIRouter()

@router.post("/upload-resumes")
async def upload_resumes(files: List[UploadFile] = File(...)):
    """
    Accepts multiple PDF files, parses them, and returns extracted texts.
    """
    results = []
    for file in files:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
        results.append({
            "filename": file.filename,
            "text": text
        })
    return {"data": results}

@router.post("/analyze", response_model=List[CandidateResult])
async def analyze_candidates(request: AnalyzeRequest):
    """
    Analyzes job description and resumes, returns ranked candidates.
    """
    jd_text = request.job_description
    resumes_text = request.resumes
    
    jd_skills = extract_skills_from_jd(jd_text)
    total_jd_skills = len(jd_skills)
    
    candidates = []
    
    for idx, resume_text in enumerate(resumes_text):
        if not resume_text.strip():
            continue
            
        entities = extract_entities(resume_text)
        name = entities["name"]
        
        # If name is unknown, use index
        if name == "Unknown Candidate":
            name = f"Candidate {idx+1}"
            
        cand_skills = entities["skills"]
        experience = entities["experience"]
        education = entities["education"]
        
        matched_skills_count = sum(1 for s in cand_skills if s in jd_skills)
        semantic_score = compute_semantic_similarity(jd_text, resume_text)
        
        scores = calculate_scores(semantic_score, matched_skills_count, total_jd_skills)
        final_score = scores["final_score"]
        
        if final_score < 40:
            match_classification = "Poor Match ❌"
        elif final_score < 70:
            match_classification = "Moderate Match ⚠️"
        else:
            match_classification = "Strong Match ✅"
            
        summary = generate_summary(cand_skills, experience)
        
        candidates.append(CandidateResult(
            name=name,
            score=round(final_score, 1),
            semantic_score=round(scores["semantic_score"], 1),
            skill_score=round(scores["skill_score"], 1),
            match_classification=match_classification,
            summary=summary,
            skills=cand_skills,
            experience=experience,
            education=education
        ))
        
    # Sort descending
    candidates.sort(key=lambda c: c.score, reverse=True)
    return candidates
