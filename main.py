import os
import glob
import pandas as pd
from tqdm import tqdm

from src.parser import parse_resume, load_job_description
from src.preprocessor import clean_text_light
from src.matcher import ResumeMatcher

def process_resume_batch(resumes_dir, jd_path, output_csv="data/leaderboard.csv"):
    print("=" * 65)
    print("🚀 RESCHECK BATCH PROCESSING ENGINE")
    print("=" * 65)
    
    # 1. Load Job Description
    if not os.path.exists(jd_path):
        raise FileNotFoundError(f"Job description file not found at: {jd_path}")
    
    raw_jd = load_job_description(jd_path)
    clean_jd = clean_text_light(raw_jd)
    print(f"✓ Loaded job description from '{jd_path}'.")

    # 2. Collect all supported resume files (.pdf, .docx, .doc)
    supported_extensions = ["*.pdf", "*.docx", "*.doc", "*.PDF", "*.DOCX", "*.DOC"]
    resume_files = []
    for ext in supported_extensions:
        resume_files.extend(glob.glob(os.path.join(resumes_dir, ext)))
    
    # Remove duplicates
    resume_files = sorted(list(set(resume_files)))
    total_files = len(resume_files)
    
    if total_files == 0:
        print(f"⚠️ No resumes found in '{resumes_dir}'.")
        print(f"Please move your 228 resume files into '{resumes_dir}' and run again.")
        return

    print(f"✓ Found {total_files} resume files in '{resumes_dir}'.")
    
    # 3. Initialize Transformer Model ONCE for maximum performance
    matcher = ResumeMatcher()
    
    results = []
    print("\n⏳ Processing resumes and calculating semantic match scores...")
    
    # Loop over all resumes with a progress bar
    for file_path in tqdm(resume_files, desc="Matching Resumes"):
        file_name = os.path.basename(file_path)
        try:
            # Parse & Preprocess
            raw_resume = parse_resume(file_path)
            clean_resume = clean_text_light(raw_resume)
            
            # Compute Semantic Similarity
            match_score = matcher.calculate_semantic_score(clean_resume, clean_jd)
            
            # Extract Keyword Gaps
            matched_kw, missing_kw = matcher.find_keyword_gaps(raw_resume, raw_jd)
            
            results.append({
                "Filename": file_name,
                "Match Score (%)": match_score,
                "Matched Skills Count": len(matched_kw),
                "Missing Skills Count": len(missing_kw),
                "Top Matched Skills": ", ".join(matched_kw[:5]),
                "Top Missing Skills": ", ".join(missing_kw[:5]),
                "Status": "Success"
            })
        except Exception as e:
            # Handle corrupted or unreadable files without crashing the pipeline
            results.append({
                "Filename": file_name,
                "Match Score (%)": 0.0,
                "Matched Skills Count": 0,
                "Missing Skills Count": 0,
                "Top Matched Skills": "N/A",
                "Top Missing Skills": "N/A",
                "Status": f"Error: {str(e)}"
            })

    # 4. Build DataFrame and Rank Candidates
    df = pd.DataFrame(results)
    df = df.sort_values(by="Match Score (%)", ascending=False).reset_index(drop=True)
    df.index += 1  # 1-based ranking
    df.index.name = "Rank"

    # Save to CSV
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df.to_csv(output_csv)
    print(f"\n✅ Full leaderboard exported to: {output_csv}")

    # 5. Display Top 10 Candidates in Console
    print("\n" + "🏆 TOP 10 RESUME LEADERBOARD " + "="*35)
    display_cols = ["Filename", "Match Score (%)", "Matched Skills Count", "Top Missing Skills", "Status"]
    print(df[display_cols].head(10).to_string())
    print("=" * 65)

if __name__ == "__main__":
    RESUMES_DIR = "data/resumes"
    JD_FILE = "data/job_desc.txt"
    
    # Auto-create directory if it doesn't exist
    os.makedirs(RESUMES_DIR, exist_ok=True)
    
    process_resume_batch(RESUMES_DIR, JD_FILE)