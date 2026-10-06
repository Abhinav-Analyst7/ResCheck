import os
import tempfile
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.parser import parse_resume, load_job_description
from src.preprocessor import clean_text_light
from src.matcher import ResumeMatcher
from src.tailor import ResumeTailor

# 1. Initialize FastAPI App (MUST BE DECLARED BEFORE ANY DECORATORS)
app = FastAPI(
    title="ResCheck API",
    description="REST API for Resume-to-Job Matching, Batch Ranking, and AI Tailoring",
    version="1.0.0"
)

# 2. Enable CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Global Model Instance
matcher = ResumeMatcher()


# ---------------------------------------------------------
# Pydantic Request Models
# ---------------------------------------------------------
class TailorRequest(BaseModel):
    resume_text: str
    jd_text: str
    missing_skills: List[str]
    provider: Optional[str] = "gemini"


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@app.get("/")
def read_root():
    """Root route providing a clean status message."""
    return {
        "message": "Welcome to ResCheck API Engine",
        "docs_url": "http://127.0.0.1:8000/docs"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint to verify API status."""
    return {"status": "ok", "service": "ResCheck FastAPI Engine"}


@app.post("/api/match-single")
async def match_single_resume(
    file: UploadFile = File(...),
    jd_text: str = Form(...)
):
    """
    Parses a single uploaded resume (.pdf or .docx), cleans the text,
    and returns semantic match score along with keyword gap analysis.
    """
    if not file.filename.endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")

    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        raw_resume = parse_resume(tmp_path)
        clean_resume = clean_text_light(raw_resume)
        clean_jd = clean_text_light(jd_text)

        score = matcher.calculate_semantic_score(clean_resume, clean_jd)
        matched_kw, missing_kw = matcher.find_keyword_gaps(raw_resume, jd_text)

        return {
            "filename": file.filename,
            "match_score": score,
            "matched_skills": matched_kw,
            "missing_skills": missing_kw,
            "raw_resume_excerpt": raw_resume[:500]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.post("/api/batch-rank")
async def batch_rank_resumes(
    files: List[UploadFile] = File(...),
    jd_text: str = Form(...)
):
    """
    Accepts multiple resume files and ranks them in descending order based on semantic match score.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    clean_jd = clean_text_light(jd_text)
    results = []

    for file in files:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            raw_resume = parse_resume(tmp_path)
            clean_resume = clean_text_light(raw_resume)
            score = matcher.calculate_semantic_score(clean_resume, clean_jd)
            matched_kw, missing_kw = matcher.find_keyword_gaps(raw_resume, jd_text)

            results.append({
                "filename": file.filename,
                "match_score": score,
                "matched_count": len(matched_kw),
                "top_matched_skills": matched_kw[:5],
                "top_missing_skills": missing_kw[:5],
                "status": "success"
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "match_score": 0.0,
                "matched_count": 0,
                "top_matched_skills": [],
                "top_missing_skills": [],
                "status": f"error: {str(e)}"
            })
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    ranked_results = sorted(results, key=lambda x: x["match_score"], reverse=True)

    for idx, item in enumerate(ranked_results, 1):
        item["rank"] = idx

    return {
        "total_resumes": len(files),
        "leaderboard": ranked_results
    }


@app.post("/api/tailor")
def generate_tailor_prompt(request: TailorRequest):
    """
    Generates tailored bullet point suggestions or LLM prompt template based on missing skills.
    """
    tailor = ResumeTailor(provider=request.provider)
    result = tailor.generate_tailored_suggestions(
        request.resume_text,
        request.jd_text,
        request.missing_skills
    )
    return result