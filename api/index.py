import sys
import os

# Add the parent directory to the path so we can import from backend
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

# Create a simple FastAPI app for Vercel
app = FastAPI(
    title="FavBooks API",
    description="Book recommendation system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "FavBooks API is running on Vercel!",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/test")
async def test():
    return {"message": "API is working!"}

# Mangum handler for Vercel
handler = Mangum(app)
