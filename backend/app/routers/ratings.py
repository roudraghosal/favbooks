from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Rating, Book, User
from app.schemas import RatingCreate, Rating as RatingSchema
from app.services.milestone_tracker import MilestoneTracker

router = APIRouter()


@router.post("/", response_model=RatingSchema)
async def create_rating(
    rating: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if book exists
    book = db.query(Book).filter(Book.id == rating.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Check if user already rated this book
    existing_rating = (
        db.query(Rating)
        .filter(Rating.user_id == current_user.id, Rating.book_id == rating.book_id)
        .first()
    )
    
    if existing_rating:
        # Update existing rating
        existing_rating.rating = rating.rating  # type: ignore[assignment]
        existing_rating.review = rating.review  # type: ignore[assignment]
        db_rating = existing_rating
    else:
        # Create new rating
        db_rating = Rating(
            user_id=current_user.id,
            book_id=rating.book_id,
            rating=rating.rating,
            review=rating.review
        )
        db.add(db_rating)
    
    db.commit()
    db.refresh(db_rating)
    
    # Update book's average rating
    avg_rating = (
        db.query(func.avg(Rating.rating))
        .filter(Rating.book_id == rating.book_id)
        .scalar()
    )
    rating_count = (
        db.query(func.count(Rating.id))
        .filter(Rating.book_id == rating.book_id)
        .scalar()
    )
    
    book.average_rating = round(avg_rating, 2) if avg_rating else 0.0  # type: ignore[assignment]
    book.rating_count = rating_count or 0  # type: ignore[assignment]
    db.commit()
    
    # Update reading streak and check for achievements
    tracker = MilestoneTracker(db)
    tracker.update_reading_streak(current_user.id)
    newly_unlocked = tracker.check_and_unlock_achievements(current_user.id)
    
    # Add newly unlocked achievements to response
    response_data = db_rating.__dict__.copy()
    response_data['newly_unlocked_achievements'] = [
        {
            'id': a.id,
            'badge_type': a.badge_type.value,
            'milestone_type': a.milestone_type.value,
            'milestone_value': a.milestone_value
        }
        for a in newly_unlocked
    ]
    
    return db_rating


@router.get("/user/{user_id}", response_model=List[RatingSchema])
async def get_user_ratings(
    user_id: int,
    db: Session = Depends(get_db)
):
    ratings = (
        db.query(Rating)
        .filter(Rating.user_id == user_id)
        .order_by(Rating.created_at.desc())
        .all()
    )
    return ratings


@router.get("/book/{book_id}", response_model=List[RatingSchema])
async def get_book_ratings(
    book_id: int,
    db: Session = Depends(get_db)
):
    # Check if book exists
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    ratings = (
        db.query(Rating)
        .filter(Rating.book_id == book_id)
        .order_by(Rating.created_at.desc())
        .all()
    )
    return ratings