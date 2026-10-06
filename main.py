from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from sentence_transformers import SentenceTransformer, util

# Import your custom parser module functions
from src.parser import parse_resume

app = FastAPI(title="ResCheck SaaS Engine")

print("Loading NLP Embedding Model (this takes a few seconds)...")
nlp_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model Loaded Successfully!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expand this library over time to improve detection accuracy
TECH_KEYWORDS = {
    "python", "fastapi", "react", "tailwind css", "docker", "kubernetes", "aws", 
    "nlp", "machine learning", "scikit-learn", "pandas", "spacy", "git", 
    "sql", "pytorch", "tensorflow", "java", "c++", "javascript", "typescript", "data scientist"
}

def extract_skills(text: str) -> set:
    text_lower = text.lower()
    return {skill for skill in TECH_KEYWORDS if skill in text_lower}

@app.post("/api/match-single")
async def match_single(
    file: UploadFile = File(...),
    jd_text: str = Form(...)
):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())

        resume_data = parse_resume(temp_path)
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        resume_text = resume_data.get("text", str(resume_data)) if isinstance(resume_data, dict) else str(resume_data)

        # 1. Calculate Semantic Score (Context & Soft Skills)
        jd_embedding = nlp_model.encode(jd_text, convert_to_tensor=True)
        resume_embedding = nlp_model.encode(resume_text, convert_to_tensor=True)
        semantic_score = max(0, min(100, int(util.cos_sim(jd_embedding, resume_embedding).item() * 100)))

        # 2. Calculate Hard Skill Score (Keyword overlap)
        jd_skills = extract_skills(jd_text)
        resume_skills = extract_skills(resume_text)
        
        matched = list(jd_skills.intersection(resume_skills))
        missing = list(jd_skills.difference(resume_skills))

        if len(jd_skills) > 0:
            skill_score = int((len(matched) / len(jd_skills)) * 100)
        else:
            skill_score = semantic_score # Fallback if JD has no recognized tech keywords

        # 3. Hybrid Calculation: 60% Skills, 40% Semantic Context
        final_match_score = int((skill_score * 0.6) + (semantic_score * 0.4))

        return {
            "filename": file.filename,
            "match_score": final_match_score,
            "matched_skills": matched if matched else ["No core tech matches"],
            "missing_skills": missing if missing else ["None"]
        }
    except Exception as e:
        if os.path.exists(f"temp_{file.filename}"):
            os.remove(f"temp_{file.filename}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/batch-rank")
async def batch_rank(
    files: List[UploadFile] = File(...),
    jd_text: str = Form(...)
):
    try:
        jd_embedding = nlp_model.encode(jd_text, convert_to_tensor=True)
        jd_skills = extract_skills(jd_text)
        
        leaderboard = []
        
        for file in files:
            temp_path = f"temp_{file.filename}"
            with open(temp_path, "wb") as buffer:
                buffer.write(await file.read())

            resume_data = parse_resume(temp_path)
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            resume_text = resume_data.get("text", str(resume_data)) if isinstance(resume_data, dict) else str(resume_data)
            
            # Semantic Score
            resume_embedding = nlp_model.encode(resume_text, convert_to_tensor=True)
            semantic_score = max(0, min(100, int(util.cos_sim(jd_embedding, resume_embedding).item() * 100)))
            
            # Skill Score
            resume_skills = extract_skills(resume_text)
            matched = list(jd_skills.intersection(resume_skills))
            missing = list(jd_skills.difference(resume_skills))
            
            if len(jd_skills) > 0:
                skill_score = int((len(matched) / len(jd_skills)) * 100)
            else:
                skill_score = semantic_score

            # Hybrid Score
            final_match_score = int((skill_score * 0.6) + (semantic_score * 0.4))

            leaderboard.append({
                "filename": file.filename,
                "match_score": final_match_score,
                "top_missing_skills": missing[:3]
            })
            
        leaderboard.sort(key=lambda x: x["match_score"], reverse=True)
        
        for idx, item in enumerate(leaderboard):
            item["rank"] = idx + 1
            
        return {"leaderboard": leaderboard}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))