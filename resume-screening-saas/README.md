# 🚀 AI Resume Screening & Candidate Ranking System

A complete, production-ready SaaS web application for HR professionals to upload resumes, provide a job description, and instantly receive AI-powered rankings.

## 🌟 Features
- **PDF Resume Parsing**: Extracts raw text efficiently from multiple uploaded PDFs.
- **NLP Processing (spaCy)**: Intelligently extracts Key Skills, Years of Experience, and Education details.
- **Semantic Matching (Sentence-Transformers)**: Computes deep contextual cosine similarity between the candidate's resume and the job description.
- **Automated AI Scoring**: Calculates a weighted score combining semantic relevance and raw skill overlap.
- **Stunning UI**: Built with React, Tailwind CSS, and Framer Motion for a premium, Stripe/Notion-like dark mode aesthetic.

---

## 🏗️ Architecture

- **Backend**: Python 3.x, FastAPI, PyPDF2, spaCy (`en_core_web_sm`), Sentence-Transformers (`all-MiniLM-L6-v2`)
- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Lucide React

---

## 🛠️ Setup Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn python-multipart pypdf2 spacy sentence-transformers scikit-learn
   ```
4. Download the NLP Models:
   ```bash
   python -m spacy download en_core_web_sm
   ```
   *(Note: The `sentence-transformers` model will automatically download upon first run).*
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The UI will be accessible at usually `http://localhost:5173`.

---

## 🚀 Deployment Steps

### Backend Deployment (Render / Railway)
1. Ensure your `requirements.txt` is updated:
   `pip freeze > requirements.txt`
   *(Also append `spacy==<version>` and `https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl` to the requirements if using Render)*
2. Set the Start Command to: 
   `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Deploy the `backend` folder as a Web Service. Ensure you configure sufficient RAM (at least 1GB - 2GB) due to the PyTorch/Sentence-Transformers models.

### Frontend Deployment (Vercel / Netlify)
1. Use Vercel to import your GitHub repository.
2. Set the Root Directory to `frontend`.
3. Vercel will automatically detect Vite. 
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Update your frontend API endpoint variable (`API_URL`) in `Dashboard.jsx` (or `.env`) to point to the live Render/Railway URL.
5. Deploy!

---

## 💡 Usage Guide
1. Launch the application and click **"Get Started Free"**.
2. **Drag & Drop** your PDF resumes into the upload area.
3. Paste the target **Job Description**.
4. Click **"Analyze & Rank Candidates"**.
5. The system will extract, score, and rank candidates from 0-100! 

Made with ❤️ using AI.
