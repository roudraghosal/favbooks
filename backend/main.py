from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (
    auth, books, ratings, wishlist, recommendations, 
    external_books, achievements,
    mood_books, creator_portal, admin, images
)

app = FastAPI(
    title="WhichBook+ - Book Discovery & Creator Platform",
    description="A comprehensive book recommendation system with mood-based discovery, world map exploration, and creator portal",
    version="2.0.0"
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

# WhichBook+ routers
app.include_router(mood_books.router, prefix="/api/mood", tags=["mood-discovery"])
app.include_router(creator_portal.router, prefix="/api/creator", tags=["creator-portal"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(images.router, prefix="/api/images", tags=["images"])

@app.get("/")
async def root():
    return {
        "message": "WhichBook+ API is running!",
        "version": "2.0.0",
        "features": [
            "Mood-based book discovery",
            "World map book exploration",
            "Creator portal for writers",
            "Admin moderation system",
            "Traditional book recommendations"
        ]
    }

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