from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[User] = None


class TokenData(BaseModel):
    email: Optional[str] = None


# Genre schemas
class GenreBase(BaseModel):
    name: str
    description: Optional[str] = None


class GenreCreate(GenreBase):
    pass


class Genre(GenreBase):
    id: int

    class Config:
        from_attributes = True


# Book schemas
class BookBase(BaseModel):
    title: str
    author: str
    description: Optional[str] = None
    isbn: Optional[str] = None
    publication_year: Optional[int] = None
    cover_image_url: Optional[str] = None
    audio_preview_url: Optional[str] = None
    price: Optional[float] = None


class BookCreate(BookBase):
    genre_ids: List[int] = []


class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    isbn: Optional[str] = None
    publication_year: Optional[int] = None
    cover_image_url: Optional[str] = None
    audio_preview_url: Optional[str] = None
    price: Optional[float] = None
    genre_ids: Optional[List[int]] = None


class Book(BookBase):
    id: int
    average_rating: float
    rating_count: int
    created_at: datetime
    genres: List[Genre] = []

    class Config:
        from_attributes = True


class BookWithRecommendationScore(Book):
    recommendation_score: float


# Rating schemas
class RatingBase(BaseModel):
    rating: float = Field(..., ge=1, le=5)
    review: Optional[str] = None


class RatingCreate(RatingBase):
    book_id: int


class Rating(RatingBase):
    id: int
    user_id: int
    book_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Wishlist schemas
class WishlistCreate(BaseModel):
    book_id: int


class Wishlist(BaseModel):
    id: int
    user_id: int
    book_id: int
    created_at: datetime
    book: Book

    class Config:
        from_attributes = True


# Search and pagination
class BookSearchParams(BaseModel):
    q: Optional[str] = None
    genre: Optional[str] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_rating: Optional[float] = Field(None, ge=0, le=5)
    sort_by: Optional[str] = "title"  # title, author, rating, created_at
    sort_order: Optional[str] = "asc"  # asc, desc
    page: int = Field(1, ge=1)
    size: int = Field(10, ge=1, le=100)


class PaginatedResponse(BaseModel):
    items: List[Book]
    total: int
    page: int
    size: int
    pages: int