import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from src.preprocessor import extract_keywords_for_gap_analysis

class ResumeMatcher:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        print("Loading Transformer Model (Sentence-BERT)...")
        self.model = SentenceTransformer(model_name)

    def calculate_semantic_score(self, resume_text, jd_text):
        """Generates 384-dimensional dense vectors and calculates Cosine Similarity."""
        # Convert raw text directly into contextual embeddings
        embeddings = self.model.encode([resume_text, jd_text])
        
        # Calculate Cosine Similarity between the 2 embedding vectors
        sim_matrix = cosine_similarity([embeddings[0]], [embeddings[1]])
        score = round(float(sim_matrix[0][0]) * 100, 2)
        return score

    def find_keyword_gaps(self, resume_text, jd_text):
        """Identifies matched and missing skill terms."""
        resume_kw = extract_keywords_for_gap_analysis(resume_text)
        jd_kw = extract_keywords_for_gap_analysis(jd_text)
        
        matched = resume_kw.intersection(jd_kw)
        missing = jd_kw - resume_kw
        return list(matched), list(missing)