from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

try:
    # all-MiniLM-L6-v2 is a small, fast model for sentence embeddings
    model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"Failed to load sentence-transformers model: {e}")
    model = None

def compute_semantic_similarity(jd: str, resume: str) -> float:
    """
    Computes cosine similarity between Job Description and Resume using Sentence-Transformers.
    """
    if not model:
        return 0.0
        
    try:
        jd_embedding = model.encode([jd])
        resume_embedding = model.encode([resume])
        sim = cosine_similarity(jd_embedding, resume_embedding)
        return float(sim[0][0])
    except Exception as e:
        print(f"Error computing similarity: {e}")
        return 0.0

def calculate_scores(semantic_score: float, matched_skills: int, total_jd_skills: int) -> dict:
    """
    Computes weighted final score and returns individual components as percentages.
    """
    # If JD specifies no skills, we default to 1.0 (100% match on skills)
    skill_score = (matched_skills / total_jd_skills) if total_jd_skills > 0 else 1.0
    
    # 70% semantic match, 30% keyword skill match
    final_score = (0.7 * semantic_score) + (0.3 * skill_score)
    
    return {
        "semantic_score": semantic_score * 100,
        "skill_score": skill_score * 100,
        "final_score": final_score * 100
    }
