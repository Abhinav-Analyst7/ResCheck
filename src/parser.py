import os
import docx
import pdfplumber

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + " "
    return text.strip()

def extract_text_from_docx(docx_path):
    doc = docx.Document(docx_path)
    full_text = [para.text for para in doc.paragraphs if para.text.strip()]
    return " ".join(full_text)

def parse_resume(file_path):
    """Automatically detects file format and extracts text."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

def load_job_description(txt_path):
    with open(txt_path, 'r', encoding='utf-8') as file:
        return file.read().strip()