"""
API routes for mood-based book recommendations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.whichbook import MoodBook
from app.schemas.whichbook import (
    MoodBookCreate, MoodBookResponse, MoodRecommendRequest, 
    WorldMapCountryResponse
)
from app.services.mood_recommender import MoodRecommender

router = APIRouter()


@router.post("/recommend", response_model=List[MoodBookResponse])
async def get_mood_recommendations(
    request: MoodRecommendRequest,
    db: Session = Depends(get_db)
):
    """
    Get book recommendations based on mood sliders
    
    User adjusts 8 mood sliders (happy-sad, calm-thrilling, etc.)
    Returns top matching books using cosine similarity
    """
    # Convert mood object to vector
    mood_vector = [
        request.mood_sliders.happy,
        request.mood_sliders.sad,
        request.mood_sliders.calm,
        request.mood_sliders.thrilling,
        request.mood_sliders.dark,
        request.mood_sliders.funny,
        request.mood_sliders.emotional,
        request.mood_sliders.optimistic
    ]
    
    # Get recommendations
    scored_books = MoodRecommender.recommend_by_mood(
        db=db,
        user_mood_vector=mood_vector,
        limit=request.limit,
        country_filter=request.country_filter or "",
        complexity_min=request.complexity_min or 1,
        complexity_max=request.complexity_max or 10
    )
    
    # Convert to response format with similarity scores
    results = []
    for book, similarity_score in scored_books:
        book_dict = {
            "id": book.id,
            "book_id": book.book_id,
            "title": book.title,
            "author": book.author,
            "country": book.country,
            "cover_url": book.cover_url,
            "description": book.description,
            "mood_vector": book.mood_vector,
            "complexity": book.complexity,
            "literary_tone": book.literary_tone,
            "latitude": book.latitude,
            "longitude": book.longitude,
            "created_at": book.created_at,
            "similarity_score": round(similarity_score, 3)
        }
        results.append(MoodBookResponse(**book_dict))
    
    return results


@router.get("/books", response_model=List[MoodBookResponse])
async def get_all_mood_books(
    skip: int = 0,
    limit: int = 100,
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all mood books with optional country filter"""
    query = db.query(MoodBook)
    
    if country:
        query = query.filter(MoodBook.country == country)
    
    books = query.offset(skip).limit(limit).all()
    return books


@router.get("/books/{book_id}", response_model=MoodBookResponse)
async def get_mood_book(
    book_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific mood book by ID"""
    book = db.query(MoodBook).filter(MoodBook.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/books", response_model=MoodBookResponse, status_code=status.HTTP_201_CREATED)
async def create_mood_book(
    book: MoodBookCreate,
    db: Session = Depends(get_db)
):
    """Create a new mood book (admin only - add auth later)"""
    db_book = MoodBook(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.get("/worldmap/countries", response_model=List[WorldMapCountryResponse])
async def get_world_map_countries(
    db: Session = Depends(get_db)
):
    """Get all countries with book counts for world map visualization"""
    from app.models.whichbook import WorldMapCountry
    countries = db.query(WorldMapCountry).all()
    return countries


@router.get("/worldmap/books-by-country")
async def get_books_by_country_stats(
    db: Session = Depends(get_db)
):
    """Get statistics about books grouped by country"""
    stats = MoodRecommender.get_country_books_stats(db)
    return {
        "total_countries": len(stats),
        "countries": stats
    }


@router.post("/auto-tag-mood")
async def auto_tag_book_mood(
    description: str,
    db: Session = Depends(get_db)
):
    """
    Auto-generate mood vector from book description
    Useful for bulk importing books from external APIs
    """
    mood_vector = MoodRecommender.auto_tag_mood_from_description(description)
    
    return {
        "mood_vector": mood_vector,
        "mood_labels": ["happy", "sad", "calm", "thrilling", "dark", "funny", "emotional", "optimistic"],
        "description": "Mood vector generated from description using keyword matching"
    }
