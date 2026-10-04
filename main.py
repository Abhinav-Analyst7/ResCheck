from src.parser import parse_resume, load_job_description
from src.preprocessor import clean_text_light
from src.matcher import ResumeMatcher

def run_pipeline(resume_path, jd_path):
    print("=" * 50)
    print("RUNNING RESCHECK NLP MATCHING ENGINE")
    print("=" * 50)
    
    # 1. Parse Files
    raw_resume = parse_resume(resume_path)
    raw_jd = load_job_description(jd_path)
    print("✓ Successfully parsed input documents.")

    # 2. Preprocess Text
    clean_resume = clean_text_light(raw_resume)
    clean_jd = clean_text_light(raw_jd)

    # 3. Initialize Matcher & Compute Score
    matcher = ResumeMatcher()
    match_score = matcher.calculate_semantic_score(clean_resume, clean_jd)
    matched_kw, missing_kw = matcher.find_keyword_gaps(raw_resume, raw_jd)

    # 4. Display Output Results
    print("\n" + " RESULTS " + "="*40)
    print(f" Semantic Matching Score: {match_score}%")
    
    print("\n Top Matched Keywords:")
    print(matched_kw[:10])
    
    print("\n Key Missing Keywords from Job Description:")
    print(missing_kw[:10])
    print("=" * 50)

if __name__ == "__main__":
    RESUME_FILE = "data/sample_resume.docx"
    JD_FILE = "data/job_desc.txt"
    
    run_pipeline(RESUME_FILE, JD_FILE)