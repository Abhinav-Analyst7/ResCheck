import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords', quiet=True)
stop_words = set(stopwords.words('english'))

def clean_text_light(text):
    """Normalizes text while preserving natural language flow for Transformer models."""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s,.+\-#]', ' ', text)  # Keep tech symbols like C++, C#, .NET
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_keywords_for_gap_analysis(text):
    """Extracts clean word tokens for traditional keyword matching."""
    words = re.findall(r'\b[a-zA-Z]{2,}\b', text.lower())
    return set([w for w in words if w not in stop_words])