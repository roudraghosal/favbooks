from typing import Any, List, Optional, cast
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import random
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user, get_current_admin_user
from backend.app.models import Book, Genre, User, Rating
from backend.app.schemas import (
    BookCreate, BookUpdate, Book as BookSchema, 
    PaginatedResponse, BookSearchParams
)

router = APIRouter()
def _safe_float(raw: Any, default: float = 0.0) -> float:
    value = cast(Optional[float], raw)
    return float(value) if value is not None else default


def _safe_int(raw: Any, default: int = 0) -> int:
    value = cast(Optional[int], raw)
    return int(value) if value is not None else default



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
    
    # Fix None values for average_rating and rating_count
    for book in books:
        if book.average_rating is None:
            book.average_rating = 0.0  # type: ignore[assignment]
        if book.rating_count is None:
            book.rating_count = 0  # type: ignore[assignment]
    
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
    q: Optional[str] = Query(None, description="Search query for autocomplete"),
    limit: int = Query(10, ge=1, le=100, description="Number of suggestions"),
    author: Optional[str] = Query(None, description="Filter by author"),
    min_year: Optional[int] = Query(None, description="Minimum publication year"),
    max_year: Optional[int] = Query(None, description="Maximum publication year"),
    min_rating: Optional[float] = Query(None, description="Minimum rating"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    db: Session = Depends(get_db)
):
    """Search endpoint with filters for books"""
    if not q:
        return []

    # Build search filter
    filters = [
        or_(
            Book.title.ilike(f"%{q}%"),
            Book.author.ilike(f"%{q}%")
        )
    ]
    
    # Add optional filters
    if author:
        filters.append(Book.author.ilike(f"%{author}%"))
    if min_year:
        filters.append(Book.publication_year >= min_year)
    if max_year:
        filters.append(Book.publication_year <= max_year)
    if min_rating:
        filters.append(Book.average_rating >= min_rating)
    if genre:
        # This assumes there's a genre relationship - adjust if needed
        filters.append(Book.genres.any(Genre.name.ilike(f"%{genre}%")))
    
    books = (
        db.query(Book)
        .filter(*filters)
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


@router.get("/{book_id}/details")
async def get_book_details(book_id: int, db: Session = Depends(get_db)):
    """
    Get comprehensive book details including ratings, reviews, and related books
    Enriched with Google Books data if available
    """
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Get ratings and reviews for this book
    ratings_query = db.query(Rating).filter(Rating.book_id == book_id)
    total_ratings = ratings_query.count()
    ratings_with_reviews = ratings_query.filter(Rating.review.isnot(None)).limit(10).all()
    
    # Calculate rating distribution
    rating_distribution = {
        "5_star": ratings_query.filter(Rating.rating >= 4.5).count(),
        "4_star": ratings_query.filter(and_(Rating.rating >= 3.5, Rating.rating < 4.5)).count(),
        "3_star": ratings_query.filter(and_(Rating.rating >= 2.5, Rating.rating < 3.5)).count(),
        "2_star": ratings_query.filter(and_(Rating.rating >= 1.5, Rating.rating < 2.5)).count(),
        "1_star": ratings_query.filter(Rating.rating < 1.5).count(),
    }
    
    # Get related books by same author
    related_by_author = (
        db.query(Book)
        .filter(and_(Book.author == book.author, Book.id != book_id))
        .limit(5)
        .all()
    )
    
    # Get related books by genre
    related_by_genre = []
    if book.genres:
        genre_ids = [g.id for g in book.genres]
        related_by_genre = (
            db.query(Book)
            .join(Book.genres)
            .filter(and_(Genre.id.in_(genre_ids), Book.id != book_id))
            .order_by(Book.average_rating.desc())
            .limit(10)
            .all()
        )
    
    # Try to enrich with Google Books data
    google_books_data = None
    try:
        from app.services.external_apis import ExternalBookAPI
        search_query = f"{book.title} {book.author}"
        google_results = await ExternalBookAPI.search_google_books(search_query, max_results=1)
        if google_results:
            google_books_data = google_results[0]
    except Exception as e:
        print(f"Could not fetch Google Books data: {e}")
    
    # Resolve numeric fields with type-aware casts for static analysis
    book_average = _safe_float(book.average_rating)
    book_rating_count = _safe_int(book.rating_count)

    # Build comprehensive response
    return {
        "basic": {
            "title": book.title,
            "author": book.author,
            "description": book.description,
            "isbn": book.isbn,
            "cover_image_url": book.cover_image_url,
            "publication_year": book.publication_year,
            "price": book.price,
            "average_rating": book_average,
            "rating_count": book_rating_count,
            "genres": [{"id": g.id, "name": g.name} for g in book.genres],
            "audio_preview_url": book.audio_preview_url,
        },
        "google_books": google_books_data,
        "ratings": {
            "total": total_ratings,
            "average": book_average,
            "distribution": rating_distribution,
        },
        "reviews": [
            {
                "id": r.id,
                "rating": _safe_float(r.rating),
                "review": r.review,
                "user_id": r.user_id,
                "created_at": r.created_at.isoformat() if r.created_at is not None else None,  # type: ignore[union-attr]
            }
            for r in ratings_with_reviews
        ],
        "related_books": {
            "by_author": [
                {
                    "id": b.id,
                    "title": b.title,
                    "cover_image_url": b.cover_image_url,
                    "average_rating": _safe_float(b.average_rating),
                }
                for b in related_by_author
            ],
            "by_genre": [
                {
                    "id": b.id,
                    "title": b.title,
                    "author": b.author,
                    "cover_image_url": b.cover_image_url,
                    "average_rating": _safe_float(b.average_rating),
                }
                for b in related_by_genre
            ],
        },
    }


@router.get("/{book_id}/preview")
async def get_book_preview(book_id: int, db: Session = Depends(get_db)):
    """Get book preview/sample content for reading with Google Books integration"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Try to get preview from Google Books
    google_preview = None
    preview_link = None
    try:
        from app.services.external_apis import ExternalBookAPI
        search_query = f"{book.title} {book.author}"
        google_results = await ExternalBookAPI.search_google_books(search_query, max_results=1)
        if google_results:
            google_data = google_results[0]
            google_preview = google_data.get("description")
            preview_link = google_data.get("preview_link")
    except Exception as e:
        print(f"Could not fetch Google Books preview: {e}")
    
    # Return sample content for reading
    avg_rating = float(book.average_rating) if book.average_rating is not None else 0  # type: ignore[arg-type]
    rating_count = int(book.rating_count) if book.rating_count is not None else 0  # type: ignore[arg-type]
    
    sample_content = f"""
# {book.title}
## by {book.author}

{book.description or google_preview or "Description not available."}

---

### About this book

- **Published:** {book.publication_year or 'Unknown'}
- **ISBN:** {book.isbn or 'Not available'}
- **Average Rating:** {'⭐' * int(avg_rating)} ({avg_rating:.1f}/5.0)
- **Total Ratings:** {rating_count}

### What readers are saying:

This book has captivated readers with its compelling narrative and rich storytelling. 
The author's unique voice brings the characters to life, making this a must-read for 
fans of the genre.

---

*Note: This is a sample preview. For the full book, please visit the publisher's website 
or your preferred book retailer.*
"""
    
    return {
        "book_id": book.id,
        "title": book.title,
        "author": book.author,
        "content": sample_content,
        "content_type": "markdown",
        "google_books_preview_link": preview_link,
        "cover_image_url": book.cover_image_url
    }


@router.get("/{book_id}/similar")
async def get_similar_books(
    book_id: int, 
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get books similar to the specified book
    Based on genre, author, and ratings
    """
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    similar_books = []
    
    # Get books by same author (excluding current book)
    by_author = (
        db.query(Book)
        .filter(and_(Book.author == book.author, Book.id != book_id))
        .order_by(Book.average_rating.desc())
        .limit(limit // 2)
        .all()
    )
    similar_books.extend(by_author)
    
    # Get books with similar genres
    if book.genres and len(similar_books) < limit:
        genre_ids = [g.id for g in book.genres]
        by_genre = (
            db.query(Book)
            .join(Book.genres)
            .filter(and_(Genre.id.in_(genre_ids), Book.id != book_id))
            .order_by(Book.average_rating.desc())
            .limit(limit)
            .all()
        )
        
        # Add books not already in list
        for b in by_genre:
            if b.id not in [sb.id for sb in similar_books] and len(similar_books) < limit:
                similar_books.append(b)
    
    # If still need more, get highly rated books
    if len(similar_books) < limit:
        highly_rated = (
            db.query(Book)
            .filter(
                and_(
                    Book.id != book_id,
                    Book.average_rating >= 4.0
                )
            )
            .order_by(Book.average_rating.desc())
            .limit(limit)
            .all()
        )
        
        for b in highly_rated:
            if b.id not in [sb.id for sb in similar_books] and len(similar_books) < limit:
                similar_books.append(b)
    
    return [
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "cover_image_url": b.cover_image_url,
            "average_rating": float(b.average_rating) if b.average_rating is not None else 0.0,  # type: ignore[arg-type]
            "rating_count": int(b.rating_count) if b.rating_count is not None else 0,  # type: ignore[arg-type]
            "genres": [{"id": g.id, "name": g.name} for g in b.genres],
            "reason": "Same author" if b.author == book.author else "Similar genre"
        }
        for b in similar_books[:limit]
    ]


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