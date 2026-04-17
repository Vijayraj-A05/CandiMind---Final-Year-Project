from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    job_description: str
    resumes: List[str]

class CandidateResult(BaseModel):
    name: str
    score: float
    semantic_score: float
    skill_score: float
    match_classification: str
    summary: str
    skills: List[str]
    experience: str
    education: str
    
    # test change by rishi