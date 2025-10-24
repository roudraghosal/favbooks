"""
Enhanced Book Router with External API Integration
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from backend.app.core.database import get_db
from backend.app.models import Book, Genre
from backend.app.schemas import BookCreate, Book as BookSchema
from backend.app.services.external_apis import ExternalBookAPI, BookDataEnricher

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/external/search", response_model=List[dict])
async def search_external_books(
    query: str = Query(..., min_length=1),
    source: str = Query("google", regex="^(google|openlibrary|both)$"),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Search books from external APIs
    
    Args:
        query: Search query (title, author, ISBN, etc.)
        source: API source (google, openlibrary, or both)
        limit: Maximum number of results
        
    Returns:
        List of books from external APIs
    """
    try:
        if source == "google":
            books = await ExternalBookAPI.search_google_books(query, max_results=limit)
        elif source == "openlibrary":
            books = await ExternalBookAPI.search_open_library(query, limit=limit)
        else:  # both
            google_books = await ExternalBookAPI.search_google_books(query, max_results=limit // 2)
            open_books = await ExternalBookAPI.search_open_library(query, limit=limit // 2)
            books = google_books + open_books
        
        return books
    except Exception as e:
        logger.error(f"Error searching external books: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching books from external APIs")


@router.get("/external/trending", response_model=List[dict])
async def get_trending_books():
    """Get trending books from external APIs"""
    try:
        books = await ExternalBookAPI.get_trending_books()
        return books
    except Exception as e:
        logger.error(f"Error fetching trending books: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching trending books")


@router.get("/external/genre/{genre}", response_model=List[dict])
async def get_books_by_genre(
    genre: str,
    limit: int = Query(20, ge=1, le=100)
):
    """Get books by genre from external APIs"""
    try:
        books = await ExternalBookAPI.get_books_by_genre(genre, limit=limit)
        return books
    except Exception as e:
        logger.error(f"Error fetching books by genre: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching books by genre")


@router.get("/external/author/{author}", response_model=List[dict])
async def get_books_by_author(
    author: str,
    limit: int = Query(20, ge=1, le=100)
):
    """Get books by author from external APIs"""
    try:
        books = await ExternalBookAPI.get_books_by_author(author, limit=limit)
        return books
    except Exception as e:
        logger.error(f"Error fetching books by author: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching books by author")


@router.post("/import/external", response_model=dict)
async def import_external_book(
    external_id: str,
    source: str = Query(..., regex="^(google_books|open_library)$"),
    db: Session = Depends(get_db)
):
    """
    Import a book from external API to local database
    
    Args:
        external_id: External book ID
        source: API source
        db: Database session
        
    Returns:
        Import status message
    """
    try:
        # Fetch book data from external API
        if source == "google_books":
            books = await ExternalBookAPI.search_google_books(external_id, max_results=1)
        else:
            books = await ExternalBookAPI.search_open_library(external_id, limit=1)
        
        if not books:
            raise HTTPException(status_code=404, detail="Book not found in external API")
        
        book_data = books[0]
        
        # Check if book already exists
        existing_book = db.query(Book).filter(
            Book.title == book_data["title"],
            Book.author == book_data["author"]
        ).first()
        
        if existing_book:
            return {"message": "Book already exists in database", "book_id": existing_book.id}
        
        # Create new book entry
        new_book = Book(
            title=book_data["title"],
            author=book_data["author"],
            description=book_data.get("description", ""),
            isbn=book_data.get("isbn"),
            published_date=book_data.get("published_date"),
            publisher=book_data.get("publisher"),
            page_count=book_data.get("page_count", 0),
            language=book_data.get("language", "en"),
            cover_image_url=book_data.get("cover_image_url", ""),
            average_rating=book_data.get("average_rating", 0.0),
            rating_count=book_data.get("ratings_count", 0)
        )
        
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        
        # Add genres
        for genre_name in book_data.get("genres", [])[:5]:
            genre = db.query(Genre).filter(Genre.name == genre_name).first()
            if not genre:
                genre = Genre(name=genre_name)
                db.add(genre)
                db.commit()
                db.refresh(genre)
            
            if genre not in new_book.genres:
                new_book.genres.append(genre)
        
        db.commit()
        
        return {
            "message": "Book imported successfully",
            "book_id": new_book.id,
            "title": new_book.title
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing book: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error importing book")


@router.post("/enrich/{book_id}", response_model=dict)
async def enrich_book_data(
    book_id: int,
    db: Session = Depends(get_db)
):
    """
    Enrich existing book with external API data
    
    Args:
        book_id: Local book ID
        db: Database session
        
    Returns:
        Enrichment status message
    """
    try:
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        
        # Get external data
        external_data = await ExternalBookAPI.enrich_book_data(str(book.title), str(book.author))
        
        if not external_data:
            return {"message": "No external data found for this book"}
        
        # Update book with external data
        desc = getattr(book, 'description', None)
        if not desc and external_data.get("description"):
            book.description = external_data["description"]  # type: ignore
        
        cover = getattr(book, 'cover_image_url', None)
        if not cover and external_data.get("cover_image_url"):
            book.cover_image_url = external_data["cover_image_url"]  # type: ignore
        
        isbn = getattr(book, 'isbn', None)
        if not isbn and external_data.get("isbn"):
            book.isbn = external_data["isbn"]  # type: ignore
        
        if not book.publisher and external_data.get("publisher"):
            book.publisher = external_data["publisher"]
        
        if not book.published_date and external_data.get("published_date"):
            book.published_date = external_data["published_date"]
        
        if book.page_count == 0 and external_data.get("page_count"):
            book.page_count = external_data["page_count"]
        
        db.commit()
        
        return {
            "message": "Book data enriched successfully",
            "book_id": book.id,
            "updated_fields": ["description", "cover_image_url", "isbn", "publisher"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enriching book: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error enriching book data")
