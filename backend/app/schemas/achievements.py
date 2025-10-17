"""
Pydantic schemas for achievements, badges, and stickers
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class BadgeTypeEnum(str, Enum):
    """Badge types"""
    VERIFIED_EXPLORER = "verified_explorer"
    READING_STREAK = "reading_streak"
    GENRE_MASTER = "genre_master"
    QUIZ_CHAMPION = "quiz_champion"
    CHALLENGE_WINNER = "challenge_winner"
    BOOK_COLLECTOR = "book_collector"
    REVIEW_EXPERT = "review_expert"
    EARLY_BIRD = "early_bird"
    NIGHT_OWL = "night_owl"
    SPEED_READER = "speed_reader"


class MilestoneTypeEnum(str, Enum):
    """Milestone types"""
    BOOKS_READ = "books_read"
    REVIEWS_WRITTEN = "reviews_written"
    STREAK_DAYS = "streak_days"
    QUIZ_SCORE = "quiz_score"
    CHALLENGES_COMPLETED = "challenges_completed"
    GENRES_EXPLORED = "genres_explored"
    RATINGS_GIVEN = "ratings_given"
    WISHLIST_SIZE = "wishlist_size"


# Achievement schemas
class AchievementBase(BaseModel):
    badge_type: BadgeTypeEnum
    milestone_type: MilestoneTypeEnum
    milestone_value: int


class Achievement(AchievementBase):
    id: int
    user_id: int
    unlocked_at: datetime
    is_shared: bool
    share_count: int

    class Config:
        from_attributes = True


# Streak schemas
class UserStreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[datetime]

    class Config:
        from_attributes = True


# Challenge schemas
class ChallengeBase(BaseModel):
    title: str
    description: Optional[str] = None
    challenge_type: str
    target_value: int
    duration_days: Optional[int] = None
    reward_badge: Optional[BadgeTypeEnum] = None


class ChallengeCreate(ChallengeBase):
    pass


class Challenge(ChallengeBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ChallengeParticipationResponse(BaseModel):
    id: int
    challenge_id: int
    current_progress: int
    is_completed: bool
    started_at: datetime
    completed_at: Optional[datetime]
    challenge: Challenge

    class Config:
        from_attributes = True


# Quiz schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    book_id: Optional[int] = None
    difficulty: str
    passing_score: int = 70
    reward_badge: Optional[BadgeTypeEnum] = None


class QuizCreate(QuizBase):
    pass


class Quiz(QuizBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class QuizAttemptCreate(BaseModel):
    quiz_id: int
    score: int = Field(..., ge=0, le=100)


class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    score: int
    is_passed: bool
    attempted_at: datetime
    quiz: Quiz

    class Config:
        from_attributes = True


# Sticker schemas
class StickerGenerateRequest(BaseModel):
    achievement_id: int
    platform: Optional[str] = "instagram"  # instagram, whatsapp, twitter


class StickerResponse(BaseModel):
    id: int
    sticker_type: str
    sticker_url: Optional[str]
    image_data: Optional[str]  # Base64 encoded image
    width: int
    height: int
    format: str
    metadata: Dict[str, Any]
    download_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Stats and progress schemas
class UserStatsResponse(BaseModel):
    books_read: int
    reviews_written: int
    streak_days: int
    quiz_score: int
    challenges_completed: int
    genres_explored: int
    ratings_given: int
    wishlist_size: int


class AchievementProgressResponse(BaseModel):
    badge_type: str
    unlocked: bool
    unlocked_at: Optional[str]
    requirements: Dict[str, Dict[str, Any]]


class UserProgressResponse(BaseModel):
    stats: UserStatsResponse
    achievements: List[Achievement]
    progress: Dict[str, AchievementProgressResponse]
    streak: Optional[UserStreakResponse]


# Social sharing schemas
class ShareStickerRequest(BaseModel):
    sticker_id: int
    platform: str  # instagram, whatsapp, twitter, facebook


class ShareStickerResponse(BaseModel):
    success: bool
    share_url: Optional[str]
    message: str
