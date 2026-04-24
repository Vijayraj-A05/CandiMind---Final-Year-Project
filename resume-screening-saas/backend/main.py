from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import router
from routes.analyze_router import router as analyze_router

# Initialize FastAPI app
app = FastAPI(
    title="AI Resume Screening API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(analyze_router, prefix="/api", tags=["Resume Analysis"])


@app.get("/")
def root():
    return {
        "message": "🚀 AI Resume Screening API is running successfully!"
    }

# ✅ Health check route (useful for debugging)
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "message": "Backend is working fine 💯"
    }