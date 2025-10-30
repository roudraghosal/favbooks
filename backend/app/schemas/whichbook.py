"""
Pydantic schemas for WhichBook+ API
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# Mood Book Schemas
class MoodVector(BaseModel):
    """Mood vector with 8 dimensions"""
    happy: float = Field(ge=0, le=10)
    sad: float = Field(ge=0, le=10)
    calm: float = Field(ge=0, le=10)
    thrilling: float = Field(ge=0, le=10)
    dark: float = Field(ge=0, le=10)
    funny: float = Field(ge=0, le=10)
    emotional: float = Field(ge=0, le=10)
    optimistic: float = Field(ge=0, le=10)


class MoodBookBase(BaseModel):
    title: str
    author: str
    country: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    mood_vector: List[float]  # 8 values [happy, sad, calm, thrilling, dark, funny, emotional, optimistic]
    complexity: int = Field(default=5, ge=1, le=10)
    literary_tone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class MoodBookCreate(MoodBookBase):
    book_id: Optional[int] = None


class MoodBookResponse(MoodBookBase):
    id: int
    book_id: Optional[int] = None
    created_at: datetime
    similarity_score: Optional[float] = None  # For recommendation results

    class Config:
        from_attributes = True


class MoodRecommendRequest(BaseModel):
    """Request for mood-based recommendations"""
    mood_sliders: MoodVector
    limit: int = Field(default=10, ge=1, le=50)
    country_filter: Optional[str] = None
    complexity_min: Optional[int] = Field(default=None, ge=1, le=10)
    complexity_max: Optional[int] = Field(default=None, ge=1, le=10)


# Creator Schemas
class CreatorBase(BaseModel):
    name: str
    email: EmailStr
    username: str
    bio: Optional[str] = None


class CreatorCreate(CreatorBase):
    password: str


class CreatorLogin(BaseModel):
    email: EmailStr
    password: str


class CreatorResponse(CreatorBase):
    id: int
    profile_image_url: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Creator Content Schemas
class CreatorContentBase(BaseModel):
    title: str
    category: str  # 'quote', 'poem', 'short_story', 'book_excerpt'
    content_text: Optional[str] = None


class CreatorContentCreate(CreatorContentBase):
    pass


class CreatorContentResponse(CreatorContentBase):
    id: int
    creator_id: int
    file_path: Optional[str] = None
    approved: bool
    publish_request: bool
    publish_request_status: str
    likes_count: int
    shares_count: int
    views_count: int
    created_at: datetime
    creator: Optional[CreatorResponse] = None

    class Config:
        from_attributes = True


class PublishToFlipkartRequest(BaseModel):
    content_id: int
    additional_notes: Optional[str] = None


# Admin Schemas
class AdminLogin(BaseModel):
    email: str
    password: str


class AdminContentReview(BaseModel):
    content_id: int
    action: str  # "approve" or "reject"
    admin_comment: Optional[str] = None


# Comment & Like Schemas
class CommentCreate(BaseModel):
    content_id: int
    comment_text: str


class CommentResponse(BaseModel):
    id: int
    content_id: int
    user_id: int
    comment_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class LikeCreate(BaseModel):
    content_id: int


# World Map Schemas
class WorldMapCountryResponse(BaseModel):
    id: int
    country_name: str
    country_code: str
    books_count: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    flag_emoji: Optional[str] = None

    class Config:
        from_attributes = True


class BestsellerResponse(BaseModel):
    id: int
    book: MoodBookResponse
    list_name: str
    rank: Optional[int] = None
    added_date: datetime

    class Config:
        from_attributes = True

