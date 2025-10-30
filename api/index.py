# Vercel serverless function handler
from backend.main import app

# Export the FastAPI app as a handler for Vercel
handler = app
