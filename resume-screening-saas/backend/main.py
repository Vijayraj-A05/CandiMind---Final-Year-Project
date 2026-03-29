from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze_router import router as analyze_router

app = FastAPI(title="AI Resume Screening API")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vite frontend
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Resume Screening API is running"}
