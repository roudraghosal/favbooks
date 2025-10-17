from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, books, ratings, wishlist, recommendations, external_books, achievements

app = FastAPI(
    title="Book Recommendation API",
    description="A FastAPI-based book recommendation system with ML integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(books.router, prefix="/books", tags=["books"])
app.include_router(external_books.router, prefix="/books", tags=["external-books"])
app.include_router(ratings.router, prefix="/ratings", tags=["ratings"])
app.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
app.include_router(recommendations.router, prefix="/recommend", tags=["recommendations"])
app.include_router(achievements.router, prefix="/achievements", tags=["achievements"])

@app.get("/")
async def root():
    return {"message": "Book Recommendation API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test/books")
async def test_books():
    """Test endpoint to check if books are available"""
    from app.core.database import SessionLocal
    from app.models import Book
    
    db = SessionLocal()
    try:
        books = db.query(Book).limit(5).all()
        return {
            "total_books": len(books),
            "books": [{"id": book.id, "title": book.title, "average_rating": book.average_rating} for book in books]
        }
    finally:
        db.close()