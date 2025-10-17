"""
API routes for achievements, badges, and social stickers
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.models.achievements import (
    UserAchievement, UserStreak, ReadingChallenge,
    ChallengeParticipation, Quiz, QuizAttempt, StickerGeneration
)
from app.schemas.achievements import (
    Achievement, UserStreakResponse, Challenge, ChallengeCreate,
    ChallengeParticipationResponse, Quiz as QuizSchema, QuizCreate,
    QuizAttemptCreate, QuizAttemptResponse, StickerGenerateRequest,
    StickerResponse, UserStatsResponse, UserProgressResponse,
    ShareStickerRequest, ShareStickerResponse
)
from app.services.milestone_tracker import MilestoneTracker
from app.services.sticker_generator import sticker_generator
import json

router = APIRouter()


@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive user statistics"""
    tracker = MilestoneTracker(db)
    stats = tracker.get_user_stats(current_user.id)
    
    return UserStatsResponse(
        books_read=stats.get("books_read", 0),
        reviews_written=stats.get("reviews_written", 0),
        streak_days=stats.get("streak_days", 0),
        quiz_score=stats.get("quiz_score", 0),
        challenges_completed=stats.get("challenges_completed", 0),
        genres_explored=stats.get("genres_explored", 0),
        ratings_given=stats.get("ratings_given", 0),
        wishlist_size=stats.get("wishlist_size", 0)
    )


@router.get("/achievements", response_model=List[Achievement])
async def get_user_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all unlocked achievements for the current user"""
    tracker = MilestoneTracker(db)
    achievements = tracker.get_user_achievements(current_user.id)
    return achievements


@router.post("/achievements/check")
async def check_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check and unlock new achievements"""
    tracker = MilestoneTracker(db)
    newly_unlocked = tracker.check_and_unlock_achievements(current_user.id)
    
    return {
        "newly_unlocked": len(newly_unlocked),
        "achievements": [
            {
                "id": a.id,
                "badge_type": a.badge_type.value,
                "milestone_type": a.milestone_type.value,
                "milestone_value": a.milestone_value
            }
            for a in newly_unlocked
        ]
    }


@router.get("/progress", response_model=UserProgressResponse)
async def get_achievement_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed progress towards all achievements"""
    tracker = MilestoneTracker(db)
    
    stats = tracker.get_user_stats(current_user.id)
    achievements = tracker.get_user_achievements(current_user.id)
    progress = tracker.get_achievement_progress(current_user.id)
    
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    return UserProgressResponse(
        stats=UserStatsResponse(
            books_read=stats.get("books_read", 0),
            reviews_written=stats.get("reviews_written", 0),
            streak_days=stats.get("streak_days", 0),
            quiz_score=stats.get("quiz_score", 0),
            challenges_completed=stats.get("challenges_completed", 0),
            genres_explored=stats.get("genres_explored", 0),
            ratings_given=stats.get("ratings_given", 0),
            wishlist_size=stats.get("wishlist_size", 0)
        ),
        achievements=achievements,
        progress=progress,
        streak=streak
    )


@router.get("/streak", response_model=UserStreakResponse)
async def get_reading_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's reading streak"""
    streak = db.query(UserStreak).filter(
        UserStreak.user_id == current_user.id
    ).first()
    
    if not streak:
        streak = UserStreak(
            user_id=current_user.id,
            current_streak=0,
            longest_streak=0
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)
    
    return streak


@router.post("/streak/update", response_model=UserStreakResponse)
async def update_reading_streak(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update reading streak (called when user completes a reading activity)"""
    tracker = MilestoneTracker(db)
    streak = tracker.update_reading_streak(current_user.id)
    
    # Check for new achievements
    tracker.check_and_unlock_achievements(current_user.id)
    
    return streak


@router.get("/challenges", response_model=List[Challenge])
async def get_active_challenges(
    db: Session = Depends(get_db)
):
    """Get all active challenges"""
    challenges = db.query(ReadingChallenge).filter(
        ReadingChallenge.is_active == True
    ).all()
    return challenges


@router.post("/challenges/{challenge_id}/join")
async def join_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a reading challenge"""
    # Check if challenge exists
    challenge = db.query(ReadingChallenge).filter(
        ReadingChallenge.id == challenge_id,
        ReadingChallenge.is_active == True
    ).first()
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Check if already participating
    existing = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.user_id == current_user.id,
        ChallengeParticipation.challenge_id == challenge_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already participating in this challenge")
    
    # Create participation
    participation = ChallengeParticipation(
        user_id=current_user.id,
        challenge_id=challenge_id
    )
    db.add(participation)
    db.commit()
    db.refresh(participation)
    
    return {"message": "Successfully joined challenge", "participation_id": participation.id}


@router.get("/challenges/my", response_model=List[ChallengeParticipationResponse])
async def get_my_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's active challenges"""
    participations = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.user_id == current_user.id
    ).all()
    return participations


@router.get("/quizzes", response_model=List[QuizSchema])
async def get_available_quizzes(
    db: Session = Depends(get_db)
):
    """Get all available quizzes"""
    quizzes = db.query(Quiz).filter(Quiz.is_active == True).all()
    return quizzes


@router.post("/quizzes/attempt", response_model=QuizAttemptResponse)
async def submit_quiz_attempt(
    attempt: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a quiz attempt"""
    tracker = MilestoneTracker(db)
    
    try:
        quiz_attempt = tracker.record_quiz_attempt(
            user_id=current_user.id,
            quiz_id=attempt.quiz_id,
            score=attempt.score
        )
        return quiz_attempt
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/stickers/generate", response_model=StickerResponse)
async def generate_sticker(
    request: StickerGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a social media sticker for an achievement"""
    # Get achievement
    achievement = db.query(UserAchievement).filter(
        UserAchievement.id == request.achievement_id,
        UserAchievement.user_id == current_user.id
    ).first()
    
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    # Generate sticker
    sticker_data = sticker_generator.generate_badge_sticker(
        username=current_user.username,
        badge_type=achievement.badge_type.value,
        milestone_value=achievement.milestone_value,
        milestone_type=achievement.milestone_type.value,
        avatar_url=current_user.avatar_url,
        unlocked_at=achievement.unlocked_at
    )
    
    # Save sticker record
    sticker_record = StickerGeneration(
        user_id=current_user.id,
        achievement_id=achievement.id,
        sticker_type="badge",
        sticker_data=json.dumps(sticker_data["metadata"]),
        share_platform=request.platform
    )
    db.add(sticker_record)
    db.commit()
    db.refresh(sticker_record)
    
    return StickerResponse(
        id=sticker_record.id,
        sticker_type=sticker_record.sticker_type,
        sticker_url=sticker_record.sticker_url,
        image_data=sticker_data["image"],
        width=sticker_data["width"],
        height=sticker_data["height"],
        format=sticker_data["format"],
        metadata=sticker_data["metadata"],
        download_count=sticker_record.download_count,
        created_at=sticker_record.created_at
    )


@router.post("/stickers/{sticker_id}/download")
async def download_sticker(
    sticker_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track sticker download"""
    sticker = db.query(StickerGeneration).filter(
        StickerGeneration.id == sticker_id,
        StickerGeneration.user_id == current_user.id
    ).first()
    
    if not sticker:
        raise HTTPException(status_code=404, detail="Sticker not found")
    
    sticker.download_count += 1
    db.commit()
    
    return {"message": "Download tracked", "download_count": sticker.download_count}


@router.post("/stickers/{sticker_id}/share", response_model=ShareStickerResponse)
async def share_sticker(
    sticker_id: int,
    request: ShareStickerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track sticker share and generate share URLs"""
    sticker = db.query(StickerGeneration).filter(
        StickerGeneration.id == sticker_id,
        StickerGeneration.user_id == current_user.id
    ).first()
    
    if not sticker:
        raise HTTPException(status_code=404, detail="Sticker not found")
    
    # Update achievement share count
    if sticker.achievement_id:
        achievement = db.query(UserAchievement).filter(
            UserAchievement.id == sticker.achievement_id
        ).first()
        if achievement:
            achievement.is_shared = True
            achievement.share_count += 1
    
    db.commit()
    
    # Generate platform-specific share message
    share_message = f"🎉 I just unlocked a new badge on BookRecommender! Check out my achievement! #BookRecommender #Reading"
    
    return ShareStickerResponse(
        success=True,
        share_url=None,  # Could generate actual share URLs for specific platforms
        message=share_message
    )


@router.get("/stickers/my", response_model=List[StickerResponse])
async def get_my_stickers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all stickers generated by the user"""
    stickers = db.query(StickerGeneration).filter(
        StickerGeneration.user_id == current_user.id
    ).order_by(StickerGeneration.created_at.desc()).all()
    
    result = []
    for sticker in stickers:
        metadata = json.loads(sticker.sticker_data) if sticker.sticker_data else {}
        result.append(StickerResponse(
            id=sticker.id,
            sticker_type=sticker.sticker_type,
            sticker_url=sticker.sticker_url,
            image_data=None,  # Don't send full image data in list view
            width=1080,
            height=1920,
            format="png",
            metadata=metadata,
            download_count=sticker.download_count,
            created_at=sticker.created_at
        ))
    
    return result
