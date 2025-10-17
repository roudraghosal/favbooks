from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import random
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models import Book, Genre, User, Rating
from app.schemas import (
    BookCreate, BookUpdate, Book as BookSchema, 
    PaginatedResponse, BookSearchParams
)

router = APIRouter()


@router.post("/", response_model=BookSchema)
async def create_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Create new book
    db_book = Book(
        title=book.title,
        author=book.author,
        description=book.description,
        isbn=book.isbn,
        publication_year=book.publication_year,
        cover_image_url=book.cover_image_url,
        audio_preview_url=book.audio_preview_url,
        price=book.price
    )
    
    # Add genres
    if book.genre_ids:
        genres = db.query(Genre).filter(Genre.id.in_(book.genre_ids)).all()
        db_book.genres = genres
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    
    return db_book


@router.get("/", response_model=PaginatedResponse)
@router.get("", response_model=PaginatedResponse)  # Handle both with and without trailing slash
async def get_books(
    q: Optional[str] = Query(None, description="Search query"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    max_rating: Optional[float] = Query(None, ge=0, le=5, description="Maximum rating"),
    sort_by: str = Query("title", description="Sort by field"),
    sort_order: str = Query("asc", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    
    # Apply search filter
    if q:
        search_filter = or_(
            Book.title.ilike(f"%{q}%"),
            Book.author.ilike(f"%{q}%"),
            Book.description.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
    
    # Apply genre filter
    if genre:
        query = query.join(Book.genres).filter(Genre.name.ilike(f"%{genre}%"))
    
    # Apply rating filters
    if min_rating is not None:
        query = query.filter(Book.average_rating >= min_rating)
    if max_rating is not None:
        query = query.filter(Book.average_rating <= max_rating)
    
    # Apply sorting
    if sort_by == "title":
        order_field = Book.title
    elif sort_by == "author":
        order_field = Book.author
    elif sort_by == "rating":
        order_field = Book.average_rating
    elif sort_by == "created_at":
        order_field = Book.created_at
    else:
        order_field = Book.title
    
    if sort_order == "desc":
        order_field = order_field.desc()
    
    query = query.order_by(order_field)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * size
    books = query.offset(offset).limit(size).all()
    
    pages = (total + size - 1) // size
    
    return PaginatedResponse(
        items=books,  # type: ignore[arg-type]
        total=total,
        page=page,
        size=size,
        pages=pages
    )


@router.get("/search", response_model=List[BookSchema])
async def search_books_autocomplete(
    q: str = Query(..., min_length=1, description="Search query for autocomplete"),
    limit: int = Query(10, ge=1, le=20, description="Number of suggestions"),
    db: Session = Depends(get_db)
):
    """Autocomplete search endpoint for real-time suggestions"""
    search_filter = or_(
        Book.title.ilike(f"%{q}%"),
        Book.author.ilike(f"%{q}%")
    )
    
    books = (
        db.query(Book)
        .filter(search_filter)
        .order_by(Book.average_rating.desc())
        .limit(limit)
        .all()
    )
    
    return books


@router.get("/surprise", response_model=List[BookSchema])
async def surprise_me(
    count: int = Query(5, ge=1, le=20, description="Number of random books"),
    min_rating: float = Query(4.0, ge=0, le=5, description="Minimum rating for surprise books"),
    db: Session = Depends(get_db)
):
    """Get random highly-rated books for 'Surprise Me!' feature"""
    # Get all books with rating above threshold
    high_rated_books = (
        db.query(Book)
        .filter(Book.average_rating >= min_rating)
        .all()
    )
    
    if not high_rated_books:
        # Fallback to any books if no high-rated books found
        high_rated_books = db.query(Book).all()
    
    # Return random selection
    random_books = random.sample(
        high_rated_books, 
        min(count, len(high_rated_books))
    )
    
    return random_books


@router.get("/{book_id}", response_model=BookSchema)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    return book


@router.get("/{book_id}/preview")
async def get_book_preview(book_id: int, db: Session = Depends(get_db)):
    """Get book preview/sample content for reading"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Return sample content for reading
    # In a real app, this would fetch from a content service
    avg_rating = float(book.average_rating) if book.average_rating else 0  # type: ignore[arg-type]
    rating_count = int(book.rating_count) if book.rating_count else 0  # type: ignore[arg-type]
    
    sample_content = f"""
    # {book.title}
    ## by {book.author}
    
    {book.description}
    
    ---
    
    ### Sample Chapter
    
    This is a preview of "{book.title}". In a production application, you would integrate 
    with a digital library service or content management system to display the actual book content.
    
    **About this book:**
    - Published: {book.publication_year or 'Unknown'}
    - ISBN: {book.isbn or 'Not available'}
    - Average Rating: {'⭐' * int(avg_rating)} ({avg_rating:.1f}/5.0)
    - Total Ratings: {rating_count}
    
    **What readers are saying:**
    
    This book has captivated readers with its compelling narrative and rich storytelling. 
    The author's unique voice brings the characters to life, making this a must-read for 
    fans of the genre.
    
    ---
    
    *Note: This is a sample preview. Full book content would be available with proper licensing 
    and integration with digital book providers.*
    """
    
    return {
        "book_id": book.id,
        "title": book.title,
        "author": book.author,
        "content": sample_content,
        "content_type": "markdown"
    }


@router.put("/{book_id}", response_model=BookSchema)
async def update_book(
    book_id: int,
    book_update: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Update fields
    update_data = book_update.dict(exclude_unset=True)
    genre_ids = update_data.pop("genre_ids", None)
    
    for field, value in update_data.items():
        setattr(db_book, field, value)
    
    # Update genres if provided
    if genre_ids is not None:
        genres = db.query(Genre).filter(Genre.id.in_(genre_ids)).all()
        db_book.genres = genres
    
    db.commit()
    db.refresh(db_book)
    
    return db_book


@router.delete("/{book_id}")
async def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    db.delete(db_book)
    db.commit()
    
    return {"message": "Book deleted successfully"}