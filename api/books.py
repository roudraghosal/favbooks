import json
import os
import sys
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import and_, or_
from sqlalchemy.sql import func

# Inline models for Vercel deployment
Base = declarative_base()

# Association table for many-to-many relationship between books and genres
book_genres = Table(
    'book_genres',
    Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('genre_id', Integer, ForeignKey('genres.id'))
)

class Genre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    books = relationship("Book", secondary=book_genres, back_populates="genres")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    author = Column(String, index=True, nullable=False)
    description = Column(Text)
    isbn = Column(String, unique=True, index=True)
    publication_year = Column(Integer)
    cover_image_url = Column(String)
    audio_preview_url = Column(String)
    price = Column(Float)
    average_rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    genres = relationship("Genre", secondary=book_genres, back_populates="genres")
    ratings = relationship("Rating", back_populates="book")
    wishlists = relationship("Wishlist", back_populates="book")

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    rating = Column(Float, nullable=False)
    review = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="ratings")
    book = relationship("Book", back_populates="ratings")

class Wishlist(Base):
    __tablename__ = "wishlists"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="wishlists")
    book = relationship("Book", back_populates="wishlists")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    avatar_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    ratings = relationship("Rating", back_populates="user")
    wishlists = relationship("Wishlist", back_populates="user")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

def handler(event, context):
    try:
        print("Books API handler called")

        # Check if DATABASE_URL is set
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "DATABASE_URL not configured"})
            }

        if not SessionLocal:
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Database not configured"})
            }

        print(f"DATABASE_URL found: {db_url[:50]}...")

        # Parse query parameters from event
        query_params = event.get("queryStringParameters") or {}
        q = query_params.get("q")
        genre = query_params.get("genre")
        min_rating = float(query_params.get("min_rating", 0))
        max_rating = float(query_params.get("max_rating", 5))
        sort_by = query_params.get("sort_by", "title")
        sort_order = query_params.get("sort_order", "asc")
        page = int(query_params.get("page", 1))
        size = int(query_params.get("size", 10))

        print(f"Query params: q={q}, genre={genre}, page={page}, size={size}")

        db = SessionLocal()
        try:
            print("Database session created")
            query = db.query(Book)

            # Apply filters (simplified)
            if q:
                query = query.filter(
                    or_(Book.title.ilike(f"%{q}%"), Book.author.ilike(f"%{q}%"))
                )
            if genre:
                query = query.join(Book.genres).filter(Genre.name.ilike(f"%{genre}%"))
            if min_rating > 0:
                query = query.filter(Book.average_rating >= min_rating)
            if max_rating < 5:
                query = query.filter(Book.average_rating <= max_rating)

            # Sorting
            order_field = getattr(Book, sort_by, Book.title)
            if sort_order == "desc":
                order_field = order_field.desc()
            query = query.order_by(order_field)

            # Pagination
            total = query.count()
            offset = (page - 1) * size
            books = query.offset(offset).limit(size).all()

            print(f"Found {total} books, returning {len(books)} books")

            # Convert to dict
            books_data = []
            for book in books:
                books_data.append({
                    "id": book.id,
                    "title": book.title,
                    "author": book.author,
                    "description": book.description,
                    "average_rating": book.average_rating or 0.0,
                    "rating_count": book.rating_count or 0,
                    "cover_image_url": book.cover_image_url,
                    "genres": [{"id": g.id, "name": g.name} for g in book.genres]
                })

            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "items": books_data,
                    "total": total,
                    "page": page,
                    "size": size,
                    "pages": (total + size - 1) // size
                })
            }
            print("Response sent successfully")
        except Exception as db_error:
            print(f"Database error: {db_error}")
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": f"Database error: {str(db_error)}"})
            }
        finally:
            db.close()
            print("Database session closed")
    except Exception as e:
        print(f"General error: {e}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"Server error: {str(e)}"})
        }