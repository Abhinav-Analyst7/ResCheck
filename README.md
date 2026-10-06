# ResCheck: Resume and Job Description Matcher

## Student and batch details
- Name: Abhinav Awasthi
- Registration Number: 23FE10CDS00388
- Branch: Data Science and Engineering
- Batch: Batch F
- GitHub Username: Abhinav-Analyst7
- Project Title: ResCheck — Resume-to-Job Matching and Screening
- Training Program: NLP Capstone Project Training Program

---

## Project overview
ResCheck is a prototype NLP application for comparing a resume against a target job description. It extracts text from uploaded PDF/DOCX files, computes semantic similarity, identifies keyword gaps, ranks multiple resumes, and can generate resume-tailoring suggestions. The app is split into a Python FastAPI backend and a React + Vite frontend.

This project is designed as a screening assistant rather than an automated hiring system. The score reflects textual similarity and keyword alignment, not a validated probability of job suitability.

---

## What the project does
- Parses resume files in PDF and DOCX formats
- Cleans the extracted text and compares it with the job description
- Uses a Sentence Transformers embedding model (`all-MiniLM-L6-v2`) to calculate semantic similarity
- Finds matched and missing technical skills/keywords between the resume and job description
- Ranks multiple resumes in a batch leaderboard
- Allows a user to upload a resume and a job description from the web dashboard
- Provides a resume-tailoring prompt generator that can return a structured fallback template or call Gemini/OpenAI if an API key is configured

---

## Architecture
- Backend: Python + FastAPI
- Frontend: React + Vite
- ML/NLP: Sentence Transformers, scikit-learn, keyword extraction
- Main API entry point: `ResCheck/main.py`
- Secondary backend: `ResCheck/api.py` (separate FastAPI app with overlapping routes; check before modifying)
- Frontend UI: `ResCheck/frontend/src/`

The frontend sends requests to `http://127.0.0.1:8000` by default, and the backend app is exposed as `main:app`.

---

## Repository structure
```text
NLP_PROJECT/
├── ResCheck/
│   ├── main.py                  # Primary FastAPI app used by the frontend
|   ├── README.md
│   ├── api.py                   # Alternative FastAPI app with overlapping routes
│   ├── requirements.txt         # Python dependencies
│   ├── prompt.md                # Project context and guidance
│   ├── prototype.ipynb          # Exploratory notebook
│   ├── data/
│   │   ├── Resumes/
│   │   └── ...
│   ├── src/
│   │   ├── parser.py            # PDF/DOCX extraction logic
│   │   ├── preprocessor.py      # Text cleaning and keyword extraction
│   │   ├── matcher.py           # Semantic similarity and keyword-gap logic
│   │   └── tailor.py            # Tailoring prompt and LLM integration
│   └── frontend/
│       ├── package.json
│       └── src/
│           ├── App.jsx
│           ├── ResCheckLanding.jsx
│           ├── ScreeningDashboard.jsx
│           └── ...
└── ...
```

---

## Setup and run

### 1. Open the project folder
```powershell
cd "C:\Users\abhin\OneDrive\Desktop\NLP_PROJECT\ResCheck"
```

### 2. Create and activate a virtual environment
```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install Python dependencies
```powershell
python -m pip install -r requirements.txt
```

### 4. Start the backend
```powershell
python -m uvicorn main:app --reload
```

The API will be available at:
- `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/docs`

### 5. Start the frontend
Open a second terminal and run:
```powershell
cd frontend
npm install
npm run dev
```

Then open the local URL printed by Vite, typically:
- `http://localhost:5173`

---

## API endpoints
The main FastAPI app in `main.py` exposes the following routes:

- `GET /` — root status message
- `GET /api/health` — health check
- `POST /api/match-single` — match one uploaded resume to a job description
- `POST /api/batch-rank` — rank multiple resumes against one job description
- `POST /api/tailor` — generate a resume-tailoring prompt or suggestions

Request payloads are form-data based for file uploads, and the frontend expects JSON responses from the backend endpoints.

---

## Key features in the current implementation
1. Single resume analysis with semantic similarity and keyword-gap output
2. Batch leaderboard for multiple resumes
3. PDF and DOCX parsing
4. Dark/light mode in the frontend
5. Search and pagination in the batch screening dashboard
6. Resume tailoring suggestions with optional Gemini/OpenAI integration if credentials are configured
7. Structured offline placeholder suggestions when no API key is available

---

## Important notes
- The project is a prototype and is meant for educational and demonstration use.
- The match score is an estimate of textual similarity and keyword overlap; it should not be treated as a hiring decision.
- There are no automated tests in the repository at the moment, so validation should be done by running the app and checking the relevant endpoints manually.
- `main.py` and `api.py` are separate apps with similar functionality; make sure you target the correct one before editing.

---

## Quick summary
ResCheck is a resume-to-job matching prototype built for the NLP capstone stream. It combines resume parsing, semantic matching, keyword-gap analysis, batch ranking, and resume-tailoring support into a simple web app with a FastAPI backend and React frontend.
