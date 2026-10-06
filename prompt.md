# ResCheck Project Context

Use this document as working context when assisting with this repository. Treat the current source code and package manifests as authoritative; some existing README material describes an earlier or aspirational design.

## Project

ResCheck is a prototype for comparing resumes with job descriptions. Its backend extracts resume text, computes semantic similarity and keyword gaps, ranks multiple resumes, and can generate resume-tailoring suggestions. The frontend provides a landing page and a screening dashboard for single-resume and batch workflows.

## Architecture

- **Backend:** Python and FastAPI. `main.py` defines the API application used by the frontend and initializes a `ResumeMatcher` with the Sentence Transformers model `all-MiniLM-L6-v2`.
- **Backend modules:** `src/parser.py` extracts text from PDF and Word documents; `src/preprocessor.py` cleans text and extracts keywords; `src/matcher.py` computes semantic scores and keyword gaps; `src/tailor.py` generates tailoring suggestions, optionally using Gemini or OpenAI when configured.
- **API routes in `main.py`:** `GET /`, `GET /api/health`, `POST /api/match-single`, `POST /api/batch-rank`, and `POST /api/tailor`.
- **Additional backend:** `api.py` contains a separate FastAPI app with overlapping matching routes and different scoring logic. Check which app and behavior a task targets before changing either implementation; do not assume they are interchangeable.
- **Frontend:** React with Vite, located in `frontend/`. `frontend/src/App.jsx` switches between the landing page and screening dashboard. The dashboard calls the backend at `http://127.0.0.1:8000`.
- **Data and experiments:** `data/` contains job-description and leaderboard files as well as resume documents; `prototype.ipynb` is an exploratory notebook.

## Development

- Frontend development server: run `npm run dev` from `frontend/`.
- Frontend production build: run `npm run build` from `frontend/`.
- Python dependencies are listed in the root `requirements.txt`.
- The backend app is exposed as `main:app` and is conventionally run with Uvicorn from the project root.
- No test files were found during this project-context review. Do not claim tests pass unless they are added or run.

## Guidance for Changes

1. Inspect the relevant implementation before editing. Follow existing patterns and keep changes focused.
2. Keep the frontend request payloads and response handling aligned with the selected backend route.
3. Be explicit about differences between `main.py` and `api.py`; avoid silently porting behavior or changing the app entry point.
4. Do not put credentials, API keys, or personal resume content in source, logs, documentation, examples, or commits. Treat files under `data/Resumes/` as sensitive and use synthetic examples for tests.
5. Preserve existing behavior unless the requested change requires otherwise. Validate with the narrowest relevant build, lint, or test command and report what was actually run.
