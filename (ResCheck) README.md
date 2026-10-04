# 📄 Resume Matcher

> An NLP model that scores how well a resume matches a job description and explains *why*, by showing matched and missing skills.

![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-prototype-orange)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Sample Output](#sample-output)
- [Evaluation](#evaluation)
- [Roadmap](#roadmap)
- [Limitations and Responsible Use](#limitations-and-responsible-use)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

Applicant tracking systems and recruiters often filter resumes by how closely they align with a job posting. **Resume Matcher** gives job seekers the same view: paste in a resume and a job description, and get back:

- an overall **match score (0-100)**,
- a **breakdown** of how that score was computed,
- the **skills you already have** that the job asks for,
- the **skills you are missing**, so you know what to learn or highlight.

The current version is a lightweight prototype that runs entirely on a laptop CPU. No GPU and no paid API is needed.

## Features

- 📥 **Resume parsing** for PDF, DOCX and TXT files
- 🧹 **Text cleaning** that preserves technical terms such as `C++`, `C#` and `node.js`
- 🔑 **Skill extraction** using a custom skill vocabulary and spaCy's `PhraseMatcher`
- 🧠 **Semantic matching** with sentence embeddings (understands that "built ML pipelines" is close to "developed machine learning workflows")
- 📊 **Hybrid score** that combines keyword, skill and semantic signals
- 🔍 **Explainable output** with matched skills, missing skills and per-component scores
- 🖥️ **Command-line interface** for quick use

## How It Works

```
 Resume (PDF/DOCX/TXT)          Job Description (TXT)
          │                               │
          └──────────────┬────────────────┘
                         ▼
                 Text extraction
                         ▼
                 Cleaning / preprocessing
                         │
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
   TF-IDF cosine    Skill matching    Semantic similarity
   (keyword)        (skill overlap)   (sentence embeddings)
        │                │                 │
        └────────────────┼─────────────────┘
                         ▼
                Weighted hybrid score
                         ▼
        Score + matched skills + missing skills
```

| Component | What it measures | Default weight |
|---|---|---|
| **Skill match** | Fraction of the job's required skills found in the resume | 0.50 |
| **Semantic similarity** | For each job-description line, the best-matching resume line (using `all-MiniLM-L6-v2`) | 0.35 |
| **Keyword similarity** | TF-IDF cosine similarity on unigrams and bigrams | 0.15 |

```
final_score = 0.50 × skill_match + 0.35 × semantic + 0.15 × tfidf
```

> The weights are initial values. They are tuned against labeled data in the [Evaluation](#evaluation) stage.

## Tech Stack

| Purpose | Tools |
|---|---|
| Language | Python 3.10+ |
| Parsing | `pdfplumber`, `python-docx` |
| NLP | `spaCy` (`en_core_web_sm`) |
| Baseline model | `scikit-learn` (TF-IDF, cosine similarity) |
| Semantic model | `sentence-transformers` (`all-MiniLM-L6-v2`) |
| Data and evaluation | `pandas`, `numpy`, `scipy` |
| Testing | `pytest` |

## Project Structure

```
resume-matcher/
├── data/
│   ├── raw/              # private data, not tracked by Git
│   ├── processed/
│   ├── sample/           # fake sample resumes and JDs for demo
│   └── skills.csv        # skill vocabulary (column: skill)
├── notebooks/            # exploration and experiments
├── src/
│   ├── parser.py         # PDF/DOCX/TXT to text
│   ├── preprocess.py     # text cleaning
│   ├── skills.py         # skill extraction and skill score
│   ├── matcher.py        # semantic score and hybrid score
│   └── evaluate.py       # evaluation scripts
├── tests/                # pytest tests
├── main.py               # command-line entry point
├── requirements.txt
├── LICENSE
└── README.md
```

## Installation

**Prerequisites:** Python 3.10 or newer and Git.

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/resume-matcher.git
cd resume-matcher

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download the spaCy language model
python -m spacy download en_core_web_sm
```

The first run downloads the sentence-transformer model (about 90 MB), so it needs an internet connection once.

## Usage

### Command line

```bash
python main.py --resume path/to/resume.pdf --jd path/to/job_description.txt
```

Try it with the included sample files:

```bash
python main.py --resume data/sample/resume_ml_engineer.txt --jd data/sample/jd_data_scientist.txt
```

### As a Python module

```python
from src.parser import extract_text
from src.skills import build_matcher
from src.matcher import final_score

matcher = build_matcher("data/skills.csv")
resume = extract_text("data/sample/resume_ml_engineer.txt")
jd = extract_text("data/sample/jd_data_scientist.txt")

result = final_score(resume, jd, matcher)
print(result["score"], result["missing_skills"])
```

## Sample Output

> Illustrative example. Replace it with real output from your own run.

```json
{
  "score": 72.4,
  "skill_match": 75.0,
  "semantic": 71.2,
  "keyword": 64.8,
  "matched_skills": ["python", "sql", "scikit-learn", "pandas", "git"],
  "missing_skills": ["docker", "aws"]
}
```

**How to read it:** the resume aligns well with the role. Adding Docker and AWS experience (if you genuinely have it) would raise the skill match.

## Evaluation

Each component is evaluated against the full hybrid model on a small hand-labeled set of resume and job-description pairs (0 = poor, 1 = partial, 2 = strong match).

| Method | Spearman correlation | Notes |
|---|---|---|
| TF-IDF only | _TBD_ | Baseline |
| Skill match only | _TBD_ | |
| Semantic only | _TBD_ | |
| **Hybrid (tuned weights)** | _TBD_ | Final model |

**Sanity checks included in the test suite:**

- identical text scores close to 100
- an unrelated resume and job (for example chef vs. software engineer) scores low
- removing skills from a resume lowers its score

Run the tests with:

```bash
pytest tests/
```

## Roadmap

- [x] Project setup and structure
- [ ] Resume parsing (PDF, DOCX, TXT)
- [ ] TF-IDF baseline
- [ ] Skill extraction and matching
- [ ] Semantic similarity scoring
- [ ] Hybrid score and weight tuning
- [ ] Evaluation on labeled data
- [ ] Rule-based resume suggestions (missing sections, weak phrases, no metrics)
- [ ] LLM-assisted bullet rewriting, with a strict no-fabrication rule
- [ ] Closed-loop resume improvement (rewrite, re-score, keep the better version)
- [ ] ATS-friendly resume export (DOCX/PDF)
- [ ] Web app (Streamlit, FastAPI or similar)

## Limitations and Responsible Use

- **The score measures alignment, not hiring chances.** A 70 does not mean a 70% chance of being hired. It describes how closely the resume's content matches the job posting.
- **Skill extraction depends on the vocabulary.** A skill that is not in `data/skills.csv` will not be detected.
- **Parsing is imperfect.** Multi-column layouts, tables and scanned PDFs may not extract cleanly.
- **Fairness.** The model does not use names, gender, age, photos or school prestige as signals, and should not be extended to do so.
- **Privacy.** Never commit real resumes. `data/raw/` and common document formats are listed in `.gitignore`. Use fake data in `data/sample/`.

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please add tests for new functionality.

## License

Distributed under the MIT License. See `LICENSE` for details.

## Contact

**Your Name**
GitHub: [@your-username](https://github.com/your-username)
LinkedIn: [your-profile](https://www.linkedin.com/in/your-profile)
Email: you@example.com

---

⭐ If you find this project useful, consider giving it a star.
